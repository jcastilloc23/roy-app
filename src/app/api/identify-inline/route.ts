import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";
import { taxonomyPromptBlock } from "@/lib/industry-taxonomy";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function extractJSON(text: string): Record<string, unknown> | null {
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, fileContent, fileSize, fileType, fileHash } = await req.json() as {
    fileName: string;
    fileContent: string;
    fileSize?: number;
    fileType?: string;
    fileHash?: string;
  };

  if (!fileName || !fileContent) {
    return NextResponse.json({ error: "fileName and fileContent are required" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  // Duplicate check — same file content already processed by this user
  if (fileHash) {
    const { data: existing } = await supabase
      .from("statements")
      .select("id, file_name, source_type, status")
      .eq("user_id", userId)
      .eq("file_hash", fileHash)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        duplicate: true,
        statementId: existing.id,
        fileName: existing.file_name,
        source: existing.source_type,
        status: existing.status,
      });
    }
  }

  // Create a statement record with the intended storage path
  const statementId = crypto.randomUUID();
  const storagePath = `${userId}/${statementId}/${fileName}`;
  const { error: stmtError } = await supabase.from("statements").insert({
    id: statementId,
    user_id: userId,
    file_name: fileName,
    file_size: fileSize ?? null,
    file_type: fileType ?? null,
    file_url: storagePath,
    file_hash: fileHash ?? null,
    status: "pending",
  });

  if (stmtError) {
    return NextResponse.json({ error: `DB error: ${stmtError.message}` }, { status: 500 });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are Roy — a music royalty analyst who specializes in transparency for independent artists, labels, and publishers. You know every DSP and PRO statement format on sight.

Your only job here is to quickly identify whether an uploaded file is a music royalty statement, and if so, what it is.

You ONLY accept files from DSPs (Spotify, Apple Music, YouTube Music, Amazon Music, TIDAL, Deezer), distributors (DistroKid, CD Baby, TuneCore, AWAL, FUGA, SoundCloud for Artists), PROs (ASCAP, BMI, SESAC, SoundExchange, GMR), and CMOs (MLC, HFA, Songtrust).

IMPORTANT: Some statement files have no source name in the filename or file content. Identify them by their column headers instead.
Known fingerprints:
- DistroKid (.tsv): headers include "Earnings (USD)", "Country of Sale", "Songwriter Royalties Withheld (USD)"
- SoundCloud for Artists (.csv): headers include "Revenue (USD)", "Revenue Share (%)", "Split Pay Share (%)" — rows 0-1 are preamble (Account ID + UUID), actual column headers are on row 2
- ASCAP International (.csv): headers include "Work Title", "Licensor", "$ Amount", "Revenue Class Description" — set source to exactly "ASCAP International"; royalty_type is "performance"; no stream counts (PROs); artist = "Statement Recipient Name"; "$ Amount" has a leading space — trim before parsing
- ASCAP US (.csv): headers include "Work Title", "Number of Plays", "Dollars", "Performance Quarter" — set source to exactly "ASCAP US"; royalty_type is "performance"; "Number of Plays" IS stream count (use it); store/platform = "Music User"; period format is "2Q2025"; artist = "Statement Recipient Name"; "Dollars" is zero-padded — trim before parsing

${taxonomyPromptBlock()}

If it is NOT a royalty statement, return exactly:
{"is_royalty_statement": false}

Do not explain. Do not add any other fields. Just that JSON.`,
  });

  const identifyPrompt = `Look at the first part of this file and identify whether it's a music royalty statement.

IMPORTANT: You are only seeing the first 50KB of what may be a very large file. Do NOT guess at date ranges or row counts — you cannot see the full file. Focus only on what you can reliably determine from this sample.

Return this exact JSON — no markdown, no explanation:
{
  "is_royalty_statement": true,
  "source": "platform or org name (e.g. DistroKid, SoundCloud for Artists, Spotify, ASCAP)",
  "royalty_type": "mechanical | performance | sync | digital_performance | digital_distribution | neighboring_rights | unknown",
  "detected_artist": "the artist or label name found in the data rows, or null if multiple different artists appear or none is found",
  "greeting": "One sentence from Roy — acknowledge what this file is, spoken directly to the user. Warm, specific, professional. Do NOT mention date ranges. Do NOT include any numbers, values, platform names, or data from the file. Describe only the type and source of the statement."
}

File name: ${fileName}
File content (first 50KB):
${fileContent}`;

  let identified: Record<string, unknown>;

  try {
    const result = await model.generateContent(identifyPrompt);
    const parsed = extractJSON(result.response.text());

    if (!parsed || parsed.is_royalty_statement === false) {
      await supabase.from("statements").delete().eq("id", statementId);
      return NextResponse.json({
        error: "not_royalty_data",
        message: "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs.",
      }, { status: 422 });
    }

    identified = parsed;
  } catch (err) {
    await supabase.from("statements").delete().eq("id", statementId);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("429") || message.toLowerCase().includes("too many requests")) {
      return NextResponse.json(
        { error: "rate_limit", message: "Roy is a little overloaded right now — please try again in a moment." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await supabase.from("statements").update({
    source_type: String(identified.source ?? ""),
    status: "identified",
  }).eq("id", statementId);

  // Generate a signed upload URL so the client can store the full file in the background
  const { data: signedUpload } = await supabase.storage
    .from("statements")
    .createSignedUploadUrl(storagePath);

  return NextResponse.json({
    statementId,
    source: identified.source,
    royalty_type: identified.royalty_type,
    detected_artist: identified.detected_artist ?? null,
    greeting: identified.greeting,
    file_name: fileName,
    signedUrl: signedUpload?.signedUrl ?? null,
  });
}

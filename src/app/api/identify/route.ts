import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";

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

  const { statementId } = await req.json() as { statementId: string };
  if (!statementId) {
    return NextResponse.json({ error: "statementId is required" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const { data: statement, error: stmtError } = await supabase
    .from("statements")
    .select("*")
    .eq("id", statementId)
    .eq("user_id", userId)
    .single();

  if (stmtError || !statement) {
    return NextResponse.json({ error: "Statement not found" }, { status: 404 });
  }

  // Generate a short-lived signed URL and fetch only the first 50KB via Range header.
  // This avoids downloading the full file (which could be hundreds of MB) just for identification.
  const { data: signedDownload, error: signedErr } = await supabase.storage
    .from("statements")
    .createSignedUrl(statement.file_url, 60);

  if (signedErr || !signedDownload) {
    await supabase.from("statements").delete().eq("id", statementId);
    return NextResponse.json({ error: "Could not access uploaded file" }, { status: 500 });
  }

  let fileText: string;
  try {
    const rangeRes = await fetch(signedDownload.signedUrl, {
      headers: { Range: "bytes=0-49999" },
    });
    fileText = await rangeRes.text();
  } catch {
    await supabase.from("statements").delete().eq("id", statementId);
    return NextResponse.json({ error: "Could not read uploaded file" }, { status: 500 });
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
  "royalty_type": "mechanical | performance | sync | digital_performance | neighboring_rights | unknown",
  "detected_artist": "the artist or label name found in the data rows, or null if multiple different artists appear or none is found",
  "greeting": "One sentence from Roy — acknowledge what this file is, spoken directly to the user. Warm, specific, professional. Do NOT mention date ranges. Do NOT include any numbers, values, platform names, or data from the file. Describe only the type and source of the statement."
}

File name: ${statement.file_name}
File content (first 50KB):
${fileText}`;

  let identified: Record<string, unknown>;

  try {
    const result = await model.generateContent(identifyPrompt);
    const parsed = extractJSON(result.response.text());

    if (!parsed || parsed.is_royalty_statement === false) {
      await supabase.storage.from("statements").remove([statement.file_url]);
      await supabase.from("statements").delete().eq("id", statementId);
      return NextResponse.json({
        error: "not_royalty_data",
        message: "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs.",
      }, { status: 422 });
    }

    identified = parsed;
  } catch (err) {
    await supabase.storage.from("statements").remove([statement.file_url]);
    await supabase.from("statements").delete().eq("id", statementId);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await supabase.from("statements").update({
    source_type: String(identified.source ?? ""),
    status: "identified",
  }).eq("id", statementId);

  return NextResponse.json({
    statementId,
    source: identified.source,
    royalty_type: identified.royalty_type,
    detected_artist: identified.detected_artist ?? null,
    greeting: identified.greeting,
    file_name: statement.file_name,
  });
}

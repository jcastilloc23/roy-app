import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ALLOWED_EXTENSIONS = [".csv", ".tsv", ".pdf", ".xls", ".xlsx"];

function getExtension(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // 1. Format check — reject unsupported file types before touching storage
  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({
      error: "unsupported_format",
      message: `Roy only reads CSV, TSV, PDF, XLS, and XLSX files. You uploaded a ${ext} file.`,
    }, { status: 415 });
  }

  const supabase = supabaseAdmin();
  const statementId = crypto.randomUUID();
  const storagePath = `${userId}/${statementId}/${file.name}`;

  // 2. Upload to Storage first — needed for large files
  const fileBuffer = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage
    .from("statements")
    .upload(storagePath, fileBuffer, { contentType: file.type });

  if (storageError) {
    return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 });
  }

  // 3. Read first 50KB only — enough to identify any statement, works for huge files
  const fileText = await file.slice(0, 50000).text();

  // 4. Lightweight Gemini identification — is this a real royalty statement?
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are Roy — a music royalty analyst who specializes in transparency for independent artists, labels, and publishers. You know every DSP and PRO statement format on sight.

Your only job here is to quickly identify whether an uploaded file is a music royalty statement, and if so, what it is.

You ONLY accept files from DSPs (Spotify, Apple Music, YouTube Music, Amazon Music, TIDAL, Deezer), distributors (DistroKid, CD Baby, TuneCore, AWAL, FUGA), PROs (ASCAP, BMI, SESAC, SoundExchange, GMR), and CMOs (MLC, HFA, Songtrust).

If it is NOT a royalty statement, return exactly:
{"is_royalty_statement": false}

Do not explain. Do not add any other fields. Just that JSON.`,
  });

  const identifyPrompt = `Look at the first part of this file and identify whether it's a music royalty statement.

Return this exact JSON — no markdown, no explanation:
{
  "is_royalty_statement": true,
  "source": "platform or org name (e.g. DistroKid, Spotify, ASCAP)",
  "royalty_type": "mechanical | performance | sync | digital_performance | neighboring_rights | unknown",
  "period_start": "YYYY-MM-DD or null",
  "period_end": "YYYY-MM-DD or null",
  "estimated_rows": number or null,
  "greeting": "One sentence from Roy — acknowledge what this file is, spoken directly to the user. Warm, specific, professional. E.g. 'This is your DistroKid mechanical royalty statement covering March 2022 through January 2026 — I can see ${file.name.includes("distrokid") ? "DistroKid" : "royalty"} data across multiple platforms and territories.'"
}

File name: ${file.name}
File content (first 50KB):
${fileText}`;

  let identified: Record<string, unknown>;

  try {
    const result = await model.generateContent(identifyPrompt);
    const rawText = result.response.text();
    const parsed = extractJSON(rawText);

    if (!parsed || parsed.is_royalty_statement === false) {
      // Not a royalty statement — delete from Storage immediately, nothing saved to DB
      await supabase.storage.from("statements").remove([storagePath]);
      return NextResponse.json({
        error: "not_royalty_data",
        message: "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs.",
      }, { status: 422 });
    }

    identified = parsed;
  } catch (err) {
    // Gemini failed — clean up storage
    await supabase.storage.from("statements").remove([storagePath]);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 5. Save statement to DB — only reaches here if it's a valid royalty statement
  const { error: stmtError } = await supabase.from("statements").insert({
    id: statementId,
    user_id: userId,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    file_url: storagePath,
    source_type: String(identified.source ?? ""),
    status: "identified",
  });

  if (stmtError) {
    await supabase.storage.from("statements").remove([storagePath]);
    return NextResponse.json({ error: `DB error: ${stmtError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    statementId,
    source: identified.source,
    royalty_type: identified.royalty_type,
    period_start: identified.period_start,
    period_end: identified.period_end,
    estimated_rows: identified.estimated_rows,
    greeting: identified.greeting,
    file_name: file.name,
  });
}

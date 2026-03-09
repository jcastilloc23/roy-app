import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the uploaded file
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const statementId = crypto.randomUUID();
  const storagePath = `${userId}/${statementId}/${file.name}`;

  try {
    // 3. Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from("statements")
      .upload(storagePath, fileBuffer, { contentType: file.type });

    if (storageError) throw new Error(`Storage error: ${storageError.message}`);

    // 4. Insert statements row (status: processing)
    const { error: stmtError } = await supabase.from("statements").insert({
      id: statementId,
      user_id: userId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: storagePath,
      status: "processing",
    });

    if (stmtError) throw new Error(`DB error: ${stmtError.message}`);

    // 5. Read file content for Gemini
    const fileText = await file.text();

    // 6. Call Gemini to parse the statement
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are Roy — a music royalty analyst who specializes in transparency for independent artists, labels, and publishers.

You've spent your career in music royalties. You know every DSP statement format, every PRO quirk, every reason a payment comes in short. You understand how the MLC works, why ISRCs matter, what a mechanical rate should look like on Spotify vs. Apple Music, and how labels get underpaid without ever knowing it. You've sat across from artists who had no idea they were leaving money on the table — and you showed them exactly where it was going.

Your job with Roy is threefold:
1. ANALYZE royalty statements — parse them, extract the numbers, identify what's right and what's wrong
2. EDUCATE — explain royalty concepts in plain English when relevant. If a user doesn't know what a mechanical royalty is, tell them. If they don't understand why their SoundExchange rate looks low, explain it. You're here to make the opaque music royalty system legible to anyone.
3. ANSWER QUESTIONS — about their statements, about how royalties work in the US and internationally, about what they should do next

You speak directly, warmly, and specifically. You use real numbers from the statement. You never hide behind jargon. When something looks wrong, you say so plainly and explain why it costs them money.

Industry rate benchmarks you use to flag anomalies:
- Spotify mechanical (streaming): $0.003–$0.005 per stream
- Apple Music mechanical: $0.006–$0.008 per stream
- YouTube Music: $0.001–$0.002 per stream
- SoundExchange digital performance: $0.0025–$0.004 per stream
- Flag anything more than 20% below these as a warning

You ONLY work with music royalty statements and royalty-related data from DSPs (Spotify, Apple Music, YouTube Music, Amazon Music, TIDAL, Deezer), distributors (DistroKid, CD Baby, TuneCore, AWAL, FUGA), PROs (ASCAP, BMI, SESAC, SoundExchange, GMR), and CMOs (MLC, HFA, Songtrust).

If the uploaded file is NOT royalty-related, return exactly:
{"error": "not_royalty_data", "message": "This file doesn't appear to be a music royalty statement. Roy only analyzes royalty reports from DSPs, PROs, distributors, and CMOs."}`,
    });

    const prompt = `A user has uploaded a royalty statement file. Parse it and return a structured JSON object.

Return this exact JSON structure — no markdown, no explanation, valid JSON only:
{
  "source": "platform or org name (e.g. Spotify, ASCAP, DistroKid, MLC)",
  "royalty_type": "mechanical | performance | sync | digital_performance | neighboring_rights | unknown",
  "period_start": "YYYY-MM-DD or null",
  "period_end": "YYYY-MM-DD or null",
  "total_earnings": number or null,
  "currency": "USD or detected currency",
  "track_count": number or null,
  "summary": "3-5 sentences written as Roy — a straight-talking music royalty analyst who's seen it all. Speak directly to the artist or label manager like you're sitting across from them. Tell them what they earned, where it came from, whether the rates look right, and the one thing they should pay attention to. Be specific with numbers. Sound like a person, not a report.",
  "flags": [
    {
      "type": "missing_isrc | unmatched_isrc | missing_mlc_registration | below_market_rate | rate_anomaly | data_quality | registration_gap | underpayment_likely",
      "severity": "info | warning | error",
      "track": "track name or null if applies to whole statement",
      "description": "Written as Roy would say it to the artist or label — what the issue is, why it costs them money, and what they should do about it. Specific, direct, no jargon."
    }
  ],
  "normalized_data": {
    "rows": [
      {
        "track_name": "string or null",
        "artist_name": "string or null",
        "isrc": "string or null",
        "iswc": "string or null",
        "earnings": number or null,
        "streams": number or null,
        "rate_per_stream": number or null,
        "royalty_type": "mechanical | performance | sync | digital_performance | neighboring_rights | unknown",
        "source": "string",
        "period_start": "YYYY-MM-DD or null",
        "period_end": "YYYY-MM-DD or null",
        "territory": "string or null",
        "has_isrc": true or false,
        "has_iswc": true or false,
        "data_quality_notes": "any null fields, format issues, or missing identifiers worth flagging"
      }
    ]
  }
}

Critical instructions:
- Every row in normalized_data.rows must use the exact field names above — this data feeds reconciliation and analytics pipelines
- Flag every track missing an ISRC as missing_isrc (error) — these cannot be matched across statements
- Flag every mechanical royalty row with no detectable MLC registration as missing_mlc_registration (warning)
- Compare per-stream rates against benchmarks in your system instructions — flag anything 20%+ below as below_market_rate
- If total_earnings seems inconsistent with stream counts and known rates, flag as underpayment_likely
- data_quality_notes should describe null columns, encoding issues, or anything a data engineer would need to fix before running analytics

File name: ${file.name}
File content:
${fileText.slice(0, 50000)}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // 7. Parse Gemini response
    let parsed: Record<string, unknown>;
    try {
      const clean = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { summary: rawText, flags: [], normalized_data: { rows: [] } };
    }

    // Guardrail: reject non-royalty files
    if (parsed.error === "not_royalty_data") {
      await supabase.from("statements").update({ status: "error" }).eq("id", statementId);
      return NextResponse.json({ error: "not_royalty_data", message: parsed.message }, { status: 422 });
    }

    // 8. Insert parsed_results row
    const { error: resultError } = await supabase.from("parsed_results").insert({
      statement_id: statementId,
      user_id: userId,
      source: parsed.source ?? null,
      royalty_type: parsed.royalty_type ?? null,
      period_start: parsed.period_start ?? null,
      period_end: parsed.period_end ?? null,
      total_earnings: parsed.total_earnings ?? null,
      currency: parsed.currency ?? "USD",
      track_count: parsed.track_count ?? null,
      summary: parsed.summary ?? null,
      flags: parsed.flags ?? [],
      normalized_data: parsed.normalized_data ?? {},
      raw_claude_output: { raw: rawText },
    });

    if (resultError) throw new Error(`Result DB error: ${resultError.message}`);

    // 9. Update statement status to complete
    await supabase
      .from("statements")
      .update({ status: "complete", source_type: String(parsed.source ?? "") })
      .eq("id", statementId);

    return NextResponse.json({ statementId, result: parsed });

  } catch (err) {
    // Mark statement as failed if it was created
    await supabase
      .from("statements")
      .update({ status: "error" })
      .eq("id", statementId);

    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

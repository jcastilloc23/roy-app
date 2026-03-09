import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";
import Papa from "papaparse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type AnalyzeAction = "summarize" | "anomalies" | "cleanup" | "split";

function extractJSON(text: string): Record<string, unknown> | null {
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

const ROY_SYSTEM = `You are Roy — a music royalty analyst who specializes in transparency for independent artists, labels, and publishers.

You've spent your career in music royalties. You know every DSP statement format, every PRO quirk, every reason a payment comes in short. You speak directly, warmly, and specifically. You use real numbers. You never hide behind jargon. When something looks wrong, you say so plainly.

Industry rate benchmarks (US and major Western markets only — CA, GB, AU, DE, FR):
- Spotify mechanical: $0.003–$0.005/stream
- Apple Music mechanical: $0.006–$0.008/stream
- YouTube Music: $0.001–$0.002/stream
- SoundExchange digital performance: $0.0025–$0.004/stream

Platforms like Boomplay, TikTok, NetEase, Tencent, Luna, and Facebook/Meta pay at structurally lower rates — do not flag these as anomalies. Emerging market territories (CN, VN, PH, ID, IN, TH, KH, NG, KE, etc.) also have lower rates by design.`;

/* ── Column detection ────────────────────────────────────────────────────── */

// DSP-specific column name overrides (keyed by source_type string, lowercase)
const DSP_COLUMNS: Record<string, {
  earnings?: string; streams?: string; store?: string; territory?: string; track?: string; period?: string;
}> = {
  distrokid: {
    earnings: "Earnings (USD)", streams: "Quantity", store: "Store",
    territory: "Country of Sale", track: "Title", period: "Sale Period",
  },
  "distrokid for teams": {
    earnings: "Earnings (USD)", streams: "Quantity", store: "Store",
    territory: "Country of Sale", track: "Title", period: "Sale Period",
  },
  tunecore: {
    earnings: "Revenue", streams: "Streams", store: "Store",
    territory: "Territory", track: "Track Title",
  },
  "cd baby": {
    earnings: "Net Sales", streams: "Units", store: "Retailer",
    territory: "Country", track: "Track Title",
  },
  spotify: {
    earnings: "Royalty", streams: "Streams", territory: "Territory", track: "Track Name",
  },
  soundexchange: {
    earnings: "Royalties", streams: "Plays", territory: "Country", track: "Sound Recording Title",
  },
  ascap: { earnings: "Domestic Total", track: "Title" },
  bmi: { earnings: "Amount", track: "Title" },
};

const EARNINGS_KEYWORDS = ["earn", "royalt", "revenue", "net", "payment", "amount", "income", "pay"];
const STREAMS_KEYWORDS  = ["stream", "quantity", "unit", "play", "count", "listen"];
const STORE_KEYWORDS    = ["store", "platform", "dsp", "service", "retailer", "channel", "outlet"];
const TERRITORY_KEYWORDS = ["country", "territory", "region", "market", "locale"];
const TRACK_KEYWORDS    = ["title", "track", "song", "recording", "asset", "work"];
const PERIOD_KEYWORDS   = ["period", "date", "month", "quarter", "report"];

function findCol(headers: string[], keywords: string[]): string | null {
  for (const kw of keywords) {
    const match = headers.find(h => h.toLowerCase().includes(kw));
    if (match) return match;
  }
  return null;
}

function resolveColumns(headers: string[], source: string) {
  const dsp = DSP_COLUMNS[source.toLowerCase()] ?? {};
  const verify = (col: string | undefined) => col && headers.includes(col) ? col : undefined;

  return {
    earningsCol:  verify(dsp.earnings)  ?? findCol(headers, EARNINGS_KEYWORDS),
    streamsCol:   verify(dsp.streams)   ?? findCol(headers, STREAMS_KEYWORDS),
    storeCol:     verify(dsp.store)     ?? findCol(headers, STORE_KEYWORDS),
    territoryCol: verify(dsp.territory) ?? findCol(headers, TERRITORY_KEYWORDS),
    trackCol:     verify(dsp.track)     ?? findCol(headers, TRACK_KEYWORDS),
    periodCol:    verify(dsp.period)    ?? findCol(headers, PERIOD_KEYWORDS),
  };
}

/* ── Numeric parser ──────────────────────────────────────────────────────── */
function toNum(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/[$,\s]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

/* ── CSV/TSV summarize (client-side parse) ───────────────────────────────── */
interface SummarizeStats {
  source: string;
  totalEarnings: number;
  totalStreams: number;
  rowCount: number;
  trackCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  byStore: { name: string; earnings: number; streams: number }[];
  byTerritory: { name: string; earnings: number; streams: number }[];
  topTracks: { track: string; earnings: number; streams: number }[];
  columnsDetected: Record<string, string>;
}

function parseAndAggregate(fileText: string, fileName: string, source: string): SummarizeStats | null {
  const isTsv = fileName.toLowerCase().endsWith(".tsv");
  const parsed = Papa.parse<Record<string, unknown>>(fileText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: isTsv ? "\t" : "",
  });

  if (!parsed.data.length) return null;
  const rows = parsed.data;
  const headers = parsed.meta.fields ?? [];
  const cols = resolveColumns(headers, source);

  let totalEarnings = 0;
  let totalStreams = 0;
  const byStore: Record<string, { earnings: number; streams: number }> = {};
  const byTerritory: Record<string, { earnings: number; streams: number }> = {};
  const byTrack: Record<string, { earnings: number; streams: number }> = {};
  const periods: string[] = [];

  for (const row of rows) {
    const earn    = cols.earningsCol  ? toNum(row[cols.earningsCol])  : 0;
    const streams = cols.streamsCol   ? toNum(row[cols.streamsCol])   : 0;
    const store   = cols.storeCol     ? String(row[cols.storeCol] ?? "").trim() || "Unknown" : null;
    const terr    = cols.territoryCol ? String(row[cols.territoryCol] ?? "").trim() || "Unknown" : null;
    const track   = cols.trackCol     ? String(row[cols.trackCol] ?? "").trim() || "Unknown" : null;
    const period  = cols.periodCol    ? String(row[cols.periodCol] ?? "").trim() : null;

    totalEarnings += earn;
    totalStreams  += streams;

    if (store) {
      byStore[store] ??= { earnings: 0, streams: 0 };
      byStore[store].earnings += earn;
      byStore[store].streams  += streams;
    }
    if (terr) {
      byTerritory[terr] ??= { earnings: 0, streams: 0 };
      byTerritory[terr].earnings += earn;
      byTerritory[terr].streams  += streams;
    }
    if (track) {
      byTrack[track] ??= { earnings: 0, streams: 0 };
      byTrack[track].earnings += earn;
      byTrack[track].streams  += streams;
    }
    if (period) periods.push(period);
  }

  const sortedStores = Object.entries(byStore)
    .sort((a, b) => b[1].earnings - a[1].earnings)
    .slice(0, 10)
    .map(([name, v]) => ({ name, ...v }));

  const sortedTerritories = Object.entries(byTerritory)
    .sort((a, b) => b[1].earnings - a[1].earnings)
    .slice(0, 10)
    .map(([name, v]) => ({ name, ...v }));

  const topTracks = Object.entries(byTrack)
    .sort((a, b) => b[1].earnings - a[1].earnings)
    .slice(0, 5)
    .map(([track, v]) => ({ track, ...v }));

  const sortedPeriods = [...periods].sort();

  const columnsDetected: Record<string, string> = {};
  if (cols.earningsCol)  columnsDetected.earnings  = cols.earningsCol;
  if (cols.streamsCol)   columnsDetected.streams   = cols.streamsCol;
  if (cols.storeCol)     columnsDetected.store     = cols.storeCol;
  if (cols.territoryCol) columnsDetected.territory = cols.territoryCol;
  if (cols.trackCol)     columnsDetected.track     = cols.trackCol;

  return {
    source,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalStreams: Math.round(totalStreams),
    rowCount: rows.length,
    trackCount: Object.keys(byTrack).length,
    periodStart: sortedPeriods[0] ?? null,
    periodEnd: sortedPeriods[sortedPeriods.length - 1] ?? null,
    byStore: sortedStores,
    byTerritory: sortedTerritories,
    topTracks,
    columnsDetected,
  };
}

function buildNarrativePrompt(stats: SummarizeStats): string {
  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const storeLines = stats.byStore
    .map(s => `  ${s.name}: ${fmt(s.earnings)}${s.streams ? ` (${s.streams.toLocaleString()} streams)` : ""}`)
    .join("\n");
  const terrLines = stats.byTerritory
    .map(t => `  ${t.name}: ${fmt(t.earnings)}`)
    .join("\n");
  const trackLines = stats.topTracks
    .map(t => `  ${t.track}: ${fmt(t.earnings)}${t.streams ? ` (${t.streams.toLocaleString()} streams)` : ""}`)
    .join("\n");

  return `These are the exact computed stats for a royalty statement from ${stats.source}. Write a 4–6 sentence summary speaking directly to the rights holder. Use these exact numbers — do not estimate or invent. Sound like a person, not a report.

Return this exact JSON — no markdown, no explanation:
{ "summary": "..." }

Statement stats:
Source: ${stats.source}
Total earnings: ${fmt(stats.totalEarnings)}
Total streams/units: ${stats.totalStreams.toLocaleString()}
Total data rows: ${stats.rowCount.toLocaleString()}
Unique tracks: ${stats.trackCount.toLocaleString()}
Period: ${stats.periodStart ?? "unknown"} to ${stats.periodEnd ?? "unknown"}

Top stores/platforms by earnings:
${storeLines || "  (not available)"}

Top territories by earnings:
${terrLines || "  (not available)"}

Top 5 tracks by earnings:
${trackLines || "  (not available)"}`;
}

/* ── Gemini prompt builder (anomalies / cleanup / split) ─────────────────── */
function buildPrompt(action: Exclude<AnalyzeAction, "summarize">, fileName: string, fileText: string): string {
  const fileSection = `\nFile name: ${fileName}\nFile content:\n${fileText.slice(0, 50000)}`;

  switch (action) {
    case "anomalies":
      return `Audit this royalty statement for anomalies and issues. Return this exact JSON — no markdown, no explanation:
{
  "anomaly_summary": "2-3 sentences from Roy summarizing the overall health of this statement and the most critical finding.",
  "flags": [
    {
      "type": "missing_isrc | unmatched_isrc | missing_mlc_registration | below_market_rate | rate_anomaly | data_quality | registration_gap | underpayment_likely",
      "severity": "info | warning | error",
      "track": "track name or null",
      "description": "Roy speaking directly — what the issue is, why it costs money, what to do. Consolidate patterns into single flags rather than one flag per row. Max 10 flags total, prioritize actionable ones."
    }
  ]
}${fileSection}`;

    case "cleanup":
      return `Analyze the data quality of this royalty statement and describe what needs to be cleaned. Return this exact JSON — no markdown, no explanation:
{
  "cleanup_summary": "2-3 sentences from Roy describing the overall data quality and what the biggest issues are.",
  "issues": [
    {
      "issue": "short description (e.g. 'Null values in ISRC column')",
      "affected_rows": number or null,
      "recommendation": "what to do about it"
    }
  ],
  "column_map": { "original_column_name": "recommended_standard_name" },
  "ready_for_analytics": true or false,
  "blocker": "what's preventing analytics readiness, or null if ready"
}${fileSection}`;

    case "split":
      return `Analyze how this royalty statement should be split into separate files. Return this exact JSON — no markdown, no explanation:
{
  "split_summary": "2-3 sentences from Roy explaining the best way to break this file apart and why.",
  "recommended_split_by": "artist | platform | territory | period | royalty_type",
  "reason": "why this split makes the most sense for this file",
  "split_groups": [
    {
      "group_name": "string (e.g. 'Spotify', 'Artist A', 'US')",
      "estimated_rows": number or null,
      "notes": "anything notable about this group"
    }
  ]
}
Limit split_groups to the most meaningful 10 groups.${fileSection}`;
  }
}

/* ── Route handler ───────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { statementId, action } = await req.json() as { statementId: string; action: AnalyzeAction };

  if (!statementId || !action) {
    return NextResponse.json({ error: "statementId and action are required" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  // 1. Fetch statement — verify it belongs to this user
  const { data: statement, error: stmtFetchError } = await supabase
    .from("statements")
    .select("*")
    .eq("id", statementId)
    .eq("user_id", userId)
    .single();

  if (stmtFetchError || !statement) {
    return NextResponse.json({ error: "Statement not found" }, { status: 404 });
  }

  // 2. Download file from Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("statements")
    .download(statement.file_url);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "Could not retrieve file from storage" }, { status: 500 });
  }

  // 3. Mark processing
  await supabase.from("statements").update({ status: "processing" }).eq("id", statementId);

  const fileText = await fileData.text();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: ROY_SYSTEM });

  let parsed: Record<string, unknown>;

  try {
    // ── Summarize: parse locally, send only aggregated stats to Gemini ──
    if (action === "summarize") {
      const ext = statement.file_name.toLowerCase();
      const isTabular = ext.endsWith(".csv") || ext.endsWith(".tsv");

      if (isTabular) {
        const stats = parseAndAggregate(fileText, statement.file_name, statement.source_type ?? "");

        if (stats) {
          const narrativePrompt = buildNarrativePrompt(stats);
          const result = await model.generateContent(narrativePrompt);
          const narrative = extractJSON(result.response.text()) as { summary?: string } | null;

          parsed = {
            summary: narrative?.summary ?? "Roy analyzed your statement.",
            total_earnings: stats.totalEarnings,
            total_streams: stats.totalStreams,
            currency: "USD",
            track_count: stats.trackCount,
            period_start: stats.periodStart,
            period_end: stats.periodEnd,
            source: stats.source,
            top_earners: stats.topTracks.map(t => ({
              track: t.track,
              earnings: t.earnings,
              streams: t.streams || null,
            })),
            by_store: stats.byStore,
            by_territory: stats.byTerritory,
            columns_detected: stats.columnsDetected,
          };
        } else {
          // Empty or unparseable — fall through to Gemini
          parsed = await runGeminiSummarize(model, statement.file_name, fileText);
        }
      } else {
        // PDF / XLS / XLSX — fall through to Gemini
        parsed = await runGeminiSummarize(model, statement.file_name, fileText);
      }

    // ── Other actions: send file text to Gemini ──
    } else {
      const prompt = buildPrompt(action, statement.file_name, fileText);
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      parsed = extractJSON(rawText) ?? { summary: rawText };
    }

    // 4. Save to parsed_results
    await supabase.from("parsed_results").upsert({
      statement_id: statementId,
      user_id: userId,
      source: statement.source_type ?? null,
      royalty_type: (parsed.royalty_type as string) ?? null,
      period_start: parsed.period_start ?? null,
      period_end: parsed.period_end ?? null,
      total_earnings: parsed.total_earnings ?? null,
      currency: (parsed.currency as string) ?? "USD",
      track_count: parsed.track_count ?? null,
      summary: (parsed.summary ?? parsed.anomaly_summary ?? parsed.cleanup_summary ?? parsed.split_summary ?? null) as string | null,
      flags: parsed.flags ?? [],
      normalized_data: { action, ...parsed },
      raw_claude_output: { action },
    }, { onConflict: "statement_id" });

    // 5. Mark complete
    await supabase.from("statements").update({ status: "complete" }).eq("id", statementId);

    return NextResponse.json({ action, result: parsed });

  } catch (err) {
    await supabase.from("statements").update({ status: "error" }).eq("id", statementId);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ── Gemini fallback summarize (PDF/XLS) ─────────────────────────────────── */
async function runGeminiSummarize(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  fileName: string,
  fileText: string,
): Promise<Record<string, unknown>> {
  const prompt = `Summarize this royalty statement. Return this exact JSON — no markdown, no explanation:
{
  "summary": "4-6 sentences from Roy speaking directly to the rights holder. What did they earn, from where, at what rates, over what period. Specific numbers. Sound like a person.",
  "total_earnings": number or null,
  "currency": "USD or detected",
  "track_count": number or null,
  "period_start": "YYYY-MM-DD or null",
  "period_end": "YYYY-MM-DD or null",
  "source": "platform name",
  "top_earners": [{ "track": "string", "earnings": number, "streams": number or null }]
}
Limit top_earners to 5.
File name: ${fileName}
File content:
${fileText.slice(0, 50000)}`;

  const result = await model.generateContent(prompt);
  return extractJSON(result.response.text()) ?? { summary: result.response.text() };
}

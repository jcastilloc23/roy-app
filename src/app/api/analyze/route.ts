import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";
import { matchSchema } from "@/lib/stmts-schema";
import { taxonomyPromptBlock } from "@/lib/industry-taxonomy";
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

${taxonomyPromptBlock()}

Industry rate benchmarks (US and major Western markets only — CA, GB, AU, DE, FR):
- Spotify: $0.003–$0.005/stream
- Apple Music: $0.006–$0.008/stream
- YouTube Music: $0.001–$0.002/stream
- SoundExchange digital performance: $0.0025–$0.004/stream

Platforms like Boomplay, TikTok, NetEase, Tencent, Luna, and Facebook/Meta pay at structurally lower rates — do not flag these as anomalies. Emerging market territories (CN, VN, PH, ID, IN, TH, KH, NG, KE, etc.) also have lower rates by design.`;

/* ── Schema detection via Gemini ─────────────────────────────────────────── */

interface ColumnMap {
  earnings: string | null;
  streams: string | null;
  store: string | null;
  territory: string | null;
  track: string | null;
  period: string | null;
  artist: string | null;
}

interface SchemaDetection {
  header_row: number; // 0-indexed row where column headers live
  columns: ColumnMap;
}

type GeminiModel = ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

async function detectSchema(fileText: string, source: string, model: GeminiModel): Promise<SchemaDetection> {
  const fallback: SchemaDetection = {
    header_row: 0,
    columns: { earnings: null, streams: null, store: null, territory: null, track: null, period: null, artist: null },
  };

  const first20 = fileText.split("\n").slice(0, 20).join("\n");

  const prompt = `These are the first 20 lines of a royalty statement from "${source}".

Some statements include metadata rows (account IDs, titles, etc.) before the real column headers. Identify which row contains the actual column headers and map each column to a standard royalty field.

Return this exact JSON — no markdown, no explanation:
{
  "header_row": 0,
  "columns": {
    "earnings": "exact column name that contains the payment/royalty/revenue dollar amount, or null",
    "streams": "exact column name for play count/units/streams/quantity, or null",
    "store": "exact column name for platform/DSP/store/partner/channel, or null",
    "territory": "exact column name for country/territory/region, or null",
    "track": "exact column name for track/song title (not artist, not album), or null",
    "period": "exact column name for reporting date/period/month, or null",
    "artist": "exact column name for artist name, or null"
  }
}

header_row is 0-indexed. If the column headers are on the very first line, use 0.
Use null for any field with no clear match.
Use exact column names as they appear in the file — character-for-character.

File (first 20 lines):
${first20}`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = extractJSON(result.response.text()) as SchemaDetection | null;
    if (!parsed || typeof parsed.header_row !== "number") return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

/* ── Artist normalization ────────────────────────────────────────────────── */

/** Strips featuring credits and lowercases for deduplication comparison only — never stored */
function normalizeArtistForComparison(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+(feat\.?|ft\.?|featuring|with)\s+.*/i, "")
    .replace(/\s+/g, " ")
    .trim();
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

/* ── Local aggregation ───────────────────────────────────────────────────── */
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
  byPeriod: { period: string; earnings: number; streams: number }[];
  topTracks: { track: string; earnings: number; streams: number }[];
  columnsDetected: Partial<ColumnMap>;
  /** Unique artist names found in data, canonical casing, deduplicated by normalized form */
  detectedArtists: string[];
  byArtist: { name: string; earnings: number; streams: number }[];
  /** Cross-tab: period → artist → { earnings, streams } — all artists, client filters to top N */
  byPeriodByArtist: Record<string, Record<string, { earnings: number; streams: number }>>;
  /** Per-artist breakdown maps for drill-down — all artists */
  byArtistStore: Record<string, Record<string, { earnings: number; streams: number }>>;
  byArtistTerritory: Record<string, Record<string, { earnings: number; streams: number }>>;
  byArtistTrack: Record<string, Record<string, { earnings: number; streams: number }>>;
}

async function summarizeTabular(
  fileText: string,
  fileName: string,
  source: string,
  model: GeminiModel,
): Promise<SummarizeStats | null> {
  // 1. Try to match against known schemas using column fingerprints — skips Gemini call for known formats
  const isTsv = fileName.toLowerCase().endsWith(".tsv");
  const lines = fileText.split("\n");
  // Scan the first 5 lines for a header row — cheap, no Gemini needed
  let knownSchema = null;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const probe = Papa.parse<string[]>(lines[i], { delimiter: isTsv ? "\t" : "" });
    const headers = (probe.data[0] ?? []).map(h => String(h).trim());
    knownSchema = matchSchema(headers);
    if (knownSchema) break;
  }

  const schema = knownSchema
    ? { header_row: knownSchema.headerRow, columns: knownSchema.columns as ColumnMap }
    : await detectSchema(fileText, source, model);

  const { columns } = schema;

  // 2. Slice from the detected header row and parse
  const dataText = lines.slice(schema.header_row).join("\n");

  const parsed = Papa.parse<Record<string, unknown>>(dataText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: isTsv ? "\t" : "",
  });

  if (!parsed.data.length) return null;
  const rows = parsed.data;

  // 3. Aggregate using the detected column names
  let totalEarnings = 0;
  let totalStreams = 0;
  const byStore: Record<string, { earnings: number; streams: number }> = {};
  const byTerritory: Record<string, { earnings: number; streams: number }> = {};
  const byTrack: Record<string, { earnings: number; streams: number }> = {};
  const byPeriod: Record<string, { earnings: number; streams: number }> = {};
  const periods: string[] = [];
  // Artist deduplication: normalized form → first-seen canonical casing
  const artistsSeen = new Map<string, string>();
  const byArtist: Record<string, { earnings: number; streams: number }> = {};
  const byPeriodByArtist: Record<string, Record<string, { earnings: number; streams: number }>> = {};
  const byArtistStore: Record<string, Record<string, { earnings: number; streams: number }>> = {};
  const byArtistTerritory: Record<string, Record<string, { earnings: number; streams: number }>> = {};
  const byArtistTrack: Record<string, Record<string, { earnings: number; streams: number }>> = {};

  for (const row of rows) {
    const earn    = columns.earnings  ? toNum(row[columns.earnings])  : 0;
    const streams = columns.streams   ? toNum(row[columns.streams])   : 0;
    const store   = columns.store     ? String(row[columns.store]   ?? "").trim() || null : null;
    const terr    = columns.territory ? String(row[columns.territory] ?? "").trim() || null : null;
    const track   = columns.track     ? String(row[columns.track]   ?? "").trim() || null : null;
    const period  = columns.period    ? String(row[columns.period]  ?? "").trim() || null : null;
    const artist  = columns.artist    ? String(row[columns.artist]  ?? "").trim() || null : null;

    if (artist) {
      const normalized = normalizeArtistForComparison(artist);
      if (normalized && !artistsSeen.has(normalized)) {
        artistsSeen.set(normalized, artist);
      }
      // Use canonical casing for aggregation
      const canonical = artistsSeen.get(normalized ?? artist) ?? artist;
      byArtist[canonical] ??= { earnings: 0, streams: 0 };
      byArtist[canonical].earnings += earn;
      byArtist[canonical].streams  += streams;
      if (period) {
        byPeriodByArtist[period] ??= {};
        byPeriodByArtist[period][canonical] ??= { earnings: 0, streams: 0 };
        byPeriodByArtist[period][canonical].earnings += earn;
        byPeriodByArtist[period][canonical].streams  += streams;
      }
      if (store) {
        byArtistStore[canonical] ??= {};
        byArtistStore[canonical][store] ??= { earnings: 0, streams: 0 };
        byArtistStore[canonical][store].earnings += earn;
        byArtistStore[canonical][store].streams  += streams;
      }
      if (terr) {
        byArtistTerritory[canonical] ??= {};
        byArtistTerritory[canonical][terr] ??= { earnings: 0, streams: 0 };
        byArtistTerritory[canonical][terr].earnings += earn;
        byArtistTerritory[canonical][terr].streams  += streams;
      }
      if (track) {
        byArtistTrack[canonical] ??= {};
        byArtistTrack[canonical][track] ??= { earnings: 0, streams: 0 };
        byArtistTrack[canonical][track].earnings += earn;
        byArtistTrack[canonical][track].streams  += streams;
      }
    }

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
    if (period) {
      periods.push(period);
      byPeriod[period] ??= { earnings: 0, streams: 0 };
      byPeriod[period].earnings += earn;
      byPeriod[period].streams  += streams;
    }
  }

  const sortedPeriods = [...new Set(periods)].sort();

  return {
    source,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalStreams: Math.round(totalStreams),
    rowCount: rows.length,
    trackCount: Object.keys(byTrack).length,
    periodStart: sortedPeriods[0] ?? null,
    periodEnd: sortedPeriods[sortedPeriods.length - 1] ?? null,
    byStore: Object.entries(byStore)
      .sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 10)
      .map(([name, v]) => ({ name, ...v })),
    byTerritory: Object.entries(byTerritory)
      .sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 10)
      .map(([name, v]) => ({ name, ...v })),
    byPeriod: Object.entries(byPeriod)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, v]) => ({ period, ...v })),
    topTracks: Object.entries(byTrack)
      .sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 5)
      .map(([track, v]) => ({ track, ...v })),
    columnsDetected: Object.fromEntries(
      Object.entries(columns).filter(([, v]) => v !== null)
    ) as Partial<ColumnMap>,
    detectedArtists: Array.from(artistsSeen.values()),
    byArtist: Object.entries(byArtist)
      .sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 20)
      .map(([name, v]) => ({ name, ...v })),
    byPeriodByArtist,
    byArtistStore,
    byArtistTerritory,
    byArtistTrack,
  };
}

/* ── Narrative prompt (stats → Roy paragraph) ───────────────────────────── */
function buildNarrativePrompt(stats: SummarizeStats): string {
  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const storeLines = stats.byStore
    .map(s => `  ${s.name}: ${fmt(s.earnings)}${s.streams ? ` (${s.streams.toLocaleString()} streams/units)` : ""}`)
    .join("\n");
  const terrLines = stats.byTerritory
    .map(t => `  ${t.name}: ${fmt(t.earnings)}`)
    .join("\n");
  const trackLines = stats.topTracks
    .map(t => `  ${t.track}: ${fmt(t.earnings)}${t.streams ? ` (${t.streams.toLocaleString()} streams/units)` : ""}`)
    .join("\n");

  const multiArtistContext = stats.detectedArtists.length > 1
    ? `\nThis is a multi-artist label statement with ${stats.detectedArtists.length} artists. Acknowledge the roster context briefly. Do not recap individual artist totals — the user can see those. Lead with the catalog-level insight.`
    : "";

  return `These are the exact computed stats from a royalty statement from ${stats.source}. Write 2–3 sentences speaking directly to the rights holder. Use these exact numbers — do not estimate or invent anything. Do NOT recap total earnings or total streams — the user can see those numbers. Lead with the single most important insight: rate quality, geographic concentration, a top-track surprise, or a notable pattern. Sound like a sharp analyst giving a take, not a report.${multiArtistContext}

Return this exact JSON — no markdown, no explanation:
{ "summary": "..." }

Statement stats:
Source: ${stats.source}
Total earnings: ${fmt(stats.totalEarnings)}
Total streams/units: ${stats.totalStreams.toLocaleString()}
Total data rows: ${stats.rowCount.toLocaleString()}
Unique tracks: ${stats.trackCount.toLocaleString()}
Period: ${stats.periodStart ?? "unknown"} to ${stats.periodEnd ?? "unknown"}

Top platforms by earnings:
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

  const { statementId, action, artist_name, precomputedStats, inlineContent } = await req.json() as {
    statementId: string;
    action: AnalyzeAction;
    artist_name?: string;
    /** Client-side PapaParse result for large CSV/TSV files — skips server-side file download */
    precomputedStats?: SummarizeStats;
    /** First 50KB of file content for anomaly/cleanup actions on large files */
    inlineContent?: string;
  };

  if (!statementId || !action) {
    return NextResponse.json({ error: "statementId and action are required" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  // Cache check — if we already have normalized_data for this statement+action, return immediately
  const { data: cached } = await supabase
    .from("parsed_results")
    .select("normalized_data")
    .eq("statement_id", statementId)
    .maybeSingle();

  if (cached?.normalized_data && (cached.normalized_data as Record<string, unknown>).action === action) {
    return NextResponse.json({ action, result: cached.normalized_data, cached: true });
  }

  const { data: statement, error: stmtFetchError } = await supabase
    .from("statements")
    .select("*")
    .eq("id", statementId)
    .eq("user_id", userId)
    .single();

  if (stmtFetchError || !statement) {
    return NextResponse.json({ error: "Statement not found" }, { status: 404 });
  }

  let fileText = inlineContent ?? "";
  if (!precomputedStats && !inlineContent) {
    // Normal flow — download from Supabase Storage
    if (!statement.file_url) {
      return NextResponse.json({ error: "No file available for this statement" }, { status: 400 });
    }
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("statements")
      .download(statement.file_url);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Could not retrieve file from storage" }, { status: 500 });
    }
    fileText = await fileData.text();
  }

  await supabase.from("statements").update({ status: "processing" }).eq("id", statementId);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: ROY_SYSTEM });

  let parsed: Record<string, unknown>;

  try {
    if (action === "summarize") {
      const ext = statement.file_name.toLowerCase();
      const isTabular = ext.endsWith(".csv") || ext.endsWith(".tsv");

      // Use client-provided stats for large files (PapaParse ran in the browser)
      const stats = precomputedStats ?? (isTabular
        ? await summarizeTabular(fileText, statement.file_name, statement.source_type ?? "", model)
        : null);

      if (isTabular || precomputedStats) {

        if (stats) {
          const narrativePrompt = buildNarrativePrompt(stats);
          const narrativeResult = await model.generateContent(narrativePrompt);
          const narrative = extractJSON(narrativeResult.response.text()) as { summary?: string } | null;

          // ── Artist resolution ────────────────────────────────────────────
          // "various artists" is a label compilation signal — treat as multi
          const VARIOUS = "various artists";
          const meaningfulArtists = stats.detectedArtists.filter(
            a => normalizeArtistForComparison(a) !== VARIOUS,
          );
          const isMultiArtist = meaningfulArtists.length > 1;
          const primaryArtist = meaningfulArtists[0] ?? null;

          let artistId: string | null = null;
          const confirmedName = artist_name?.trim() || null;

          if (!isMultiArtist && confirmedName) {
            // Upsert artist — match by user + exact name (case-insensitive)
            const { data: existing } = await supabase
              .from("artists")
              .select("id")
              .eq("user_id", userId)
              .ilike("name", confirmedName)
              .maybeSingle();

            if (existing) {
              artistId = existing.id;
            } else {
              const newArtistId = crypto.randomUUID();
              await supabase.from("artists").insert({
                id: newArtistId,
                user_id: userId,
                name: confirmedName,
              });
              artistId = newArtistId;
            }
          }
          // ────────────────────────────────────────────────────────────────

          parsed = {
            summary: narrative?.summary ?? "Roy analyzed your statement.",
            total_earnings: stats.totalEarnings,
            total_streams: stats.totalStreams,
            currency: "USD",
            track_count: stats.trackCount,
            avg_revenue_per_stream: stats.totalStreams > 0
              ? Math.round((stats.totalEarnings / stats.totalStreams) * 1000000) / 1000000
              : null,
            period_start: stats.periodStart,
            period_end: stats.periodEnd,
            source: stats.source,
            top_earners: stats.topTracks.map(t => ({
              track: t.track,
              earnings: t.earnings,
              streams: t.streams || null,
            })),
            by_store: stats.byStore.map(s => ({
              ...s,
              rate_per_stream: s.streams > 0
                ? Math.round((s.earnings / s.streams) * 1000000) / 1000000
                : null,
            })),
            by_territory: stats.byTerritory,
            by_period: stats.byPeriod,
            columns_detected: stats.columnsDetected,
            // Artist info for UI
            detected_artist: primaryArtist,
            artist_count: stats.detectedArtists.length,
            is_multi_artist: isMultiArtist,
            artist_id: artistId,
            by_artist: isMultiArtist ? stats.byArtist : null,
            top_artists: isMultiArtist ? stats.byArtist.slice(0, 5).map(a => a.name) : null,
            by_period_by_artist: isMultiArtist ? stats.byPeriodByArtist : null,
            by_artist_detail: isMultiArtist ? Object.fromEntries(
              stats.byArtist.slice(0, 5).map(a => [a.name, {
                earnings: a.earnings,
                streams: a.streams,
                track_count: Object.keys(stats.byArtistTrack[a.name] ?? {}).length,
                by_store: Object.entries(stats.byArtistStore[a.name] ?? {})
                  .sort((x, y) => y[1].earnings - x[1].earnings).slice(0, 10)
                  .map(([name, v]) => ({
                    name, ...v,
                    rate_per_stream: v.streams > 0
                      ? Math.round((v.earnings / v.streams) * 1000000) / 1000000
                      : null,
                  })),
                by_territory: Object.entries(stats.byArtistTerritory[a.name] ?? {})
                  .sort((x, y) => y[1].earnings - x[1].earnings).slice(0, 10)
                  .map(([name, v]) => ({ name, ...v })),
                top_tracks: Object.entries(stats.byArtistTrack[a.name] ?? {})
                  .sort((x, y) => y[1].earnings - x[1].earnings).slice(0, 5)
                  .map(([track, v]) => ({ track, ...v })),
              }])
            ) : null,
          };

          // Link artist to parsed_result if resolved
          if (artistId) {
            await supabase
              .from("parsed_results")
              .update({ artist_id: artistId })
              .eq("statement_id", statementId);
          }
        } else {
          parsed = await runGeminiSummarize(model, statement.file_name, fileText);
        }
      } else {
        parsed = await runGeminiSummarize(model, statement.file_name, fileText);
      }

    } else {
      const prompt = buildPrompt(action, statement.file_name, fileText);
      const result = await model.generateContent(prompt);
      parsed = extractJSON(result.response.text()) ?? { summary: result.response.text() };
    }

    const toDate = (v: unknown): string | null => {
      if (!v) return null;
      const s = String(v);
      // "2026-01" → "2026-01-01", "2026-01-31" passes through
      return /^\d{4}-\d{2}$/.test(s) ? `${s}-01` : s;
    };
    const upsertPayload = {
      statement_id: statementId,
      user_id: userId,
      source: statement.source_type ?? null,
      royalty_type: (parsed.royalty_type as string) ?? null,
      period_start: toDate(parsed.period_start),
      period_end: toDate(parsed.period_end),
      total_earnings: parsed.total_earnings ?? null,
      currency: (parsed.currency as string) ?? "USD",
      track_count: parsed.track_count ?? null,
      summary: (parsed.summary ?? parsed.anomaly_summary ?? parsed.cleanup_summary ?? parsed.split_summary ?? null) as string | null,
      flags: parsed.flags ?? [],
      normalized_data: { action, ...parsed },
      raw_claude_output: { action },
    };
    console.log("[analyze] upserting parsed_results for statement:", statementId);
    const { data: upsertData, error: upsertErr } = await supabase.from("parsed_results").upsert(upsertPayload, { onConflict: "statement_id" }).select("id");
    if (upsertErr) console.error("[analyze] parsed_results upsert failed:", JSON.stringify(upsertErr));
    else console.log("[analyze] parsed_results upsert ok, id:", upsertData?.[0]?.id);

    await supabase.from("statements").update({ status: "complete" }).eq("id", statementId);

    return NextResponse.json({ action, result: parsed });

  } catch (err) {
    await supabase.from("statements").update({ status: "error" }).eq("id", statementId);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ── Gemini fallback summarize (PDF / XLS / XLSX or parse failure) ────────── */
async function runGeminiSummarize(
  model: GeminiModel,
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

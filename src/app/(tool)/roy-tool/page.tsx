"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { royaltyTypeLabel } from "@/lib/industry-taxonomy";
import Papa from "papaparse";
import { matchSchema } from "@/lib/stmts-schema";
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import RoyLogo from "@/components/RoyLogo";
import { getCountryName } from "@/lib/country-codes";
import { SiSpotify, SiApplemusic, SiYoutubemusic } from "react-icons/si";

const GREEN = "#C8FF00";
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50 MB

/* ── Client-side stats for large CSV/TSV files ── */
// Mirrors the SummarizeStats shape used by the analyze route
interface LocalStats {
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
  columnsDetected: Record<string, string>;
  detectedArtists: string[];
  byArtist: { name: string; earnings: number; streams: number }[];
  byPeriodByArtist: Record<string, Record<string, { earnings: number; streams: number }>>;
  byArtistStore: Record<string, Record<string, { earnings: number; streams: number }>>;
  byArtistTerritory: Record<string, Record<string, { earnings: number; streams: number }>>;
  byArtistTrack: Record<string, Record<string, { earnings: number; streams: number }>>;
}

function _toNum(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/[$,\s]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function _normalizeArtist(name: string): string {
  return name.trim().toLowerCase()
    .replace(/\s+(feat\.?|ft\.?|featuring|with)\s+.*/i, "")
    .replace(/\s+/g, " ").trim();
}

function _guessColumnMap(headers: string[]): Record<string, string | null> {
  const low = headers.map(h => h.toLowerCase());
  const find = (pats: RegExp[]): string | null => {
    for (const pat of pats) {
      const i = low.findIndex(h => pat.test(h));
      if (i >= 0) return headers[i];
    }
    return null;
  };
  return {
    earnings: find([/earnings|revenue|royalt|amount|payment|payout/]),
    streams: find([/quantity|streams|plays|units|listens|count/]),
    store: find([/store|platform|dsp|partner|channel|service/]),
    territory: find([/country|territory|region|market/]),
    track: find([/title|track|song|recording/]),
    period: find([/period|month|date|quarter/]),
    artist: find([/\bartist\b|band|performer/]),
  };
}

async function computeFileStats(file: File, source: string): Promise<LocalStats | null> {
  const isTsv = file.name.toLowerCase().endsWith(".tsv");

  // Read first 4KB to detect schema without loading the whole file
  const headerSlice = await file.slice(0, 4096).text();
  const lines = headerSlice.split("\n");

  let headerRow = 0;
  let columns: Record<string, string | null> = {
    earnings: null, streams: null, store: null,
    territory: null, track: null, period: null, artist: null,
  };

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const probe = Papa.parse<string[]>(lines[i], { delimiter: isTsv ? "\t" : "" });
    const headers = (probe.data[0] ?? []).map((h: unknown) => String(h).trim());
    const schema = matchSchema(headers);
    if (schema) {
      headerRow = schema.headerRow;
      columns = { ...columns, ...schema.columns };
      break;
    }
    if (i === 0) columns = _guessColumnMap(headers);
  }

  // Aggregation state
  let totalEarnings = 0, totalStreams = 0, rowCount = 0;
  const byStore: Record<string, { earnings: number; streams: number }> = {};
  const byTerritory: Record<string, { earnings: number; streams: number }> = {};
  const byTrack: Record<string, { earnings: number; streams: number }> = {};
  const byPeriod: Record<string, { earnings: number; streams: number }> = {};
  const periods: string[] = [];
  const artistsSeen = new Map<string, string>();
  const byArtist: Record<string, { earnings: number; streams: number }> = {};
  const byPeriodByArtist: Record<string, Record<string, { earnings: number; streams: number }>> = {};
  const byArtistStore: Record<string, Record<string, { earnings: number; streams: number }>> = {};
  const byArtistTerritory: Record<string, Record<string, { earnings: number; streams: number }>> = {};
  const byArtistTrack: Record<string, Record<string, { earnings: number; streams: number }>> = {};

  await new Promise<void>((resolve) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: isTsv ? "\t" : "",
      beforeFirstChunk: (chunk) => {
        if (headerRow === 0) return chunk;
        const chunkLines = chunk.split("\n");
        return chunkLines.slice(headerRow).join("\n");
      },
      step: (result) => {
        const row = result.data;
        rowCount++;
        const earn    = columns.earnings  ? _toNum(row[columns.earnings])  : 0;
        const streams = columns.streams   ? _toNum(row[columns.streams])   : 0;
        const store   = columns.store     ? String(row[columns.store]   ?? "").trim() || null : null;
        const terr    = columns.territory ? String(row[columns.territory] ?? "").trim() || null : null;
        const track   = columns.track     ? String(row[columns.track]   ?? "").trim() || null : null;
        const period  = columns.period    ? String(row[columns.period]  ?? "").trim() || null : null;
        const artist  = columns.artist    ? String(row[columns.artist]  ?? "").trim() || null : null;

        if (artist) {
          const norm = _normalizeArtist(artist);
          if (norm && !artistsSeen.has(norm)) artistsSeen.set(norm, artist);
          const canonical = artistsSeen.get(norm) ?? artist;
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
        if (store)  { byStore[store]    ??= { earnings: 0, streams: 0 }; byStore[store].earnings    += earn; byStore[store].streams    += streams; }
        if (terr)   { byTerritory[terr] ??= { earnings: 0, streams: 0 }; byTerritory[terr].earnings += earn; byTerritory[terr].streams += streams; }
        if (track)  { byTrack[track]    ??= { earnings: 0, streams: 0 }; byTrack[track].earnings    += earn; byTrack[track].streams    += streams; }
        if (period) { periods.push(period); byPeriod[period] ??= { earnings: 0, streams: 0 }; byPeriod[period].earnings += earn; byPeriod[period].streams += streams; }
      },
      complete: () => resolve(),
      error:    () => resolve(),
    });
  });

  if (rowCount === 0) return null;

  const sortedPeriods = [...new Set(periods)].sort();
  return {
    source,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalStreams:   Math.round(totalStreams),
    rowCount,
    trackCount: Object.keys(byTrack).length,
    periodStart: sortedPeriods[0] ?? null,
    periodEnd:   sortedPeriods[sortedPeriods.length - 1] ?? null,
    byStore: Object.entries(byStore).sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 10).map(([name, v]) => ({ name, ...v })),
    byTerritory: Object.entries(byTerritory).sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 10).map(([name, v]) => ({ name, ...v })),
    byPeriod: Object.entries(byPeriod).sort(([a], [b]) => a.localeCompare(b)).map(([period, v]) => ({ period, ...v })),
    topTracks: Object.entries(byTrack).sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 5).map(([track, v]) => ({ track, ...v })),
    columnsDetected: Object.fromEntries(Object.entries(columns).filter(([, v]) => v !== null)) as Record<string, string>,
    detectedArtists: Array.from(artistsSeen.values()),
    byArtist: Object.entries(byArtist).sort((a, b) => b[1].earnings - a[1].earnings).slice(0, 20).map(([name, v]) => ({ name, ...v })),
    byPeriodByArtist,
    byArtistStore,
    byArtistTerritory,
    byArtistTrack,
  };
}

/* ── Helpers ─────────────────────────────────── */
function fmtCompact(n: number, dollars = false): string {
  const prefix = dollars ? "$" : "";
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (!dollars && n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (dollars && n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return dollars
    ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : n.toLocaleString();
}

const DONUT_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#d946ef", "#84cc16", "#94a3b8"];
const ARTIST_COLORS = ["#C8FF00", "#06b6d4", "#8b5cf6", "#f59e0b", "#d946ef"];

const BENCHMARKS: Record<string, [number, number]> = {
  "Spotify":       [0.003, 0.005],
  "Apple Music":   [0.006, 0.008],
  "YouTube Music": [0.001, 0.002],
};

/* ── Platform logos ──────────────────────────── */
function PlatformLogo({ name, size = 20 }: { name: string; size?: number }) {
  if (name === "Spotify")       return <SiSpotify size={size} color="#1DB954" />;
  if (name === "Apple Music")   return <SiApplemusic size={size} color="#FC3C44" />;
  if (name === "YouTube Music") return <SiYoutubemusic size={size} color="#FF0000" />;
  return null;
}

/* ── SVG Donut Chart ─────────────────────────── */
interface DonutSlice { name: string; value: number; streams?: number }

function DonutChart({ data, title, dollars = true }: { data: DonutSlice[]; title: string; dollars?: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const top6 = data.slice(0, 6);
  const otherTotal = data.slice(6).reduce((s, d) => s + d.value, 0);
  const otherStreams = data.slice(6).reduce((s, d) => s + (d.streams ?? 0), 0);
  const slices: DonutSlice[] = otherTotal > 0
    ? [...top6, { name: "Other", value: otherTotal, streams: otherStreams }]
    : top6;
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = 60; const cy = 60; const R = 52; const r = 30;
  let cumAngle = -90;
  const paths: { d: string; color: string }[] = [];

  const polar = (radius: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  for (let i = 0; i < slices.length; i++) {
    const sweep = (slices[i].value / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + sweep - 0.4;
    cumAngle += sweep;
    const large = sweep > 180 ? 1 : 0;
    const o1 = polar(R, startAngle); const o2 = polar(R, endAngle);
    const i1 = polar(r, endAngle);   const i2 = polar(r, startAngle);
    paths.push({
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      d: `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)} L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${i2.x.toFixed(2)} ${i2.y.toFixed(2)} Z`,
    });
  }

  const h = hovered !== null ? slices[hovered] : null;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
        {title}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={120} height={120} viewBox="0 0 120 120" style={{ cursor: "default" }}>
          {paths.map((p, i) => (
            <path
              key={i} d={p.d} fill={p.color}
              opacity={hovered === null || hovered === i ? 0.9 : 0.35}
              style={{ transition: "opacity 0.15s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* Center tooltip */}
          {h !== null ? (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill={DONUT_COLORS[hovered! % DONUT_COLORS.length]}>
              {fmtCompact(h.value, dollars)}
            </text>
          ) : null}
        </svg>
      </div>
      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
        {slices.map((s, i) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <div key={i}
              style={{ display: "flex", alignItems: "center", gap: "8px", opacity: hovered === null || hovered === i ? 1 : 0.4, transition: "opacity 0.15s", cursor: "default" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Time Chart (Recharts-based, replaces custom SVG bar chart) ──────────── */
type PeriodRow = { period: string; earnings: number; streams: number };
type PeriodArtistMap = Record<string, Record<string, { earnings: number; streams: number }>>;

function fmtPeriodTick(p: string, granularity: "monthly" | "yearly"): string {
  if (granularity === "yearly") return p;
  const m = p.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m[2]) - 1] ?? ""} '${m[1].slice(2)}`;
  }
  return p;
}

function aggregateYearly(data: PeriodRow[]): PeriodRow[] {
  const acc: Record<string, { earnings: number; streams: number }> = {};
  for (const d of data) {
    const y = d.period.slice(0, 4);
    acc[y] ??= { earnings: 0, streams: 0 };
    acc[y].earnings += d.earnings;
    acc[y].streams  += d.streams;
  }
  return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b)).map(([period, v]) => ({ period, ...v }));
}

function TimeChart({
  byPeriod,
  byPeriodByArtist,
  selectedArtist,
}: {
  byPeriod: PeriodRow[];
  byPeriodByArtist?: PeriodArtistMap;
  selectedArtist?: string | null;
}) {
  const uniqueYears = new Set(byPeriod.map(d => d.period.slice(0, 4))).size;
  const [mode, setMode] = useState<"earnings" | "streams">("earnings");
  const [granularity, setGran] = useState<"monthly" | "yearly">(byPeriod.length > 18 ? "yearly" : "monthly");

  // When an artist is selected, derive their period data from the cross-tab
  const artistPeriodData: PeriodRow[] | null = selectedArtist && byPeriodByArtist
    ? Object.entries(byPeriodByArtist)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, artists]) => ({
          period,
          earnings: artists[selectedArtist]?.earnings ?? 0,
          streams:  artists[selectedArtist]?.streams  ?? 0,
        }))
    : null;

  const rawData  = artistPeriodData ?? byPeriod;
  const chartData = granularity === "yearly" ? aggregateYearly(rawData) : rawData;
  const tickInterval = granularity === "yearly" ? 0 : Math.max(0, Math.floor(chartData.length / 8) - 1);
  const valFmt = (n: number) => mode === "earnings" ? fmtCompact(n, true) : fmtCompact(n);

  const Tip = ({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    if (!entry || entry.value === 0) return null;
    return (
      <div style={{ background: "#1a1d26", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 14px" }}>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: GREEN }}>{valFmt(entry.value)}</div>
      </div>
    );
  };

  const axisStyle = { fontSize: 9, fill: "rgba(255,255,255,0.28)", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
            Over time
          </div>
          {uniqueYears > 1 && (
            <div style={{ display: "flex", gap: "3px" }}>
              {(["monthly", "yearly"] as const).map(g => (
                <button key={g} onClick={() => setGran(g)} style={{
                  padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                  background: granularity === g ? "rgba(255,255,255,0.1)" : "transparent",
                  color: granularity === g ? "#fff" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${granularity === g ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {g === "monthly" ? "Mo" : "Yr"}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          {(["earnings", "streams"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
              background: mode === m ? GREEN : "transparent",
              color: mode === m ? "#000" : "rgba(255,255,255,0.4)",
              border: `1px solid ${mode === m ? GREEN : "rgba(255,255,255,0.1)"}`,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {m === "earnings" ? "Revenue" : "Streams"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={GREEN} stopOpacity={0.22} />
              <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="period"
            tickFormatter={p => fmtPeriodTick(p, granularity)}
            interval={tickInterval}
            tick={axisStyle}
            axisLine={false} tickLine={false}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis hide />
          <RTooltip content={<Tip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey={mode} stroke={GREEN} strokeWidth={2}
            fill="url(#areaGrad)" dot={false}
            activeDot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Types ───────────────────────────────────── */
type Phase = "idle" | "hashing" | "uploading" | "identifying" | "identified" | "analyzing" | "result" | "error" | "multi_artist" | "split_preview";
type ActionType = "summarize" | "anomalies" | "cleanup" | "split";

interface IdentifiedFile {
  statementId: string;
  source: string;
  royalty_type: string;
  detected_artist: string | null;
  greeting: string;
  file_name: string;
  isDuplicate?: boolean;
}

interface ParsedFlag {
  type: string;
  severity: "info" | "warning" | "error";
  track?: string | null;
  description: string;
}

interface AnalyzedResult {
  action: ActionType;
  result: Record<string, unknown>;
  cached?: boolean;
}

/* ── Progress ring ───────────────────────────── */
function ProgressRing({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <>
      <style>{`
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", padding: "48px 32px" }}>
        <div style={{ width: "100%", maxWidth: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ height: "3px", borderRadius: "99px", background: "rgba(200,255,0,0.12)", overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(90deg, transparent 0%, ${GREEN} 40%, rgba(200,255,0,0.4) 60%, transparent 100%)`,
              animation: "shimmer-bar 1.6s ease-in-out infinite",
            }} />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{label}</div>
          {sublabel && <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{sublabel}</div>}
        </div>
      </div>
    </>
  );
}

/* ── Drop zone ───────────────────────────────── */
function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setHovering(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setHovering(true); }}
      onDragLeave={() => setHovering(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${hovering ? GREEN : "rgba(200,255,0,0.3)"}`,
        borderRadius: "8px",
        padding: "48px 32px",
        textAlign: "center",
        background: hovering ? "rgba(200,255,0,0.04)" : "rgba(200,255,0,0.02)",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.pdf,.xls,.xlsx"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div style={{ marginBottom: "16px" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke={GREEN} strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M12 15V9M12 9L9.5 11.5M12 9L14.5 11.5" stroke={GREEN} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 17h8" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      </div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
        Drop your royalty statement here
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "20px", lineHeight: 1.5 }}>
        Spotify, Apple Music, ASCAP, DistroKid, MLC, SoundExchange — any format, any source.
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        {["CSV", "TSV", "PDF", "XLS", "XLSX"].map((fmt) => (
          <span key={fmt} style={{
            padding: "3px 12px", borderRadius: "100px",
            border: "1px solid rgba(200,255,0,0.25)",
            fontSize: "11px", fontWeight: 600, color: GREEN, letterSpacing: "0.06em",
          }}>
            {fmt}
          </span>
        ))}
      </div>
      <span style={{
        display: "inline-block", padding: "10px 24px", borderRadius: "8px",
        background: GREEN, color: "#000", fontWeight: 600, fontSize: "14px",
      }}>
        Browse files
      </span>
    </div>
  );
}

/* ── Action definitions ──────────────────────── */
const ACTIONS: {
  id: ActionType | "talk";
  icon: React.ReactNode;
  label: string;
  desc: string;
}[] = [
  {
    id: "summarize",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="3" stroke={GREEN} strokeWidth="1.5" />
        <path d="M5 6h8M5 9h8M5 12h5" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "Summarize this statement",
    desc: "Plain-English breakdown of what you earned, from where, and at what rates.",
  },
  {
    id: "anomalies",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L16 15H2L9 2Z" stroke={GREEN} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 7v4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="13" r="0.75" fill={GREEN} />
      </svg>
    ),
    label: "Flag rate anomalies",
    desc: "Missing ISRCs, below-market rates, registration gaps, and likely underpayments.",
  },
  {
    id: "cleanup",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 15l3-3M3 3l12 12" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 3l2 2-8 8-2-2 8-8Z" stroke={GREEN} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    label: "Clean up this file",
    desc: "Data quality issues and a column-by-column remediation plan.",
  },
  {
    id: "split",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="14" rx="2" stroke={GREEN} strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="2" stroke={GREEN} strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="2" stroke={GREEN} strokeWidth="1.5" />
      </svg>
    ),
    label: "Split this file",
    desc: "File too large for Excel? Roy splits it into 500K-row chunks with the header preserved on every part.",
  },
  {
    id: "talk",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 3h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1Z" stroke={GREEN} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 7h6M6 10h4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "Talk to Roy",
    desc: "Ask Roy anything about this statement. He'll answer from the data.",
  },
];

/* ── Identified panel ────────────────────────── */
function IdentifiedPanel({
  identified,
  artistName,
  onArtistChange,
  onAction,
}: {
  identified: IdentifiedFile;
  artistName: string;
  onArtistChange: (name: string) => void;
  onAction: (action: ActionType | "talk") => void;
}) {
  if (identified.isDuplicate) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "8px",
          padding: "18px 20px",
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#f59e0b", marginBottom: "10px",
          }}>
            Roy recognized this file
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>
            {identified.greeting}
          </p>
        </div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
          What should Roy do with it?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {ACTIONS.map(({ id, icon, label, desc }) => (
            <button
              key={id}
              onClick={() => onAction(id)}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "16px 18px", borderRadius: "8px",
                background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "border-color 0.15s, background 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(200,255,0,0.4)";
                e.currentTarget.style.background = "rgba(200,255,0,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--roy-border)";
                e.currentTarget.style.background = "var(--roy-surface-2)";
              }}
            >
              <span style={{ flexShrink: 0, width: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <path d="M6 12l4-4-4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Roy's greeting */}
      <div style={{
        background: "rgba(200,255,0,0.05)",
        border: "1px solid rgba(200,255,0,0.15)",
        borderRadius: "8px",
        padding: "18px 20px",
      }}>
        <div style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: GREEN, marginBottom: "10px",
        }}>
          Roy identified your file
        </div>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>
          {identified.greeting}
        </p>
      </div>

      {/* File metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[
          { label: "Source", value: identified.source || "—" },
          { label: "Type", value: royaltyTypeLabel(identified.royalty_type) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
            borderRadius: "8px", padding: "14px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Artist confirm */}
      <div style={{
        background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
        borderRadius: "8px", padding: "16px 18px",
      }}>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Confirm your artist name:
        </div>
        <input
          type="text"
          value={artistName}
          onChange={(e) => onArtistChange(e.target.value)}
          placeholder="Artist or label name"
          style={{
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            background: "var(--roy-surface)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff", fontSize: "14px", fontWeight: 500,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,255,0,0.4)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "8px", lineHeight: 1.5 }}>
          {identified.detected_artist
            ? "Roy found this artist in your file — confirm or correct it."
            : "Roy will use this to organize your statements across uploads."}
        </div>
      </div>

      {/* Action prompt */}
      <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
        What should Roy do with it?
      </div>

      {/* Action cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ACTIONS.map(({ id, icon, label, desc }) => (
          <button
            key={id}
            onClick={() => onAction(id)}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "16px 18px", borderRadius: "8px",
              background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
              cursor: "pointer", textAlign: "left", width: "100%",
              transition: "border-color 0.15s, background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(200,255,0,0.4)";
              e.currentTarget.style.background = "rgba(200,255,0,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--roy-border)";
              e.currentTarget.style.background = "var(--roy-surface-2)";
            }}
          >
            <span style={{ flexShrink: 0, width: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {icon}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{label}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{desc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
              <path d="M6 12l4-4-4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Flag card ───────────────────────────────── */
function FlagCard({ flag }: { flag: ParsedFlag }) {
  const colors = {
    error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "#ef4444", badge: "Action needed" },
    warning: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", text: "#f59e0b", badge: "Review" },
    info: { bg: "rgba(200,255,0,0.08)", border: "rgba(200,255,0,0.2)", text: GREEN, badge: "Info" },
  };
  const c = colors[flag.severity] ?? colors.info;

  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: "8px", padding: "14px 16px",
      display: "flex", alignItems: "flex-start", gap: "12px",
    }}>
      <div style={{ flex: 1 }}>
        {flag.track && (
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "3px", fontWeight: 600 }}>
            {flag.track}
          </div>
        )}
        <div style={{ fontSize: "13px", color: "#fff", lineHeight: 1.5 }}>{flag.description}</div>
      </div>
      <span style={{
        padding: "3px 10px", borderRadius: "100px", fontSize: "11px",
        fontWeight: 600, color: c.text, border: `1px solid ${c.border}`,
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {c.badge}
      </span>
    </div>
  );
}

/* ── Roy's take box ──────────────────────────── */
function RoyTake({ text, label }: { text: string; label: string }) {
  return (
    <div style={{
      background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)",
      borderRadius: "8px", padding: "18px 20px",
    }}>
      <div style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: GREEN, marginBottom: "10px",
      }}>
        {label}
      </div>
      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  );
}

/* ── Split preview panel ─────────────────────── */
const SPLIT_CHUNK_SIZE = 500_000;
const EXCEL_ROW_LIMIT = 1_048_576;
const EXCEL_SIZE_WARN_MB = 100;
const READ_CHUNK_BYTES = 4 * 1024 * 1024; // 4MB read chunks — constant memory regardless of file size

function SplitPreviewPanel({
  file,
  onBack,
  onReset,
}: {
  file: File;
  onBack: () => void;
  onReset: () => void;
}) {
  const [status, setStatus] = useState<"counting" | "preview" | "splitting" | "done">("counting");
  const [partsDone, setPartsDone] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [partCount, setPartCount] = useState(0);
  // Only store the header line — data is streamed during split, never all in memory at once
  const headerRef = useRef<string>("");

  const fileSizeMB = file.size / (1024 * 1024);
  const needsSplit = file.size > EXCEL_SIZE_WARN_MB * 1024 * 1024 || rowCount > EXCEL_ROW_LIMIT;

  // Stream-count rows on mount — reads 4MB at a time, never loads the full file
  useEffect(() => {
    async function countRows() {
      let remainder = "";
      let isFirstLine = true;
      let dataCount = 0;

      for (let offset = 0; offset < file.size; offset += READ_CHUNK_BYTES) {
        const slice = file.slice(offset, Math.min(offset + READ_CHUNK_BYTES, file.size));
        const text = await slice.text();
        const combined = remainder + text;
        const lines = combined.split("\n");
        remainder = lines.pop() ?? "";

        for (const line of lines) {
          if (isFirstLine) {
            headerRef.current = line;
            isFirstLine = false;
          } else if (line.trim()) {
            dataCount++;
          }
        }
      }
      // Count any content left in the last partial line
      if (remainder.trim() && !isFirstLine) dataCount++;

      const parts = Math.max(1, Math.ceil(dataCount / SPLIT_CHUNK_SIZE));
      setRowCount(dataCount);
      setPartCount(parts);
      setStatus("preview");
    }
    countRows().catch(() => setStatus("preview"));
  }, [file]);

  async function doSplit() {
    setStatus("splitting");

    const dotIdx = file.name.lastIndexOf(".");
    const base = dotIdx > 0 ? file.name.slice(0, dotIdx) : file.name;
    const ext = dotIdx > 0 ? file.name.slice(dotIdx) : ".csv";
    const header = headerRef.current;

    let remainder = "";
    let partLines: string[] = [header];
    let dataCount = 0;
    let partIndex = 0;
    let isFirstLine = true;

    const downloadPart = async (lines: string[]) => {
      const content = lines.join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}_part${partIndex + 1}_of_${partCount}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      partIndex++;
      setPartsDone(partIndex);
      await new Promise<void>((r) => setTimeout(r, 300));
    };

    for (let offset = 0; offset < file.size; offset += READ_CHUNK_BYTES) {
      const slice = file.slice(offset, Math.min(offset + READ_CHUNK_BYTES, file.size));
      const text = await slice.text();
      const combined = remainder + text;
      const lines = combined.split("\n");
      remainder = lines.pop() ?? "";

      for (const line of lines) {
        if (isFirstLine) { isFirstLine = false; continue; } // skip header row in file
        if (!line.trim()) continue;

        partLines.push(line);
        dataCount++;

        if (dataCount >= SPLIT_CHUNK_SIZE) {
          await downloadPart(partLines);
          partLines = [header];
          dataCount = 0;
        }
      }
    }

    // Flush any remaining lines
    if (remainder.trim() && !isFirstLine) partLines.push(remainder);
    if (partLines.length > 1) await downloadPart(partLines);

    setStatus("done");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Nav row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            fontSize: "13px", fontFamily: "inherit", padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button
          onClick={onReset}
          style={{
            padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
            background: "transparent", border: "1px solid var(--roy-border)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Upload another
        </button>
      </div>

      {status === "counting" && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px 0", color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin-ring 1s linear infinite", transformOrigin: "center", flexShrink: 0 }}>
            <circle cx="12" cy="12" r="9" stroke="rgba(200,255,0,0.3)" strokeWidth="2.5" />
            <path d="M12 3a9 9 0 019 9" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Counting rows…
        </div>
      )}

      {status === "preview" && (
        <>
          {!needsSplit ? (
            /* File is fine for Excel */
            <div style={{
              background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)",
              borderRadius: "8px", padding: "18px 20px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN, marginBottom: "10px" }}>
                No split needed
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>
                Your file is {fileSizeMB.toFixed(1)} MB with{" "}
                <strong style={{ color: "#fff" }}>{fmtCompact(rowCount)} rows</strong> — well within Excel&apos;s 1,048,576 row limit. It should open directly without issues.
              </p>
            </div>
          ) : (
            /* Split needed */
            <>
              <div style={{
                background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)",
                borderRadius: "8px", padding: "18px 20px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN, marginBottom: "10px" }}>
                  Roy&apos;s split plan
                </div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>
                  Your file is <strong style={{ color: "#fff" }}>{fileSizeMB.toFixed(0)} MB</strong> with{" "}
                  <strong style={{ color: "#fff" }}>{fmtCompact(rowCount)} rows</strong> — over Excel&apos;s limit. Roy will split it into{" "}
                  <strong style={{ color: GREEN }}>{partCount} parts</strong> of up to{" "}
                  <strong style={{ color: "#fff" }}>500,000 rows each</strong>. The original header row is preserved on every part.
                </p>
              </div>

              {/* File details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[
                  { label: "File size", value: `${fileSizeMB.toFixed(1)} MB` },
                  { label: "Rows", value: fmtCompact(rowCount) },
                  { label: "Parts", value: String(partCount) },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
                    borderRadius: "8px", padding: "14px",
                  }}>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{value}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={doSplit}
                style={{
                  padding: "14px 24px", borderRadius: "8px", fontSize: "15px", fontWeight: 600,
                  background: GREEN, color: "#000", border: "none", cursor: "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px",
                  alignSelf: "flex-start",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V3M12 15l-4-4M12 15l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Split and download {partCount} files
              </button>
            </>
          )}
        </>
      )}

      {status === "splitting" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)",
            borderRadius: "8px", padding: "18px 20px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN, marginBottom: "10px" }}>
              Splitting…
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: "0 0 16px" }}>
              Downloading part <strong style={{ color: GREEN }}>{partsDone + 1}</strong> of{" "}
              <strong style={{ color: "#fff" }}>{partCount}</strong>. Your browser may ask to allow multiple downloads — click Allow.
            </p>
            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "100px", height: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%", background: GREEN, borderRadius: "100px",
                width: `${(partsDone / partCount) * 100}%`,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        </div>
      )}

      {status === "done" && (
        <div style={{
          background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)",
          borderRadius: "8px", padding: "18px 20px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN, marginBottom: "10px" }}>
            Done
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: "0 0 6px" }}>
            <strong style={{ color: "#fff" }}>{partCount} files</strong> downloaded. Each part is under 500,000 rows and opens directly in Excel.
          </p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 16px" }}>
            Hit <strong style={{ color: "rgba(255,255,255,0.7)" }}>Back</strong> to summarize the full statement, or drop a part for a focused per-part analysis.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={onBack}
              style={{
                padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: GREEN, color: "#000", border: "none", cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Back to actions
            </button>
            <button
              onClick={onReset}
              style={{
                padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: "transparent", border: "1px solid var(--roy-border)",
                color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Upload another file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Result panel ────────────────────────────── */
function ResultPanel({
  analyzed,
  onReset,
  onBack,
}: {
  analyzed: AnalyzedResult;
  onReset: () => void;
  onBack: () => void;
}) {
  const { action, result } = analyzed;
  const [trackMode, setTrackMode]   = useState<"earnings" | "streams">("earnings");
  const [artistMode, setArtistMode] = useState<"earnings" | "streams">("earnings");
  const [donutMode, setDonutMode]   = useState<"earnings" | "streams">("earnings");
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const { has } = useAuth();
  const isLabel = has?.({ feature: "unlimited_artists" }) ?? false;

  // Per-artist detail (Label + multi-artist only)
  type ArtistDetail = {
    earnings: number; streams: number; track_count: number;
    by_store: { name: string; earnings: number; streams: number; rate_per_stream: number | null }[];
    by_territory: { name: string; earnings: number; streams: number }[];
    top_tracks: { track: string; earnings: number; streams: number }[];
  };
  const topArtists  = result.top_artists as string[] | undefined;
  const artistDetailMap = result.by_artist_detail as Record<string, ArtistDetail> | undefined;
  const artistDetail = selectedArtist && artistDetailMap ? artistDetailMap[selectedArtist] : null;

  // Derive effective data for all visualizations — switches when artist is selected
  const artistEntry = selectedArtist
    ? (result.by_artist as { name: string; earnings: number; streams: number }[] | undefined)?.find(a => a.name === selectedArtist)
    : null;
  // artistEntry covers KPI cards even for results that predate by_artist_detail
  const effEarnings    = artistDetail?.earnings   ?? artistEntry?.earnings   ?? result.total_earnings as number;
  const effStreams     = artistDetail?.streams    ?? artistEntry?.streams    ?? result.total_streams  as number;
  const effAvgPerStream = effStreams > 0 ? Math.round((effEarnings / effStreams) * 1000000) / 1000000 : null;
  const effTrackCount  = artistDetail?.track_count ?? result.track_count as number;
  // Donuts, rate table, top tracks require by_artist_detail (populated on re-analyze)
  const effByStore     = (artistDetail?.by_store     ?? result.by_store)     as { name: string; earnings: number; streams: number; rate_per_stream?: number | null }[];
  const effByTerritory = (artistDetail?.by_territory ?? result.by_territory) as { name: string; earnings: number; streams: number }[];
  const effTopEarners  = (artistDetail?.top_tracks
    ? artistDetail.top_tracks.map(t => ({ track: t.track, earnings: t.earnings, streams: t.streams }))
    : result.top_earners) as { track: string; earnings: number; streams?: number | null }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Previously analyzed notice */}
      {analyzed.cached && (
        <div style={{
          display: "flex", flexDirection: "column",
          background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.2)",
          borderRadius: "8px", padding: "10px 14px",
          fontSize: "13px", color: "rgba(255,180,0,0.85)",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,180,0,0.85)", marginBottom: "6px" }}>
            Roy recognized this file
          </div>
          <span>Roy&apos;s already read this one — here&apos;s your existing analysis.</span>
        </div>
      )}
      {/* Nav row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            fontSize: "13px", fontFamily: "inherit", padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button
          onClick={onReset}
          style={{
            padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
            background: "transparent", border: "1px solid var(--roy-border)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Upload another
        </button>
      </div>

      {/* ── Summarize ── */}
      {action === "summarize" && (
        <>
          {/* Multi-artist: upgrade prompt (Artist plan) or label badge (Label plan) */}
          {result.is_multi_artist && !isLabel && (
            <div style={{
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "8px", padding: "16px 18px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Multiple artists detected
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 12px" }}>
                Roy found{result.artist_count ? ` ${result.artist_count}` : ""} different artists in this statement. Managing multiple artists is a <strong style={{ color: "#fff" }}>Roy Label</strong> feature.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <a href="/subscribe" style={{
                  padding: "8px 16px", borderRadius: "7px", fontSize: "13px", fontWeight: 600,
                  background: "#f59e0b", color: "#000", textDecoration: "none", display: "inline-block",
                }}>
                  Upgrade to Roy Label
                </a>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>
                  or split your file by artist and re-upload
                </span>
              </div>
            </div>
          )}

          {/* Roy's take */}
          {result.summary && <RoyTake text={result.summary as string} label="Roy's take" />}

          {/* Catalog KPI cards — shown only for non-Label multi-artist (gives a taste, gates the breakdown) */}
          {result.is_multi_artist && !isLabel && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total earnings
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: GREEN }}>
                  {result.total_earnings != null ? fmtCompact(result.total_earnings as number, true) : "—"}
                </div>
                {typeof result.currency === "string" && result.currency !== "USD" && (
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{result.currency as string}</div>
                )}
              </div>
              <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total streams
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                  {result.total_streams != null ? fmtCompact(result.total_streams as number) : "—"}
                </div>
              </div>
              <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg / stream</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                  {result.total_streams && (result.total_streams as number) > 0 && result.total_earnings != null
                    ? `$${(Math.round(((result.total_earnings as number) / (result.total_streams as number)) * 1000000) / 1000000).toFixed(4)}`
                    : "—"}
                </div>
              </div>
            </div>
          )}

          {/* Full breakdown — only for single-artist or Label plan */}
          {(!result.is_multi_artist || isLabel) && (<>

          {/* Artist picker — Label only, multi-artist */}
          {isLabel && result.is_multi_artist && topArtists && topArtists.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                Viewing
              </div>
              <div style={{ position: "relative", flex: 1, maxWidth: "260px" }}>
                <select
                  value={selectedArtist ?? ""}
                  onChange={e => setSelectedArtist(e.target.value || null)}
                  style={{
                    width: "100%", appearance: "none",
                    background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
                    borderRadius: "8px", color: "#fff",
                    fontSize: "13px", fontWeight: 500, fontFamily: "inherit",
                    padding: "8px 32px 8px 12px", cursor: "pointer",
                  }}
                >
                  <option value="">All Artists</option>
                  {topArtists.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <path d="M2 4l4 4 4-4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {selectedArtist && (
                <button onClick={() => setSelectedArtist(null)} style={{
                  fontSize: "11px", color: "rgba(255,255,255,0.35)", background: "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
                }}>
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Headline KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {selectedArtist ? "Artist earnings" : "Total earnings"}
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: GREEN }}>
                {effEarnings != null ? fmtCompact(effEarnings, true) : "—"}
              </div>
              {!selectedArtist && typeof result.currency === "string" && result.currency !== "USD" && (
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{result.currency as string}</div>
              )}
            </div>
            <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {selectedArtist ? "Artist streams" : "Total streams"}
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                {effStreams != null ? fmtCompact(effStreams) : "—"}
              </div>
            </div>
            <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg / stream</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                {effAvgPerStream != null ? `$${effAvgPerStream.toFixed(4)}` : "—"}
              </div>
            </div>
          </div>

          {/* Time chart — over time */}
          {Array.isArray(result.by_period) && result.by_period.length > 1 && (
            <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "20px" }}>
              <TimeChart
                byPeriod={result.by_period as PeriodRow[]}
                byPeriodByArtist={result.by_period_by_artist as PeriodArtistMap | undefined}
                selectedArtist={selectedArtist}
              />
            </div>
          )}

          {/* Revenue per stream — platform table */}
          {effByStore.some(s => s.rate_per_stream != null && s.streams > 0 && BENCHMARKS[s.name] != null) && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
                Revenue / stream
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {effByStore
                  .filter(s => s.rate_per_stream != null && s.streams > 0 && BENCHMARKS[s.name] != null)
                  .map((s, i) => {
                    const bench = BENCHMARKS[s.name];
                    const rate = s.rate_per_stream as number;
                    const badge = rate < bench![0]
                      ? { label: "Below benchmark", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" }
                      : { label: "In range", color: GREEN, bg: "rgba(200,255,0,0.07)", border: "rgba(200,255,0,0.2)" };
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
                        borderRadius: "8px", padding: "10px 14px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <PlatformLogo name={s.name} size={20} />
                          <span style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>{s.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums" }}>
                            ${rate.toFixed(4)}
                          </div>
                          <span style={{
                            padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600,
                            color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`,
                            whiteSpace: "nowrap",
                          }}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Donut charts — with Revenue/Streams toggle */}
          {(effByStore.length > 0 || effByTerritory.length > 0) && (
            <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "3px" }}>
                  {(["earnings", "streams"] as const).map(m => (
                    <button key={m} onClick={() => setDonutMode(m)} style={{
                      padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                      background: donutMode === m ? GREEN : "transparent",
                      color: donutMode === m ? "#000" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${donutMode === m ? GREEN : "rgba(255,255,255,0.1)"}`,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {m === "earnings" ? "Revenue" : "Streams"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {effByStore.length > 0 && (
                  <DonutChart
                    title="By platform"
                    dollars={donutMode === "earnings"}
                    data={[...effByStore]
                      .sort((a, b) => (donutMode === "earnings" ? b.earnings - a.earnings : b.streams - a.streams))
                      .map(s => ({ name: s.name, value: donutMode === "earnings" ? s.earnings : s.streams, streams: donutMode === "earnings" ? s.streams : undefined }))}
                  />
                )}
                {effByTerritory.length > 0 && (
                  <DonutChart
                    title="By territory"
                    dollars={donutMode === "earnings"}
                    data={[...effByTerritory]
                      .sort((a, b) => (donutMode === "earnings" ? b.earnings - a.earnings : b.streams - a.streams))
                      .map(t => ({ name: getCountryName(t.name), value: donutMode === "earnings" ? t.earnings : t.streams, streams: donutMode === "earnings" ? t.streams : undefined }))}
                  />
                )}
              </div>
            </div>
          )}

          {/* Artist Breakdown — Label only, multi-artist, all-artists view only */}
          {result.is_multi_artist && isLabel && !selectedArtist && Array.isArray(result.by_artist) && (result.by_artist as { name: string; earnings: number; streams: number }[]).length > 0 && (() => {
            const artists = result.by_artist as { name: string; earnings: number; streams: number }[];
            const barData = artists
              .map(a => ({ name: a.name, value: artistMode === "earnings" ? a.earnings : a.streams }))
              .filter(a => a.value > 0)
              .sort((a, b) => b.value - a.value);
            const formatter = artistMode === "earnings"
              ? (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : (n: number) => fmtCompact(n);
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                    Artist breakdown
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(["earnings", "streams"] as const).map(m => (
                      <button key={m} onClick={() => setArtistMode(m)} style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                        background: artistMode === m ? GREEN : "transparent",
                        color: artistMode === m ? "#000" : "rgba(255,255,255,0.4)",
                        border: `1px solid ${artistMode === m ? GREEN : "rgba(255,255,255,0.1)"}`,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                        {m === "earnings" ? "Revenue" : "Streams"}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {barData.map((item, i) => {
                    const max = barData[0]?.value ?? 1;
                    const pct = max > 0 ? (item.value / max) * 100 : 0;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, position: "relative", height: "36px", borderRadius: "6px", overflow: "hidden", background: "var(--roy-surface-2)" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: "rgba(200,255,0,0.15)", transition: "width 0.4s ease" }} />
                          <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "13px", color: "#fff", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {item.name}
                          </div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: GREEN, flexShrink: 0, minWidth: "64px", textAlign: "right" }}>
                          {formatter(item.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Top tracks */}
          {effTopEarners.length > 0 && (() => {
            const tracks = effTopEarners;
            const barData = tracks
              .map(t => ({
                name: t.track,
                value: trackMode === "earnings" ? t.earnings : (t.streams ?? 0),
              }))
              .filter(t => t.value > 0)
              .sort((a, b) => b.value - a.value);
            const formatter = trackMode === "earnings"
              ? (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : (n: number) => fmtCompact(n);
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                    Top tracks
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(["earnings", "streams"] as const).map(m => (
                      <button key={m} onClick={() => setTrackMode(m)} style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                        background: trackMode === m ? GREEN : "transparent",
                        color: trackMode === m ? "#000" : "rgba(255,255,255,0.4)",
                        border: `1px solid ${trackMode === m ? GREEN : "rgba(255,255,255,0.1)"}`,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                        {m === "earnings" ? "Revenue" : "Streams"}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {barData.map((item, i) => {
                    const max = barData[0]?.value ?? 1;
                    const pct = max > 0 ? (item.value / max) * 100 : 0;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Bar + label */}
                        <div style={{ flex: 1, position: "relative", height: "36px", borderRadius: "6px", overflow: "hidden", background: "var(--roy-surface-2)" }}>
                          <div style={{
                            position: "absolute", top: 0, left: 0, bottom: 0,
                            width: `${pct}%`,
                            background: "rgba(200,255,0,0.15)",
                            transition: "width 0.4s ease",
                          }} />
                          <div style={{
                            position: "relative", height: "100%",
                            display: "flex", alignItems: "center",
                            padding: "0 10px",
                            fontSize: "13px", color: "#fff", fontWeight: 500,
                            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                          }}>
                            {item.name}
                          </div>
                        </div>
                        {/* Value */}
                        <div style={{ fontSize: "13px", fontWeight: 700, color: GREEN, flexShrink: 0, minWidth: "64px", textAlign: "right" }}>
                          {formatter(item.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          </>)}
        </>
      )}

      {/* ── Anomalies ── */}
      {action === "anomalies" && (
        <>
          {result.anomaly_summary && <RoyTake text={result.anomaly_summary as string} label="Roy's assessment" />}
          {Array.isArray(result.flags) && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px",
              }}>
                {(result.flags as ParsedFlag[]).length}{" "}
                {(result.flags as ParsedFlag[]).length === 1 ? "issue" : "issues"} found
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(result.flags as ParsedFlag[]).map((flag, i) => (
                  <FlagCard key={i} flag={flag} />
                ))}
              </div>
              {(result.flags as ParsedFlag[]).length === 0 && (
                <div style={{
                  background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)",
                  borderRadius: "8px", padding: "14px 16px", fontSize: "13px", color: GREEN,
                }}>
                  ✓ No issues detected — statement looks clean.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Cleanup ── */}
      {action === "cleanup" && (
        <>
          {result.cleanup_summary && <RoyTake text={result.cleanup_summary as string} label="Roy's data quality assessment" />}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Analytics ready</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: result.ready_for_analytics ? GREEN : "#ef4444" }}>
                {result.ready_for_analytics ? "Yes" : "No"}
              </div>
            </div>
            {typeof result.blocker === "string" && result.blocker && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Blocker</div>
                <div style={{ fontSize: "13px", color: "#ef4444", lineHeight: 1.4 }}>{result.blocker}</div>
              </div>
            )}
          </div>

          {Array.isArray(result.issues) && result.issues.length > 0 && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px",
              }}>
                Issues
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(result.issues as { issue: string; affected_rows?: number | null; recommendation: string }[]).map((item, i) => (
                  <div key={i} style={{
                    background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
                    borderRadius: "8px", padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{item.issue}</div>
                      {item.affected_rows != null && (
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                          {item.affected_rows.toLocaleString()} rows
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{item.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Split ── */}
      {action === "split" && (
        <>
          {result.split_summary && <RoyTake text={result.split_summary as string} label="Roy's split recommendation" />}

          {result.recommended_split_by && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Split by:</div>
              <span style={{
                padding: "4px 12px", borderRadius: "100px",
                background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.25)",
                fontSize: "12px", fontWeight: 600, color: GREEN,
              }}>
                {result.recommended_split_by as string}
              </span>
            </div>
          )}

          {Array.isArray(result.split_groups) && result.split_groups.length > 0 && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px",
              }}>
                Groups
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(result.split_groups as { group_name: string; estimated_rows?: number | null; notes?: string }[]).map((g, i) => (
                  <div key={i} style={{
                    background: "var(--roy-surface-2)", border: "1px solid var(--roy-border)",
                    borderRadius: "8px", padding: "12px 14px",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: g.notes ? "4px" : 0,
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{g.group_name}</div>
                      {g.estimated_rows != null && (
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                          {g.estimated_rows.toLocaleString()} rows
                        </span>
                      )}
                    </div>
                    {g.notes && (
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{g.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function RoyToolPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const [phase, setPhase] = useState<Phase>("idle");
  const [identified, setIdentified] = useState<IdentifiedFile | null>(null);
  const [artistName, setArtistName] = useState<string>("");
  const [analyzed, setAnalyzed] = useState<AnalyzedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState(false);
  const [largeFile, setLargeFile] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      openSignIn();
    }
  }, [isLoaded, isSignedIn]);

  // Presigned upload flow:
  // 1. Hash file client-side
  // 2. POST /api/upload-url (duplicate check + get signed URL)
  // 3. XHR PUT directly to Supabase signed URL (real progress, no size limit)
  // 4. POST /api/identify to run Gemini identification server-side
  async function doUpload(file: File): Promise<IdentifiedFile | null> {
    setPhase("uploading");
    setUploadProgress(0);
    try {
      // Step 1 — Hash for duplicate detection (skip for large files — arrayBuffer loads full file into RAM)
      let fileHash: string | undefined;
      if (file.size < 100 * 1024 * 1024) {
        const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        fileHash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
      }

      // Step 2 — Request presigned URL (or detect duplicate)
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, fileType: file.type, ...(fileHash ? { fileHash } : {}) }),
      });
      const urlData = await urlRes.json() as Record<string, unknown>;

      if (!urlRes.ok) {
        const msg = urlData.error === "unsupported_format"
          ? (urlData.message as string)
          : (urlData.message as string) ?? (urlData.error as string) ?? "Something went wrong. Please try again.";
        throw new Error(msg);
      }

      // Duplicate file — skip upload, load cached result directly
      if (urlData.duplicate === true) {
        const dupIdentified: IdentifiedFile = {
          statementId: urlData.statementId as string,
          source: (urlData.source as string) ?? "",
          royalty_type: "",
          detected_artist: null,
          greeting: `Roy's already read this one. Pick an action below.`,
          file_name: urlData.fileName as string,
          isDuplicate: true,
        };
        setIdentified(dupIdentified);
        setPhase("analyzing");

        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statementId: urlData.statementId, action: "summarize" }),
          });
          const analyzeData = await res.json();
          if (res.ok) {
            setAnalyzed({ action: "summarize", result: analyzeData.result, cached: analyzeData.cached });
            setPhase("result");
          } else {
            setPhase("identified");
          }
        } catch {
          setPhase("identified");
        }

        return dupIdentified;
      }

      const { statementId, signedUrl } = urlData as { statementId: string; signedUrl: string };

      // Helper — remove the orphaned DB row if the upload or identify step fails
      const cleanupStatement = () =>
        fetch("/api/upload-url", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statementId }),
        }).catch(() => { /* best-effort, ignore errors */ });

      // Step 3 — XHR PUT directly to Supabase signed URL
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrl);
          xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.upload.onload = () => setUploadProgress(null);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else {
              let msg = `Upload failed (${xhr.status}). Please try again.`;
              try {
                const body = JSON.parse(xhr.responseText);
                if (body.message) msg = body.message;
                else if (body.error) msg = body.error;
              } catch { /* ignore */ }
              reject(new Error(msg));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
          xhr.send(file);
        });
      } catch (uploadErr) {
        await cleanupStatement();
        throw uploadErr;
      }

      // Step 4 — Identify (identify route handles its own cleanup on failure)
      setPhase("identifying");
      const idRes = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statementId }),
      });
      const idData = await idRes.json() as Record<string, unknown>;

      if (!idRes.ok) {
        const msg = idData.error === "not_royalty_data"
          ? "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs."
          : (idData.message as string) ?? (idData.error as string) ?? "Something went wrong. Please try again.";
        // identify route already cleaned up storage+DB for not_royalty_data; for other errors, clean up DB row
        if (idData.error !== "not_royalty_data") await cleanupStatement();
        throw new Error(msg);
      }

      const result: IdentifiedFile = {
        statementId: idData.statementId as string,
        source: idData.source as string,
        royalty_type: idData.royalty_type as string,
        detected_artist: (idData.detected_artist as string) ?? null,
        greeting: idData.greeting as string,
        file_name: idData.file_name as string,
      };
      setIdentified(result);
      setArtistName((idData.detected_artist as string) ?? "");
      setPhase("identified");
      return result;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Check your connection and try again.");
      setPhase("error");
      return null;
    }
  }

  async function doUploadLarge(file: File): Promise<void> {
    setPhase("identifying");
    try {
      // Hash for duplicate detection — same threshold as doUpload (skip for >100MB to avoid loading full file into RAM)
      let fileHash: string | undefined;
      if (file.size < 100 * 1024 * 1024) {
        const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        fileHash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
      }

      const slice = file.slice(0, 50000);
      const fileContent = await slice.text();

      const res = await fetch("/api/identify-inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileContent,
          fileSize: file.size,
          fileType: file.type,
          ...(fileHash ? { fileHash } : {}),
        }),
      });
      const data = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        const msg = data.error === "not_royalty_data"
          ? "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs."
          : data.error === "rate_limit"
          ? "Roy is a little overloaded right now — please try again in a moment."
          : (data.message as string) ?? (data.error as string) ?? "Something went wrong. Please try again.";
        setErrorMsg(msg);
        setPhase("error");
        return;
      }

      // Duplicate — try to load cached analysis, fall back to identified panel
      if (data.duplicate === true) {
        const dupIdentified: IdentifiedFile = {
          statementId: data.statementId as string,
          source: (data.source as string) ?? "",
          royalty_type: "",
          detected_artist: null,
          greeting: `Roy's already read this one. Pick an action below.`,
          file_name: data.fileName as string,
          isDuplicate: true,
        };
        setIdentified(dupIdentified);
        setPhase("analyzing");
        try {
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statementId: data.statementId, action: "summarize" }),
          });
          const analyzeData = await analyzeRes.json();
          if (analyzeRes.ok) {
            setAnalyzed({ action: "summarize", result: analyzeData.result, cached: analyzeData.cached });
            setPhase("result");
          } else {
            setPhase("identified");
          }
        } catch {
          setPhase("identified");
        }
        return;
      }

      setIdentified({
        statementId: data.statementId as string,
        source: data.source as string,
        royalty_type: data.royalty_type as string,
        detected_artist: (data.detected_artist as string) ?? null,
        greeting: data.greeting as string,
        file_name: data.file_name as string,
      });
      setArtistName((data.detected_artist as string) ?? "");
      setPhase("identified");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Check your connection and try again.");
      setPhase("error");
    }
  }

  async function handleFile(file: File) {
    setUploadedFile(file);
    setIdentified(null);
    setAnalyzed(null);
    setErrorMsg(null);

    if (splitMode) {
      setPhase("split_preview");
      return;
    }

    // CSV/TSV: always process inline — PapaParse runs in the browser, no upload needed.
    // Gemini only ever sees aggregated stats or a 50KB sample, never raw rows.
    // PDF/XLS/XLSX: Gemini needs the actual file content, so those go through Supabase Storage.
    const name = file.name.toLowerCase();
    const isTabular = name.endsWith(".csv") || name.endsWith(".tsv");

    if (isTabular) {
      setLargeFile(true);
      await doUploadLarge(file);
      return;
    }

    setLargeFile(false);
    await doUpload(file);
  }

  async function handleAction(action: ActionType | "talk") {
    if (!identified) return;

    if (action === "talk") {
      router.push(`/roy-tool/talk?statementId=${identified.statementId}`);
      return;
    }

    if (action === "split") {
      setPhase("split_preview");
      return;
    }

    setPhase("analyzing");
    setAnalyzed(null);

    try {
      const bodyObj: Record<string, unknown> = {
        statementId: identified.statementId,
        action,
        artist_name: artistName.trim() || undefined,
      };

      // Large file — no storage copy exists, send data inline
      if (largeFile && uploadedFile) {
        if (action === "summarize") {
          const stats = await computeFileStats(uploadedFile, identified.source);
          if (stats) {
            // Trim per-artist cross-tab maps to top 5 artists only — server only uses top 5 for
            // by_artist_detail anyway, and these maps can be enormous on label statements.
            const top5 = new Set(stats.byArtist.slice(0, 5).map(a => a.name));
            bodyObj.precomputedStats = {
              ...stats,
              byPeriodByArtist: Object.fromEntries(
                Object.entries(stats.byPeriodByArtist).map(([p, artists]) => [
                  p,
                  Object.fromEntries(Object.entries(artists).filter(([k]) => top5.has(k))),
                ])
              ),
              byArtistStore: Object.fromEntries(
                Object.entries(stats.byArtistStore).filter(([k]) => top5.has(k))
              ),
              byArtistTerritory: Object.fromEntries(
                Object.entries(stats.byArtistTerritory).filter(([k]) => top5.has(k))
              ),
              byArtistTrack: Object.fromEntries(
                Object.entries(stats.byArtistTrack)
                  .filter(([k]) => top5.has(k))
                  .map(([k, tracks]) => [
                    k,
                    Object.fromEntries(
                      Object.entries(tracks)
                        .sort((a, b) => b[1].earnings - a[1].earnings)
                        .slice(0, 20)
                    ),
                  ])
              ),
            };
          }
          // If stats is null (unsupported format), server falls back to Gemini with empty fileText
        } else {
          // anomalies / cleanup: send first 50KB sample
          const slice = uploadedFile.slice(0, 50000);
          bodyObj.inlineContent = await slice.text();
        }
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.error === "rate_limit"
            ? "Roy is a little overloaded right now — please try again in a moment."
            : data.error ?? "Analysis failed. Please try again."
        );
        setPhase("error");
        return;
      }

      setAnalyzed({ action, result: data.result, cached: data.cached });
      setPhase("result");
    } catch {
      setErrorMsg("Analysis failed. Check your connection and try again.");
      setPhase("error");
    }
  }

  function handleReset() {
    setPhase("idle");
    setIdentified(null);
    setArtistName("");
    setAnalyzed(null);
    setErrorMsg(null);
    setUploadedFile(null);
    setUploadProgress(null);
    setSplitMode(false);
    setLargeFile(false);
  }

  function handleBack() {
    if (!identified) { handleReset(); return; }
    setPhase("identified");
    setAnalyzed(null);
    setErrorMsg(null);
  }

  return (
    <main>
      {/* ── Hero — idle only ────────────────────── */}
      {phase === "idle" && (
        <section style={{
          padding: "72px 24px 56px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(200,255,0,0.07) 0%, transparent 55%)",
            pointerEvents: "none",
          }} />
          <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
            <h1 style={{
              fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 700,
              lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "20px",
              fontFamily: "var(--font-display)",
            }}>
              Drop in,{" "}
              <span style={{ color: GREEN }}>
                <RoyLogo height="1.5em" inline />
              </span>
              {" "}is here.
            </h1>
            <p style={{
              fontSize: "17px", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.65, maxWidth: "520px", margin: "0 auto",
            }}>
              Drop in any royalty statement — CSV, PDF, or Excel — and Roy reads it,
              explains it in plain English, and tells you exactly what&apos;s missing or wrong.
            </p>
          </div>
        </section>
      )}

      {/* ── Tool card ──────────────────────────── */}
      <div style={{ padding: `${phase === "idle" ? "0" : "40px"} 24px 80px` }}>
        <div style={{ maxWidth: phase === "idle" || phase === "identified" ? "720px" : "960px", margin: "0 auto" }}>
          <div style={{
            background: "var(--roy-surface)", border: "1px solid var(--roy-border)",
            borderRadius: "8px", overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          }}>
            <div style={{ padding: "32px" }}>

              {phase === "idle" && !splitMode && (
                <>
                  <DropZone onFile={handleFile} />
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <button
                      onClick={() => setSplitMode(true)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "13px", color: "rgba(255,255,255,0.45)",
                        padding: "4px 8px",
                      }}
                    >
                      Splitting a large file? →
                    </button>
                  </div>
                </>
              )}

              {phase === "idle" && splitMode && (
                <>
                  <button
                    onClick={() => setSplitMode(false)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "13px", color: "rgba(255,255,255,0.45)",
                      padding: "4px 8px", marginBottom: "16px",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}
                  >
                    ← Back
                  </button>
                  <div
                    style={{
                      border: `2px dashed rgba(200,255,0,0.3)`,
                      borderRadius: "8px",
                      padding: "48px 32px",
                      textAlign: "center",
                      background: "rgba(200,255,0,0.02)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".csv,.tsv";
                      input.onchange = (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (f) handleFile(f);
                      };
                      input.click();
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleFile(f);
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <svg width="40" height="40" viewBox="0 0 18 18" fill="none" style={{ margin: "0 auto" }}>
                        <rect x="2" y="2" width="6" height="14" rx="2" stroke={GREEN} strokeWidth="1.5" />
                        <rect x="10" y="2" width="6" height="6" rx="2" stroke={GREEN} strokeWidth="1.5" />
                        <rect x="10" y="10" width="6" height="6" rx="2" stroke={GREEN} strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                      Drop your large file here
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "20px", lineHeight: 1.5 }}>
                      Roy will split it into 500K-row chunks with the header preserved on every part. No upload required.
                    </div>
                    <span style={{
                      display: "inline-block", padding: "10px 24px", borderRadius: "8px",
                      background: GREEN, color: "#000", fontWeight: 600, fontSize: "14px",
                    }}>
                      Browse files
                    </span>
                  </div>
                </>
              )}

              {phase === "uploading" && (
                uploadProgress !== null ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "48px 32px" }}>
                    <div style={{ width: "100%", maxWidth: "320px", textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                        {uploadProgress === 0 ? "Preparing…" : "Uploading your statement…"}
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {uploadedFile?.name}{uploadedFile ? ` · ${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB` : ""}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "100px", height: "5px", overflow: "hidden", marginBottom: "8px" }}>
                        <div style={{ height: "100%", background: GREEN, borderRadius: "100px", width: `${uploadProgress}%`, transition: "width 0.25s ease" }} />
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: GREEN }}>{uploadProgress}%</div>
                    </div>
                  </div>
                ) : (
                  <ProgressRing
                    label="Identifying your statement…"
                    sublabel="Roy is checking what this file is."
                  />
                )
              )}

              {phase === "identifying" && (
                <ProgressRing
                  label="Identifying your statement…"
                  sublabel="Roy is checking what this file is."
                />
              )}

              {phase === "identified" && identified && (
                <IdentifiedPanel
                  identified={identified}
                  artistName={artistName}
                  onArtistChange={setArtistName}
                  onAction={handleAction}
                />
              )}

              {phase === "analyzing" && (() => {
                const isPdfFile = uploadedFile?.name.toLowerCase().endsWith(".pdf") ?? false;
                return (
                  <ProgressRing
                    label={
                      largeFile
                        ? "Reading your file locally…"
                        : isPdfFile
                        ? "Roy is reading the PDF…"
                        : "Roy is analyzing your statement…"
                    }
                    sublabel={
                      largeFile
                        ? "Crunching the data in your browser — no upload needed. Large files may take a moment."
                        : isPdfFile
                        ? "Parsing the document with AI — longer PDFs may take up to a minute."
                        : "Digging into rates, patterns, and data quality. This can take 20–30 seconds."
                    }
                  />
                );
              })()}

              {phase === "split_preview" && uploadedFile && (
                <SplitPreviewPanel file={uploadedFile} onBack={handleBack} onReset={handleReset} />
              )}

              {phase === "result" && analyzed && (
                <ResultPanel analyzed={analyzed} onReset={handleReset} onBack={handleBack} />
              )}

              {phase === "error" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "8px", padding: "16px 18px",
                    fontSize: "13px", color: "#ef4444", lineHeight: 1.6,
                  }}>
                    {errorMsg ?? "Something went wrong. Please try again."}
                  </div>
                  <button
                    onClick={handleReset}
                    style={{
                      alignSelf: "flex-start", padding: "8px 18px", borderRadius: "8px",
                      background: "transparent", border: "1px solid var(--roy-border)",
                      color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

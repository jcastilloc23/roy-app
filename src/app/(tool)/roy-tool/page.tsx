"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import RoyLogo from "@/components/RoyLogo";

const GREEN = "#00d47b";

/* ── Types ───────────────────────────────────── */
type Phase = "idle" | "uploading" | "identified" | "analyzing" | "result" | "error";
type ActionType = "summarize" | "anomalies" | "cleanup" | "split";

interface IdentifiedFile {
  statementId: string;
  source: string;
  royalty_type: string;
  period_start: string | null;
  period_end: string | null;
  estimated_rows: number | null;
  greeting: string;
  file_name: string;
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
}

/* ── Progress ring ───────────────────────────── */
function ProgressRing({ label, sublabel }: { label: string; sublabel?: string }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSecs(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(id);
  }, []);

  const r = 28;
  const circ = 2 * Math.PI * r;
  // Arc covers 75% of the circle, spinning via CSS
  const dash = circ * 0.75;

  return (
    <>
      <style>{`
        @keyframes spin-ring { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "48px 32px" }}>
        <div style={{ position: "relative", width: 72, height: 72 }}>
          <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(0,212,123,0.12)" strokeWidth={4} />
          </svg>
          <svg
            width={72} height={72} viewBox="0 0 72 72"
            style={{ position: "absolute", top: 0, left: 0, animation: "spin-ring 1s linear infinite", transformOrigin: "36px 36px" }}
          >
            <circle
              cx={36} cy={36} r={r}
              fill="none" stroke={GREEN} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={0}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700, color: GREEN,
          }}>
            {secs}s
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
        border: `2px dashed ${hovering ? GREEN : "rgba(0,212,123,0.3)"}`,
        borderRadius: "12px",
        padding: "48px 32px",
        textAlign: "center",
        background: hovering ? "rgba(0,212,123,0.04)" : "rgba(0,212,123,0.02)",
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
            border: "1px solid rgba(0,212,123,0.25)",
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
    desc: "Roy recommends how to break this into separate files by artist, platform, or period.",
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
  onAction,
}: {
  identified: IdentifiedFile;
  onAction: (action: ActionType | "talk") => void;
}) {
  const period =
    identified.period_start && identified.period_end
      ? `${identified.period_start} → ${identified.period_end}`
      : identified.period_start ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Roy's greeting */}
      <div style={{
        background: "rgba(0,212,123,0.05)",
        border: "1px solid rgba(0,212,123,0.15)",
        borderRadius: "10px",
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {[
          { label: "Source", value: identified.source || "—" },
          { label: "Type", value: identified.royalty_type || "—" },
          { label: "Est. rows", value: identified.estimated_rows?.toLocaleString() ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: "10px", padding: "14px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{value}</div>
          </div>
        ))}
      </div>

      {period && (
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "-8px" }}>
          Period: {period}
        </div>
      )}

      {/* Action prompt */}
      <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
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
              padding: "16px 18px", borderRadius: "10px",
              background: "var(--bg3)", border: "1px solid var(--border)",
              cursor: "pointer", textAlign: "left", width: "100%",
              transition: "border-color 0.15s, background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,212,123,0.4)";
              e.currentTarget.style.background = "rgba(0,212,123,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--bg3)";
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
    info: { bg: "rgba(0,212,123,0.08)", border: "rgba(0,212,123,0.2)", text: GREEN, badge: "Info" },
  };
  const c = colors[flag.severity] ?? colors.info;

  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: "10px", padding: "14px 16px",
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
      background: "rgba(0,212,123,0.05)", border: "1px solid rgba(0,212,123,0.15)",
      borderRadius: "10px", padding: "18px 20px",
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
            background: "transparent", border: "1px solid var(--border)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Upload another
        </button>
      </div>

      {/* ── Summarize ── */}
      {action === "summarize" && (
        <>
          {result.summary && <RoyTake text={result.summary as string} label="Roy's summary" />}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Total earnings</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: GREEN }}>
                {result.total_earnings != null
                  ? `$${(result.total_earnings as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"}
              </div>
              {typeof result.currency === "string" && result.currency !== "USD" && (
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{result.currency}</div>
              )}
            </div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Total streams</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                {result.total_streams != null ? (result.total_streams as number).toLocaleString() : "—"}
              </div>
            </div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Tracks</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                {result.track_count != null ? (result.track_count as number).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          {Array.isArray(result.top_earners) && result.top_earners.length > 0 && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px",
              }}>
                Top tracks
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(result.top_earners as { track: string; earnings: number; streams?: number | null }[]).map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "10px 14px",
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>{t.track}</div>
                      {t.streams != null && t.streams > 0 && (
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                          {t.streams.toLocaleString()} streams
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: GREEN }}>
                      ${t.earnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(result.by_store) && result.by_store.length > 0 && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px",
              }}>
                By platform
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {(result.by_store as { name: string; earnings: number; streams: number }[]).map((s, i) => {
                  const total = (result.by_store as { earnings: number }[]).reduce((sum, x) => sum + x.earnings, 0);
                  const pct = total > 0 ? Math.round((s.earnings / total) * 100) : 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", width: "120px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.name}
                      </div>
                      <div style={{ flex: 1, height: "6px", background: "var(--bg3)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: GREEN, borderRadius: "3px" }} />
                      </div>
                      <div style={{ fontSize: "12px", color: GREEN, fontWeight: 600, width: "44px", textAlign: "right", flexShrink: 0 }}>
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(result.by_territory) && result.by_territory.length > 0 && (
            <div>
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px",
              }}>
                By territory
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {(result.by_territory as { name: string; earnings: number }[]).map((t, i) => {
                  const total = (result.by_territory as { earnings: number }[]).reduce((sum, x) => sum + x.earnings, 0);
                  const pct = total > 0 ? Math.round((t.earnings / total) * 100) : 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", width: "120px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.name}
                      </div>
                      <div style={{ flex: 1, height: "6px", background: "var(--bg3)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "rgba(0,212,123,0.5)", borderRadius: "3px" }} />
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, width: "44px", textAlign: "right", flexShrink: 0 }}>
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                  background: "rgba(0,212,123,0.05)", border: "1px solid rgba(0,212,123,0.15)",
                  borderRadius: "10px", padding: "14px 16px", fontSize: "13px", color: GREEN,
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
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Analytics ready</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: result.ready_for_analytics ? GREEN : "#ef4444" }}>
                {result.ready_for_analytics ? "Yes" : "No"}
              </div>
            </div>
            {typeof result.blocker === "string" && result.blocker && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "16px" }}>
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
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    borderRadius: "10px", padding: "14px 16px",
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
                background: "rgba(0,212,123,0.1)", border: "1px solid rgba(0,212,123,0.25)",
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
                    background: "var(--bg3)", border: "1px solid var(--border)",
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
  const [phase, setPhase] = useState<Phase>("idle");
  const [identified, setIdentified] = useState<IdentifiedFile | null>(null);
  const [analyzed, setAnalyzed] = useState<AnalyzedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setPhase("uploading");
    setIdentified(null);
    setAnalyzed(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.error === "not_royalty_data"
            ? "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs."
            : data.message ?? data.error ?? "Something went wrong. Please try again.";
        setErrorMsg(msg);
        setPhase("error");
        return;
      }

      setIdentified(data);
      setPhase("identified");
    } catch {
      setErrorMsg("Upload failed. Check your connection and try again.");
      setPhase("error");
    }
  }

  async function handleAction(action: ActionType | "talk") {
    if (!identified) return;

    if (action === "talk") {
      router.push(`/roy-tool/talk?statementId=${identified.statementId}`);
      return;
    }

    setPhase("analyzing");
    setAnalyzed(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statementId: identified.statementId, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Analysis failed. Please try again.");
        setPhase("error");
        return;
      }

      setAnalyzed({ action, result: data.result });
      setPhase("result");
    } catch {
      setErrorMsg("Analysis failed. Check your connection and try again.");
      setPhase("error");
    }
  }

  function handleReset() {
    setPhase("idle");
    setIdentified(null);
    setAnalyzed(null);
    setErrorMsg(null);
  }

  function handleBack() {
    if (!identified) { handleReset(); return; }
    setPhase("identified");
    setAnalyzed(null);
  }

  return (
    <main>
      {/* ── Hero ───────────────────────────────── */}
      <section style={{
        padding: "72px 24px 56px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,123,0.07) 0%, transparent 55%)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div className="section-tag" style={{ marginBottom: "24px" }}>Music Rights Transparency</div>
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "20px",
          }}>
            <RoyLogo height="1.5em" inline /><span style={{ color: "#fff" }}>,</span> your music rights<br />transparency tool.
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

      {/* ── Tool card ──────────────────────────── */}
      <div style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          }}>
            <div style={{ padding: "32px" }}>

              {phase === "idle" && (
                <DropZone onFile={handleFile} />
              )}

              {phase === "uploading" && (
                <ProgressRing
                  label="Uploading and identifying your statement…"
                  sublabel="Roy is checking what this file is."
                />
              )}

              {phase === "identified" && identified && (
                <IdentifiedPanel identified={identified} onAction={handleAction} />
              )}

              {phase === "analyzing" && (
                <ProgressRing
                  label="Roy is analyzing your statement…"
                  sublabel="Digging into rates, patterns, and data quality. This can take 20–30 seconds."
                />
              )}

              {phase === "result" && analyzed && (
                <ResultPanel analyzed={analyzed} onReset={handleReset} onBack={handleBack} />
              )}

              {phase === "error" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "10px", padding: "16px 18px",
                    fontSize: "13px", color: "#ef4444", lineHeight: 1.6,
                  }}>
                    {errorMsg ?? "Something went wrong. Please try again."}
                  </div>
                  <button
                    onClick={handleReset}
                    style={{
                      alignSelf: "flex-start", padding: "8px 18px", borderRadius: "8px",
                      background: "transparent", border: "1px solid var(--border)",
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

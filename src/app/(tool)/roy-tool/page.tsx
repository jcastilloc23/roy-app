"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import RoyLogo from "@/components/RoyLogo";

const GREEN = "#00d47b";

/* ── Types ───────────────────────────────────── */
interface ParsedFlag {
  type: string;
  severity: "info" | "warning" | "error";
  track?: string | null;
  description: string;
}

interface ParsedResult {
  source?: string;
  royalty_type?: string;
  period_start?: string | null;
  period_end?: string | null;
  total_earnings?: number | null;
  currency?: string;
  track_count?: number | null;
  summary?: string;
  flags?: ParsedFlag[];
}

type UploadState = "idle" | "uploading" | "done" | "error";

/* ── Tab button ──────────────────────────────── */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 24px",
        background: active ? "rgba(0,212,123,0.06)" : "transparent",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: active ? `2px solid ${GREEN}` : "2px solid transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.45)",
        fontWeight: active ? 600 : 400,
        fontSize: "14px",
        borderRadius: 0,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

/* ── Drop zone ───────────────────────────────── */
function DropZone({
  label,
  hint,
  onFile,
  uploading,
}: {
  label: string;
  hint: string;
  onFile: (file: File) => void;
  uploading: boolean;
}) {
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setHovering(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
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
        cursor: uploading ? "wait" : "pointer",
        opacity: uploading ? 0.6 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf,.xls,.xlsx"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div style={{ marginBottom: "16px" }}>
        {uploading ? (
          <div style={{
            width: "40px", height: "40px", margin: "0 auto",
            border: `2px solid rgba(0,212,123,0.2)`,
            borderTop: `2px solid ${GREEN}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
            <rect x="3" y="3" width="18" height="18" rx="3" stroke={GREEN} strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M12 15V9M12 9L9.5 11.5M12 9L14.5 11.5" stroke={GREEN} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 17h8" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          </svg>
        )}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
        {uploading ? "Roy is reading your statement…" : label}
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "20px", lineHeight: 1.5 }}>
        {uploading ? "This usually takes 10–20 seconds." : hint}
      </div>
      {!uploading && (
        <>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px", flexWrap: "wrap" }}>
            {["CSV", "PDF", "XLS", "XLSX"].map((fmt) => (
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
            background: GREEN, color: "#000", fontWeight: 600, fontSize: "14px", cursor: "pointer",
          }}>
            Browse files
          </span>
        </>
      )}
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
        fontWeight: 600, background: "transparent", color: c.text,
        border: `1px solid ${c.border}`, whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {c.badge}
      </span>
    </div>
  );
}

/* ── Results panel ───────────────────────────── */
function ResultsPanel({ result, onReset }: { result: ParsedResult; onReset: () => void }) {
  const period = result.period_start && result.period_end
    ? `${result.period_start} → ${result.period_end}`
    : result.period_start ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>
            {result.source ?? "Statement"} · {result.royalty_type ?? "royalty"}
          </div>
          {period && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{period}</div>}
        </div>
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

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Total earnings</div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: GREEN }}>
            {result.total_earnings != null
              ? `$${result.total_earnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"}
          </div>
          {result.currency && result.currency !== "USD" && (
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{result.currency}</div>
          )}
        </div>
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Tracks</div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            {result.track_count != null ? result.track_count.toLocaleString() : "—"}
          </div>
        </div>
      </div>

      {/* Roy's summary */}
      {result.summary && (
        <div style={{
          background: "rgba(0,212,123,0.05)", border: "1px solid rgba(0,212,123,0.15)",
          borderRadius: "10px", padding: "18px 20px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN, marginBottom: "10px" }}>
            Roy&apos;s take
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>
            {result.summary}
          </p>
        </div>
      )}

      {/* Flags */}
      {result.flags && result.flags.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
            {result.flags.length} {result.flags.length === 1 ? "issue" : "issues"} found
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.flags.map((flag, i) => <FlagCard key={i} flag={flag} />)}
          </div>
        </div>
      )}

      {result.flags?.length === 0 && (
        <div style={{
          background: "rgba(0,212,123,0.05)", border: "1px solid rgba(0,212,123,0.15)",
          borderRadius: "10px", padding: "14px 16px",
          fontSize: "13px", color: GREEN,
        }}>
          ✓ No issues detected — statement looks clean.
        </div>
      )}
    </div>
  );
}

/* ── Artist tab ──────────────────────────────── */
function ArtistTab({
  uploadState,
  result,
  errorMsg,
  onFile,
  onReset,
}: {
  uploadState: UploadState;
  result: ParsedResult | null;
  errorMsg: string | null;
  onFile: (file: File) => void;
  onReset: () => void;
}) {
  if (uploadState === "done" && result) {
    return <ResultsPanel result={result} onReset={onReset} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <DropZone
        label="Drop your royalty statement here"
        hint="Spotify, Apple Music, ASCAP, DistroKid, MLC, SoundExchange — any format, any source."
        onFile={onFile}
        uploading={uploadState === "uploading"}
      />
      {errorMsg && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "10px", padding: "14px 16px", fontSize: "13px", color: "#ef4444",
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

/* ── Label tab ───────────────────────────────── */
function LabelTab({
  uploadState,
  result,
  errorMsg,
  onFile,
  onReset,
}: {
  uploadState: UploadState;
  result: ParsedResult | null;
  errorMsg: string | null;
  onFile: (file: File) => void;
  onReset: () => void;
}) {
  if (uploadState === "done" && result) {
    return <ResultsPanel result={result} onReset={onReset} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Upgrade banner */}
      <div style={{
        background: "rgba(0,212,123,0.06)", border: "1px solid rgba(0,212,123,0.2)",
        borderRadius: "10px", padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>You&apos;re on Roy Artist</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            Label features require Roy Label — unlimited artists, reconciliation, and more.
          </div>
        </div>
        <Link href="/subscribe" style={{
          padding: "8px 20px", borderRadius: "8px", background: GREEN,
          color: "#000", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", textDecoration: "none",
        }}>
          Get Roy Label
        </Link>
      </div>

      <DropZone
        label="Drop statements for any artist in your roster"
        hint="Bulk upload across multiple artists. Roy identifies each statement automatically."
        onFile={onFile}
        uploading={uploadState === "uploading"}
      />
      {errorMsg && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "10px", padding: "14px 16px", fontSize: "13px", color: "#ef4444",
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function RoyToolPage() {
  const [tab, setTab] = useState<"artist" | "label">("artist");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploadState("uploading");
    setResult(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error === "not_royalty_data"
          ? "This file doesn't look like a royalty statement. Roy only reads reports from DSPs, PROs, distributors, and CMOs."
          : data.error ?? "Something went wrong. Please try again.";
        setErrorMsg(msg);
        setUploadState("error");
        return;
      }

      setResult(data.result);
      setUploadState("done");
    } catch {
      setErrorMsg("Upload failed. Check your connection and try again.");
      setUploadState("error");
    }
  }

  function handleReset() {
    setUploadState("idle");
    setResult(null);
    setErrorMsg(null);
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <main>
        {/* ── Hero ─────────────────────────────── */}
        <section style={{
          padding: "72px 24px 56px", textAlign: "center",
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
              Drop in any royalty statement — CSV, PDF, or Excel — and Roy reads it, explains it in plain English, and tells you exactly what&apos;s missing or wrong.
            </p>
          </div>
        </section>

        {/* ── Tool card ────────────────────────── */}
        <div style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: "16px", overflow: "hidden",
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
            }}>
              {/* Tab bar */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                <TabButton active={tab === "artist"} onClick={() => setTab("artist")}>
                  I&apos;m an artist
                </TabButton>
                <TabButton active={tab === "label"} onClick={() => setTab("label")}>
                  I&apos;m a label
                </TabButton>
              </div>

              {/* Tab content */}
              <div style={{ padding: "32px" }}>
                {tab === "artist" ? (
                  <ArtistTab
                    uploadState={uploadState}
                    result={result}
                    errorMsg={errorMsg}
                    onFile={handleFile}
                    onReset={handleReset}
                  />
                ) : (
                  <LabelTab
                    uploadState={uploadState}
                    result={result}
                    errorMsg={errorMsg}
                    onFile={handleFile}
                    onReset={handleReset}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import RoyLogo from "@/components/RoyLogo";

const GREEN = "#00d47b";

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
        padding: "16px 24px",
        background: active ? "rgba(0,212,123,0.06)" : "transparent",
        borderBottom: active ? `2px solid ${GREEN}` : "2px solid transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.45)",
        fontWeight: active ? 600 : 400,
        fontSize: "15px",
        border: "none",
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
function DropZone({ label, hint }: { label: string; hint: string }) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHovering(true); }}
      onDragLeave={() => setHovering(false)}
      onDrop={(e) => { e.preventDefault(); setHovering(false); }}
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
      {/* Upload icon */}
      <div style={{ marginBottom: "16px" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke={GREEN} strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M12 15V9M12 9L9.5 11.5M12 9L14.5 11.5" stroke={GREEN} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 17h8" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      </div>

      <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "20px", lineHeight: 1.5 }}>
        {hint}
      </div>

      {/* Format badges */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        {["CSV", "PDF", "XLS", "XLSX"].map((fmt) => (
          <span
            key={fmt}
            style={{
              padding: "3px 12px",
              borderRadius: "100px",
              border: "1px solid rgba(0,212,123,0.25)",
              fontSize: "11px",
              fontWeight: 600,
              color: GREEN,
              letterSpacing: "0.06em",
            }}
          >
            {fmt}
          </span>
        ))}
      </div>

      <label
        style={{
          display: "inline-block",
          padding: "10px 24px",
          borderRadius: "8px",
          background: GREEN,
          color: "#000",
          fontWeight: 600,
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Browse files
        <input type="file" accept=".csv,.pdf,.xls,.xlsx" style={{ display: "none" }} />
      </label>
    </div>
  );
}

/* ── Mock result card ────────────────────────── */
function ResultCard({
  icon,
  label,
  value,
  badge,
  badgeColor,
}: {
  icon: string;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "3px" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{value}</div>
      </div>
      {badge && (
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 600,
            background: badgeColor === "warn" ? "rgba(245,158,11,0.15)" : badgeColor === "err" ? "rgba(239,68,68,0.15)" : "rgba(0,212,123,0.15)",
            color: badgeColor === "warn" ? "#f59e0b" : badgeColor === "err" ? "#ef4444" : GREEN,
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ── Artist tab ──────────────────────────────── */
function ArtistTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <DropZone
        label="Drop your royalty statement here"
        hint="Spotify, Apple Music, ASCAP, DistroKid, MLC, SoundExchange — any format, any source."
      />

      {/* Mock preview */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
          What Roy shows you
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <ResultCard
            icon="📄"
            label="Statement identified"
            value="Spotify for Artists · Q3 2024 · 847 tracks"
            badge="Parsed"
            badgeColor="ok"
          />
          <ResultCard
            icon="💰"
            label="Total earnings identified"
            value="$1,247.83 across 3 royalty types"
          />
          <ResultCard
            icon="⚠️"
            label="Anomaly detected"
            value="Your mechanical rate is 18% below average for your genre"
            badge="Review"
            badgeColor="warn"
          />
          <ResultCard
            icon="🔍"
            label="Missing registrations"
            value="3 tracks appear in Spotify data but have no MLC registration"
            badge="Action needed"
            badgeColor="err"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Label tab ───────────────────────────────── */
function LabelTab() {
  const mockArtists = [
    { name: "Artist A", sources: 4, status: "ok", note: "All sources reconciled" },
    { name: "Artist B", sources: 3, status: "warn", note: "1 underpayment detected" },
    { name: "Artist C", sources: 5, status: "err", note: "MLC registration gap found" },
    { name: "Artist D", sources: 2, status: "ok", note: "All sources reconciled" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <DropZone
        label="Drop statements for any artist in your roster"
        hint="Bulk upload across multiple artists. Roy identifies each statement automatically and builds a per-artist ledger."
      />

      {/* Mock roster preview */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
          What Roy builds for your roster
        </div>
        <div
          style={{
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 1fr",
              padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <span>Artist</span>
            <span style={{ textAlign: "center" }}>Sources</span>
            <span>Status</span>
          </div>

          {mockArtists.map((a, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 1fr",
                padding: "12px 16px",
                alignItems: "center",
                borderBottom: i < mockArtists.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{a.name}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{a.sources}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: a.status === "ok" ? GREEN : a.status === "warn" ? "#f59e0b" : "#ef4444",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{a.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function RoyToolPage() {
  const [tab, setTab] = useState<"artist" | "label">("artist");

  return (
    <>
      <CookieBanner />
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────── */}
        <section
          style={{
            padding: "100px 24px 64px",
            textAlign: "center",
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,123,0.07) 0%, transparent 55%)",
          }}
        >
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div className="section-tag" style={{ marginBottom: "24px" }}>
              Music Rights Transparency
            </div>
            <h1
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                marginBottom: "20px",
              }}
            >
              <RoyLogo height="1.5em" inline /><span style={{ color: "#fff" }}>,</span> your music rights<br />transparency tool.
            </h1>
            <p
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.65,
                maxWidth: "520px",
                margin: "0 auto 0",
              }}
            >
              Drop in any royalty statement — CSV, PDF, or Excel — and Roy reads it, explains it in plain English, and tells you exactly what&apos;s missing or wrong.
            </p>
          </div>
        </section>

        {/* ── Tool card ────────────────────────── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
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
              {tab === "artist" ? <ArtistTab /> : <LabelTab />}
            </div>
          </div>

          {/* Signup nudge */}
          <div style={{ maxWidth: "680px", margin: "20px auto 0", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
              This is a preview of what Roy surfaces. Sign up to analyze your actual statements.
            </p>
            <Link href="/sign-up" className="btn-primary" style={{ fontSize: "14px", padding: "10px 24px" }}>
              Try Roy free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>

        {/* ── How it works ─────────────────────── */}
        <section
          style={{
            padding: "80px 24px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div className="section-tag">How Roy works</div>
              <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                No integrations. No setup. Just drop it in.
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {[
                {
                  step: "01",
                  title: "Drop in your statement",
                  body: "Any file, any format. Spotify CSV, ASCAP quarterly PDF, DistroKid export, MLC report — Roy identifies it automatically. No mapping, no templates.",
                },
                {
                  step: "02",
                  title: "Roy reads and explains it",
                  body: "Our AI parsing engine normalizes the data and generates a plain-English summary. You see exactly what you earned, from where, and at what rate — without needing a finance degree.",
                },
                {
                  step: "03",
                  title: "Roy flags what's wrong",
                  body: "Missing registrations, rate anomalies, unmatched ISRCs, late payments — Roy surfaces discrepancies before royalties expire. The average PRO royalty expires in 2–3 years if unclaimed.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "28px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: GREEN,
                      marginBottom: "12px",
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px", color: "#fff" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────── */}
        <section className="section-cta">
          <div className="container">
            <div className="section-tag">Get Started Today</div>
            <h2>Your royalties are out there. Let&apos;s go find them.</h2>
            <p>
              Drop in any statement. Roy reads it, explains it, and tells
              you if something&apos;s missing.
            </p>
            <div className="cta-btns">
              <Link href="/sign-up" className="btn-primary">
                Try Roy free{" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/pricing" className="btn-outline">
                See pricing
              </Link>
            </div>
            <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
              No credit card · Cancel anytime · Real humans on support
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

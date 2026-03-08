"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import RoyLogo from "@/components/RoyLogo";

const GREEN = "#00d47b";

/* ── Icons ────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
    <circle cx="12" cy="12" r="10" stroke={GREEN} strokeWidth="1.75" />
    <path d="M7.5 12L10.5 15L16.5 9" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIconDark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.5)" strokeWidth="1.75" />
    <path d="M7.5 12L10.5 15L16.5 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Feature lists ───────────────────────────── */
const artistFeatures = [
  "1 artist profile",
  "Up to 3 report sources per month",
  "Plain-English statement summaries",
  "Basic anomaly alerts",
  "Drag & drop CSV and PDF upload",
  "Email support",
];

const labelFeatures = [
  "Unlimited artist profiles",
  "Unlimited report sources",
  "Full cross-statement reconciliation",
  "Discrepancy detection & classification",
  "Anomaly alerts across all artists",
  "Drag & drop CSV and PDF upload",
  "Priority support",
];

/* ── FAQ data ────────────────────────────────── */
const faqs = [
  {
    q: "What is a report source?",
    a: "A report source is any platform or organization that sends you royalty statements — Spotify, Apple Music, ASCAP, DistroKid, the MLC, etc. Roy Artist supports up to 3 unique sources per month. Roy Label supports unlimited sources across unlimited artists.",
  },
  {
    q: "What file formats does Roy support?",
    a: "Roy accepts CSV, XLS, XLSX, and PDF files. Our AI parsing engine identifies the format automatically and normalizes the data — no manual mapping required. If Roy encounters a format it hasn't seen before, it learns from it.",
  },
  {
    q: "When does Roy Artist hit the paywall?",
    a: "You'll hit the limit when a second artist is detected across your uploaded statements, or when you try to add a 4th unique report source in a given month. Roy will notify you before blocking the upload and prompt you to upgrade.",
  },
  {
    q: "Can I manage multiple artists on one account?",
    a: "Roy Label supports unlimited artist profiles under one account — ideal for managers, catalog managers, and small labels. Each artist's statements are tracked separately so you always have a clear per-artist view.",
  },
  {
    q: "Is my royalty data secure?",
    a: "Yes. Your statement data is encrypted in transit and at rest. We never share your data with third parties. Anonymized, aggregated data may be used in the future to power benchmarking features — you'll always be notified before that happens and can opt out.",
  },
  {
    q: "I manage a full label roster. Is Roy Label the right fit?",
    a: "Roy Label works well for managers and small operations. If you're running a label with a large roster, complex accounting needs, or team access requirements, reach out — we'll figure out the right setup for you.",
  },
];

/* ══════════════════════════════════════════════ */
export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <CookieBanner />
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────── */}
        <div className="page-hero" style={{ paddingBottom: "64px" }}>
          <div className="container">
            <h1 style={{ marginBottom: "16px" }}>
              Drop in,{" "}
              <span style={{ color: GREEN }}>
                <RoyLogo height="1.5em" inline />
              </span>
              {" "}is here.
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              No spreadsheets. No finance degree. Just answers.
            </p>
          </div>
        </div>

        {/* ── Pricing cards ─────────────────────── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div
            style={{
              maxWidth: "780px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >

            {/* Roy Artist */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: "#fff" }}>
                Roy Artist
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "24px", lineHeight: 1.5 }}>
                For independent artists getting started with their royalties
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "4px", color: "#fff" }}>
                Free
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px" }}>
                no credit card required
              </div>
              <Link
                href="/subscribe"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: "32px",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                Get started free
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {artistFeatures.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>
                    <CheckIcon />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Roy Label — featured */}
            <div
              style={{
                background: GREEN,
                borderRadius: "16px",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-13px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#000",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 14px",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.06em",
                }}
              >
                MOST POPULAR
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#000", marginBottom: "6px" }}>
                Roy Label
              </div>
              <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)", marginBottom: "24px", lineHeight: 1.5 }}>
                For managers and catalog operations handling multiple artists
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em", color: "#000", marginBottom: "4px" }}>
                $11<span style={{ fontSize: "18px", fontWeight: 500 }}>/mo</span>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.55)", marginBottom: "28px" }}>
                billed monthly · cancel anytime
              </div>
              <Link
                href="/subscribe"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  background: "#000",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: "32px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#1a1a1a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#000"; }}
              >
                Get Roy Label
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {labelFeatures.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(0,0,0,0.8)" }}>
                    <CheckIconDark />
                    {f}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Enterprise CTA ──────────────────── */}
          <div
            style={{
              maxWidth: "780px",
              margin: "20px auto 0",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px", color: "#fff" }}>
              Managing a label or full roster?
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "20px" }}>
              We work with indie labels and publishers who need custom setups. Let&apos;s figure out what&apos;s right for you.
            </div>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              Let&apos;s talk
            </Link>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────── */}
        <section className="section-faq-callout">
          <div className="faq-callout-inner container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div className="section-tag">Frequently Asked Questions</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
                Questions about pricing
              </h2>
            </div>

            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item"
                style={{ cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div
                  className="faq-question"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}
                >
                  {faq.q}
                  <span style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-muted)", flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", display: "inline-block" }}>
                    +
                  </span>
                </div>
                {openFaq === i && (
                  <div className="faq-answer" style={{ paddingTop: "14px" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
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
              <Link href="/subscribe" className="btn-primary">
                Try Roy free{" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/contact" className="btn-outline">
                Talk to us
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

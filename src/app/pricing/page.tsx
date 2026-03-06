"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const GREEN = "#00d47b";

/* ── Icons ────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={GREEN} strokeWidth="1.75" />
    <path d="M7.5 12L10.5 15L16.5 9" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIconDark = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.5)" strokeWidth="1.75" />
    <path d="M7.5 12L10.5 15L16.5 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DashIcon = () => (
  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "18px", lineHeight: 1 }}>—</span>
);

/* ── Feature rows ────────────────────────────── */
const features: { label: string; collect: boolean; register: boolean; concierge: boolean }[] = [
  { label: "Unlimited Registrations of New Music", collect: true,  register: true,  concierge: true  },
  { label: "Keep 100% of Royalties",               collect: true,  register: true,  concierge: true  },
  { label: "Royalty Analytics Dashboard",          collect: true,  register: true,  concierge: true  },
  { label: "Invite Teammates",                     collect: true,  register: true,  concierge: true  },
  { label: "Chat and Email Support",               collect: true,  register: true,  concierge: true  },
  { label: "Fix Missing Registrations",            collect: false, register: true,  concierge: true  },
  { label: "Automated Royalty Recovery",           collect: false, register: true,  concierge: true  },
  { label: "Bulk Registrations",                   collect: false, register: true,  concierge: true  },
  { label: "Downloadable Catalog",                 collect: false, register: true,  concierge: true  },
  { label: "Advanced Audit Dashboard",             collect: false, register: true,  concierge: true  },
  { label: "Dedicated Account Manager",            collect: false, register: false, concierge: true  },
  { label: "Full-Service Registrations",           collect: false, register: false, concierge: true  },
  { label: "Ongoing Catalog Maintenance",          collect: false, register: false, concierge: true  },
  { label: "Custom Registration Strategy",         collect: false, register: false, concierge: true  },
  { label: "Catalog Valuation",                    collect: false, register: false, concierge: true  },
  { label: "Contract Storage & Milestone Alerts",  collect: false, register: false, concierge: true  },
];

/* ── FAQ data ────────────────────────────────── */
const faqs = [
  {
    q: "Is your customer service as good as advertised?",
    a: "We pride ourselves on being the best in the business. Our team typically responds within a few hours — not days. Every plan includes direct chat and email access to a real human who knows music royalties.",
  },
  {
    q: "How fast does my music get registered?",
    a: "On Register and Concierge plans, most new releases are submitted within 1–3 business days. Backlog registrations for existing catalogs typically take 5–10 business days depending on volume.",
  },
  {
    q: "Do I need a publishing administrator for international mechanicals?",
    a: "Not necessarily. Roy handles registrations at US-based organizations (ASCAP, BMI, SoundExchange, the MLC). For international mechanical collection, we'll advise you on the right structure and help you figure out what's best for your catalog.",
  },
  {
    q: "Can I upgrade my plan in the middle of the year?",
    a: "Yes. Upgrades are prorated from the day you switch — you only pay the difference for the remaining billing period. Downgrades take effect at the start of your next billing cycle.",
  },
  {
    q: "Do I need a separate account for each artist I manage?",
    a: "Each plan supports one artist or songwriter by default. If you're a manager handling multiple artists, reach out about our multi-artist options — we'll set you up right.",
  },
  {
    q: "What if I have a large catalog or need custom integrations?",
    a: "We work with top business managers and labels managing large catalogs. Contact us and we'll build a plan around your needs, including custom pricing, dedicated support, and tailored integrations.",
  },
];

/* ── Shared cell styles ──────────────────────── */
const cellBase: React.CSSProperties = {
  padding: "14px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelCell: React.CSSProperties = {
  ...cellBase,
  justifyContent: "flex-start",
  fontSize: "14px",
  color: "rgba(255,255,255,0.8)",
  paddingLeft: "0",
};

const featuredCell: React.CSSProperties = {
  ...cellBase,
  background: "rgba(0,212,123,0.07)",
  borderBottom: "1px solid rgba(0,212,123,0.12)",
};

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
              We handle the registrations,{" "}
              <span style={{ color: GREEN }}>
                you keep 100% of your royalties
              </span>
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              See Roy in action{" "}
              <a href="#" style={{ color: GREEN, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                here
              </a>
            </p>
          </div>
        </div>

        {/* ── Unified pricing table ─────────────── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "1050px", margin: "0 auto", overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(160px, 2fr) 1fr 1fr 1fr",
                minWidth: "620px",
              }}
            >

              {/* ── TOP HEADER ROW ─────────────── */}
              {/* Empty label column */}
              <div />

              {/* Collect header */}
              <div
                style={{
                  padding: "28px 20px 24px",
                  borderLeft: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                  Roy Collect
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
                  Roy collects your royalties for you
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "2px" }}>
                  $5/mo
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  billed annually
                </div>
                <Link
                  href="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px 16px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.45)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                >
                  Get started
                </Link>
              </div>

              {/* Register header — featured (green) */}
              <div
                style={{
                  padding: "28px 20px 24px",
                  background: GREEN,
                  borderRadius: "12px 12px 0 0",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#000", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 14px", borderRadius: "100px", whiteSpace: "nowrap", letterSpacing: "0.06em" }}>
                  MOST POPULAR
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#000", marginBottom: "6px" }}>
                  Roy Register
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", marginBottom: "16px", lineHeight: 1.5 }}>
                  Roy submits registrations into your royalty portals
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#000", marginBottom: "2px" }}>
                  $12.50/mo
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", marginBottom: "20px" }}>
                  billed annually
                </div>
                <Link
                  href="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px 16px",
                    borderRadius: "100px",
                    background: "#000",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#1a1a1a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#000"; }}
                >
                  Get started
                </Link>
              </div>

              {/* Concierge header */}
              <div
                style={{
                  padding: "28px 20px 24px",
                  borderLeft: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                  Roy Concierge
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
                  Full service catalog management
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "2px" }}>
                  $75/mo
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  billed monthly
                </div>
                <Link
                  href="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px 16px",
                    borderRadius: "100px",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.45)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                >
                  Get started
                </Link>
              </div>

              {/* ── FEATURE ROWS ───────────────── */}
              {features.map((f, i) => {
                const isLast = i === features.length - 1;
                const lastStyle = isLast ? { borderBottom: "none" } : {};
                return [
                  /* Label */
                  <div key={`l-${i}`} style={{ ...labelCell, ...lastStyle }}>
                    {f.label}
                  </div>,

                  /* Collect */
                  <div
                    key={`c-${i}`}
                    style={{
                      ...cellBase,
                      borderLeft: "1px solid rgba(255,255,255,0.08)",
                      ...(isLast ? { borderBottom: "none", borderRadius: "0 0 0 0" } : {}),
                    }}
                  >
                    {f.collect ? <CheckIcon /> : <DashIcon />}
                  </div>,

                  /* Register (featured) */
                  <div
                    key={`r-${i}`}
                    style={{
                      ...featuredCell,
                      ...(isLast ? { borderBottom: "none", borderRadius: "0 0 12px 12px" } : {}),
                    }}
                  >
                    {f.register ? <CheckIconDark /> : <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "18px" }}>—</span>}
                  </div>,

                  /* Concierge */
                  <div
                    key={`cc-${i}`}
                    style={{
                      ...cellBase,
                      borderLeft: "1px solid rgba(255,255,255,0.08)",
                      ...(isLast ? { borderBottom: "none" } : {}),
                    }}
                  >
                    {f.concierge ? <CheckIcon /> : <DashIcon />}
                  </div>,
                ];
              })}

            </div>
          </div>

          {/* Enterprise callout */}
          <div
            style={{
              maxWidth: "680px",
              margin: "48px auto 0",
              textAlign: "center",
              background: "#111218",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "40px 32px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
              Enterprise
            </div>
            <h3 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
              Large roster or publishing company?
            </h3>
            <p style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 28px" }}>
              We work with top business managers, publishers, and labels managing large catalogs. Get custom pricing, dedicated support, and integrations built for your workflow.
            </p>
            <Link
              href="/contact"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              Contact us
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
            <h2>Your royalties are out there. Let&apos;s go get them.</h2>
            <p>
              Roy registers your music, fixes your issues, and makes sure every
              dollar finds its way to you.
            </p>
            <div className="cta-btns">
              <Link href="/signup" className="btn-primary">
                Get Started Free{" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/contact" className="btn-outline">
                Talk to us
              </Link>
            </div>
            <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
              No long-term contracts · Cancel anytime · Real humans on support
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

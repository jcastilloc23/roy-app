"use client";
import { useState } from "react";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import RoyLogo from "@/components/RoyLogo";


const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckBullet = ({ children }: { children: React.ReactNode }) => (
  <div className="feature-bullet">
    <div className="bullet-check">✓</div>
    <span>{children}</span>
  </div>
);

const faqs = [
  {
    q: "I don't make much money yet — is Roy still for me?",
    a: "Yes. Missing royalties are most common early on, when accounts aren't fully set up. Create a free account — no card required.",
  },
  {
    q: "How does Roy work?",
    a: "Drop in a royalty statement — CSV, PDF, or XLS. Roy reads it, normalizes the data, and gives you a plain-English breakdown of what you earned, at what rates, and what looks off.",
  },
  {
    q: "Do I need to connect my accounts?",
    a: "No — and intentionally so. Most DSPs don't offer reliable APIs, and automated extraction breaks constantly. Roy's approach: start by uploading a lifetime earnings report to get the full picture, then drop in each month's new statements as they come in. You stay in control of your data.",
  },
  {
    q: "Is my statement data safe?",
    a: "Yes. Files are encrypted in transit and at rest. We never share your data with third parties.",
  },
  {
    q: "What's the difference between Roy Artist and Roy Label?",
    a: "Roy Artist is free — one artist, up to 3 report sources a month. Roy Label is $11/mo and supports unlimited artists and sources, plus full cross-statement reconciliation.",
  },
];

export default function WhosItForPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <main>

      {/* ===== PAGE HERO ===== */}
      <div className="page-hero">
        <div className="container">
          <h1>Who is <RoyLogo height="1.5em" inline /> for?</h1>
          <p>
            The music industry is complicated for everyone — artists, managers,
            and the business side alike. Roy fixes that by giving everyone the
            clarity they deserve.
          </p>
        </div>
      </div>

      {/* ===== INDEPENDENT ARTISTS ===== */}
      <section className="section-audience" id="artists">
        <div className="audience-inner container">
          <div className="audience-content">
            <div className="section-tag">Artists, Producers &amp; Songwriters</div>
            <h2>Stop leaving money on the table</h2>
            <p>
              Whether you&apos;re a touring artist, bedroom producer, or staff
              songwriter — you&apos;re likely missing royalties you&apos;ve
              already earned. Roy connects all your accounts, audits your
              catalogue, and surfaces exactly where your money is and why you
              haven&apos;t received it yet.
            </p>
            <div className="feature-bullets">
              <CheckBullet>Sync ASCAP, BMI, SESAC, SoundExchange, MLC &amp; more in one place</CheckBullet>
              <CheckBullet>Automatic ISWC/ISRC registration audit across all platforms</CheckBullet>
              <CheckBullet>Detect unclaimed royalties before they expire</CheckBullet>
              <CheckBullet>Unified payout calendar — know exactly when money is coming</CheckBullet>
            </div>
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ marginTop: "24px" }}>
                Get started free <ArrowIcon />
              </button>
            </SignUpButton>
          </div>

          <div className="audience-visual">
            <img
              src="/screenshots/roy-analytics-platform-territory.png"
              alt="Roy tool — platform and territory revenue breakdown"
              style={{ width: "100%", borderRadius: "12px", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ===== MANAGERS, LABELS & PUBLISHERS ===== */}
      <section className="section-audience" id="labels">
        <div className="audience-inner container reverse">
          <div className="audience-content">
            <div className="section-tag">Managers, Labels &amp; Publishers</div>
            <h2>Manage your entire roster in one place</h2>
            <p>
              You&apos;re responsible for making sure your artists get paid —
              and that means juggling a dozen different platforms for each
              client. Roy gives managers and labels a unified view across their
              entire roster, with structured financial exports ready for tax
              season, forecasting, and client reporting.
            </p>
            <div className="feature-bullets">
              <CheckBullet>Multi-artist roster view — see everyone at a glance</CheckBullet>
              <CheckBullet>Automated issue alerts sent directly to you</CheckBullet>
              <CheckBullet>Income categorized by type: performance, mechanical, digital, sync</CheckBullet>
              <CheckBullet>Consolidated CSV and PDF exports ready for your accountant</CheckBullet>
              <CheckBullet>Track open claims and pending registrations across all artists</CheckBullet>
            </div>
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ marginTop: "24px" }}>
                Manage Your Roster <ArrowIcon />
              </button>
            </SignUpButton>
          </div>

          <div className="audience-visual">
            <img
              src="/screenshots/roy-analytics-artist-breakdown.png"
              alt="Roy tool — artist breakdown and top tracks revenue view"
              style={{ width: "100%", borderRadius: "12px", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section-faq-callout">
        <div className="faq-callout-inner container">
          <div style={{ marginBottom: "48px" }}>
            <div className="section-tag">Frequently Asked Questions</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
              Common questions about Roy
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              Everything you need to know before getting started.
            </p>
          </div>
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
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

      {/* ===== BOTTOM CTA ===== */}
      <section className="section-cta">
        <div className="container">
          <div className="section-tag">Get Started</div>
          <h2>Your royalties are waiting. Go get them.</h2>
          <p>Drop in a statement and Roy shows you exactly what you earned, at what rates, and what looks off.</p>
          <div className="cta-btns">
            <SignUpButton mode="modal">
              <button className="btn-primary">
                Get started free <ArrowIcon />
              </button>
            </SignUpButton>
            <Link href="/contact" className="btn-outline">Talk to us</Link>
          </div>
          <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
            No credit card required · Free to get started · Cancel anytime
          </p>
        </div>
      </section>

    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import RoyLogo from "@/components/RoyLogo";

export const metadata: Metadata = {
  title: "Who is Roy for? — Roy",
  description:
    "Whether you're an artist, producer, manager, or business manager — Roy makes royalty tracking simple for everyone in the music industry.",
};

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
    a: "Absolutely. In fact, emerging artists often miss the most royalties because their accounts aren't fully set up yet. Roy's free plan is designed for artists at every stage — you can connect your accounts, see what you're earning, and start fixing issues without paying a dime. As your income grows, Roy grows with you.",
  },
  {
    q: "How long does it take to get set up?",
    a: "Most artists connect all their accounts within 10–15 minutes. Roy guides you through each integration step by step. Once connected, your royalty data starts populating immediately — and Roy begins auditing your catalogue for gaps and issues right away.",
  },
  {
    q: "What platforms does Roy integrate with?",
    a: "Roy connects with all major PROs (ASCAP, BMI, SESAC, SOCAN), SoundExchange, The MLC, and the biggest distributors — DistroKid, CD Baby, TuneCore, AWAL, Songtrust, and more. We're adding new integrations every month.",
  },
  {
    q: "Is my financial data safe with Roy?",
    a: "Yes. Roy uses read-only access to connect your royalty accounts — we never store your credentials, and we can never move money on your behalf. Your data is encrypted at rest and in transit, and we are SOC 2 compliant.",
  },
  {
    q: "Can my manager or business manager access my Roy account?",
    a: "Yes. Roy supports team access with role-based permissions. You can invite managers, business managers, or collaborators to view your dashboard — with full control over what they can see and do.",
  },
];

export default function WhosItForPage() {
  return (
    <>
      <CookieBanner />
      <Navbar />
      <main>

        {/* ===== PAGE HERO ===== */}
        <div className="page-hero">
          <div className="container">
            <div className="section-tag">Made for the Music Industry</div>
            <h1>Who is <RoyLogo height="1.5em" inline /> for?</h1>
            <p>
              The music industry is complicated for everyone — artists, managers,
              and the business side alike. Roy fixes that by giving everyone the
              clarity they deserve.
            </p>
          </div>
        </div>

        {/* ===== ARTISTS ===== */}
        <section className="section-audience" id="artists">
          <div className="audience-inner container">
            <div className="audience-content">
              <div className="section-tag">Artists, Producers &amp; Composers</div>
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
              <Link href="/subscribe" className="btn-primary" style={{ marginTop: "24px" }}>
                Get Started Free <ArrowIcon />
              </Link>
            </div>

            <div className="audience-visual">
              <div className="feature-visual-label">Your Royalty Dashboard</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "PRO Income", val: "$4,812", sub: "ASCAP + BMI + SESAC", green: true },
                  { label: "Streaming", val: "$2,340", sub: "DistroKid + CD Baby", green: false },
                  { label: "Mechanical", val: "$640", sub: "MLC (unclaimed)", green: false },
                  { label: "Issues Found", val: "3", sub: "Action required", amber: true },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: "#181a22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "14px" }}>
                    <div style={{ fontSize: "10px", color: "#8a8f9a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{stat.label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: stat.green ? "var(--green)" : stat.amber ? "#f59e0b" : "#fff" }}>{stat.val}</div>
                    <div style={{ fontSize: "10px", color: "#8a8f9a", marginTop: "4px" }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#181a22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "#8a8f9a", marginBottom: "10px" }}>Royalty sources synced</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {["ASCAP ✓", "BMI ✓", "MLC ✓", "DistroKid ✓"].map((tag) => (
                    <span key={tag} style={{ background: "rgba(0,212,123,0.12)", color: "var(--green)", border: "1px solid rgba(0,212,123,0.2)", borderRadius: "100px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>{tag}</span>
                  ))}
                  <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>SoundExchange !</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MANAGERS ===== */}
        <section className="section-audience" id="managers">
          <div className="audience-inner container reverse">
            <div className="audience-content">
              <div className="section-tag">Managers</div>
              <h2>Manage your entire roster in one place</h2>
              <p>
                You&apos;re responsible for making sure your artists get paid —
                and that means juggling a dozen different platforms for each
                client. Roy gives managers a unified view across their entire
                roster, so you can spot problems before your artists even know
                they exist.
              </p>
              <div className="feature-bullets">
                <CheckBullet>Multi-artist roster view — see everyone at a glance</CheckBullet>
                <CheckBullet>Automated issue alerts sent directly to you</CheckBullet>
                <CheckBullet>Consolidated reports ready to share with your team</CheckBullet>
                <CheckBullet>Track open claims and pending registrations across all artists</CheckBullet>
              </div>
              <Link href="/subscribe" className="btn-primary" style={{ marginTop: "24px" }}>
                Manage Your Roster <ArrowIcon />
              </Link>
            </div>

            <div className="audience-visual">
              <div className="feature-visual-label">Roster Overview</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { initials: "JR", name: "Jordan Rivers", sources: "7 sources · All synced", amount: "$3,420", gradient: "linear-gradient(135deg,#00d47b,#0099aa)", color: "#000", dotColor: "var(--green)", amountColor: "var(--green)" },
                  { initials: "AM", name: "Alicia Monroe", sources: "5 sources · 2 issues", amount: "$1,890", gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", dotColor: "#f59e0b", amountColor: "#fff" },
                  { initials: "DK", name: "Dev Kumar", sources: "9 sources · All synced", amount: "$6,150", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", dotColor: "var(--green)", amountColor: "var(--green)" },
                ].map((artist) => (
                  <div key={artist.name} style={{ background: "#181a22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", background: artist.gradient, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: artist.color, flexShrink: 0 }}>{artist.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{artist.name}</div>
                      <div style={{ fontSize: "11px", color: "#8a8f9a" }}>{artist.sources}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: artist.amountColor }}>{artist.amount}</div>
                      <div style={{ fontSize: "10px", color: "#8a8f9a" }}>this quarter</div>
                    </div>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: artist.dotColor, flexShrink: 0 }} />
                  </div>
                ))}
                <div style={{ background: "#181a22", border: "1px solid rgba(0,212,123,0.15)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#8a8f9a", flex: 1 }}>Roster total this quarter</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--green)" }}>$11,460</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BUSINESS MANAGERS ===== */}
        <section className="section-audience" id="business-managers">
          <div className="audience-inner container">
            <div className="audience-content">
              <div className="section-tag">Business Managers</div>
              <h2>Financial clarity for your music clients</h2>
              <p>
                Business managers need accurate, timely royalty data to do their
                jobs — forecasting income, filing taxes, managing cash flow. Roy
                delivers structured, export-ready financial data from every
                royalty source your clients use, so you&apos;re never working
                from guesswork.
              </p>
              <div className="feature-bullets">
                <CheckBullet>Structured financial exports — CSV, PDF, and more</CheckBullet>
                <CheckBullet>Income categorized by type: performance, mechanical, digital, sync</CheckBullet>
                <CheckBullet>Year-over-year trend reports ready for tax season</CheckBullet>
                <CheckBullet>Cash flow forecasting based on historical payout patterns</CheckBullet>
              </div>
              <Link href="/contact" className="btn-primary" style={{ marginTop: "24px" }}>
                Talk to Sales <ArrowIcon />
              </Link>
            </div>

            <div className="audience-visual">
              <div className="feature-visual-label">Annual Income Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Performance Royalties", val: "$18,430", green: true },
                  { label: "Mechanical Royalties", val: "$7,210", green: false },
                  { label: "Digital Distribution", val: "$12,880", green: false },
                  { label: "Sync Licensing", val: "$4,500", green: false },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#181a22", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>{row.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: row.green ? "var(--green)" : "#fff" }}>{row.val}</div>
                  </div>
                ))}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(0,212,123,0.06)", borderRadius: "8px", border: "1px solid rgba(0,212,123,0.2)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Total FY{new Date().getFullYear()}</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--green)" }}>$43,020</div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button style={{ flex: 1, background: "rgba(0,212,123,0.1)", border: "1px solid rgba(0,212,123,0.2)", borderRadius: "6px", padding: "8px", fontSize: "12px", fontWeight: 600, color: "var(--green)", cursor: "pointer", fontFamily: "inherit" }}>Export CSV</button>
                  <button style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", fontSize: "12px", fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Export PDF</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="section-faq-callout">
          <div className="faq-callout-inner container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div className="section-tag">Questions &amp; Answers</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
                Common questions about Roy
              </h2>
              <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
                Everything you need to know before getting started.
              </p>
            </div>
            {faqs.map((faq) => (
              <div key={faq.q} className="faq-item">
                <div className="faq-question">{faq.q}</div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section className="section-cta">
          <div className="container">
            <div className="section-tag">Start for Free</div>
            <h2>Your royalties are waiting. Go get them.</h2>
            <p>Connect your accounts in minutes. Roy will show you exactly what you&apos;re earning — and what you&apos;re missing.</p>
            <div className="cta-btns">
              <Link href="/subscribe" className="btn-primary">
                Get Started — It&apos;s Free <ArrowIcon />
              </Link>
              <Link href="/contact" className="btn-outline">Talk to us</Link>
            </div>
            <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
              No credit card required · Free to get started · Cancel anytime
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

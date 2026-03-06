import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import CounterSection from "@/components/CounterSection";

export const metadata: Metadata = {
  title: "Roy — Mint for Music Royalties",
  description:
    "Roy connects all your royalty accounts in one place. Sync your PROs, distributors, MLC, and more. Never miss a dollar again.",
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

const integrations = [
  "ASCAP","BMI","SESAC","SoundExchange","MLC","DistroKid",
  "CD Baby","TuneCore","Songtrust","AWAL","Spotify for Artists",
  "Apple Music","YouTube Music","Amazon Music",
];

const logoNames = [
  "ASCAP","BMI","SESAC","SoundExchange","MLC","DistroKid",
  "CD Baby","TuneCore","Songtrust","AWAL","Spotify","Apple Music",
];

const testimonials = [
  {
    initials: "TM",
    quote: "I had no idea I was leaving thousands of dollars on the table every year. Roy connected all my accounts in 10 minutes and showed me exactly what I was missing. Game-changing for any independent artist.",
    name: "Tracy Maddux",
    role: "Former CEO, CD Baby",
  },
  {
    initials: "IA",
    quote: "As a producer and songwriter, I've got royalties flowing from so many different places — PROs, streaming, sync deals. Roy finally makes it manageable. The issue detection alone has recovered thousands for me.",
    name: "Isaiah Avila",
    role: "Producer & Songwriter — Usher, Macy Gray",
  },
  {
    initials: "AA",
    quote: "Touring bands have zero time to manage royalties. Roy handles it all in the background. We set it up once and now we actually see everything we're earning from our catalogue — without thinking about it.",
    name: "Attack Attack!",
    role: "Rock Band",
  },
  {
    initials: "B",
    quote: "The dashboard is clean, fast, and shows me everything I need at a glance. I used to dread checking my royalty accounts. Now I actually look forward to seeing Roy's weekly summary in my inbox.",
    name: "Besomorph",
    role: "Electronic Music Producer",
  },
];

export default function Home() {
  return (
    <>
      <CookieBanner />
      <Navbar />

      <main>
        {/* ===== ANNOUNCEMENT BANNER ===== */}
        <div className="announcement">
          🎉 Introducing Roy —{" "}
          <Link href="/signup">
            the simplest way for artists to track every royalty dollar they&apos;ve earned →
          </Link>
        </div>

        {/* ===== HERO ===== */}
        <section className="hero" id="home">
          <div className="container">
            <div className="hero-eyebrow">
              <span className="pill">Mint for Music Royalties</span>
            </div>
            <h1>
              Never miss a <span>royalty</span> payment again
            </h1>
            <p className="hero-sub">
              Roy connects all your PRO, distributor, and publishing accounts
              in one place — so you always know exactly what you&apos;ve earned
              and what&apos;s missing.
            </p>
            <div className="hero-ctas">
              <Link href="/signup" className="btn-primary">
                Get Started Free <ArrowIcon />
              </Link>
              <a href="#demo" className="hero-video-link">
                <div className="play-icon">▶</div>
                See Roy in action
              </a>
            </div>

            {/* Dashboard mockup */}
            <div className="hero-mockup">
              <div className="mockup-browser">
                <div className="mockup-bar">
                  <div className="mockup-dot" />
                  <div className="mockup-dot" />
                  <div className="mockup-dot" />
                  <div className="mockup-url">app.useroy.com — Dashboard</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-sidebar">
                    <div className="mockup-sidebar-logo">🎵 Roy</div>
                    {[
                      { icon: "📊", label: "Dashboard", active: true },
                      { icon: "💰", label: "Royalties" },
                      { icon: "🎵", label: "Catalogue" },
                      { icon: "🔗", label: "Accounts" },
                      { icon: "⚠️", label: "Issues" },
                      { icon: "📅", label: "Payments" },
                      { icon: "⚙️", label: "Settings" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`mockup-nav-item${item.active ? " active" : ""}`}
                      >
                        {item.icon} {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-stat-row">
                      <div className="mockup-stat">
                        <div className="mockup-stat-label">Total Earned</div>
                        <div className="mockup-stat-val green">$24,817</div>
                      </div>
                      <div className="mockup-stat">
                        <div className="mockup-stat-label">Pending Payout</div>
                        <div className="mockup-stat-val">$3,240</div>
                      </div>
                      <div className="mockup-stat">
                        <div className="mockup-stat-label">Active Sources</div>
                        <div className="mockup-stat-val">7 / 9</div>
                      </div>
                    </div>
                    <div className="mockup-chart-area">
                      <div className="mockup-chart-label">Monthly Royalties — Last 12 Months</div>
                      <div className="mockup-bars">
                        {[40, 55, 70, 45, 85, 60, 90, 75, 65, 80, 95, 72].map((h, i) => (
                          <div
                            key={i}
                            className="mockup-bar-item"
                            style={{
                              height: `${h}%`,
                              background: h === 95 ? "var(--green)" : h >= 80 ? "rgba(0,212,123,0.4)" : undefined,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== INTEGRATIONS ===== */}
        <section className="section-register" id="integrations">
          <div className="container">
            <div className="section-tag">One Account. Every Platform.</div>
            <h2>Connect all your royalty sources. Keep 100% of what&apos;s yours.</h2>
            <p>Roy integrates with every major PRO, distributor, and publishing platform — so nothing slips through the cracks.</p>
            <Link href="/signup" className="btn-primary">
              Connect Your Accounts <ArrowIcon />
            </Link>
            <div className="integration-chips">
              {integrations.map((name) => (
                <span key={name} className="chip">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== STAT HEADLINE ===== */}
        <section className="section-stat-headline">
          <div className="container">
            <p className="stat-headline-text">
              <strong>Over 80% of independent artists are missing royalty payments</strong>{" "}
              they&apos;ve already earned — because their accounts aren&apos;t set up, registered, or linked properly. Roy finds the gaps and fixes them automatically.
            </p>
          </div>
        </section>

        {/* ===== FEATURE 1 — One Portal ===== */}
        <section className="section-feature" id="features">
          <div className="feature-inner container">
            <div className="feature-content">
              <div className="section-tag">One Portal</div>
              <h2>Every royalty stream, in a single dashboard</h2>
              <p>Stop logging into 10 different portals to piece together what you&apos;ve earned. Roy pulls everything together — PRO royalties, streaming income, sync licensing, and more — and shows it all in one clear view.</p>
              <div className="feature-bullets">
                <CheckBullet>Real-time sync from all connected accounts</CheckBullet>
                <CheckBullet>Breakdown by source: PRO, streaming, sync, mechanical</CheckBullet>
                <CheckBullet>Unified payment calendar and payout history</CheckBullet>
              </div>
            </div>
            <div className="feature-visual fv-portal">
              <div className="feature-visual-label">Connected Sources</div>
              <div className="fv-cards">
                {[
                  { icon: "🏢", name: "ASCAP", sub: "Last sync: 2 hours ago", val: "$1,240", bg: "rgba(0,212,123,0.1)", warn: false },
                  { icon: "🎵", name: "DistroKid", sub: "Last sync: 5 hours ago", val: "$892", bg: "rgba(99,102,241,0.1)", warn: false },
                  { icon: "📡", name: "SoundExchange", sub: "Last sync: 1 day ago", val: "$340", bg: "rgba(245,158,11,0.1)", warn: true },
                  { icon: "📜", name: "MLC", sub: "Last sync: 3 hours ago", val: "$218", bg: "rgba(0,212,123,0.1)", warn: false },
                ].map((card) => (
                  <div key={card.name} className="fv-card">
                    <div className="fv-card-icon" style={{ background: card.bg }}>{card.icon}</div>
                    <div className="fv-card-info">
                      <div className="fv-card-name">{card.name}</div>
                      <div className="fv-card-sub">{card.sub}</div>
                    </div>
                    <div className="fv-card-val">{card.val}</div>
                    <div className={`fv-card-status${card.warn ? " warning" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURE 2 — Identify Issues ===== */}
        <section className="section-feature">
          <div className="feature-inner container reverse">
            <div className="feature-content">
              <div className="section-tag">Identify Issues</div>
              <h2>Spot the gaps before you lose money</h2>
              <p>Roy automatically audits your catalogue against every platform you&apos;re connected to — flagging missing registrations, unmatched works, and unclaimed royalties before they expire.</p>
              <div className="feature-bullets">
                <CheckBullet>Automatic catalogue audit across all platforms</CheckBullet>
                <CheckBullet>Alerts for missing ISWC/ISRC registrations</CheckBullet>
                <CheckBullet>Unclaimed royalty detection with estimated value</CheckBullet>
              </div>
            </div>
            <div className="feature-visual fv-issues">
              <div className="feature-visual-label">Detected Issues</div>
              {[
                { icon: "⚠️", title: 'Missing ISWC — "Golden Hour"', desc: "Not registered with ASCAP or BMI", badge: "Action needed", badgeClass: "badge-err" },
                { icon: "💸", title: "Unclaimed mechanical — 3 tracks", desc: "Est. $640 waiting at MLC", badge: "Claim now", badgeClass: "badge-warn" },
                { icon: "🔗", title: "Account not linked — SoundExchange", desc: "Digital performance royalties uncollected", badge: "Connect", badgeClass: "badge-warn" },
                { icon: "✅", title: 'BMI Registration — "Midnight Run"', desc: "Verified and collecting", badge: "Resolved", badgeClass: "badge-ok" },
              ].map((issue) => (
                <div key={issue.title} className="issue-row">
                  <div className="issue-icon">{issue.icon}</div>
                  <div className="issue-info">
                    <div className="issue-title">{issue.title}</div>
                    <div className="issue-desc">{issue.desc}</div>
                  </div>
                  <span className={`issue-badge ${issue.badgeClass}`}>{issue.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURE 3 — Fix Issues ===== */}
        <section className="section-feature">
          <div className="feature-inner container">
            <div className="feature-content">
              <div className="section-tag">Fix Issues &amp; Get Paid</div>
              <h2>We don&apos;t just find the problems — we fix them</h2>
              <p>Roy&apos;s guided workflows walk you through fixing registration issues, claiming uncollected royalties, and submitting corrections to PROs and distributors — right from within the app.</p>
              <div className="feature-bullets">
                <CheckBullet>Step-by-step guided resolution flows</CheckBullet>
                <CheckBullet>Direct integration with platform registration portals</CheckBullet>
                <CheckBullet>Track status of open claims and submissions</CheckBullet>
              </div>
            </div>
            <div className="feature-visual">
              <div className="feature-visual-label">Fix Progress</div>
              {[
                { label: "Registrations complete", val: "8 / 11", pct: 73 },
                { label: "Unclaimed royalties claimed", val: "$1,820 of $2,300", pct: 79 },
                { label: "Accounts linked", val: "7 / 9", pct: 78 },
              ].map((bar) => (
                <div key={bar.label} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{bar.label}</span>
                    <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 700 }}>{bar.val}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
                    <div style={{ background: "var(--green)", height: "100%", width: `${bar.pct}%`, borderRadius: "100px" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "20px", padding: "14px", background: "#181a22", border: "1px solid var(--border)", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Estimated recovered earnings</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--green)" }}>+$3,640</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURE 4 — Payments ===== */}
        <section className="section-feature">
          <div className="feature-inner container reverse">
            <div className="feature-content">
              <div className="section-tag">Stay on Track</div>
              <h2>Know exactly when your next payment is coming</h2>
              <p>Roy gives you a full payment calendar across all your royalty sources — so you can anticipate cash flow, track late payments, and never be surprised by your next payout.</p>
              <div className="feature-bullets">
                <CheckBullet>Unified payout calendar for all sources</CheckBullet>
                <CheckBullet>Alerts for upcoming and overdue payments</CheckBullet>
                <CheckBullet>Historical trend charts and earnings forecasts</CheckBullet>
              </div>
            </div>
            <div className="feature-visual fv-timeline">
              <div className="feature-visual-label">Upcoming Payments</div>
              {[
                { name: "ASCAP — Q1 2026", date: "March 15, 2026", amount: "$1,240", upcoming: false },
                { name: "DistroKid — March", date: "March 20, 2026", amount: "$892", upcoming: false },
                { name: "SoundExchange — Q1", date: "April 1, 2026 (est.)", amount: "~$340", upcoming: true },
                { name: "BMI — Q1 2026", date: "April 15, 2026 (est.)", amount: "~$580", upcoming: true },
              ].map((payment, i) => (
                <div key={payment.name}>
                  <div className="timeline-row">
                    <div className={`timeline-dot${payment.upcoming ? " upcoming" : ""}`} />
                    <div className="timeline-info">
                      <div className="timeline-name">{payment.name}</div>
                      <div className="timeline-date">{payment.date}</div>
                    </div>
                    <div className="timeline-amount" style={{ color: payment.upcoming ? "var(--text-muted)" : undefined }}>{payment.amount}</div>
                  </div>
                  {i < 3 && (
                    <div style={{ borderLeft: `2px dashed ${payment.upcoming ? "rgba(255,255,255,0.1)" : "rgba(0,212,123,0.3)"}`, margin: "0 4px", height: "16px" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== COUNTER ===== */}
        <CounterSection />

        {/* ===== TESTIMONIALS ===== */}
        <section className="section-testimonials" id="for-who">
          <div className="testimonials-header">
            <div className="section-tag">Loved by Creators</div>
            <h2>Artists are finally getting paid what they deserve</h2>
            <p>Hear from independent artists, producers, and songwriters who use Roy every day.</p>
          </div>
          <div className="testimonials-grid container">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <div className="testimonial-quote">&ldquo;{t.quote}&rdquo;</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== LOGOS SCROLLER ===== */}
        <section className="section-logos">
          <div className="logos-label">Works with all major platforms</div>
          <div className="logos-track-wrapper">
            <div className="logos-track">
              {[...logoNames, ...logoNames].map((name, i) => (
                <div key={i} className="logo-item">
                  <span className="logo-name">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section className="section-cta">
          <div className="container">
            <div className="section-tag">Start for Free</div>
            <h2>Your royalties are waiting. Go get them.</h2>
            <p>Connect your accounts in minutes. Roy will show you exactly what you&apos;re earning — and what you&apos;re missing.</p>
            <div className="cta-btns">
              <Link href="/signup" className="btn-primary">
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

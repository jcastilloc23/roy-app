import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCTA from "@/components/HeroCTA";
import RoyLogo from "@/components/RoyLogo";
import { SiSpotify, SiApplemusic, SiSoundcloud, SiYoutubemusic, SiBandcamp, SiPandora } from "react-icons/si";

export const metadata: Metadata = {
  title: "Roy — Music Royalty Transparency",
};

type LogoEntry =
  | { name: string; Icon: React.ComponentType<{ size?: number; "aria-label"?: string }>; brandColor: string; url: string }
  | { name: string; src: string; url: string };

const logos: LogoEntry[] = [
  { name: "Spotify",       Icon: SiSpotify,      brandColor: "#1DB954", url: "https://open.spotify.com" },
  { name: "Apple Music",   Icon: SiApplemusic,   brandColor: "#FC3C44", url: "https://music.apple.com" },
  { name: "YouTube Music", Icon: SiYoutubemusic, brandColor: "#FF0000", url: "https://music.youtube.com" },
  { name: "SoundCloud",    Icon: SiSoundcloud,   brandColor: "#FF5500", url: "https://soundcloud.com" },
  { name: "ASCAP",          src: "/logos/ascap.png",                       url: "https://www.ascap.com" },
  { name: "Bandcamp",      Icon: SiBandcamp,     brandColor: "#1DA0C3", url: "https://bandcamp.com" },
  { name: "DistroKid",     src: "/logos/distrokid.png",               url: "https://distrokid.com" },
  { name: "CD Baby",       src: "/logos/cd_baby.png",                    url: "https://cdbaby.com" },
  { name: "Pandora",       Icon: SiPandora,      brandColor: "#224099", url: "https://pandora.com" },
  { name: "BMI",           src: "/logos/bmi.png",                         url: "https://bmi.com" },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* ===== HERO ===== */}
        <section className="hero" id="home">
          <div className="container">
            <h1>
              Never miss a <RoyLogo height="1.5em" inline />alty payment again
            </h1>
            <p className="hero-sub">
              Drop in any royalty statement — from Spotify, ASCAP, DistroKid, the MLC, or anywhere else — and Roy reads it, explains it in plain English, and tells you exactly what&apos;s missing or wrong.
            </p>
            <HeroCTA />

            {/* Summary mockup */}
            <div className="hero-mockup">
              <div className="mockup-browser">
                <div className="mockup-bar">
                  <div className="mockup-dot" />
                  <div className="mockup-dot" />
                  <div className="mockup-dot" />
                  <div className="mockup-url">app.useroy.com — Summary</div>
                </div>
                <div className="mockup-body" style={{ gridTemplateColumns: "160px 1fr" }}>
                  <div className="mockup-sidebar">
                    <div className="mockup-sidebar-logo">🎵 Roy</div>
                    {[
                      { label: "Summary", active: true },
                      { label: "Analytics" },
                      { label: "Talk to Roy" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`mockup-nav-item${item.active ? " active" : ""}`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="mockup-content">
                    {/* Roy's take */}
                    <div style={{
                      background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.18)",
                      borderRadius: "8px", padding: "12px 14px",
                    }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: "6px" }}>
                        Roy&apos;s take
                      </div>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>
                        DistroKid paid out $2,847 across 18 tracks for Q4 2024. Your Spotify rate of $0.0035/stream is within benchmark. One track is missing an ISRC — flag it before the next reporting cycle.
                      </p>
                    </div>
                    {/* KPI cards */}
                    <div className="mockup-stat-row">
                      <div className="mockup-stat">
                        <div className="mockup-stat-label">Total earnings</div>
                        <div className="mockup-stat-val green">$2,847</div>
                      </div>
                      <div className="mockup-stat">
                        <div className="mockup-stat-label">Total streams</div>
                        <div className="mockup-stat-val">821K</div>
                      </div>
                      <div className="mockup-stat">
                        <div className="mockup-stat-label">Avg / stream</div>
                        <div className="mockup-stat-val">$0.0035</div>
                      </div>
                    </div>
                    {/* By platform */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { name: "Spotify", pct: 60, val: "$1,720" },
                        { name: "Apple Music", pct: 24, val: "$680" },
                        { name: "Amazon Music", pct: 16, val: "$447" },
                      ].map((row) => (
                        <div key={row.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", width: "80px", flexShrink: 0 }}>{row.name}</div>
                          <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "100px", height: "5px", overflow: "hidden" }}>
                            <div style={{ background: "var(--green)", height: "100%", width: `${row.pct}%`, borderRadius: "100px" }} />
                          </div>
                          <div style={{ fontSize: "10px", color: "#fff", fontWeight: 600, width: "40px", textAlign: "right" }}>{row.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CAPABILITIES ===== */}
        <section style={{ background: "var(--bg)", padding: "80px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="section-tag">What Roy does</div>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, marginBottom: "48px" }}>
              Read any statement. Understand everything.
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              textAlign: "left",
            }}>
              {/* Card 1 */}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "28px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                  Drop in any statement
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                  CSV, PDF, or Excel from any DSP, PRO, or distributor. Roy identifies the source and format on sight — no setup, no mapping.
                </p>
              </div>

              {/* Card 2 */}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "28px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                  Plain-English summary
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                  What you earned, at what rates, from which platforms. Real numbers surfaced instantly, no spreadsheet required.
                </p>
              </div>

              {/* Card 3 */}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "28px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                  Spot what&apos;s wrong
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                  Missing ISRCs, below-market rates, registration gaps. The issues that cost you money, flagged before the next reporting cycle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== LOGOS SCROLLER ===== */}
        <section className="section-logos">
          <div className="logos-label">Works with all major platforms</div>
          <div className="logos-track-wrapper">
            <div className="logos-track">
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <a
                  key={i}
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="logo-item"
                  style={"Icon" in logo ? { "--logo-brand-color": logo.brandColor } as React.CSSProperties : undefined}
                >
                  {"Icon" in logo
                    ? <logo.Icon size={32} aria-label={logo.name} />
                    : <img src={logo.src} alt={logo.name} className="logo-img" />
                  }
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

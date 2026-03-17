import type { Metadata } from "next";
import Link from "next/link";
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
        </div>
      </section>

      {/* Roy tool mockup — stacked screenshots */}
      <div className="hero-mockup">
        <Link href="/roy-tool" style={{ display: "block", cursor: "pointer" }}>
          <img
            src="/screenshots/roy-tool-result.png"
            alt="Roy tool — Roy's Take, earnings summary, and benchmark stats"
            style={{ width: "100%", borderRadius: "12px 12px 0 0", display: "block" }}
          />
          <img
            src="/screenshots/roy-tool-result-2.png"
            alt="Roy tool — revenue over time chart and per-platform benchmark rates"
            style={{ width: "100%", borderRadius: "0 0 12px 12px", display: "block" }}
          />
        </Link>
      </div>

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
  );
}

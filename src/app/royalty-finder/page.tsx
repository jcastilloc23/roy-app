import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import RoyaltyFinderTabs from "@/components/RoyaltyFinderTabs";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Royalty Finder — Roy",
  description:
    "Find out if you're missing mechanical royalties. Search by artist name, Spotify URL, or writer name.",
};

export default function RoyaltyFinderPage() {
  return (
    <>
      {/* External live-search widget from Mogul */}
      <Script
        src="https://app.usemogul.com/live-search-results.bundle.js"
        strategy="afterInteractive"
      />

      <CookieBanner />
      <Navbar />

      <main>
        {/* ===== HERO ===== */}
        <section
          style={{
            padding: "100px 24px 0",
            textAlign: "center",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(0,212,123,0.07) 0%, transparent 55%)",
          }}
        >
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {/* Eyebrow tag */}
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--green)",
                marginBottom: "16px",
              }}
            >
              Royalty Finder
            </p>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                marginBottom: "20px",
              }}
            >
              Missing out on{" "}
              <span style={{ color: "var(--green)" }}>
                mechanical royalties?
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.65,
                marginBottom: "12px",
                maxWidth: "520px",
                margin: "0 auto 48px",
              }}
            >
              Search your catalog and discover unclaimed mechanical royalties
              from streams and downloads — before someone else does.
            </p>
          </div>
        </section>

        {/* ===== TABS + SEARCH ===== */}
        <RoyaltyFinderTabs />

        {/* ===== HELPER NOTE ===== */}
        <section style={{ padding: "0 24px 40px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            If you&apos;re both an artist and a writer, select which one you
            currently earn more royalties from.
          </p>
        </section>

        {/* ===== LIVE SEARCH RESULTS (injected by external script) ===== */}
        {/* The isolation wrapper resets inherited styles so the Mogul bundle's
            injected CSS cannot bleed into the rest of the Roy UI. */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", all: "initial" as React.CSSProperties["all"], display: "block", fontFamily: "inherit" }}>
            <div
              id="live-search-results-root"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

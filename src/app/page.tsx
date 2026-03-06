import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <CookieBanner />
      <Navbar />
      <main>
        {/* Hero */}
        <section
          style={{
            padding: "120px 24px 80px",
            textAlign: "center",
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,123,0.08) 0%, transparent 60%)",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <span className="pill">Mint for Music Royalties</span>
            <h1
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 700,
                lineHeight: 1.1,
                margin: "24px 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              Your royalties,{" "}
              <span style={{ color: "var(--green)" }}>all in one place.</span>
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.6,
                marginBottom: "40px",
                maxWidth: "560px",
                margin: "0 auto 40px",
              }}
            >
              Roy connects all your PRO, distributor, and publishing accounts
              in one place — so you always know exactly what you&apos;ve earned
              and what&apos;s missing.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-primary">
                Get Started Free →
              </Link>
              <Link href="/royalty-finder" className="btn-outline">
                Find Your Royalties
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

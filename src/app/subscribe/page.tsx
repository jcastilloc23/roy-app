"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const PricingTable = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.PricingTable),
  { ssr: false }
);

export default function SubscribePage() {
  return (
    <>
      <CookieBanner />
      <Navbar />
      <main>
        <div className="page-hero" style={{ paddingBottom: "48px" }}>
          <div className="container">
            <h1 style={{ marginBottom: "16px" }}>Choose your plan</h1>
            <p style={{ color: "var(--text-muted)" }}>
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
        </div>

        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <PricingTable />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

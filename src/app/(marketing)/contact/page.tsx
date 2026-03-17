import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Roy",
};

export default function ContactPage() {
  return (
    <main>
      <div className="page-hero" style={{ paddingBottom: "48px" }}>
        <div className="container">
          <div className="section-tag">Contact</div>
          <h1 style={{ color: "#fff" }}>Get in touch</h1>
        </div>
      </div>

      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "40px",
              width: "100%",
              maxWidth: "480px",
              textAlign: "center",
            }}
          >
            <a
              href="mailto:hello@roymetrics.com"
              style={{
                display: "block",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--green)",
                marginBottom: "20px",
                textDecoration: "none",
              }}
            >
              hello@roymetrics.com
            </a>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7, marginBottom: "8px" }}>
              Questions about statements, billing, account access, or enterprise pricing.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
              We respond within 1–2 business days.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
              For privacy or data deletion requests, use the same address.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

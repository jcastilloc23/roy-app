import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Roy",
};

const h2Style: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#fff",
  marginTop: "48px",
  marginBottom: "12px",
};

const pStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "15px",
  lineHeight: 1.8,
  marginBottom: "16px",
};

export default function PrivacyPage() {
  return (
    <main>
      <div className="page-hero" style={{ paddingBottom: "48px" }}>
        <div className="container">
          <div className="section-tag">Legal</div>
          <h1 style={{ color: "#fff" }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-muted)" }}>Last updated: March 2026</p>
        </div>
      </div>

      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>

          <h2 style={h2Style}>1. What We Collect</h2>
          <p style={pStyle}>
            When you create an account, we collect your name and email address through Clerk, our authentication
            provider. When you upload royalty statements, we store the files themselves and the structured data
            parsed from them. We also store AI-generated summaries and anomaly flags derived from your uploads.
          </p>
          <p style={pStyle}>
            We do not collect payment information directly — billing is handled by Stripe via Clerk. We do not
            have access to your full card details.
          </p>

          <h2 style={h2Style}>2. How We Store It</h2>
          <p style={pStyle}>
            Uploaded statement files are stored in a private Supabase Storage bucket. Parsed results and account
            data are stored in Supabase Postgres. All data is encrypted in transit (TLS) and at rest.
            Authentication and session data is managed by Clerk. Billing records are managed by Stripe via Clerk.
          </p>
          <p style={pStyle}>
            Access to your data is restricted to your account. We use Row Level Security (RLS) policies on our
            database to enforce this at the data layer.
          </p>

          <h2 style={h2Style}>3. AI Processing</h2>
          <p style={pStyle}>
            When you upload a royalty statement, the text content of that file is sent to the Google Gemini API
            for parsing and analysis. This is how Roy extracts structured data and generates plain-English
            summaries. The raw model response is stored in our database for debugging and quality review.
          </p>
          <p style={pStyle}>
            We do not use your data to train third-party models. Google&apos;s use of data submitted through
            the Gemini API is governed by their API terms of service. Roy does not opt in to any data sharing
            or training programs with Google.
          </p>

          <h2 style={h2Style}>4. Sharing and Third Parties</h2>
          <p style={pStyle}>
            We do not sell your data. The subprocessors we use to operate Roy are:
          </p>
          <ul style={{ ...pStyle, paddingLeft: "20px", marginBottom: "16px" }}>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#fff" }}>Supabase</strong> — database and file storage</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#fff" }}>Clerk</strong> — authentication and user management</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#fff" }}>Stripe (via Clerk)</strong> — billing and subscription management</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#fff" }}>Google Gemini</strong> — AI parsing of uploaded statement text</li>
          </ul>
          <p style={pStyle}>
            We do not share your data with any other third parties except as required by law.
          </p>

          <h2 style={h2Style}>5. Your Rights</h2>
          <p style={pStyle}>
            You have the right to access, correct, export, or delete your data at any time. To request any of
            these, email us at{" "}
            <a href="mailto:hello@roymetrics.com" style={{ color: "var(--green)" }}>hello@roymetrics.com</a>.
            We will respond within 30 days.
          </p>
          <p style={pStyle}>
            If you delete your account, all associated statement files and parsed results will be permanently
            deleted. This action cannot be undone.
          </p>

          <h2 style={h2Style}>6. Contact</h2>
          <p style={pStyle}>
            For privacy questions or data deletion requests, contact us at{" "}
            <a href="mailto:hello@roymetrics.com" style={{ color: "var(--green)" }}>hello@roymetrics.com</a>.
          </p>

        </div>
      </section>
    </main>
  );
}

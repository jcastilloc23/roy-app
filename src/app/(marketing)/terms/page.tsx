import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Roy",
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

export default function TermsPage() {
  return (
    <main>
      <div className="page-hero" style={{ paddingBottom: "48px" }}>
        <div className="container">
          <div className="section-tag">Legal</div>
          <h1 style={{ color: "#fff" }}>Terms of Service</h1>
          <p style={{ color: "var(--text-muted)" }}>Last updated: March 2026</p>
        </div>
      </div>

      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>

          <h2 style={h2Style}>1. What Roy Is</h2>
          <p style={pStyle}>
            Roy is a royalty statement parsing and transparency tool. It is designed to help independent artists,
            managers, and labels understand what their royalty statements say — not to provide financial, legal,
            or accounting advice. Nothing Roy produces constitutes professional advice of any kind. Always consult
            a qualified professional for financial or legal decisions.
          </p>

          <h2 style={h2Style}>2. Your Content and Uploads</h2>
          <p style={pStyle}>
            By uploading files to Roy, you represent that you have the right to share those documents and that
            doing so does not violate any third-party agreement. You retain all ownership of your content.
            Roy does not claim any rights to the royalty statements or data you upload.
          </p>
          <p style={pStyle}>
            You are responsible for ensuring that any files you upload are yours to share. Do not upload
            documents belonging to other parties without their explicit permission.
          </p>

          <h2 style={h2Style}>3. How We Use Your Data</h2>
          <p style={pStyle}>
            We do not sell your data. We do not share your uploaded statement data with third parties except
            as required to operate the service (see our Privacy Policy for the list of subprocessors).
          </p>
          <p style={pStyle}>
            We may use anonymized, aggregated data derived from statements to power future benchmarking features.
            If we do, we will notify you before this happens and you will be able to opt out.
          </p>

          <h2 style={h2Style}>4. Billing and Cancellation</h2>
          <p style={pStyle}>
            Roy Label is billed at $11/month. You may cancel at any time from your account settings. Cancellation
            takes effect at the end of your current billing period — you will retain access until then.
          </p>
          <p style={pStyle}>
            If you believe you were charged in error, contact us at{" "}
            <a href="mailto:hello@roymetrics.com" style={{ color: "var(--green)" }}>hello@roymetrics.com</a>{" "}
            within 7 days of the charge and we will review it promptly.
          </p>

          <h2 style={h2Style}>5. Termination</h2>
          <p style={pStyle}>
            Roy may suspend or terminate accounts that are used abusively or in violation of these terms.
            You may request deletion of your account and data at any time by contacting us. We will process
            deletion requests within 30 days.
          </p>

          <h2 style={h2Style}>6. Disclaimer</h2>
          <p style={pStyle}>
            Roy is provided as-is. We make no warranties about the accuracy of parsed results. AI-generated
            summaries are tools to help you understand your statements — they are not a substitute for
            professional review. Rates, flags, and anomaly detection are based on known industry benchmarks
            and may not reflect your specific agreements.
          </p>

          <h2 style={h2Style}>7. Contact</h2>
          <p style={pStyle}>
            Questions about these terms? Reach us at{" "}
            <a href="mailto:hello@roymetrics.com" style={{ color: "var(--green)" }}>hello@roymetrics.com</a>.
          </p>

        </div>
      </section>
    </main>
  );
}

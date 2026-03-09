export default function AnalyticsPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: "16px",
      color: "var(--text-muted)",
      textAlign: "center",
      padding: "48px 24px",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Analytics</h2>
        <p style={{ fontSize: "14px", lineHeight: 1.6, maxWidth: "360px" }}>
          This feature is on the way. Rate benchmarking, royalty health scores, and cross-source comparisons — coming in a future update.
        </p>
      </div>
    </div>
  );
}

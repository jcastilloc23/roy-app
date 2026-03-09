export default function TalkPage() {
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Talk to Roy</h2>
        <p style={{ fontSize: "14px", lineHeight: 1.6, maxWidth: "360px" }}>
          This feature is on the way. Ask Roy anything about your royalty statements — what you earned, what&apos;s missing, and what to do about it.
        </p>
      </div>
    </div>
  );
}

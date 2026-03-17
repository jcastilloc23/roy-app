export default function AnalyticsPage() {
  return (
    <main>
      <section style={{
        padding: "72px 24px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
          background: "radial-gradient(ellipse, rgba(200,255,0,0.07) 0%, transparent 55%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "20px",
            fontFamily: "var(--font-display)",
          }}>
            Analytics
          </h1>
          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,0.6)",
            lineHeight: 1.65, maxWidth: "520px", margin: "0 auto",
          }}>
            Your earnings data, broken down. Rate benchmarking, royalty health score, and cross-source comparisons will appear here once your statements are processed.
          </p>
        </div>
      </section>
    </main>
  );
}

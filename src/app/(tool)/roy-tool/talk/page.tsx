export default function TalkPage() {
  return (
    <main>
      <section style={{
        padding: "72px 24px 56px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,123,0.07) 0%, transparent 55%)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "20px",
          }}>
            Talk to Roy
          </h1>
          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,0.6)",
            lineHeight: 1.65, maxWidth: "520px", margin: "0 auto",
          }}>
            Ask Roy anything about your royalty statements — what you earned, what&apos;s missing, and what to do about it. Coming in a future update.
          </p>
        </div>
      </section>
    </main>
  );
}

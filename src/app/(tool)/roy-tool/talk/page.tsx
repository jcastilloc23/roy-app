import RoyLogo from "@/components/RoyLogo";

interface TalkPageProps {
  searchParams: Promise<{ statementId?: string }>;
}

export default async function TalkPage({ searchParams }: TalkPageProps) {
  const { statementId } = await searchParams;

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
            Talk to{" "}
            <span style={{ color: "var(--green)" }}>
              <RoyLogo height="1.5em" inline />
            </span>
          </h1>
          {statementId ? (
            <p style={{
              fontSize: "17px", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.65, maxWidth: "520px", margin: "0 auto",
            }}>
              Roy has read your statement — this is where you&apos;ll be able to ask questions about it. What did you earn? What&apos;s missing? What should you do next? This feature is on its way.
            </p>
          ) : (
            <p style={{
              fontSize: "17px", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.65, maxWidth: "520px", margin: "0 auto",
            }}>
              Drop a statement on the Summary tab and Roy will have something to talk about.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

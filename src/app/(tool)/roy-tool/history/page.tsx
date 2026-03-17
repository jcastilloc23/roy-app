import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = { title: "History — Roy" };

type StatementRow = {
  id: string;
  file_name: string;
  source_type: string | null;
  status: string | null;
  uploaded_at: string | null;
  file_size: number | null;
  parsed_results: {
    total_earnings: number | null;
    currency: string | null;
    period_start: string | null;
    period_end: string | null;
    summary: string | null;
  }[] | null;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  const fmt = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start ?? end!);
}

function fmtEarnings(n: number | null, currency: string | null): string {
  if (n === null) return "—";
  return `${currency === "USD" || !currency ? "$" : currency + " "}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    complete:    { label: "Analyzed",    color: "#C8FF00",     bg: "rgba(200,255,0,0.08)" },
    identified:  { label: "Identified",  color: "#06b6d4",     bg: "rgba(6,182,212,0.08)" },
    processing:  { label: "Processing",  color: "#f59e0b",     bg: "rgba(245,158,11,0.08)" },
    pending:     { label: "Pending",     color: "#8a8f9a",     bg: "rgba(138,143,154,0.08)" },
    error:       { label: "Error",       color: "#ef4444",     bg: "rgba(239,68,68,0.08)" },
  };
  const s = map[status ?? ""] ?? { label: status ?? "Unknown", color: "#8a8f9a", bg: "rgba(138,143,154,0.08)" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "100px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.04em",
      color: s.color,
      background: s.bg,
    }}>
      {s.label}
    </span>
  );
}

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = supabaseAdmin();
  const { data: statements, error } = await supabase
    .from("statements")
    .select(`
      id,
      file_name,
      source_type,
      status,
      uploaded_at,
      file_size,
      parsed_results (
        total_earnings,
        currency,
        period_start,
        period_end,
        summary
      )
    `)
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[history] DB error:", error.message);
  }

  const rows = (statements ?? []) as StatementRow[];

  return (
    <main>
      <section style={{
        padding: "48px 24px 32px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(200,255,0,0.05) 0%, transparent 55%)",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700,
            lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "8px",
          }}>
            Statement history
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
            All royalty statements you&apos;ve uploaded, most recent first.
          </p>
        </div>
      </section>

      <div style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {rows.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.3 }}>📂</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>
                No statements yet
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>
                Drop a royalty statement on the Summary tab to get started.
              </div>
              <Link
                href="/roy-tool"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  background: "#C8FF00",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Upload a statement
              </Link>
            </div>
          ) : (
            <div style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 130px 120px 100px",
                gap: "16px",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}>
                <span>File</span>
                <span>Period</span>
                <span>Earnings</span>
                <span>Uploaded</span>
                <span>Status</span>
              </div>

              {/* Rows */}
              {rows.map((stmt, i) => {
                const pr = stmt.parsed_results?.[0] ?? null;
                const isLast = i === rows.length - 1;
                return (
                  <div
                    key={stmt.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 130px 120px 100px",
                      gap: "16px",
                      padding: "16px 20px",
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                      alignItems: "center",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* File info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: "13px", fontWeight: 600, color: "#fff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: "3px",
                      }}>
                        {stmt.file_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "flex", gap: "8px", alignItems: "center" }}>
                        {stmt.source_type && (
                          <span style={{
                            padding: "1px 8px",
                            borderRadius: "100px",
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.55)",
                            fontSize: "11px",
                          }}>
                            {stmt.source_type}
                          </span>
                        )}
                        {stmt.file_size && (
                          <span>{fmtFileSize(stmt.file_size)}</span>
                        )}
                      </div>
                    </div>

                    {/* Period */}
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                      {pr ? fmtPeriod(pr.period_start, pr.period_end) : "—"}
                    </div>

                    {/* Earnings */}
                    <div style={{ fontSize: "13px", fontWeight: pr?.total_earnings ? 600 : 400, color: pr?.total_earnings ? "#C8FF00" : "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}>
                      {pr ? fmtEarnings(pr.total_earnings, pr.currency) : "—"}
                    </div>

                    {/* Upload date */}
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                      {fmtDate(stmt.uploaded_at)}
                    </div>

                    {/* Status */}
                    <StatusBadge status={stmt.status} />
                  </div>
                );
              })}
            </div>
          )}

          {rows.length > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link
                href="/roy-tool"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  background: "#C8FF00",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Upload another statement
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

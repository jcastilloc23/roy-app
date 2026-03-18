"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SummaryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="4" height="18" rx="1" />
    <rect x="10" y="8" width="4" height="13" rx="1" />
    <rect x="17" y="13" width="4" height="8" rx="1" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TalkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);


const navItems = [
  { href: "/roy-tool", label: "Summary", Icon: SummaryIcon },
  { href: "/roy-tool/analytics", label: "Analytics", Icon: AnalyticsIcon },
  { href: "/roy-tool/talk", label: "Talk to Roy", Icon: TalkIcon },
];

export default function ToolSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "200px",
      minHeight: "calc(100vh - 64px)",
      background: "var(--roy-bg)",
      borderRight: "1px solid var(--roy-border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 12px",
      flexShrink: 0,
      fontFamily: "var(--font-ui)",
    }}>
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--roy-accent)" : "var(--roy-text-muted)",
                background: "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div style={{
        marginTop: "auto",
        padding: "14px",
        background: "var(--roy-surface)",
        border: "1px solid var(--roy-border)",
        borderRadius: "8px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Roy Label</div>
        <div style={{ fontSize: "12px", color: "var(--roy-text-muted)", marginBottom: "10px", lineHeight: 1.4 }}>
          Unlimited artists, reconciliation, and anomaly alerts.
        </div>
        <Link
          href="/subscribe"
          style={{
            display: "block",
            textAlign: "center",
            padding: "7px 0",
            background: "var(--roy-accent)",
            color: "#000",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Upgrade — $11/mo
        </Link>
      </div>
    </aside>
  );
}

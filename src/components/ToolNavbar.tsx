"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import RoyLogo from "@/components/RoyLogo";

const toolLinks = [
  { href: "/roy-tool", label: "Statements" },
  { href: "/roy-tool/dashboard", label: "Dashboard" },
  { href: "/roy-tool/issues", label: "Issues" },
];

export default function ToolNavbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg2)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          height: "58px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <RoyLogo height={38} />
        </Link>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: "2px", flex: 1 }}>
          {toolLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  background: active ? "rgba(255,255,255,0.07)" : "transparent",
                  transition: "all 0.15s",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Account */}
        <UserButton />
      </div>
    </nav>
  );
}

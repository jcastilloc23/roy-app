"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import RoyLogo from "@/components/RoyLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/whos-it-for", label: "Who it's for" },
  { href: "/roy-tool", label: "Roy Tool" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav>
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <RoyLogo height={52} />
          </Link>

          {/* Desktop nav links */}
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? "active" : ""}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <Show when="signed-out">
              <li>
                <SignInButton mode="modal" forceRedirectUrl="/roy-tool">
                  <button style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "rgba(255,255,255,0.7)", padding: 0, fontSize: "15px" }}>
                    Log In
                  </button>
                </SignInButton>
              </li>
            </Show>
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            <Show when="signed-out">
              <SignUpButton mode="modal" forceRedirectUrl="/roy-tool">
                <button className="btn-primary" style={{ padding: "9px 18px", fontSize: "14px" }}>
                  Get Started Free
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
            {/* Hamburger (mobile) */}
            <button
              className="hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{
                display: "none",
                flexDirection: "column",
                gap: "5px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <span style={{ display: "block", width: "24px", height: "2px", background: "#fff", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "24px", height: "2px", background: "#fff", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "24px", height: "2px", background: "#fff", borderRadius: "2px" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,13,15,0.97)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", top: "20px", right: "24px", background: "none", border: "none", color: "#fff", fontSize: "28px", cursor: "pointer" }}
          >
            ×
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontSize: "24px", fontWeight: 600, color: "#fff" }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Show when="signed-out">
            <SignInButton mode="modal" forceRedirectUrl="/roy-tool">
              <button style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "#fff", fontSize: "24px", fontWeight: 600 }}>
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/roy-tool">
              <button className="btn-primary" onClick={() => setMobileOpen(false)}>
                Get Started Free
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      )}
    </>
  );
}

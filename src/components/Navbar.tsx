"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/whos-it-for", label: "Who it's for" },
  { href: "/royalty-finder", label: "Royalty Finder" },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/roy-logo.svg"
              alt="Roy"
              width={72}
              height={36}
              style={{ display: "block" }}
            />
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
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="nav-login">Log In</button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="btn-primary"
                style={{ padding: "9px 18px", fontSize: "14px" }}
              >
                Get Started Free
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
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
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "#fff",
                  borderRadius: "2px",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "#fff",
                  borderRadius: "2px",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "#fff",
                  borderRadius: "2px",
                }}
              />
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
            background: "rgba(5,6,10,0.97)",
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
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "28px",
              cursor: "pointer",
            }}
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
          <SignedOut>
            <Link href="/sign-up" className="btn-primary" onClick={() => setMobileOpen(false)}>
              Get Started Free
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      )}
    </>
  );
}

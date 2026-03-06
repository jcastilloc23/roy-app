"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleClose = (choice: "accept" | "deny" | "close") => {
    if (choice !== "close") {
      localStorage.setItem("cookie-consent", choice);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" style={{ position: "fixed" }}>
      <div className="cookie-text">
        <p>
          We use cookies to improve your experience. See our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <div className="cookie-btns">
          <button className="cookie-accept" onClick={() => handleClose("accept")}>
            Accept
          </button>
          <button className="cookie-deny" onClick={() => handleClose("deny")}>
            Deny
          </button>
        </div>
      </div>
      <button className="cookie-close" onClick={() => handleClose("close")}>
        ×
      </button>
    </div>
  );
}

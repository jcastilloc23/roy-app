"use client";

import { SignUpButton } from "@clerk/nextjs";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function HeroCTA() {
  return (
    <div className="hero-ctas">
      <SignUpButton mode="modal">
        <button className="btn-primary">
          Get Started Free <ArrowIcon />
        </button>
      </SignUpButton>
      <a href="#demo" className="hero-video-link">
        <div className="play-icon">▶</div>
        See Roy in action
      </a>
    </div>
  );
}

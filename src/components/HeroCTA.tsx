"use client";

import { SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function HeroCTA() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  return (
    <div className="hero-ctas">
      {isSignedIn ? (
        <button className="btn-primary" onClick={() => router.push('/roy-tool')}>
          Go to Roy Tool <ArrowIcon />
        </button>
      ) : (
        <SignUpButton mode="modal">
          <button className="btn-primary">
            Get Started Free <ArrowIcon />
          </button>
        </SignUpButton>
      )}
      <a href="#demo" className="hero-video-link">
        <div className="play-icon">▶</div>
        See Roy in action
      </a>
    </div>
  );
}

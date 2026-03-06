"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export default function CounterSection() {
  const { count, ref } = useCountUp(24817430, 2400);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(count);

  return (
    <section className="section-counter" ref={ref}>
      <div className="container">
        <div className="counter-label">Royalties tracked for artists</div>
        <div className="counter-headline">
          Billions in uncollected royalties — we&apos;re finding them.
        </div>
        <div className="counter-sub">
          The music industry loses an estimated $2.65B in unclaimed royalties
          every year. Roy is here to change that.
        </div>
        <div className="counter-number">{formatted}</div>
        <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--text-muted)" }}>
          tracked across our artist community
        </p>
      </div>
    </section>
  );
}

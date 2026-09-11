"use client";

import { useEffect, useRef, useState } from "react";

import { formatSoles } from "@/components/landing/content";

const DURATION_MS = 1400;

export function PrizeCounter({ amount }: { readonly amount: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (node === null) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setValue(amount);
      return;
    }

    let frame = 0;
    let started = false;

    const play = () => {
      if (started) return;
      started = true;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(amount * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [amount]);

  return (
    <span ref={nodeRef} className="tabular-nums">
      {formatSoles(value)}
    </span>
  );
}

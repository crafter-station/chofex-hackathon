"use client";

import { useEffect, useRef, useState } from "react";

import { formatSoles } from "@/components/landing/content";

export type PrizeCounterFormat = "soles" | "number";

interface PrizeCounterProps {
  readonly amount: number;
  readonly animate?: boolean;
  readonly format?: PrizeCounterFormat;
}

export function formatPrizeAmount(
  amount: number,
  format: PrizeCounterFormat,
): string {
  if (format === "number") {
    return amount.toLocaleString("es-PE");
  }

  return formatSoles(amount);
}

export function PrizeCounter({
  amount,
  animate = false,
  format = "soles",
}: PrizeCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [displayedAmount, setDisplayedAmount] = useState(amount);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!animate) {
      return;
    }

    const counter = counterRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!counter || reduceMotion) {
      setDisplayedAmount(amount);
      setComplete(true);
      return;
    }

    let animationFrame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        setDisplayedAmount(0);

        const duration = 850;
        const startedAt = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startedAt;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = 1 - (1 - progress) ** 4;

          setDisplayedAmount(Math.round(amount * easedProgress));

          if (progress < 1) {
            animationFrame = requestAnimationFrame(tick);
            return;
          }

          setComplete(true);
        };

        animationFrame = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );

    observer.observe(counter);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [amount, animate]);

  return (
    <>
      <span
        aria-hidden="true"
        className="tabular-nums"
        data-complete={complete}
        ref={counterRef}
      >
        {formatPrizeAmount(displayedAmount, format)}
      </span>
      <span className="sr-only">{formatPrizeAmount(amount, format)}</span>
    </>
  );
}

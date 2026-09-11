"use client";

import { useEffect, useRef, useState } from "react";

import { formatSoles } from "@/components/landing/content";

const DURATION_MS = 1600;

export type PrizeCounterFormat = "soles" | "number";

interface PrizeCounterProps {
  readonly amount: number;
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

export function isRectInViewport(
  rect: Pick<DOMRect, "top" | "right" | "bottom" | "left">,
  viewport: { readonly width: number; readonly height: number },
): boolean {
  const horizontallyVisible = rect.left < viewport.width && rect.right > 0;
  const verticallyVisible = rect.top < viewport.height && rect.bottom > 0;
  return horizontallyVisible && verticallyVisible;
}

export function shouldStartPrizeCounter(input: {
  readonly reducedMotion: boolean;
  readonly intersecting: boolean;
  readonly alreadyInViewport: boolean;
}): "final" | "play" | "wait" {
  if (input.reducedMotion) {
    return "final";
  }

  if (input.intersecting || input.alreadyInViewport) {
    return "play";
  }

  return "wait";
}

export function PrizeCounter({ amount, format = "soles" }: PrizeCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (node === null) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const alreadyInViewport = isRectInViewport(node.getBoundingClientRect(), {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const start = shouldStartPrizeCounter({
      reducedMotion,
      intersecting: false,
      alreadyInViewport,
    });

    if (start === "final") {
      setValue(amount);
      return;
    }

    let frame = 0;
    let started = false;

    const play = () => {
      if (started) return;
      started = true;
      const began = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / DURATION_MS);
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(amount * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setValue(amount);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    if (start === "play" || typeof IntersectionObserver === "undefined") {
      play();
      return () => {
        cancelAnimationFrame(frame);
      };
    }

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

    const queued = observer.takeRecords();
    if (
      shouldStartPrizeCounter({
        reducedMotion: false,
        intersecting: queued.some((entry) => entry.isIntersecting),
        alreadyInViewport,
      }) === "play"
    ) {
      play();
      observer.disconnect();
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [amount]);

  const formatted = formatPrizeAmount(value, format);
  const accessible = formatPrizeAmount(amount, format);

  return (
    <span ref={nodeRef} className="tabular-nums">
      <span aria-hidden="true">{formatted}</span>
      <span className="sr-only">{accessible}</span>
    </span>
  );
}

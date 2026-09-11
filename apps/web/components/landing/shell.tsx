import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

import "@/components/landing/landing.css";

export const landingPageClassName =
  "min-h-svh bg-[#1a1a1a] text-[#e1ff00] antialiased selection:bg-[#e1ff00] selection:text-[#1a1a1a]";

export const landingInvertClassName =
  "bg-[#e1ff00] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-[#e1ff00]";

export const landingCtaClassName =
  "inline-flex min-h-12 flex-col items-center justify-center border-2 border-[#e1ff00] bg-[#e1ff00] px-6 py-2.5 text-center font-[family-name:var(--font-landing-title)] text-base font-medium text-[#1a1a1a] uppercase tracking-[0.14em] transition hover:scale-[1.02] md:min-h-14 md:px-10 md:text-xl";

export const landingFrameClassName = "border-2 border-[#e1ff00] bg-[#111111]";

export function LandingContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1800px] px-5 sm:px-8 lg:px-10",
        className,
      )}
      {...props}
    />
  );
}

export function LandingEyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] lowercase tracking-[0.08em] text-[#d1d5d1]",
        className,
      )}
      {...props}
    />
  );
}

export function LandingTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-center font-[family-name:var(--font-landing-title)] text-4xl leading-none font-medium tracking-[0.16em] uppercase sm:text-6xl lg:text-7xl",
        className,
      )}
      {...props}
    />
  );
}

export function LandingSectionHead({
  title,
  titleId,
  children,
}: {
  readonly title: string;
  readonly titleId?: string;
  readonly children?: ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-3 text-center">
      <LandingTitle id={titleId}>{title}</LandingTitle>
      {children}
    </div>
  );
}

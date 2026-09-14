import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

import "@/components/landing/landing.css";

export const landingPageClassName =
  "landing-page min-h-svh bg-[var(--hud-paper)] text-[var(--hud-ink)] antialiased selection:bg-[var(--hud-accent)] selection:text-[var(--hud-ink)]";

/** Primary lockup: title-case brand, display condensed. */
export const landingDisplayClassName =
  "font-[family-name:var(--font-landing-display)] leading-[0.82] tracking-[-0.03em]";

export const landingHudClassName =
  "font-[family-name:var(--font-landing-mono)] uppercase tracking-[0.16em]";

export const landingCtaClassName =
  "landing-cta inline-flex min-h-12 flex-col items-center justify-center bg-[var(--hud-action)] px-7 py-2.5 text-center font-[family-name:var(--font-landing-mono)] text-sm font-semibold text-[var(--hud-paper)] uppercase tracking-[0.14em] transition hover:bg-[var(--hud-action-hover)] md:min-h-13 md:px-9";

export const landingFrameClassName =
  "border border-[rgb(239_232_222_/_15%)] bg-[var(--hud-panel)]/90 text-[var(--hud-ink)] shadow-[0_24px_80px_rgba(1,8,20,0.24)] backdrop-blur-sm";

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
      className={cn("landing-type-meta text-[var(--hud-action)]", className)}
      {...props}
    />
  );
}

export function LandingTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "font-[family-name:var(--font-landing-display)] text-5xl leading-[0.86] tracking-[-0.03em] uppercase sm:text-7xl",
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
  align = "left",
}: {
  readonly title: string;
  readonly titleId?: string;
  readonly children?: ReactNode;
  readonly align?: "left" | "center";
}) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={cn("mb-10 flex max-w-3xl flex-col gap-3", alignment)}>
      <LandingTitle id={titleId}>{title}</LandingTitle>
      {children}
    </div>
  );
}

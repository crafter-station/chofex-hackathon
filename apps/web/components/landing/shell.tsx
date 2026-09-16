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

export const landingCtaBaseClassName =
  "landing-cta inline-flex items-center justify-center whitespace-nowrap bg-[var(--hud-action)] text-center font-[family-name:var(--font-landing-mono)] font-semibold text-[var(--hud-paper)] uppercase tracking-[0.12em] transition-colors duration-150 hover:bg-[var(--hud-action-hover)] active:scale-[0.98]";

export const landingCtaClassName = `${landingCtaBaseClassName} min-h-12 px-7 py-2.5 text-sm md:min-h-13 md:px-9`;

export const landingFrameClassName =
  "border border-[var(--hud-ink)]/10 bg-[var(--hud-card)] text-[var(--hud-ink)]";

/** Vertical rhythm for regular content sections. Hero stays full-viewport; prizes does from md up. */
export const landingSectionYClassName = "py-14 sm:py-20";

export function LandingContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10",
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

export function LandingTitle({
  as: Heading = "h2",
  className,
  ...props
}: ComponentProps<"h2"> & { readonly as?: "h1" | "h2" }) {
  return (
    <Heading
      className={cn(
        "text-balance font-[family-name:var(--font-landing-display)] text-5xl leading-[0.88] tracking-[-0.025em] uppercase sm:text-7xl",
        className,
      )}
      {...props}
    />
  );
}

export function LandingSectionHead({
  title,
  subtitle,
  titleId,
  children,
  align = "left",
  headingLevel = "h2",
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly titleId?: string;
  readonly children?: ReactNode;
  readonly align?: "left" | "center";
  readonly headingLevel?: "h1" | "h2";
}) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={cn("mb-10 flex max-w-3xl flex-col gap-3", alignment)}>
      <LandingTitle as={headingLevel} id={titleId}>
        <span className="block">{title}</span>
        {subtitle ? <span className="block">{subtitle}</span> : null}
      </LandingTitle>
      {children}
    </div>
  );
}

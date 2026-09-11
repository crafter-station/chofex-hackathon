import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

import "@/components/landing/landing.css";

export const landingPageClassName =
  "landing-page min-h-svh bg-[#b9a8f4] text-[#fff3e4] antialiased selection:bg-[#fff3e4] selection:text-[#1f1833]";

export const landingInvertClassName =
  "bg-[#fff3e4] text-[#1f1833] selection:bg-[#1f1833] selection:text-[#fff3e4]";

export const landingDisplayClassName =
  "font-[family-name:var(--font-landing-display)] uppercase leading-[0.82] tracking-[-0.04em]";

export const landingCtaClassName =
  "inline-flex min-h-12 flex-col items-center justify-center rounded-full bg-[#fff3e4] px-8 py-3 text-center font-[family-name:var(--font-landing-sans)] text-base font-semibold text-[#1f1833] shadow-[0_10px_28px_rgb(31_24_51_/_18%)] transition hover:scale-[1.03] hover:shadow-[0_14px_32px_rgb(31_24_51_/_22%)] md:min-h-14 md:px-10 md:text-lg";

export const landingFrameClassName =
  "rounded-[1.75rem] border border-[#1f1833]/8 bg-[#fff3e4]/92 text-[#1f1833] shadow-[0_12px_40px_rgb(31_24_51_/_8%)]";

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
        "font-[family-name:var(--font-landing-sans)] text-[11px] font-medium tracking-[0.18em] text-current/55 uppercase",
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
        "text-center font-[family-name:var(--font-landing-display)] text-5xl leading-[0.82] tracking-[-0.04em] uppercase sm:text-7xl lg:text-8xl",
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
    <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 text-center">
      <LandingTitle id={titleId}>{title}</LandingTitle>
      {children}
    </div>
  );
}

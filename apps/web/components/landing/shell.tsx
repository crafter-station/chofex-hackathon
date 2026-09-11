import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps } from "react";

export const landingPageClassName =
  "min-h-svh bg-white text-[#07122b] antialiased selection:bg-[#e8ff00] selection:text-[#07122b]";

export const landingInvertClassName =
  "bg-[#0057ff] text-white selection:bg-[#e8ff00] selection:text-[#07122b]";

export const landingCtaClassName =
  "inline-flex min-h-12 flex-col items-center justify-center rounded-full bg-[#e8ff00] px-8 py-2.5 text-center font-[family-name:var(--font-landing-display)] text-base font-semibold tracking-[-0.03em] text-[#07122b] uppercase transition hover:scale-[1.03] md:min-h-14 md:px-10 md:text-xl";

export function LandingContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto max-w-6xl px-5 sm:px-8", className)}
      {...props}
    />
  );
}

export function LandingEyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.2em] text-current/60",
        className,
      )}
      {...props}
    />
  );
}

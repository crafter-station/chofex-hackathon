import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps } from "react";

export const landingPageClassName =
  "min-h-svh bg-[#f4f1e9] text-[#171713] dark:bg-[#171713] dark:text-[#f4f1e9]";

export const landingInvertClassName =
  "bg-[#171713] text-[#f4f1e9] dark:bg-[#f4f1e9] dark:text-[#171713]";

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
        "font-mono text-xs uppercase tracking-[0.2em] opacity-55",
        className,
      )}
      {...props}
    />
  );
}

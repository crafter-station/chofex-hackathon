import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps } from "react";

export function HudLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

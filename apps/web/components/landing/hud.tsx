import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps } from "react";

export function HudLabel({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("landing-type-meta", className)} {...props} />;
}

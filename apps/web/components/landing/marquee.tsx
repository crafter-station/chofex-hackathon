import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

interface LandingMarqueeProps {
  readonly children: ReactNode;
  readonly reverse?: boolean;
  readonly fast?: boolean;
  readonly className?: string;
}

export function LandingMarquee({
  children,
  reverse = false,
  fast = false,
  className,
}: LandingMarqueeProps) {
  const trackClassName = cn(
    "landing-marquee__track",
    reverse && "landing-marquee__track--reverse",
    fast && "landing-marquee__track--fast",
  );

  return (
    <div className={cn("landing-marquee", className)}>
      <div className={trackClassName}>
        <div className="landing-marquee__group">{children}</div>
        <div aria-hidden="true" className="landing-marquee__group">
          {children}
        </div>
      </div>
    </div>
  );
}

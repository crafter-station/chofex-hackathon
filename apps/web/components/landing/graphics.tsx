import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export function PersonMark({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-[0.72em] shrink-0 fill-current", className)}
      viewBox="0 0 64 120"
    >
      <circle cx="32" cy="16" r="12" />
      <path d="M12 40h40l6 80H6Z" />
    </svg>
  );
}

export function ClockMark({
  className,
  minutes,
}: {
  readonly className?: string;
  readonly minutes: number;
}) {
  const hourAngle = (minutes / 60) * 360;
  return (
    <svg
      aria-hidden="true"
      className={cn("size-[0.72em] shrink-0", className)}
      fill="none"
      viewBox="0 0 64 64"
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" />
      <line
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="4"
        x1="32"
        x2="32"
        y1="32"
        y2="14"
      />
      <line
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="4"
        transform={`rotate(${hourAngle} 32 32)`}
        x1="32"
        x2="46"
        y1="32"
        y2="32"
      />
    </svg>
  );
}

export function IconRepeat({
  count,
  children,
}: {
  readonly count: number;
  readonly children: (index: number) => ReactNode;
}) {
  return <>{Array.from({ length: count }, (_, index) => children(index))}</>;
}

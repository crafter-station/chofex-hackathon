import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export function AndesWireframe({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("text-[#e1ff00]", className)}
      fill="none"
      viewBox="0 0 640 360"
    >
      <path
        d="M40 300 200 80l120 40 160-72 120 252H40Z"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path
        d="M200 80 280 300M320 120 400 300M480 48 560 300"
        opacity="0.7"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M40 300 200 80 320 120 480 48 600 300"
        opacity="0.35"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M72 248h496M112 200h416M160 152h320M208 112h200"
        opacity="0.28"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M40 300h560"
        opacity="0.85"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M200 80 248 300M320 120 360 300M480 48 520 300"
        opacity="0.22"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="200" cy="80" fill="currentColor" r="2.4" />
      <circle cx="320" cy="120" fill="currentColor" r="2.4" />
      <circle cx="480" cy="48" fill="currentColor" r="2.6" />
      <circle cx="40" cy="300" fill="currentColor" r="2" />
      <circle cx="600" cy="300" fill="currentColor" r="2" />
    </svg>
  );
}

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

import { cn } from "@chofex/ui/lib/utils";

export function AndesWireframe({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("text-[#e1ff00]", className)}
      fill="none"
      viewBox="0 0 420 300"
    >
      <path
        d="M40 250 210 40l170 210H40Z"
        opacity="0.95"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M40 250 210 188l170 62"
        opacity="0.55"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M86 194 210 118l124 76"
        opacity="0.45"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M132 138 210 86l78 52"
        opacity="0.4"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M210 40v210"
        opacity="0.7"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M40 250h340M86 194h248M132 138h156"
        opacity="0.28"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M70 250 210 40 350 250"
        opacity="0.2"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="210" cy="40" fill="currentColor" r="2.5" />
      <circle cx="40" cy="250" fill="currentColor" r="2" />
      <circle cx="380" cy="250" fill="currentColor" r="2" />
      <circle cx="210" cy="188" fill="currentColor" r="2" />
    </svg>
  );
}

import Link from "next/link";

import { LandingContainer } from "@/components/landing/shell";

export function LandingFooter() {
  return (
    <footer className="border-[#e1ff00]/30 border-t pb-24 sm:pb-0">
      <LandingContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-landing-display)] font-medium lowercase tracking-tight">
            hack the andes
          </p>
          <p className="font-mono text-xs tracking-[0.08em] text-[#d1d5d1] lowercase">
            lima · 10–11 oct 2026 · sponsored by chofex
          </p>
        </div>
        <nav aria-label="Legal" className="flex items-center gap-5 text-sm">
          <Link className="underline-offset-4 hover:underline" href="/terms">
            Términos
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/privacy">
            Privacidad
          </Link>
        </nav>
      </LandingContainer>
    </footer>
  );
}

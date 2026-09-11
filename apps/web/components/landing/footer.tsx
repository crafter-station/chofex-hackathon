import Link from "next/link";

import { LandingContainer } from "@/components/landing/shell";

export function LandingFooter() {
  return (
    <footer className="border-[#1f1833]/10 border-t bg-[#b9a8f4] pb-24 text-[#fff3e4] sm:pb-0">
      <LandingContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-landing-display)] tracking-[-0.04em] uppercase">
            hack the andes
          </p>
          <p className="text-xs font-medium tracking-[0.12em] text-[#fff3e4]/75 uppercase">
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

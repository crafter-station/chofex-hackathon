import Link from "next/link";

import { HudLabel } from "@/components/landing/hud";
import { LandingContainer } from "@/components/landing/shell";

export function LandingFooter() {
  return (
    <footer className="border-[#f5f5f5]/10 border-t bg-[#0b0d10] pb-24 text-[#f5f5f5] sm:pb-0">
      <LandingContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-landing-display)] text-2xl uppercase tracking-[-0.02em]">
            hack the andes
          </p>
          <HudLabel className="text-[#f5f5f5]/55">
            lima · 10–11 oct 2026 · sponsored by chofex
          </HudLabel>
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

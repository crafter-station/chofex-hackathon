import Link from "next/link";

import { brandName, footerCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { LandingContainer } from "@/components/landing/shell";

export function LandingFooter() {
  return (
    <footer className="landing-footer border-[#f5f5f5]/10 border-t bg-[#0b0d10] text-[#f5f5f5]">
      <LandingContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-landing-display)] text-2xl tracking-[-0.02em]">
            {brandName}
          </p>
          <HudLabel className="text-[var(--hud-muted)]">
            {footerCopy.meta}
          </HudLabel>
        </div>
        <nav
          aria-label={footerCopy.legalLabel}
          className="flex items-center gap-5 text-sm"
        >
          <Link className="underline-offset-4 hover:underline" href="/terms">
            {footerCopy.terms}
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/privacy">
            {footerCopy.privacy}
          </Link>
        </nav>
      </LandingContainer>
    </footer>
  );
}

import Link from "next/link";

import { brandName, footerCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { LandingContainer } from "@/components/landing/shell";

export function LandingFooter() {
  return (
    <footer className="landing-footer border-[var(--hud-type)]/12 border-t bg-[var(--hud-footer)] text-[var(--hud-type)]">
      <LandingContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-landing-display)] text-2xl tracking-[-0.02em]">
            {brandName}
          </p>
          <HudLabel className="text-[var(--hud-type)]/70">
            {footerCopy.meta}
          </HudLabel>
        </div>
        <nav
          aria-label={footerCopy.legalLabel}
          className="flex flex-wrap items-center gap-5 text-sm"
        >
          <a
            className="text-[var(--hud-type)]/70 underline-offset-4 hover:underline"
            href="https://registry.opendata.aws/terrain-tiles/"
          >
            {footerCopy.terrainCredit}
          </a>
          <a
            className="text-[var(--hud-type)]/70 underline-offset-4 hover:underline"
            href="https://cloudless.eox.at"
          >
            {footerCopy.imageryCredit}
          </a>
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

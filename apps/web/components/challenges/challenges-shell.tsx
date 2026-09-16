import { cn } from "@chofex/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { brandName } from "@/components/landing/content";
import {
  landingBrand,
  landingDisplay,
  landingMono,
  landingSans,
} from "@/components/landing/fonts";
import { LandingFooter } from "@/components/landing/footer";
import {
  LandingContainer,
  landingCtaBaseClassName,
  landingPageClassName,
} from "@/components/landing/shell";
import { LandingSkipLinks } from "@/components/landing/skip-links";

import "@/components/landing/dark.css";

export function ChallengesShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div
      className={cn(
        landingPageClassName,
        "landing-dark flex flex-col",
        landingBrand.variable,
        landingDisplay.variable,
        landingSans.variable,
        landingMono.variable,
        landingSans.className,
      )}
      id="top"
    >
      <LandingSkipLinks applyHref="/#apply" />
      <header className="border-[var(--hud-ink)]/15 border-b bg-[var(--hud-paper)]">
        <LandingContainer className="flex items-center justify-between gap-4 py-4 sm:py-5">
          <Link
            className="font-[family-name:var(--font-landing-brand)] font-medium text-lg tracking-[0.012em] text-[var(--hud-ink)] sm:text-xl"
            href="/"
          >
            {brandName}
          </Link>
          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-3 font-[family-name:var(--font-landing-mono)] text-xs uppercase tracking-[0.12em] sm:gap-5"
          >
            <Link
              className="text-[var(--hud-muted)] underline-offset-4 hover:text-[var(--hud-ink)] hover:underline"
              href="/challenges"
            >
              Ranking
            </Link>
            <Link
              className={`${landingCtaBaseClassName} min-h-10 px-4 py-2 text-xs sm:px-5`}
              href="/#apply"
            >
              Aplicar
            </Link>
          </nav>
        </LandingContainer>
      </header>
      <main className="flex-1" id="contenido">
        {children}
      </main>
      <LandingFooter sectionHrefPrefix="/" />
    </div>
  );
}

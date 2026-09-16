import { cn } from "@chofex/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { brandName } from "@/components/landing/content";
import {
  landingDisplay,
  landingMono,
  landingSans,
} from "@/components/landing/fonts";
import { LandingFooter } from "@/components/landing/footer";
import {
  LandingContainer,
  landingCtaClassName,
  landingPageClassName,
} from "@/components/landing/shell";

export function ChallengesShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div
      className={cn(
        landingPageClassName,
        landingDisplay.variable,
        landingSans.variable,
        landingMono.variable,
        landingSans.className,
      )}
    >
      <header className="border-[#f5f5f5]/10 border-b bg-[#061226]">
        <LandingContainer className="flex items-center justify-between gap-4 py-4">
          <Link
            className="font-[family-name:var(--font-landing-display)] text-lg tracking-[-0.03em] text-[#d6ff00] sm:text-xl"
            href="/"
          >
            {brandName}
          </Link>
          <nav className="flex items-center gap-4 text-[10px] font-[family-name:var(--font-landing-mono)] uppercase tracking-[0.16em] text-[var(--hud-muted)]">
            <Link href="/challenges">Ranking</Link>
            <Link className={landingCtaClassName} href="/#apply">
              Aplicar
            </Link>
          </nav>
        </LandingContainer>
      </header>
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}

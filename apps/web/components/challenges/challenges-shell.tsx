import {
  BrandHeader,
  BrandPage,
  BrandWordmarkLink,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import Link from "next/link";
import type { ReactNode } from "react";
import { brandName } from "@/components/landing/content";
import { LandingFooter } from "@/components/landing/footer";
import { LandingSkipLinks } from "@/components/landing/skip-links";

export function ChallengesShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <BrandPage className="landing-dark flex flex-col" id="top">
      <LandingSkipLinks applyHref="/#apply" />
      <BrandHeader>
        <BrandWordmarkLink href="/">{brandName}</BrandWordmarkLink>
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] sm:gap-5"
        >
          <Link
            className="text-[var(--hud-muted)] underline-offset-4 hover:text-[var(--hud-ink)] hover:underline"
            href="/challenges"
          >
            Challenges
          </Link>
          <Link className={buttonVariants()} href="/#apply">
            Aplicar
          </Link>
        </nav>
      </BrandHeader>
      <main className="flex-1" id="contenido">
        {children}
      </main>
      <LandingFooter sectionHrefPrefix="/" />
    </BrandPage>
  );
}

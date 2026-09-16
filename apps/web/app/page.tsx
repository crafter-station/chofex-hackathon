import { cn } from "@chofex/ui/lib/utils";

import { LandingApply } from "@/components/landing/apply";
import { LandingChallenges } from "@/components/landing/challenges";
import { LandingEvent } from "@/components/landing/event";
import {
  landingBrand,
  landingDisplay,
  landingMono,
  landingSans,
} from "@/components/landing/fonts";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { LandingPeople } from "@/components/landing/people";
import { LandingPrizes } from "@/components/landing/prizes";
import { HERO_MODEL_PRELOAD } from "@/components/landing/sacred-valley-preload";
import { landingPageClassName } from "@/components/landing/shell";
import { LandingSkipLinks } from "@/components/landing/skip-links";
import { LandingSponsors } from "@/components/landing/sponsors";

import "@/components/landing/dark.css";

/**
 * The landing.
 *
 * Black, and opening on the Sacred Valley drawn in white contour lines from a
 * parked vantage inside the range — turned by dragging, not flown through.
 * Theme tokens live in `components/landing/dark.css`.
 *
 * Section order after the hero is locked:
 * Evento (#why) → Panel → Postular → Premios → Tracks.
 * Sponsors stay last. Do not restore a separate experiencia chapter.
 */
export default function Home() {
  return (
    <div
      className={cn(
        landingPageClassName,
        "landing-dark",
        landingBrand.variable,
        landingDisplay.variable,
        landingSans.variable,
        landingMono.variable,
        landingSans.className,
      )}
      id="top"
    >
      {/* The terrain is the hero's only asset and the largest thing on the
          critical path, so the browser is told about it in the markup rather
          than being left to discover it when the canvas mounts. */}
      <link
        rel="preload"
        href={HERO_MODEL_PRELOAD.href}
        as={HERO_MODEL_PRELOAD.as}
        crossOrigin={HERO_MODEL_PRELOAD.crossOrigin}
        type={HERO_MODEL_PRELOAD.type}
      />
      <LandingSkipLinks />
      <main id="contenido">
        <LandingHero />
        <LandingEvent />
        <LandingPeople />
        <LandingApply />
        <LandingPrizes />
        <LandingChallenges />
        <LandingSponsors />
      </main>
      <LandingFooter />
    </div>
  );
}

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
import { LandingPrizes } from "@/components/landing/prizes";
import { HERO_MODEL_PRELOAD } from "@/components/landing/sacred-valley-preload";
import { landingPageClassName } from "@/components/landing/shell";
import { LandingSkipLinks } from "@/components/landing/skip-links";
import { LandingSponsors } from "@/components/landing/sponsors";
import { LandingHero } from "@/components/landing/hero";

import "@/components/landing/dark.css";

/**
 * The landing.
 *
 * Black, and opening on the Sacred Valley drawn in white contour lines from a
 * parked vantage inside the range — turned by dragging, not flown through. The
 * sections below are unchanged; what carries them is the dark theme in
 * `components/landing/dark.css`, which re-points the `--hud-*` tokens rather
 * than touching a single section component.
 *
 * The liquid colour field is off: `components/landing/backdrop.tsx` still
 * works and is one element away from coming back, but against a drawing that is
 * pure white line on pure black it was the loudest thing in the frame.
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
        <LandingPrizes />
        <LandingChallenges />
        <LandingEvent />
        <LandingApply />
        <LandingSponsors />
      </main>
      <LandingFooter />
    </div>
  );
}

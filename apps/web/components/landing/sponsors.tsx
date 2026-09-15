import Image from "next/image";

import { sponsorsCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { LandingContainer } from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="bg-[var(--hud-card)] text-[var(--hud-ink)]"
      id="sponsors"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-8 text-[var(--hud-action)]">
          {sponsorsCopy.kicker}
        </HudLabel>
        <figure className="grid gap-12 border-[var(--hud-ink)]/15 border-y py-10 sm:py-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <h2 className="sr-only" id="sponsors-heading">
            {sponsorsCopy.mark}
          </h2>
          <Image
            alt={sponsorsCopy.mark}
            className="landing-logo-invert h-auto w-full max-w-xl"
            height={sponsorsCopy.logoHeight}
            src={sponsorsCopy.logoSrc}
            width={sponsorsCopy.logoWidth}
          />
          <figcaption className="max-w-md text-base leading-relaxed text-[var(--hud-muted)] lg:justify-self-end">
            <p>{sponsorsCopy.lede}</p>
            <HudLabel className="mt-6 text-[var(--hud-ink)]">
              {sponsorsCopy.organizer}
            </HudLabel>
          </figcaption>
        </figure>
      </LandingContainer>
    </section>
  );
}

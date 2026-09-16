import Image from "next/image";

import { panelBrands, peopleCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingSectionYClassName,
} from "@/components/landing/shell";

/**
 * Panel chapter: talent framing plus institutional backgrounds.
 *
 * Names, photos, and roles stay off the page until each participation is
 * verified. The marks are backgrounds, not a grid of empty seats that would
 * imply committed people.
 */
export function LandingPeople() {
  return (
    <section
      aria-labelledby="people-heading"
      className="bg-[var(--hud-paper)]"
      id="people"
    >
      <LandingContainer className={landingSectionYClassName}>
        <LandingSectionHead title={peopleCopy.title} titleId="people-heading" />

        <HudLabel className="mb-4 text-[var(--hud-muted)]">
          {peopleCopy.brandsLabel}
        </HudLabel>
        <ul className="flex flex-wrap justify-center border-[var(--hud-ink)]/15 border-y">
          {panelBrands.map((brand) => (
            <li
              className="flex min-w-0 w-1/2 items-center justify-center border-[var(--hud-ink)]/10 border-r border-b px-3 py-6 sm:w-1/3 sm:px-4 sm:py-8 lg:w-1/4 xl:w-1/6"
              key={brand.id}
            >
              <Image
                alt={brand.name}
                className="h-8 w-auto max-w-full object-contain sm:h-9"
                height={brand.logoHeight}
                src={brand.logoSrc}
                unoptimized
                width={brand.logoWidth}
              />
            </li>
          ))}
        </ul>
      </LandingContainer>
    </section>
  );
}

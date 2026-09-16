import { peopleCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingSectionYClassName,
} from "@/components/landing/shell";

/**
 * Panel chapter while the roster is still unconfirmed.
 *
 * Names, photos, roles, and organization marks stay off the page until each
 * participation is verified. This is a compact pending state, not a grid of
 * empty seats that would imply committed people.
 */
export function LandingPeople() {
  return (
    <section
      aria-labelledby="people-heading"
      className="bg-[var(--hud-paper)]"
      id="people"
    >
      <LandingContainer className={landingSectionYClassName}>
        <LandingSectionHead title={peopleCopy.title} titleId="people-heading">
          <p className="max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {peopleCopy.lede}
          </p>
        </LandingSectionHead>

        <p className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-[var(--hud-ink)]/15 border-y py-5">
          <HudLabel className="text-[var(--hud-muted)]">
            {peopleCopy.kicker}
          </HudLabel>
          <span className="text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
            {peopleCopy.status}
          </span>
        </p>
      </LandingContainer>
    </section>
  );
}

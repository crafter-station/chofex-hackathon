import { panelBrands, peopleCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingSectionYClassName,
} from "@/components/landing/shell";

/**
 * Panel chapter while the roster is still unconfirmed.
 *
 * Names, photos, and roles stay off the page until each participation is
 * verified. Institutional marks sit here as social proof, not as a grid of
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

        <div className="mt-8">
          <HudLabel className="mb-4 text-[var(--hud-muted)]">
            {peopleCopy.brandsLabel}
          </HudLabel>
          <ul className="grid grid-cols-2 gap-px border-[var(--hud-ink)]/15 border-y bg-[var(--hud-ink)]/10 sm:grid-cols-3 lg:grid-cols-6">
            {panelBrands.map((brand) => (
              <li
                className="flex flex-col items-center justify-center gap-3 bg-[var(--hud-paper)] px-4 py-7"
                key={brand.id}
              >
                <img
                  alt=""
                  className={
                    brand.shape === "wordmark"
                      ? "h-7 w-auto max-w-[7.5rem] object-contain sm:h-8"
                      : "h-8 w-auto object-contain"
                  }
                  height={brand.logoHeight}
                  src={brand.logoSrc}
                  width={brand.logoWidth}
                />
                <HudLabel className="text-center text-[var(--hud-muted)]">
                  {brand.name}
                </HudLabel>
              </li>
            ))}
          </ul>
        </div>
      </LandingContainer>
    </section>
  );
}

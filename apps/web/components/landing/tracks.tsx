import { trackSeats, tracksCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { ContourSeal } from "@/components/landing/illustrations";
import {
  LandingContainer,
  LandingSectionHead,
  landingSectionYClassName,
} from "@/components/landing/shell";

/**
 * Formation parameters for each sealed track card.
 * Each index gets a distinct topographic signature — different ridge shape —
 * so the three cards read as genuinely separate sealed formations.
 *
 *   01 — broad E-W ridge (elongated, low): wide challenge space
 *   02 — steep symmetric peak (nearly circular): concentrated, intense
 *   03 — tilted elongated formation: irregular, asymmetric problem
 */
const TRACK_FORMATIONS = [
  { rxOuter: 98, ryOuter: 66, rotateDeg: 0 },
  { rxOuter: 80, ryOuter: 78, rotateDeg: 0 },
  { rxOuter: 94, ryOuter: 58, rotateDeg: -8 },
] as const;

export function LandingTracks() {
  return (
    <section
      aria-labelledby="tracks-heading"
      className="bg-[var(--hud-card)]"
      id="tracks"
    >
      <LandingContainer className={landingSectionYClassName}>
        <LandingSectionHead
          title={tracksCopy.title}
          subtitle={tracksCopy.subtitle}
          titleId="tracks-heading"
        >
          <p className="max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {tracksCopy.lede}
          </p>
        </LandingSectionHead>

        <ol className="grid gap-4 md:grid-cols-3">
          {trackSeats.map((track, index) => {
            const formation = TRACK_FORMATIONS[index] ?? {
              rxOuter: 96,
              ryOuter: 74,
              rotateDeg: 0,
            };
            return (
              <li
                className="landing-dossier relative flex min-h-[24rem] overflow-hidden border border-[var(--hud-ink)]/15 bg-[var(--hud-paper)]"
                key={track.index}
              >
                {/*
                 * Contour seal — topographic formation unique to this brief.
                 * Positioned bottom-right, bleeding off the card edge (overflow-hidden
                 * clips it). Replaces the ghost number: same "depth" signal, richer
                 * visual language, reduced chrome.
                 */}
                <ContourSeal
                  className="absolute right-0 bottom-0 w-3/4 translate-x-1/4 translate-y-1/4 text-[var(--hud-ink)]"
                  rxOuter={formation.rxOuter}
                  ryOuter={formation.ryOuter}
                  rotateDeg={formation.rotateDeg}
                />

                <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-8">
                  <HudLabel className="text-[var(--hud-muted)]">
                    Track {track.index}
                  </HudLabel>

                  <p className="max-w-[28ch] text-lg leading-snug text-[var(--hud-ink)]">
                    {track.hint}
                  </p>

                  <HudLabel className="border-[var(--hud-ink)]/15 border-t pt-4 text-[var(--hud-muted)]">
                    {tracksCopy.reveal}
                  </HudLabel>
                </div>
              </li>
            );
          })}
        </ol>
      </LandingContainer>
    </section>
  );
}

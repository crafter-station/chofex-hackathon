import { challengeSeats, challengesCopy } from "@/components/landing/content";
import { ContourSeal } from "@/components/landing/illustrations";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

/**
 * Formation parameters for each sealed challenge card.
 * Each index gets a distinct topographic signature — different ridge shape —
 * so the three cards read as three genuinely separate sealed formations.
 *
 *   01 — broad E-W ridge (elongated, low): wide challenge space
 *   02 — steep symmetric peak (nearly circular): concentrated, intense
 *   03 — tilted elongated formation: irregular, asymmetric problem
 */
const CHALLENGE_FORMATIONS = [
  { rxOuter: 98, ryOuter: 66, rotateDeg: 0 },
  { rxOuter: 80, ryOuter: 78, rotateDeg: 0 },
  { rxOuter: 94, ryOuter: 58, rotateDeg: -8 },
] as const;

export function LandingChallenges() {
  return (
    <section
      aria-labelledby="challenges-heading"
      className="bg-[var(--hud-card)]"
      id="challenges"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-4 text-[var(--hud-action)]">
          {challengesCopy.kicker}
        </HudLabel>
        <LandingSectionHead
          title={challengesCopy.title}
          titleId="challenges-heading"
        >
          <p className="max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {challengesCopy.lede}
          </p>
        </LandingSectionHead>

        <ol className="grid gap-4 md:grid-cols-3">
          {challengeSeats.map((seat, index) => {
            const formation = CHALLENGE_FORMATIONS[index] ?? {
              rxOuter: 96,
              ryOuter: 74,
              rotateDeg: 0,
            };
            return (
              <li
                className="landing-dossier relative flex min-h-[24rem] overflow-hidden border border-[var(--hud-ink)]/15 bg-[var(--hud-paper)]"
                key={seat.index}
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
                  <div className="flex items-start justify-between gap-4">
                    <HudLabel className="text-[var(--hud-muted)]">
                      Challenge {seat.index}
                    </HudLabel>
                    <HudLabel className="border border-[var(--hud-status)]/35 px-2 py-1 text-[var(--hud-status)]">
                      {challengesCopy.sealed}
                    </HudLabel>
                  </div>

                  <p className="max-w-[28ch] text-lg leading-snug text-[var(--hud-ink)]">
                    {seat.hint}
                  </p>

                  <HudLabel className="border-[var(--hud-ink)]/15 border-t pt-4 text-[var(--hud-muted)]">
                    {challengesCopy.reveal}
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

import { challengeSeats, challengesCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

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
          {challengeSeats.map((seat) => (
            <li
              className="landing-dossier relative flex min-h-[24rem] overflow-hidden border border-[var(--hud-ink)]/15 bg-[var(--hud-paper)]"
              key={seat.index}
            >
              <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <HudLabel className="text-[var(--hud-muted)]">
                    Challenge {seat.index}
                  </HudLabel>
                  <HudLabel className="border border-[var(--hud-status)]/35 px-2 py-1 text-[var(--hud-status)]">
                    {challengesCopy.sealed}
                  </HudLabel>
                </div>

                <div>
                  <p
                    aria-hidden="true"
                    className="font-[family-name:var(--font-landing-display)] text-8xl leading-none text-[var(--hud-ink)]/12"
                  >
                    {seat.index}
                  </p>
                  <p className="mt-5 max-w-[28ch] text-lg leading-snug text-[var(--hud-ink)]">
                    {seat.hint}
                  </p>
                </div>

                <HudLabel className="border-[var(--hud-ink)]/15 border-t pt-4 text-[var(--hud-muted)]">
                  {challengesCopy.reveal}
                </HudLabel>
              </div>
            </li>
          ))}
        </ol>
      </LandingContainer>
    </section>
  );
}

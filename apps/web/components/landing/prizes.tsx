import { prizeAmountsPen, prizesCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { PrizeCounter } from "@/components/landing/prize-counter";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingPrizes() {
  return (
    <section
      aria-labelledby="prizes-heading"
      className="bg-[var(--hud-field)] text-[var(--hud-type)]"
      id="prizes"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-4 text-[var(--hud-type)]">
          {prizesCopy.kicker}
        </HudLabel>
        <LandingSectionHead title={prizesCopy.title} titleId="prizes-heading">
          <p className="max-w-lg text-lg leading-relaxed text-[var(--hud-type)]/70">
            {prizesCopy.lede}
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="flex min-h-80 flex-col justify-between border border-[var(--hud-type)]/18 p-6 sm:p-8">
            <HudLabel className="text-[var(--hud-type)]/55">
              {prizesCopy.firstPlace}
            </HudLabel>
            {/*
             * Both figures are set in the same white. The sandstone accent was
             * there to separate first place from second on paper; on black it
             * reads as a weaker, dimmer number for the larger prize, which is
             * the wrong way round.
             */}
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(4.25rem,12vw,8.5rem)] leading-[0.8] tracking-[-0.03em] text-[var(--hud-type)]">
              <PrizeCounter amount={prizeAmountsPen.first} />
            </p>
          </article>

          <article className="flex min-h-80 flex-col justify-between border border-[var(--hud-type)]/18 bg-[var(--hud-type)]/[0.04] p-6 sm:p-8">
            <HudLabel className="text-[var(--hud-type)]/55">
              {prizesCopy.secondPlace}
            </HudLabel>
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(3.75rem,8vw,6.5rem)] leading-[0.82] tracking-[-0.03em] text-[var(--hud-type)]">
              <PrizeCounter amount={prizeAmountsPen.second} />
            </p>
          </article>
        </div>

        <div className="mt-10 grid gap-3 border-[var(--hud-type)]/18 border-t pt-7 sm:grid-cols-[14rem_1fr]">
          <HudLabel className="text-[var(--hud-type)]">
            {prizesCopy.opportunity}
          </HudLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--hud-type)]/65">
            {prizesCopy.opportunityBody}
          </p>
        </div>
      </LandingContainer>
    </section>
  );
}

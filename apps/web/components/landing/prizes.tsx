import { prizePoolHeadlinePen, prizesCopy } from "@/components/landing/content";
import { PrizeCounter } from "@/components/landing/prize-counter";
import { LandingContainer } from "@/components/landing/shell";

const tripTitleLines = prizesCopy.tripTitle.split(/\s+/);

export function LandingPrizes() {
  return (
    <section
      aria-labelledby="prizes-heading"
      // `svh` for the same reason the hero uses it; see the note there.
      className="flex min-h-svh flex-col bg-[var(--hud-field)] text-[var(--hud-type)]"
      id="prizes"
    >
      <LandingContainer className="flex flex-1 flex-col justify-center py-12 sm:py-16">
        {/* Section title — small kicker, also the landmark label */}
        <h2
          className="landing-type-meta mb-8 text-[var(--hud-type)]/60 sm:mb-10"
          id="prizes-heading"
        >
          {prizesCopy.title}
        </h2>

        {/*
         * Two columns from lg up, stacked below. The previous md split plus a
         * 7.5rem "HEADQUARTERS" overflowed a 1280 viewport; min-w-0 lets the
         * title shrink, and the title stacks as two words so the long lockup
         * stays inside the column.
         */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <div className="prize-total min-w-0">
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(3.25rem,9vw,7.25rem)] leading-[0.78] tracking-[-0.045em]">
              <PrizeCounter amount={prizePoolHeadlinePen} animate />
              <span aria-hidden="true">+</span>
            </p>
            <p className="mt-4 font-[family-name:var(--font-landing-mono)] text-xs uppercase tracking-[0.18em] text-[var(--hud-type)]/60">
              {prizesCopy.totalSuffix}
            </p>
          </div>

          <p
            aria-hidden="true"
            className="hidden font-[family-name:var(--font-landing-display)] text-[clamp(2rem,4vw,3.25rem)] leading-none text-[var(--hud-type)]/30 lg:block"
          >
            +
          </p>

          <div className="min-w-0">
            <h3 className="max-w-full font-[family-name:var(--font-landing-display)] text-[clamp(2.25rem,5.2vw,4.5rem)] uppercase leading-[0.86] tracking-[-0.03em]">
              {tripTitleLines.map((line) => (
                <span className="block w-fit" key={line}>
                  {line}
                </span>
              ))}
            </h3>
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}

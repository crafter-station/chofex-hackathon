import { prizePoolHeadlinePen, prizesCopy } from "@/components/landing/content";
import { PrizeCounter } from "@/components/landing/prize-counter";
import { LandingContainer } from "@/components/landing/shell";

export function LandingPrizes() {
  return (
    <section
      aria-labelledby="prizes-heading"
      // Full-viewport only from md up. On a ~390px phone, `min-h-svh` plus
      // vertical centering leaves a black void above PREMIOS and below the
      // trip lockup. Hug the copy there; keep the one-screen chapter on desktop.
      className="flex min-h-0 flex-col bg-[var(--hud-field)] text-[var(--hud-type)] md:min-h-svh"
      id="prizes"
    >
      <LandingContainer className="flex flex-1 flex-col py-6 sm:py-12 md:justify-center md:py-16">
        {/* Section title — small kicker, also the landmark label */}
        <h2
          className="landing-type-meta mb-5 text-[var(--hud-type)]/60 sm:mb-8 md:mb-10"
          id="prizes-heading"
        >
          {prizesCopy.title}
        </h2>

        {/*
         * Two columns from lg up, stacked below. The trip lockup is three
         * authored lines so "Viaje a" is explicit and CHOFEX / HEADQUARTERS
         * stay a readable pair instead of wrapping as four huge words.
         */}
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <div className="prize-total min-w-0">
            <p className="whitespace-nowrap font-[family-name:var(--font-landing-display)] text-[clamp(6rem,24vw,8.5rem)] leading-[0.76] tracking-[-0.05em] lg:text-[clamp(3.25rem,9vw,7.25rem)]">
              <PrizeCounter amount={prizePoolHeadlinePen} animate />
              <span aria-hidden="true">+</span>
            </p>
            <p className="mt-3 font-[family-name:var(--font-landing-mono)] text-xs uppercase tracking-[0.18em] text-[var(--hud-type)]/60 sm:mt-4">
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
            <h3 className="max-w-full font-[family-name:var(--font-landing-display)] text-[clamp(2.75rem,8vw,4.5rem)] uppercase leading-[0.86] tracking-[-0.03em] lg:text-[clamp(2.25rem,5.2vw,4.5rem)]">
              <span className="sr-only">{prizesCopy.tripTitle}</span>
              {prizesCopy.tripLines.map((line) => (
                <span aria-hidden="true" className="block w-fit" key={line}>
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

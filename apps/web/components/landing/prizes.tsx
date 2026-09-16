import { prizePoolHeadlinePen, prizesCopy } from "@/components/landing/content";
import { PrizeCounter } from "@/components/landing/prize-counter";
import { LandingContainer } from "@/components/landing/shell";

export function LandingPrizes() {
  return (
    <section
      aria-labelledby="prizes-heading"
      // `svh` for the same reason the hero uses it; see the note there.
      className="flex min-h-svh flex-col bg-[var(--hud-field)] text-[var(--hud-type)]"
      id="prizes"
    >
      <LandingContainer className="flex flex-1 flex-col justify-center py-20 sm:py-24">
        {/* Section title — small kicker, also the landmark label */}
        <h2
          className="mb-10 font-[family-name:var(--font-landing-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--hud-type)]/60 sm:mb-14"
          id="prizes-heading"
        >
          {prizesCopy.title}
        </h2>

        {/* Editorial two-column layout */}
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-[1fr_auto_1fr] md:gap-10 lg:gap-16">
          {/* Left: Cash prize with count-up animation */}
          <div className="prize-total">
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(5rem,18vw,14rem)] leading-[0.78] tracking-[-0.045em]">
              <PrizeCounter amount={prizePoolHeadlinePen} animate />
              <span aria-hidden="true">+</span>
            </p>
            <p className="mt-5 font-[family-name:var(--font-landing-mono)] text-xs uppercase tracking-[0.18em] text-[var(--hud-type)]/60">
              {prizesCopy.totalSuffix}
            </p>
          </div>

          {/* Plus separator — hidden on mobile, visible on md+ */}
          <p
            aria-hidden="true"
            className="hidden font-[family-name:var(--font-landing-display)] text-[clamp(2.5rem,5vw,4rem)] leading-none text-[var(--hud-type)]/30 md:block"
          >
            +
          </p>

          {/* Right: Trip prize */}
          <div>
            <h3 className="font-[family-name:var(--font-landing-display)] text-[clamp(3.5rem,9vw,7.5rem)] uppercase leading-[0.85] tracking-[-0.03em]">
              {prizesCopy.tripTitle}
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--hud-type)]/65 sm:text-base">
              {prizesCopy.tripBody}
            </p>
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}

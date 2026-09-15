import {
  experienceCopy,
  experienceItems,
  faqCopy,
  faqItems,
} from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { LandingContainer } from "@/components/landing/shell";

export function LandingExperience() {
  return (
    <section
      aria-labelledby="experience-heading"
      className="bg-[var(--hud-paper)]"
      id="experience"
    >
      <LandingContainer className="py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <HudLabel className="mb-4 text-[var(--hud-action)]">
              {experienceCopy.kicker}
            </HudLabel>
            <h2
              className="text-balance font-[family-name:var(--font-landing-display)] text-5xl leading-[0.88] tracking-[-0.025em] uppercase sm:text-7xl"
              id="experience-heading"
            >
              {experienceCopy.title}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
              {experienceCopy.lede}
            </p>

            <div
              aria-hidden="true"
              className="mt-8 flex max-w-lg items-end justify-between overflow-hidden border-[var(--hud-ink)]/15 border-y py-4 sm:mt-10 sm:py-5"
            >
              <span className="font-[family-name:var(--font-landing-display)] text-[clamp(6.5rem,26vw,12rem)] leading-[0.68] tracking-[-0.06em] text-[var(--hud-type)]">
                30
              </span>
              <div className="mb-1 ml-5 flex min-w-24 flex-1 flex-col gap-3">
                <span className="h-px w-full bg-[var(--hud-action)]" />
                <HudLabel className="text-[var(--hud-type)]/65">horas</HudLabel>
              </div>
            </div>
          </div>

          <ul className="border-[var(--hud-ink)]/15 border-t">
            {experienceItems.map((item, index) => (
              <li
                className="grid grid-cols-[2.25rem_1fr] gap-4 border-[var(--hud-ink)]/15 border-b py-4 sm:grid-cols-[2.75rem_1fr] sm:gap-6 sm:py-6"
                key={item.title}
              >
                <HudLabel className="pt-1 text-[var(--hud-status)]">
                  0{index + 1}
                </HudLabel>
                <div className="grid gap-2 sm:grid-cols-[minmax(9rem,0.55fr)_1fr] sm:gap-6">
                  <h3 className="font-[family-name:var(--font-landing-display)] text-2xl leading-none">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--hud-muted)]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-10 border-[var(--hud-ink)]/15 border-t pt-12 sm:mt-16 sm:pt-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <HudLabel className="mb-4 text-[var(--hud-action)]">
              {faqCopy.kicker}
            </HudLabel>
            <h2 className="font-[family-name:var(--font-landing-display)] text-5xl leading-[0.9] tracking-[-0.025em] uppercase sm:text-6xl">
              {faqCopy.title}
            </h2>
          </div>
          <div className="border-[var(--hud-ink)]/15 border-t">
            {faqItems.map((item) => (
              <details
                className="group border-[var(--hud-ink)]/15 border-b"
                key={item.question}
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-medium sm:min-h-18 sm:py-5 [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="font-[family-name:var(--font-landing-mono)] text-[var(--hud-action)] transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}

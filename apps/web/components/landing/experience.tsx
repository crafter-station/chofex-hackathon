import {
  experienceCopy,
  experienceItems,
  faqCopy,
  faqItems,
} from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingExperience() {
  return (
    <section
      aria-labelledby="experience-heading"
      className="bg-[var(--hud-paper)]"
      id="experience"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-4 text-[var(--hud-action)]">
          {experienceCopy.kicker}
        </HudLabel>
        <LandingSectionHead
          title={experienceCopy.title}
          titleId="experience-heading"
        >
          <p className="max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {experienceCopy.lede}
          </p>
        </LandingSectionHead>

        <ul className="grid gap-px overflow-hidden border border-[var(--hud-ink)]/15 bg-[var(--hud-ink)]/15 sm:grid-cols-2 lg:grid-cols-4">
          {experienceItems.map((item, index) => (
            <li className="bg-[var(--hud-card)] p-6 sm:p-7" key={item.title}>
              <HudLabel className="mb-12 text-[var(--hud-status)]">
                0{index + 1}
              </HudLabel>
              <h3 className="font-[family-name:var(--font-landing-display)] text-2xl leading-none">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--hud-muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-24 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
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
                <summary className="flex min-h-18 cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium [&::-webkit-details-marker]:hidden">
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

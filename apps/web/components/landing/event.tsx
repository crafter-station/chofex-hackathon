import { eventCopy, eventItems } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingSectionYClassName,
} from "@/components/landing/shell";

export function LandingEvent() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-[var(--hud-paper)]"
      id="why"
    >
      <LandingContainer className={landingSectionYClassName}>
        <LandingSectionHead title={eventCopy.title} titleId="why-heading">
          <div className="max-w-xl space-y-4">
            <p className="text-lg leading-relaxed text-[var(--hud-ink)]/80">
              {eventCopy.lede}
            </p>
            <p className="text-lg leading-relaxed text-[var(--hud-ink)]/75">
              {eventCopy.support}
            </p>
          </div>
        </LandingSectionHead>

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div
            aria-hidden="true"
            className="flex w-full max-w-xl items-end justify-between self-start overflow-hidden border border-[var(--hud-ink)]/20 px-5 py-6 sm:max-w-2xl sm:px-6 sm:py-8"
          >
            <span className="font-[family-name:var(--font-landing-display)] text-[clamp(7.25rem,28vw,13.5rem)] leading-[0.68] tracking-[-0.06em] text-[var(--hud-type)]">
              30
            </span>
            <div className="mb-1 ml-5 flex min-w-24 flex-1 flex-col gap-3">
              <span className="h-px w-full bg-[var(--hud-action)]" />
              <HudLabel className="text-[var(--hud-type)]/65">horas</HudLabel>
            </div>
          </div>

          <ul className="border-[var(--hud-ink)]/15 border-t">
            {eventItems.map((item, index) => (
              <li
                className="grid grid-cols-[2.25rem_1fr] gap-4 border-[var(--hud-ink)]/15 border-b px-4 py-4 sm:grid-cols-[2.75rem_1fr] sm:gap-6 sm:px-6 sm:py-6"
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
      </LandingContainer>
    </section>
  );
}

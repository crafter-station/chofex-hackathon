import { audienceCopy, audienceRoles } from "@/components/landing/content";
import { ElevationSlice } from "@/components/landing/illustrations";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingAudience() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative bg-[var(--hud-paper)]"
      id="why"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-4 text-[var(--hud-action)]">
          {audienceCopy.kicker}
        </HudLabel>
        <LandingSectionHead title={audienceCopy.title} titleId="why-heading">
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed text-[var(--hud-ink)]/80">
              {audienceCopy.lede}
            </p>
          </div>
        </LandingSectionHead>

        {/*
         * Elevation cross-section: side-view Andean terrain profile drawn in
         * the style of technical field documentation (baseline, ruler ticks,
         * summit marker). Bridges the section copy and the roles grid with an
         * original visual that grounds this section in an Andean identity
         * without repeating the hero's 3D drawing.
         */}
        <ElevationSlice className="mb-10 w-full text-[var(--hud-ink)]" />

        <ol className="grid border-[var(--hud-ink)]/15 border-y md:grid-cols-3">
          {audienceRoles.map((role, index) => (
            <li
              className="border-[var(--hud-ink)]/15 py-7 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              key={role.title}
            >
              <HudLabel className="mb-8 text-[var(--hud-status)]">
                0{index + 1}
              </HudLabel>
              <h3 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none tracking-[-0.02em]">
                {role.title}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
                {role.body}
              </p>
            </li>
          ))}
        </ol>
      </LandingContainer>
    </section>
  );
}

import { peopleCopy } from "@/components/landing/content";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingPeople() {
  return (
    <section
      aria-labelledby="people-heading"
      className="bg-[var(--hud-paper)]"
      id="people"
    >
      <LandingContainer className="py-20 sm:py-28">
        <LandingSectionHead title={peopleCopy.title} titleId="people-heading">
          <p className="max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {peopleCopy.lede}
          </p>
        </LandingSectionHead>
        <p className="font-[family-name:var(--font-landing-mono)] text-xs uppercase tracking-[0.18em] text-[var(--hud-muted)]">
          {peopleCopy.status}
        </p>
      </LandingContainer>
    </section>
  );
}

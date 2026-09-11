import { expeditionSignals, whyCopy } from "@/components/landing/content";
import { DeviceCard, HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingJudges() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden bg-[#0b0d10]"
      id="why"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2f6fad]/35 to-transparent"
      />
      <LandingContainer className="relative py-16 sm:py-20">
        <HudLabel className="mb-3">{whyCopy.kicker}</HudLabel>
        <LandingSectionHead title={whyCopy.title} titleId="why-heading">
          <p className="max-w-xl text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
            {whyCopy.lede}
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {expeditionSignals.map((item) => (
            <DeviceCard
              accent={item.accent}
              body={item.body}
              code={item.code}
              key={item.code}
              mark={item.mark}
              title={item.title}
            />
          ))}
        </div>

        <p className="mt-8 font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.16em] text-[var(--hud-muted)] uppercase">
          {whyCopy.rosterNote}
        </p>
      </LandingContainer>
    </section>
  );
}

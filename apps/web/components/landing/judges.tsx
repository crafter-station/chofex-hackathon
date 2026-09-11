import { differentiators } from "@/components/landing/content";
import { DeviceCard, HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

const judgeMeta = [
  { code: "J-01", handle: "SELECTIVO", accent: "yellow" },
  { code: "J-02", handle: "JUECES", accent: "blue" },
  { code: "J-03", handle: "CAMPUS", accent: "yellow" },
  { code: "J-04", handle: "BADGE", accent: "blue" },
] as const;

export function LandingJudges() {
  return (
    <section
      aria-labelledby="judges-heading"
      className="relative overflow-hidden bg-[#0b0d10]"
      id="judges"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2f6fad]/35 to-transparent" />
      <LandingContainer className="relative py-16 sm:py-20">
        <HudLabel className="mb-3">{"valle / roster"}</HudLabel>
        <LandingSectionHead title="Jueces y mentores" titleId="judges-heading">
          <p className="max-w-xl text-sm leading-relaxed text-[#f5f5f5]/70 sm:text-base">
            Mentores y jueces de alto calibre. Gente que ha shipped producto
            real — no un panel decorativo.
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {differentiators.map((item, index) => {
            const meta = judgeMeta[index];
            if (!meta) return null;

            return (
              <DeviceCard
                accent={meta.accent}
                body={item.body}
                code={meta.code}
                handle={meta.handle}
                key={item.title}
                title={item.title}
              />
            );
          })}
        </div>
      </LandingContainer>
    </section>
  );
}

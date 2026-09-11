import { facts, filterSignals } from "@/components/landing/content";
import { HudLabel, ScanTarget } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

const trackHints = [
  {
    code: "T-01",
    hint: "Una línea que se comporta como montaña — o como señal.",
  },
  {
    code: "T-02",
    hint: "Nodos que se buscan. El mapa no está publicado.",
  },
] as const;

export function LandingScan() {
  return (
    <section
      aria-labelledby="scan-heading"
      className="relative overflow-hidden bg-[#141414]"
      id="scan"
    >
      <div className="hud-halftone pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute top-10 right-8 size-40 rounded-full bg-[#0057ff]" />
      <div className="pointer-events-none absolute bottom-16 left-[20%] h-32 w-48 bg-[#d6ff00]" />

      <LandingContainer className="relative py-16 sm:py-20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <HudLabel className="text-[#d6ff00]">{"scan / hud"}</HudLabel>
          <HudLabel className="text-[#f5f5f5]/60">02 / 08</HudLabel>
        </div>

        <LandingSectionHead title="Preselección" titleId="scan-heading">
          <p className="max-w-xl text-sm leading-relaxed text-[#f5f5f5]/70 sm:text-base">
            El filtro empieza ahora. Algunos llegan por un challenge. Otros, por
            un golden ticket. El resto, demostrando en público. Las reglas
            exactas no caben en una landing.
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
            {filterSignals.map((item, index) => {
              const code = `S-0${index + 1}`;
              return (
                <ScanTarget code={code} key={item.title} label={item.title}>
                  <p className="mt-3 text-sm leading-relaxed text-[#f5f5f5]/70">
                    {item.body}
                  </p>
                </ScanTarget>
              );
            })}
          </div>

          <aside className="hud-box relative overflow-hidden bg-[#0b0d10]/80 lg:col-span-5">
            <div className="hud-scanlines absolute inset-0" />
            <div className="landing-scan-beam pointer-events-none absolute inset-x-0 h-16 bg-[#d6ff00]/20" />
            <div className="relative flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <HudLabel className="text-[#d6ff00]">
                  {"window / facts"}
                </HudLabel>
                <span className="size-3 rounded-full bg-[#d6ff00]" />
              </div>
              <p className="font-[family-name:var(--font-landing-display)] text-4xl uppercase leading-none">
                telemetría
              </p>
              <dl className="grid gap-3">
                {facts.map((fact) => (
                  <div
                    className="flex items-baseline justify-between gap-4 border-[#f5f5f5]/15 border-b pb-2"
                    key={fact.label}
                  >
                    <dt>
                      <HudLabel className="text-[#f5f5f5]/50">
                        {fact.label}
                      </HudLabel>
                    </dt>
                    <dd className="text-right text-sm">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trackHints.map((track) => (
            <ScanTarget code={track.code} key={track.code} label="Track" locked>
              <p className="mt-3 text-sm leading-relaxed text-[#f5f5f5]/70">
                {track.hint}
              </p>
            </ScanTarget>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}

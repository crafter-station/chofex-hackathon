import {
  facts,
  filterSignals,
  scanCopy,
  trackHints,
} from "@/components/landing/content";
import { HudLabel, ScanTarget } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingScan() {
  return (
    <section
      aria-labelledby="scan-heading"
      className="relative overflow-hidden bg-[#141414]"
      id="scan"
    >
      <div
        aria-hidden="true"
        className="hud-halftone pointer-events-none absolute inset-0 opacity-40"
      />
      <div
        aria-hidden="true"
        className="landing-scan-blob pointer-events-none absolute top-10 right-8 size-40 rounded-full bg-[#0057ff]"
      />
      <div
        aria-hidden="true"
        className="landing-scan-blob pointer-events-none absolute bottom-16 left-[20%] h-32 w-48 bg-[#d6ff00]"
      />

      <LandingContainer className="relative py-16 sm:py-20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <HudLabel className="text-[#d6ff00]">{scanCopy.kicker}</HudLabel>
          <HudLabel className="text-[var(--hud-muted)]">
            {scanCopy.index}
          </HudLabel>
        </div>

        <LandingSectionHead title={scanCopy.title} titleId="scan-heading">
          <p className="max-w-xl text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
            {scanCopy.lede}
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
            {filterSignals.map((item, index) => {
              const code = `S-0${index + 1}`;
              return (
                <ScanTarget code={code} key={item.title} label={item.title}>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--hud-muted)]">
                    {item.body}
                  </p>
                </ScanTarget>
              );
            })}
          </div>

          <aside className="hud-box relative overflow-hidden bg-[#0b0d10]/80 lg:col-span-5">
            <div
              aria-hidden="true"
              className="hud-scanlines absolute inset-0"
            />
            <div
              aria-hidden="true"
              className="landing-scan-beam pointer-events-none absolute inset-x-0 h-16 bg-[#d6ff00]/20"
            />
            <div className="relative flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <HudLabel className="text-[#d6ff00]">
                  {scanCopy.factsWindow}
                </HudLabel>
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-[#d6ff00]"
                />
              </div>
              <p className="font-[family-name:var(--font-landing-display)] text-4xl leading-none uppercase">
                {scanCopy.telemetry}
              </p>
              <dl className="grid gap-3">
                {facts.map((fact) => (
                  <div
                    className="flex items-baseline justify-between gap-4 border-[#f5f5f5]/15 border-b pb-2"
                    key={fact.label}
                  >
                    <dt>
                      <HudLabel className="text-[var(--hud-muted)]">
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
            <ScanTarget
              code={track.code}
              key={track.code}
              label={scanCopy.trackLabel}
              locked
            >
              <p className="mt-3 text-sm leading-relaxed text-[var(--hud-muted)]">
                {track.hint}
              </p>
            </ScanTarget>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}

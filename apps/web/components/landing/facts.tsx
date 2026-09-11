import {
  facts,
  marqueePressure,
  marqueeSignals,
} from "@/components/landing/content";
import { LandingMarquee } from "@/components/landing/marquee";
import {
  LandingContainer,
  LandingEyebrow,
  landingInvertClassName,
} from "@/components/landing/shell";

function MarqueeItems({ items }: { readonly items: readonly string[] }) {
  return (
    <>
      {items.map((item) => (
        <span
          className="text-[clamp(2.6rem,9vw,7.5rem)] leading-none font-medium tracking-tighter lowercase"
          key={item}
        >
          {item}
        </span>
      ))}
    </>
  );
}

export function LandingFacts() {
  return (
    <section
      aria-labelledby="facts-heading"
      className={`${landingInvertClassName} w-full`}
    >
      <LandingContainer className="flex flex-col justify-evenly gap-6 py-10 md:min-h-dvh md:py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <LandingEyebrow className="text-[#1a1a1a]" id="facts-heading">
            Datos clave
          </LandingEyebrow>
          <p className="text-sm font-medium tracking-[0.16em] uppercase">
            Lima. Presencial. Selectivo.
          </p>
        </div>

        <div className="flex flex-col gap-1 overflow-hidden">
          <LandingMarquee>
            <MarqueeItems items={marqueeSignals} />
          </LandingMarquee>
          <LandingMarquee reverse fast>
            <MarqueeItems items={marqueePressure} />
          </LandingMarquee>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-[#1a1a1a] md:grid-cols-4">
          {facts.map((fact) => (
            <div
              className="flex flex-col gap-2 bg-[#e1ff00] py-5 pr-4 sm:py-6"
              key={fact.label}
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-60">
                {fact.label}
              </dt>
              <dd className="text-base leading-snug font-medium tracking-tight lowercase sm:text-lg">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </LandingContainer>
    </section>
  );
}

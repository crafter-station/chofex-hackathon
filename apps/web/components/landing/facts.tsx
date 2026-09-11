import {
  facts,
  marqueePressure,
  marqueeSignals,
} from "@/components/landing/content";
import { LandingMarquee } from "@/components/landing/marquee";
import {
  LandingContainer,
  landingInvertClassName,
} from "@/components/landing/shell";

function MarqueeItems({ items }: { readonly items: readonly string[] }) {
  return (
    <>
      {items.map((item) => (
        <span
          className="font-[family-name:var(--font-landing-display)] text-[clamp(3rem,11vw,8rem)] leading-none font-medium tracking-tighter lowercase"
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
      <LandingContainer className="flex flex-col justify-evenly gap-8 py-10 md:min-h-dvh md:py-8">
        <h2 className="sr-only" id="facts-heading">
          Datos clave
        </h2>

        <div className="flex flex-col gap-2 overflow-hidden">
          <LandingMarquee>
            <MarqueeItems items={marqueeSignals} />
          </LandingMarquee>
          <LandingMarquee reverse fast>
            <MarqueeItems items={marqueePressure} />
          </LandingMarquee>
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-landing-display)] text-2xl leading-tight font-medium lowercase sm:text-3xl">
            Entrar es difícil. Ese es el punto.
          </p>
          <p className="mt-3 text-sm leading-relaxed sm:text-base">
            Un hackathon presencial para el talento que ya está construyendo.
            Pocas plazas, presión real y ~30 horas para demostrar de qué estás
            hecho.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {facts.map((fact) => (
            <div
              className="flex flex-col gap-2 border-2 border-[#1a1a1a] px-3 py-4"
              key={fact.label}
            >
              <dt className="font-mono text-[11px] lowercase tracking-[0.08em] opacity-70">
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

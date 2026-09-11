import { facts } from "@/components/landing/content";
import {
  ClockMark,
  IconRepeat,
  PersonMark,
} from "@/components/landing/graphics";
import { LandingMarquee } from "@/components/landing/marquee";
import {
  LandingContainer,
  landingDisplayClassName,
  landingInvertClassName,
} from "@/components/landing/shell";

const clockMinutes = [0, 8, 16, 24, 32, 40, 48, 56] as const;

export function LandingFacts() {
  return (
    <section
      aria-labelledby="facts-heading"
      className={`${landingInvertClassName} w-full overflow-hidden`}
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col justify-evenly gap-6 px-4 py-10 sm:px-8 md:min-h-dvh md:py-8">
        <h2 className="sr-only" id="facts-heading">
          Datos clave
        </h2>
        <dl className="sr-only">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-center gap-3 overflow-hidden sm:gap-5">
          <div className="hidden items-center gap-2 text-[clamp(2.4rem,8vw,6.5rem)] sm:flex">
            <IconRepeat count={6}>
              {(index) => <PersonMark key={index} />}
            </IconRepeat>
          </div>
          <PersonMark className="sm:hidden text-[clamp(2.6rem,16vw,4rem)]" />
          <p
            className={`${landingDisplayClassName} text-[clamp(2.6rem,11vw,7.2rem)]`}
          >
            lima
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 overflow-hidden sm:gap-5">
          <p
            className={`${landingDisplayClassName} text-[clamp(2.6rem,11vw,7.2rem)]`}
          >
            ~30h
          </p>
          <div className="flex items-center gap-2 text-[clamp(2.2rem,8vw,6.5rem)]">
            <IconRepeat count={8}>
              {(index) => (
                <ClockMark
                  className={index > 1 ? "hidden sm:block" : undefined}
                  key={index}
                  minutes={clockMinutes[index % clockMinutes.length] ?? 0}
                />
              )}
            </IconRepeat>
          </div>
        </div>

        <LandingMarquee>
          <span
            className={`${landingDisplayClassName} text-[clamp(2.2rem,9vw,6.2rem)]`}
          >
            1–4 por equipo
          </span>
          <span
            className={`${landingDisplayClassName} text-[clamp(2.2rem,9vw,6.2rem)]`}
          >
            1–4 por equipo
          </span>
        </LandingMarquee>

        <LandingMarquee reverse fast>
          <span
            className={`${landingDisplayClassName} text-[clamp(2rem,8vw,5.4rem)]`}
          >
            selectivo @ lima
          </span>
          <span
            className={`${landingDisplayClassName} text-[clamp(2rem,8vw,5.4rem)]`}
          >
            selectivo @ lima
          </span>
        </LandingMarquee>

        <LandingContainer className="px-0">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-[family-name:var(--font-landing-sans)] text-xl leading-tight font-semibold sm:text-2xl">
              Entrar es difícil. Ese es el punto.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#1f1833]/70 sm:text-base">
              Un hackathon presencial para el talento que ya está construyendo.
              Pocas plazas, presión real y ~30 horas para demostrar de qué estás
              hecho.
            </p>
          </div>
        </LandingContainer>
      </div>
    </section>
  );
}

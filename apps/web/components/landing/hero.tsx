import {
  LandingContainer,
  landingCtaClassName,
} from "@/components/landing/shell";

export function LandingHero() {
  return (
    <section className="relative min-h-dvh w-full overflow-hidden md:h-dvh">
      <LandingContainer className="relative flex min-h-dvh flex-col justify-between pt-24 pb-20 md:h-dvh md:pt-28 md:pb-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl font-mono text-[11px] leading-relaxed tracking-[0.2em] text-[#d1d5d1] uppercase sm:text-xs">
            Hackathon selectivo de IA · Lima, Perú
          </p>
          <h1 className="max-w-6xl lowercase leading-[0.78] font-medium tracking-tighter text-[clamp(3.4rem,14vw,9.5rem)]">
            hack the <span className="font-normal">andes</span>
          </h1>
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#d1d5d1] uppercase md:text-sm">
            10–11 oct 2026 · presencial
          </p>
        </div>

        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <p className="text-xl leading-snug font-medium tracking-tight lowercase sm:text-2xl">
            Entrar es difícil. Ese es el punto.
          </p>
          <p className="text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
            Un hackathon presencial para el talento que ya está construyendo.
            Pocas plazas, presión real y ~30 horas para demostrar de qué estás
            hecho.
          </p>
        </div>

        <div className="landing-fade-in flex flex-col items-center gap-5">
          <a href="#apply" className={landingCtaClassName}>
            <span>Aplicar ahora</span>
            <span className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-[#1a1a1a]/75 uppercase md:text-[11px]">
              10–11 oct 2026 · presencial
            </span>
          </a>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#d1d5d1] uppercase sm:hidden">
            Sponsored by Chofex
          </p>
          <a
            href="#apply"
            className="flex flex-col items-center gap-1 text-[#e1ff00]"
          >
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
              Aplicar abajo
            </span>
            <span
              aria-hidden="true"
              className="landing-bounce-cue text-3xl leading-none"
            >
              ⌄
            </span>
          </a>
        </div>
      </LandingContainer>
    </section>
  );
}

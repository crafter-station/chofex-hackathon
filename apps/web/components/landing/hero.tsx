import { ArrowDownIcon } from "lucide-react";

import { LandingContainer } from "@/components/landing/shell";

export function LandingHero() {
  return (
    <section className="border-current/15 border-b">
      <LandingContainer className="flex min-h-[calc(100svh-4rem)] flex-col justify-between py-10 sm:py-14">
        <div className="flex flex-col gap-8 py-10 sm:gap-12 sm:py-20">
          <p className="max-w-sm text-sm leading-relaxed opacity-55 sm:text-base">
            Hackathon selectivo de IA · Lima, Perú
          </p>
          <h1 className="max-w-5xl text-[clamp(3.4rem,16vw,10rem)] leading-[0.78] font-semibold tracking-[-0.075em]">
            Hack the
            <span className="block pl-[0.32em] italic">Andes.</span>
          </h1>
          <div className="flex max-w-xl flex-col gap-4 sm:ml-[28%]">
            <p className="text-xl leading-snug font-medium tracking-[-0.03em] sm:text-2xl">
              Entrar es difícil. Ese es el punto.
            </p>
            <p className="text-base leading-relaxed opacity-65 sm:text-lg">
              Un hackathon presencial para el talento que ya está construyendo.
              Pocas plazas, presión real y ~30 horas para demostrar de qué estás
              hecho.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#apply"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#171713] text-base font-medium text-[#f4f1e9] sm:w-auto sm:px-8 dark:bg-[#f4f1e9] dark:text-[#171713]"
            >
              Aplicar ahora
            </a>
            <p className="text-center text-sm opacity-50 sm:text-left">
              10–11 oct 2026 · presencial
            </p>
          </div>
          <p className="text-center text-[11px] tracking-[0.08em] uppercase opacity-45 sm:hidden">
            Sponsored by Chofex
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 pb-16 sm:pb-0">
          <a
            href="#apply"
            className="flex w-fit items-center gap-3 text-sm font-medium"
          >
            Apply below
            <span className="grid size-9 place-items-center rounded-full border border-current/30">
              <ArrowDownIcon className="size-4" aria-hidden="true" />
            </span>
          </a>
        </div>
      </LandingContainer>
    </section>
  );
}

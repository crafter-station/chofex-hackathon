import {
  formatSoles,
  prizeAmountsPen,
  prizeAmountsUsd,
  usdToPenRate,
} from "@/components/landing/content";
import { AndesWireframe } from "@/components/landing/graphics";
import { PrizeCounter } from "@/components/landing/prize-counter";
import {
  LandingContainer,
  LandingEyebrow,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingPrizes() {
  const cashHeadline =
    Math.floor((prizeAmountsPen.first + prizeAmountsPen.second) / 1_000) *
    1_000;

  return (
    <section aria-labelledby="prizes-heading" className="bg-[#1a1a1a]">
      <LandingContainer className="flex flex-col justify-center gap-10 py-14 md:min-h-dvh md:py-16">
        <LandingSectionHead title="Premios" titleId="prizes-heading">
          <p className="max-w-lg text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
            Más de {formatSoles(cashHeadline)} en efectivo. Convertidos de USD{" "}
            {prizeAmountsUsd.first.toLocaleString("es-PE")} /{" "}
            {prizeAmountsUsd.second.toLocaleString("es-PE")} al tipo ~S/.{" "}
            {usdToPenRate.toLocaleString("es-PE")}.
          </p>
        </LandingSectionHead>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <div className="flex flex-col gap-2 lg:pr-6">
            <LandingEyebrow>1er lugar</LandingEyebrow>
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(4.2rem,14vw,9.5rem)] leading-[0.8] font-light tracking-tighter">
              <PrizeCounter amount={prizeAmountsPen.first} format="number" />
            </p>
            <p className="font-[family-name:var(--font-landing-title)] text-sm tracking-[0.14em] uppercase">
              S/. en efectivo
            </p>
            <p className="mt-2 text-sm text-[#d1d5d1]">
              2do lugar{" "}
              <span className="text-[#e1ff00]">
                <PrizeCounter amount={prizeAmountsPen.second} />
              </span>
            </p>
          </div>

          <div className="hidden flex-col items-center gap-3 lg:flex">
            <span className="font-[family-name:var(--font-landing-display)] text-6xl leading-none font-light">
              +
            </span>
            <AndesWireframe className="h-auto w-40 text-[#e1ff00]" />
          </div>

          <div className="flex flex-col gap-2 lg:pl-6 lg:text-right">
            <LandingEyebrow className="lg:ml-auto">
              viaje / minijuegos
            </LandingEyebrow>
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(3rem,8vw,5.5rem)] leading-[0.85] font-light tracking-tighter">
              <PrizeCounter
                amount={prizeAmountsPen.travelPool}
                format="number"
              />
            </p>
            <p className="text-sm leading-snug text-[#d1d5d1] sm:text-base">
              Pool extra de ~{formatSoles(prizeAmountsPen.travelPool)} para
              minijuegos y/o viaje de provincia.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#d1d5d1]">
          * Los equipos top podrían ser invitados a un work trial de dos semanas
          en Monterrey o San Francisco. No es una oferta de trabajo.
        </p>
      </LandingContainer>
    </section>
  );
}

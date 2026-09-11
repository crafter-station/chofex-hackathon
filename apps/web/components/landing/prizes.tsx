import {
  formatSoles,
  prizeAmountsPen,
  prizeAmountsUsd,
  usdToPenRate,
} from "@/components/landing/content";
import { PrizeCounter } from "@/components/landing/prize-counter";
import {
  LandingContainer,
  LandingEyebrow,
  LandingTitle,
} from "@/components/landing/shell";

const places = [
  { place: "1er lugar", amount: prizeAmountsPen.first },
  { place: "2do lugar", amount: prizeAmountsPen.second },
  {
    place: "Viaje / minijuegos",
    amount: prizeAmountsPen.travelPool,
  },
] as const;

export function LandingPrizes() {
  const cashHeadline =
    Math.floor((prizeAmountsPen.first + prizeAmountsPen.second) / 1_000) *
    1_000;

  return (
    <section aria-labelledby="prizes-heading">
      <LandingContainer className="flex flex-col gap-8 py-12 md:min-h-dvh md:justify-center md:py-16">
        <div className="grid gap-5 border-[#e1ff00]/20 border-b pb-8 md:grid-cols-[1fr_1.6fr]">
          <LandingEyebrow id="prizes-heading">Premios</LandingEyebrow>
          <div className="flex flex-col gap-4">
            <LandingTitle>
              Más de {formatSoles(cashHeadline)} en efectivo.
            </LandingTitle>
            <p className="max-w-lg text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
              Premios en soles para que se sientan cerca. Convertidos de USD{" "}
              {prizeAmountsUsd.first.toLocaleString("es-PE")} /{" "}
              {prizeAmountsUsd.second.toLocaleString("es-PE")} al tipo ~S/.{" "}
              {usdToPenRate.toLocaleString("es-PE")}.
            </p>
          </div>
        </div>

        <div className="grid gap-px bg-[#e1ff00]/20 md:grid-cols-3">
          {places.map((item) => (
            <article
              className="flex flex-col gap-3 bg-[#1a1a1a] py-8 pr-6"
              key={item.place}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#d1d5d1]">
                {item.place}
              </p>
              <p className="text-[clamp(2.4rem,6vw,4.6rem)] leading-none font-medium tracking-tighter">
                <PrizeCounter amount={item.amount} />
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-[#e1ff00]/20 border-t pt-6 text-sm leading-relaxed text-[#d1d5d1]">
          <p>
            Hay un pool extra de ~{formatSoles(prizeAmountsPen.travelPool)} para
            minijuegos y/o viaje de provincia.
          </p>
          <p>
            * Los equipos top podrían ser invitados a un work trial de dos
            semanas en Monterrey o San Francisco. No es una oferta de trabajo.
          </p>
        </div>
      </LandingContainer>
    </section>
  );
}

import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

function RidgelineHint() {
  return (
    <svg
      aria-hidden="true"
      className="size-full"
      fill="none"
      viewBox="0 0 320 180"
    >
      <path
        className="stroke-current"
        d="M8 142 54 96l28 22 46-70 38 48 42-36 56 54 40-18"
        opacity="0.85"
        strokeWidth="1.5"
      />
      <path
        className="stroke-current"
        d="M8 158h304"
        opacity="0.2"
        strokeWidth="1"
      />
      <circle className="fill-current" cx="128" cy="48" opacity="0.9" r="3" />
    </svg>
  );
}

function ConstellationHint() {
  return (
    <svg
      aria-hidden="true"
      className="size-full"
      fill="none"
      viewBox="0 0 320 180"
    >
      <path
        className="stroke-current"
        d="M48 128 96 64l72 28 56-48 52 72"
        opacity="0.35"
        strokeWidth="1"
      />
      <path
        className="stroke-current"
        d="M96 64 70 42M224 44 248 78M168 92 196 128"
        opacity="0.2"
        strokeWidth="1"
      />
      <circle className="fill-current" cx="48" cy="128" r="3.5" />
      <circle className="fill-current" cx="96" cy="64" r="3.5" />
      <circle className="fill-current" cx="168" cy="92" r="3.5" />
      <circle className="fill-current" cx="224" cy="44" r="3.5" />
      <circle className="fill-current" cx="276" cy="116" r="3.5" />
    </svg>
  );
}

const trackHints = [
  {
    code: "01",
    hint: "Una línea que se comporta como montaña — o como señal.",
    visual: RidgelineHint,
  },
  {
    code: "02",
    hint: "Nodos que se buscan. El mapa no está publicado.",
    visual: ConstellationHint,
  },
] as const;

export function LandingTracks() {
  return (
    <section
      aria-labelledby="tracks-heading"
      className="bg-[#fff3e4] text-[#1f1833]"
    >
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Tracks" titleId="tracks-heading">
          <p className="max-w-md text-sm leading-relaxed text-[#1f1833]/70 sm:text-base">
            Se revelan el día 1. Cinco minutos para elegir. Cero spoilers. Las
            pistas están a la vista; los nombres, no.
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 md:grid-cols-2">
          {trackHints.map((track) => {
            const Visual = track.visual;
            return (
              <article
                className={`flex flex-col gap-5 p-6 ${landingFrameClassName}`}
                key={track.code}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-[0.16em] text-[#1f1833]/50 uppercase">
                    señal {track.code}
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">
                    Bloqueado
                  </span>
                </div>
                <div className="aspect-16/9 overflow-hidden rounded-2xl bg-[#b9a8f4]/25 text-[#8d78d6]">
                  <Visual />
                </div>
                <p className="text-sm leading-relaxed text-[#1f1833]/70">
                  {track.hint}
                </p>
              </article>
            );
          })}
        </div>
      </LandingContainer>
    </section>
  );
}

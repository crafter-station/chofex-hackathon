import { sponsorSlots } from "@/components/landing/content";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="bg-[#fff3e4] text-[#1f1833]"
    >
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Sponsors" titleId="sponsors-heading">
          <p className="max-w-md text-sm leading-relaxed text-[#1f1833]/70">
            Sponsored by Chofex. Identidad propia del evento. Chofex patrocina —
            no pinta la paleta.
          </p>
        </LandingSectionHead>
        <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {sponsorSlots.map((slot) => {
            const label = slot.confirmed ? slot.name : "Más sponsors pronto";
            return (
              <li
                className={`grid h-28 place-items-center px-3 text-center ${landingFrameClassName}`}
                key={slot.id}
              >
                <span
                  className={
                    slot.confirmed
                      ? "font-[family-name:var(--font-landing-display)] text-2xl tracking-[-0.04em] uppercase"
                      : "text-xs font-medium tracking-[0.12em] text-[#1f1833]/50 uppercase"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </LandingContainer>
    </section>
  );
}

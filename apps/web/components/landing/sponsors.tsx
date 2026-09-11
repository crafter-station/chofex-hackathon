import { sponsorSlots } from "@/components/landing/content";
import { LandingContainer, LandingEyebrow } from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section aria-labelledby="sponsors-heading">
      <LandingContainer className="py-16 sm:py-20">
        <div className="flex flex-col gap-3">
          <LandingEyebrow id="sponsors-heading">Sponsors</LandingEyebrow>
          <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Sponsored by Chofex
          </h2>
          <p className="max-w-md text-sm leading-relaxed opacity-55">
            Sponsored by Chofex. Más logos cuando estén confirmados.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sponsorSlots.map((slot) => {
            const label = slot.confirmed ? slot.name : "Próximamente";
            return (
              <li
                className="grid h-24 place-items-center rounded-2xl border border-dashed border-current/20 px-3 text-center"
                key={slot.id}
              >
                <span
                  className={
                    slot.confirmed
                      ? "text-sm font-semibold tracking-tight"
                      : "text-xs tracking-[0.12em] uppercase opacity-40"
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

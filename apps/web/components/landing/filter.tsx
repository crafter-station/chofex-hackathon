import { filterSignals } from "@/components/landing/content";
import {
  LandingContainer,
  landingFrameClassName,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingFilter() {
  return (
    <section aria-labelledby="filter-heading" className="bg-[#1a1a1a]">
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Preselección" titleId="filter-heading">
          <p className="max-w-lg text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
            El filtro empieza ahora. Algunos llegan por un challenge. Otros, por
            un golden ticket. El resto, demostrando en público. Las reglas
            exactas no caben en una landing.
          </p>
        </LandingSectionHead>
        <div className="grid gap-3 sm:grid-cols-3">
          {filterSignals.map((item) => (
            <article
              className={`flex flex-col gap-3 p-5 ${landingFrameClassName}`}
              key={item.title}
            >
              <h3 className="font-[family-name:var(--font-landing-title)] text-sm font-medium tracking-[0.12em] uppercase sm:text-base">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#d1d5d1]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}

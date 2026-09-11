import { filterSignals } from "@/components/landing/content";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

export function LandingFilter() {
  return (
    <section
      aria-labelledby="filter-heading"
      className="bg-[#f0c3de] text-[#1f1833]"
    >
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Preselección" titleId="filter-heading">
          <p className="max-w-lg text-sm leading-relaxed text-[#1f1833]/70 sm:text-base">
            El filtro empieza ahora. Algunos llegan por un challenge. Otros, por
            un golden ticket. El resto, demostrando en público. Las reglas
            exactas no caben en una landing.
          </p>
        </LandingSectionHead>
        <div className="grid gap-4 sm:grid-cols-3">
          {filterSignals.map((item) => (
            <article
              className={`flex flex-col gap-3 p-6 ${landingFrameClassName}`}
              key={item.title}
            >
              <h3 className="font-[family-name:var(--font-landing-sans)] text-base font-semibold sm:text-lg">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#1f1833]/70">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}

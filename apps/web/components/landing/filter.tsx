import { filterSignals } from "@/components/landing/content";
import {
  LandingContainer,
  LandingEyebrow,
  LandingTitle,
} from "@/components/landing/shell";

export function LandingFilter() {
  return (
    <section
      aria-labelledby="filter-heading"
      className="border-[#e1ff00]/20 border-t"
    >
      <LandingContainer className="py-12 sm:py-16">
        <div className="flex max-w-3xl flex-col gap-4">
          <LandingEyebrow id="filter-heading">Preselección</LandingEyebrow>
          <LandingTitle>El filtro empieza ahora.</LandingTitle>
          <p className="max-w-lg text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
            Algunos llegan por un challenge. Otros, por un golden ticket. El
            resto, demostrando en público. Las reglas exactas no caben en una
            landing.
          </p>
        </div>
        <div className="mt-8 grid gap-px bg-[#e1ff00]/20 sm:grid-cols-3">
          {filterSignals.map((item) => (
            <article
              className="flex flex-col gap-3 bg-[#1a1a1a] p-5"
              key={item.title}
            >
              <h3 className="text-base font-medium tracking-[0.08em] uppercase sm:text-lg">
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

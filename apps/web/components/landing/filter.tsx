import { filterSignals } from "@/components/landing/content";
import { LandingContainer, LandingEyebrow } from "@/components/landing/shell";

export function LandingFilter() {
  return (
    <section
      aria-labelledby="filter-heading"
      className="border-current/15 border-t"
    >
      <LandingContainer className="py-16 sm:py-24">
        <div className="flex flex-col gap-5">
          <LandingEyebrow id="filter-heading">Preselección</LandingEyebrow>
          <h2 className="max-w-xl text-4xl leading-[0.95] font-medium tracking-[-0.05em] sm:text-5xl">
            El filtro empieza ahora.
          </h2>
          <p className="max-w-lg text-base leading-relaxed opacity-65">
            Algunos llegan por un challenge. Otros, por un golden ticket. El
            resto, demostrando en público. Las reglas exactas no caben en una
            landing.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {filterSignals.map((item) => (
            <article
              className="flex flex-col gap-3 rounded-2xl border border-current/15 p-5"
              key={item.title}
            >
              <h3 className="text-lg font-medium tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed opacity-60">{item.body}</p>
            </article>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}

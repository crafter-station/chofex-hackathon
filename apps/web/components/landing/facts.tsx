import { facts } from "@/components/landing/content";
import { LandingContainer, LandingEyebrow } from "@/components/landing/shell";

export function LandingFacts() {
  return (
    <section aria-labelledby="facts-heading">
      <LandingContainer className="py-14 sm:py-20">
        <div className="flex flex-col gap-8 border-current/20 border-b pb-10 sm:flex-row sm:items-end sm:justify-between">
          <LandingEyebrow id="facts-heading">Datos clave</LandingEyebrow>
          <p className="max-w-md text-lg leading-snug font-medium tracking-[-0.03em] sm:text-right sm:text-xl">
            Lima. Presencial. Selectivo.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-px bg-current/10 md:grid-cols-4">
          {facts.map((fact) => (
            <div
              className="flex flex-col gap-2 bg-[#f4f1e9] py-6 pr-4 sm:py-8 dark:bg-[#171713]"
              key={fact.label}
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-45">
                {fact.label}
              </dt>
              <dd className="text-base leading-snug font-medium tracking-tight sm:text-lg">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </LandingContainer>
    </section>
  );
}

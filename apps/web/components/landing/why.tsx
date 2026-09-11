import { differentiators } from "@/components/landing/content";
import { LandingContainer, LandingEyebrow } from "@/components/landing/shell";

export function LandingWhy() {
  return (
    <section
      aria-labelledby="why-heading"
      className="border-current/15 border-t"
    >
      <LandingContainer className="py-16 sm:py-24">
        <div className="grid gap-8 border-current/20 border-b pb-10 md:grid-cols-[1fr_1.4fr]">
          <LandingEyebrow id="why-heading">Por qué este</LandingEyebrow>
          <h2 className="max-w-xl text-4xl leading-[0.95] font-medium tracking-[-0.05em] sm:text-5xl">
            No es otro hackathon.
          </h2>
        </div>
        <ol className="divide-y divide-current/10">
          {differentiators.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <li
                className="grid gap-3 py-8 md:grid-cols-[4rem_minmax(0,14rem)_1fr] md:gap-8"
                key={item.title}
              >
                <span className="font-mono text-xs opacity-40">{number}</span>
                <h3 className="text-xl font-medium tracking-tight">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed opacity-60">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ol>
      </LandingContainer>
    </section>
  );
}

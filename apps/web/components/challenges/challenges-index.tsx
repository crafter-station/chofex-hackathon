import {
  type ChallengeCatalogItem,
  challengeCatalog,
} from "@chofex/challenges-contract";
import {
  BrandContainer,
  BrandKicker,
  BrandSectionHeader,
  brandFrameClassName,
  brandSectionClassName,
} from "@chofex/ui/components/brand";
import Link from "next/link";
import { ContourSeal } from "@/components/landing/illustrations";
import { catalogItemFor } from "@/lib/challenges/catalog";

const CHALLENGE_SEAL_GEOMETRIES = [
  { rxOuter: 98, ryOuter: 66, rotateDeg: 0 },
  { rxOuter: 80, ryOuter: 78, rotateDeg: 0 },
  { rxOuter: 94, ryOuter: 58, rotateDeg: -8 },
  { rxOuter: 88, ryOuter: 70, rotateDeg: 12 },
  { rxOuter: 100, ryOuter: 52, rotateDeg: -4 },
] as const;

export function ChallengesIndex({
  challenges,
}: {
  readonly challenges: ReadonlyArray<ChallengeCatalogItem>;
}) {
  return (
    <section
      aria-labelledby="challenges-index-heading"
      className="bg-[var(--hud-paper)]"
    >
      <BrandContainer className={brandSectionClassName}>
        <BrandKicker className="mb-3 text-[var(--hud-kicker)]">
          challenges / clasificación
        </BrandKicker>
        <BrandSectionHeader
          headingLevel="h1"
          title="Challenges técnicos"
          titleId="challenges-index-heading"
        >
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            Estos {challenges.length} challenges ocurren antes del evento y no
            son los tracks de la hackathon. Resuelve uno para demostrar lo que
            puedes hacer: los mejores resultados de cada challenge obtienen pase
            directo. Las soluciones se envían por la CLI y el ranking es
            público.
          </p>
        </BrandSectionHeader>
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge, index) => {
            const sealGeometry =
              CHALLENGE_SEAL_GEOMETRIES[index] ?? CHALLENGE_SEAL_GEOMETRIES[0];
            let stateClassName = "text-[var(--hud-muted)]";
            if (challenge.open) {
              stateClassName = "text-[var(--hud-action)]";
            }

            return (
              <article
                className={`landing-dossier relative flex min-h-[22rem] overflow-hidden ${brandFrameClassName}`}
                key={challenge.slug}
              >
                <ContourSeal
                  className="absolute right-0 bottom-0 w-3/5 translate-x-1/4 translate-y-1/4 text-[var(--hud-ink)]"
                  rxOuter={sealGeometry.rxOuter}
                  ryOuter={sealGeometry.ryOuter}
                  rotateDeg={sealGeometry.rotateDeg}
                />

                <div className="relative z-10 flex w-full flex-col p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <BrandKicker className="text-[var(--hud-kicker)]">
                      {challenge.code} / {challenge.theme}
                    </BrandKicker>
                    <BrandKicker className={stateClassName}>
                      {challenge.open ? "abierto" : "programado"}
                    </BrandKicker>
                  </div>

                  <div className="my-10 max-w-xl">
                    <h2 className="font-display text-3xl leading-none uppercase sm:text-4xl">
                      {challenge.title}
                    </h2>
                    <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-[var(--hud-muted)]">
                      {challenge.summary}
                    </p>
                  </div>

                  <div className="mt-auto border-[var(--hud-ink)]/15 border-t pt-4">
                    <BrandKicker className="mb-4 text-[var(--hud-muted)]">
                      {challenge.formatLabel} · {challenge.coreSkill}
                    </BrandKicker>
                    <Link
                      aria-label={`Ver detalles, instrucciones y ranking de ${challenge.title}`}
                      className="font-mono text-sm uppercase tracking-[0.12em] text-[var(--hud-action)] underline-offset-4 hover:text-[var(--hud-action-hover)] hover:underline"
                      href={challenge.rankingPath}
                    >
                      Ver detalles y ranking →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </BrandContainer>
    </section>
  );
}

export const scheduledChallengeItems =
  (): ReadonlyArray<ChallengeCatalogItem> =>
    challengeCatalog.map((challenge) => catalogItemFor(challenge));

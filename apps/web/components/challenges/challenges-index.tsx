import {
  type ChallengeCatalogItem,
  challengeCatalog,
} from "@chofex/challenges-contract";
import Link from "next/link";

import { HudLabel } from "@/components/landing/hud";
import { ContourSeal } from "@/components/landing/illustrations";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
  landingSectionYClassName,
} from "@/components/landing/shell";
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
      <LandingContainer className={landingSectionYClassName}>
        <HudLabel className="mb-3 text-[var(--hud-kicker)]">
          challenges / clasificación
        </HudLabel>
        <LandingSectionHead
          headingLevel="h1"
          title="Challenges técnicos"
          titleId="challenges-index-heading"
        >
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            Estos 5 challenges ocurren antes del evento y no son los tracks de
            la hackathon. Resuelve uno para demostrar lo que puedes hacer: los
            mejores resultados de cada challenge obtienen pase directo. Las
            soluciones se envían por la CLI y el ranking es público.
          </p>
        </LandingSectionHead>
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
                className={`landing-dossier relative flex min-h-[22rem] overflow-hidden ${landingFrameClassName}`}
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
                    <HudLabel className="text-[var(--hud-kicker)]">
                      {challenge.code} / {challenge.theme}
                    </HudLabel>
                    <HudLabel className={stateClassName}>
                      {challenge.open ? "abierto" : "programado"}
                    </HudLabel>
                  </div>

                  <div className="my-10 max-w-xl">
                    <h2 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none uppercase sm:text-4xl">
                      {challenge.title}
                    </h2>
                    <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-[var(--hud-muted)]">
                      {challenge.summary}
                    </p>
                  </div>

                  <div className="mt-auto border-[var(--hud-ink)]/15 border-t pt-4">
                    <HudLabel className="mb-4 text-[var(--hud-muted)]">
                      {challenge.formatLabel} · {challenge.coreSkill}
                    </HudLabel>
                    <Link
                      aria-label={`Ver detalles, instrucciones y ranking de ${challenge.title}`}
                      className="font-[family-name:var(--font-landing-mono)] text-sm uppercase tracking-[0.12em] text-[var(--hud-action)] underline-offset-4 hover:text-[var(--hud-action-hover)] hover:underline"
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
      </LandingContainer>
    </section>
  );
}

export const scheduledChallengeItems =
  (): ReadonlyArray<ChallengeCatalogItem> =>
    challengeCatalog.map((challenge) => catalogItemFor(challenge));

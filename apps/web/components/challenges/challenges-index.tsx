import {
  type ChallengeCatalogItem,
  challengeCatalog,
} from "@chofex/challenges-contract";
import Link from "next/link";

import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";
import { catalogItemFor } from "@/lib/challenges/catalog";

export function ChallengesIndex({
  challenges,
}: {
  readonly challenges: ReadonlyArray<ChallengeCatalogItem>;
}) {
  return (
    <section className="landing-topography bg-[linear-gradient(180deg,#07152b_0%,#0d2949_100%)] text-[#f5f5f5]">
      <LandingContainer className="py-16 sm:py-20">
        <HudLabel className="mb-3 text-[#d6ff00]">
          challenges / ranking
        </HudLabel>
        <LandingSectionHead title="Mini technical challenges">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
            El ranking es público y de solo lectura. Las soluciones se envían
            por la CLI. Cada participante recibe una variante personalizada, así
            que compartir un score no revela el algoritmo.
          </p>
        </LandingSectionHead>
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => (
            <article
              className={`flex flex-col gap-4 p-6 ${landingFrameClassName}`}
              key={challenge.slug}
            >
              <div className="flex items-center justify-between">
                <HudLabel className="text-[#d6ff00]">
                  {challenge.code} / {challenge.theme}
                </HudLabel>
                <HudLabel className="text-[var(--hud-muted)]">
                  {challenge.open ? "abierto" : "programado"}
                </HudLabel>
              </div>
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none uppercase">
                {challenge.title}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--hud-muted)]">
                {challenge.summary}
              </p>
              <p className="font-[family-name:var(--font-landing-mono)] text-[11px] uppercase tracking-[0.14em] text-[#d6ff00]">
                {challenge.formatLabel} · {challenge.coreSkill}
              </p>
              <Link
                className="font-[family-name:var(--font-landing-mono)] text-sm uppercase tracking-[0.12em] text-[#d6ff00] underline-offset-4 hover:underline"
                href={challenge.rankingPath}
              >
                Ver ranking
              </Link>
            </article>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}

export const scheduledChallengeItems =
  (): ReadonlyArray<ChallengeCatalogItem> =>
    challengeCatalog.map((challenge) => catalogItemFor(challenge));

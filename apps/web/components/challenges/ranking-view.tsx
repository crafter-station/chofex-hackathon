import type { ChallengeRanking } from "@chofex/challenges-contract";

import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

const percent = (value: number): string => `${(value * 100).toFixed(2)}%`;

export function ChallengeRankingView({
  ranking,
}: {
  readonly ranking: ChallengeRanking;
}) {
  const { challenge, entries, competitorCount } = ranking;
  let cliHint = "chofex challenge list";
  if (challenge.playable) {
    cliHint = `chofex challenge query ${challenge.slug}`;
  }

  return (
    <section className="landing-topography bg-[linear-gradient(180deg,#07152b_0%,#0d2949_100%)] text-[#f5f5f5]">
      <LandingContainer className="py-16 sm:py-20">
        <HudLabel className="mb-3 text-[#d6ff00]">
          {challenge.theme} #{challenge.code}
        </HudLabel>
        <LandingSectionHead title={challenge.title}>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
            {challenge.summary} Ranking público de solo lectura: accuracy,
            empates por predicciones exactas, menos queries y runtime. Las
            implementaciones no se publican.
          </p>
        </LandingSectionHead>

        <div
          className={`mb-8 grid gap-3 p-5 sm:grid-cols-3 ${landingFrameClassName}`}
        >
          <div>
            <HudLabel className="text-[var(--hud-muted)]">
              Participantes
            </HudLabel>
            <p className="mt-2 font-[family-name:var(--font-landing-display)] text-4xl">
              {competitorCount}
            </p>
          </div>
          <div>
            <HudLabel className="text-[var(--hud-muted)]">Estado</HudLabel>
            <p className="mt-2 font-[family-name:var(--font-landing-mono)] text-sm uppercase tracking-[0.12em] text-[#d6ff00]">
              {challenge.open
                ? "Abierto"
                : `Abre ${challenge.opensAt.slice(0, 10)}`}
            </p>
          </div>
          <div>
            <HudLabel className="text-[var(--hud-muted)]">CLI</HudLabel>
            <p className="mt-2 font-[family-name:var(--font-landing-mono)] text-sm">
              {cliHint}
            </p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className={`p-6 ${landingFrameClassName}`}>
            <p className="text-sm text-[var(--hud-muted)]">
              Nadie ha enviado una evaluación oficial todavía. Las soluciones se
              envían por la CLI; esta página solo muestra el ranking.
            </p>
          </div>
        ) : (
          <div className={`overflow-x-auto ${landingFrameClassName}`}>
            <table className="min-w-full text-left text-sm">
              <thead className="font-[family-name:var(--font-landing-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--hud-muted)]">
                <tr>
                  <th className="px-4 py-3">Puesto</th>
                  <th className="px-4 py-3">Participante</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Exactas</th>
                  <th className="px-4 py-3">Queries</th>
                  <th className="px-4 py-3">Runtime</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    className="border-white/10 border-t"
                    key={`${entry.shareCode}-${entry.rank}`}
                  >
                    <td className="px-4 py-3 font-[family-name:var(--font-landing-mono)] text-[#d6ff00]">
                      #{entry.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div>{entry.displayName}</div>
                      <div className="font-[family-name:var(--font-landing-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--hud-muted)]">
                        #{entry.shareCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-landing-mono)]">
                      {percent(entry.accuracy)}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-landing-mono)]">
                      {entry.exactCount}/{entry.sampleSize}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-landing-mono)]">
                      {entry.queriesUsed}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-landing-mono)]">
                      {entry.runtimeMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LandingContainer>
    </section>
  );
}

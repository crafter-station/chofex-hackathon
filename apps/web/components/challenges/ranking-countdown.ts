const secondMs = 1_000;
const minuteMs = 60 * secondMs;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;
const peruOffsetMs = 5 * hourMs;
const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export interface RankingCountdownParts {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

export const rankingCountdownParts = (
  millisecondsRemaining: number,
): RankingCountdownParts => {
  const remaining = Math.max(0, millisecondsRemaining);
  return {
    days: Math.floor(remaining / dayMs),
    hours: Math.floor((remaining % dayMs) / hourMs),
    minutes: Math.floor((remaining % hourMs) / minuteMs),
    seconds: Math.floor((remaining % minuteMs) / secondMs),
  };
};

export const formatRankingVisibleAtInPeru = (visibleAt: string): string => {
  const localTime = new Date(Date.parse(visibleAt) - peruOffsetMs);
  const month = monthNames[localTime.getUTCMonth()];
  if (!month || Number.isNaN(localTime.getTime())) {
    throw new Error("Ranking visibility time is invalid");
  }
  const day = localTime.getUTCDate();
  const year = localTime.getUTCFullYear();
  const hour = String(localTime.getUTCHours()).padStart(2, "0");
  const minute = String(localTime.getUTCMinutes()).padStart(2, "0");
  return `${day} de ${month} de ${year} · ${hour}:${minute} (hora de Perú, UTC−5)`;
};

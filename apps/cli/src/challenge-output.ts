import type {
  ChallengeAttemptView,
  ChallengeCatalogResponse,
  ChallengeEvaluationResult,
  ChallengeLocalTestResult,
  ChallengeObservation,
  ChallengeQueryResult,
  ChallengeRanking,
} from "@chofex/challenges-contract";
import type { RegistrationResult } from "@chofex/registration-contract";

export const remainingBar = (used: number, limit: number): string => {
  if (limit <= 0) return "";
  const width = 20;
  const remaining = Math.max(0, limit - used);
  const filled = Math.round((remaining / limit) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
};

const percent = (value: number): string => `${(value * 100).toFixed(2)}%`;

export const challengeListText = (
  catalog: ChallengeCatalogResponse,
): string => {
  const lines = ["Hack the Andes challenges", ""];
  for (const challenge of catalog.challenges) {
    let state = "open";
    if (!challenge.open) state = `opens ${challenge.opensAt.slice(0, 10)}`;
    const playable = challenge.playable ? "" : " (coming later)";
    lines.push(
      `${challenge.code}  ${challenge.theme} — ${challenge.title}${playable}`,
    );
    lines.push(
      `    ${challenge.coreSkill} · ${challenge.formatLabel} · ${state}`,
    );
    lines.push(`    Ranking: ${challenge.rankingPath}`);
    lines.push("");
  }
  lines.push("Play the open challenge: chofex challenge query");
  return lines.join("\n");
};

export const challengeShowText = (attempt: ChallengeAttemptView): string => {
  const { challenge, progress } = attempt;
  const queryBar = remainingBar(progress.queriesUsed, progress.queriesLimit);
  const evalBar = remainingBar(
    progress.evaluationsUsed,
    progress.evaluationsLimit,
  );
  const lines = [
    `${challenge.theme} #${challenge.code}`,
    challenge.title,
    challenge.summary,
    "",
    "AI is allowed. Use ChatGPT, Claude, Codex, Cursor, or any tool you want.",
    "The hidden rules are personalized to you, so leaked solutions will not match.",
    "",
    "Queries remaining",
    queryBar,
    `${progress.queriesLimit - progress.queriesUsed} / ${progress.queriesLimit}`,
    "",
    "Official evaluations remaining",
    evalBar,
    `${progress.evaluationsLimit - progress.evaluationsUsed} / ${progress.evaluationsLimit}`,
  ];
  if (progress.bestAccuracy !== undefined) {
    lines.push("", `Best accuracy  ${percent(progress.bestAccuracy)}`);
    if (progress.rank !== undefined)
      lines.push(`Rank           #${progress.rank}`);
    if (progress.shareCode) lines.push(`Share code     #${progress.shareCode}`);
  }
  lines.push(
    "",
    "Next:",
    "  chofex challenge query",
    "  chofex challenge notebook",
    "  chofex challenge test --source ./shipping.js",
    "  chofex challenge evaluate --source ./shipping.js",
  );
  return lines.join("\n");
};

export const challengeQueryText = (result: ChallengeQueryResult): string => {
  const remaining = remainingBar(result.queriesUsed, result.queriesLimit);
  return [
    `Output  ${JSON.stringify(result.observation.output)}`,
    "",
    "Queries remaining",
    remaining,
    `${result.queriesRemaining} / ${result.queriesLimit}`,
  ].join("\n");
};

const shipmentCells = (
  observation: ChallengeObservation,
): {
  distance: string;
  weight: string;
  hour: string;
  fragile: string;
  express: string;
} => {
  const input = observation.input;
  if (typeof input !== "object" || input === null) {
    return {
      distance: "",
      weight: "",
      hour: "",
      fragile: "",
      express: "",
    };
  }
  const record = input as Record<string, unknown>;
  return {
    distance: String(record.distanceKm ?? ""),
    weight: String(record.weightKg ?? ""),
    hour: String(record.hour ?? ""),
    fragile: String(record.fragile ?? ""),
    express: String(record.express ?? ""),
  };
};

export const notebookTableText = (
  observations: ReadonlyArray<ChallengeObservation>,
): string => {
  if (observations.length === 0) {
    return "No observations yet. Run `chofex challenge query`.";
  }
  const header = "#\tDistance\tWeight\tHour\tFragile\tExpress\tOutput";
  const rows = observations.map((observation) => {
    const cells = shipmentCells(observation);
    return [
      observation.sequence,
      cells.distance,
      cells.weight,
      cells.hour,
      cells.fragile,
      cells.express,
      JSON.stringify(observation.output),
    ].join("\t");
  });
  return [header, ...rows].join("\n");
};

export const notebookCsvText = (
  observations: ReadonlyArray<ChallengeObservation>,
): string => {
  const header = "sequence,distanceKm,weightKg,hour,fragile,express,output";
  const rows = observations.map((observation) => {
    const cells = shipmentCells(observation);
    return [
      observation.sequence,
      cells.distance,
      cells.weight,
      cells.hour,
      cells.fragile,
      cells.express,
      JSON.stringify(observation.output),
    ].join(",");
  });
  return [header, ...rows].join("\n");
};

export const challengeTestText = (result: ChallengeLocalTestResult): string => {
  const lines = [
    "LOCAL TESTS (your notebook only)",
    `Accuracy           ${percent(result.accuracy)}`,
    `Exact predictions  ${result.matchedObservations} / ${result.observationCount}`,
    `Mean error         ${result.meanError.toFixed(2)}`,
  ];
  if (result.mismatches.length > 0) {
    lines.push("", "Mismatches:");
    for (const mismatch of result.mismatches) {
      lines.push(
        `  #${mismatch.sequence} expected ${JSON.stringify(mismatch.expected)} got ${JSON.stringify(mismatch.actual)}`,
      );
    }
  }
  return lines.join("\n");
};

export const challengeEvaluateText = (
  result: ChallengeEvaluationResult,
): string => {
  const lines = [
    "BLACK BOX REPLICATION",
    `Accuracy            ${percent(result.accuracy)}`,
    `Exact predictions   ${result.exactCount} / ${result.sampleSize}`,
    `Mean error          ${result.meanError.toFixed(2)}`,
    `Oracle queries used ${result.queriesUsed}`,
  ];
  if (result.rank !== undefined)
    lines.push(`Rank                #${result.rank}`);
  lines.push(
    `Official evaluations remaining ${result.evaluationsRemaining} / ${result.evaluationsLimit}`,
    "",
    result.shareText,
  );
  return lines.join("\n");
};

export const challengeRankingText = (ranking: ChallengeRanking): string => {
  const lines = [
    `${ranking.challenge.theme} — ${ranking.challenge.title}`,
    `${ranking.competitorCount} official evaluations`,
    "",
  ];
  if (ranking.entries.length === 0) {
    lines.push("No official evaluations yet.");
    return lines.join("\n");
  }
  lines.push("Rank  Accuracy  Exact        Queries  Name");
  for (const entry of ranking.entries.slice(0, 20)) {
    const rank = String(entry.rank).padStart(4, " ");
    const accuracy = percent(entry.accuracy).padStart(8, " ");
    const exact = `${entry.exactCount}/${entry.sampleSize}`.padStart(11, " ");
    const queries = String(entry.queriesUsed).padStart(7, " ");
    lines.push(
      `${rank}  ${accuracy}  ${exact}  ${queries}  ${entry.displayName} #${entry.shareCode}`,
    );
  }
  return lines.join("\n");
};

export const draftSavedText = (result: RegistrationResult): string =>
  ["Application draft saved.", registrationPartsText(result)].join("\n");

export const registrationPartsText = (result: RegistrationResult): string => {
  const parts = result.requirements.parts ?? [];
  if (parts.length === 0) return "";
  const lines = ["", "Application parts:"];
  for (const part of parts) {
    const mark = part.complete ? "✓" : "○";
    let detail = "";
    if (!part.complete && part.missing[0]) {
      detail = ` — ${part.missing[0].reason}`;
    }
    lines.push(`  ${mark} ${part.title}${detail}`);
  }
  if (result.requirements.canSubmitApplication) {
    lines.push("", "Ready to submit: chofex register --submit");
  } else if (result.requirements.stage === "draft") {
    lines.push("", "Continue later with `chofex register`. Progress is saved.");
  }
  return lines.join("\n");
};

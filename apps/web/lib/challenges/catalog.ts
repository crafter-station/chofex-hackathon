import {
  type ChallengeCatalogItem,
  type ChallengeDefinition,
  challengeCatalog,
  isChallengeOpenAt,
} from "@chofex/challenges-contract";

import { challengesForceOpen, currentChallengeTime } from "./clock";

export const rankingPathFor = (slug: string): string => `/challenges/${slug}`;

export const catalogItemFor = (
  challenge: ChallengeDefinition,
  now: Date = currentChallengeTime(),
  forceOpen = challengesForceOpen(),
): ChallengeCatalogItem => ({
  slug: challenge.slug,
  number: challenge.number,
  code: challenge.code,
  theme: challenge.theme,
  title: challenge.title,
  summary: challenge.summary,
  coreSkill: challenge.coreSkill,
  format: challenge.format,
  formatLabel: challenge.formatLabel,
  opensAt: challenge.opensAt,
  queryLimit: challenge.queryLimit,
  evaluationLimit: challenge.evaluationLimit,
  requiredForApplication: challenge.requiredForApplication,
  playable: challenge.playable,
  open: isChallengeOpenAt(challenge, now, forceOpen),
  rankingPath: rankingPathFor(challenge.slug),
});

export const publicChallengeCatalog = (
  now: Date = currentChallengeTime(),
): ReadonlyArray<ChallengeCatalogItem> =>
  challengeCatalog.map((challenge) => catalogItemFor(challenge, now));

export const listPublicChallenges = (
  now: Date = currentChallengeTime(),
): { challenges: ReadonlyArray<ChallengeCatalogItem> } => ({
  challenges: publicChallengeCatalog(now),
});

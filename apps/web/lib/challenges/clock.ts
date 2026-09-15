export const currentChallengeTime = (): Date => new Date();

export const challengesForceOpen = (): boolean =>
  process.env.CHALLENGES_FORCE_OPEN === "true";

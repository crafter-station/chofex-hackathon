/** Signals that can try to hide the painted hero fallback. */
export type WorldRevealSignal =
  | "pending"
  | "canvas"
  | "procedural"
  | "unmarked"
  | "terrain";

/**
 * Painted fallback stays up until the terrain GLB is drawn.
 */
export function isWorldReadyToReveal(signal: WorldRevealSignal): boolean {
  return signal === "terrain";
}

/**
 * The terrain is authored pre-centred, so there is no centring step to wait
 * on. What is left: the GLB parsed, it identified itself as the Sacred Valley,
 * and it has survived a couple of presented frames.
 */
export function isTerrainPresented(input: {
  glbLoaded: boolean;
  presentedFrames: number;
  heroSubject: "terrain" | null;
}): boolean {
  return (
    input.glbLoaded &&
    input.presentedFrames >= 2 &&
    input.heroSubject === "terrain"
  );
}

export function isPaintedFallbackVisible(worldReady: boolean): boolean {
  return !worldReady;
}

export function paintedFallbackClassName(worldReady: boolean): string {
  if (worldReady) {
    return "landing-world-fallback landing-world-fallback--ready";
  }
  return "landing-world-fallback";
}

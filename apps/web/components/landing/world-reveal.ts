/** Signals that can try to hide the painted hero fallback. */
export type WorldRevealSignal =
  | "pending"
  | "canvas"
  | "procedural"
  | "uncentered"
  | "terrain";

/**
 * Painted fallback stays up until the terrain GLB is centered and drawn.
 */
export function isWorldReadyToReveal(signal: WorldRevealSignal): boolean {
  return signal === "terrain";
}

export function isTerrainPresented(input: {
  glbLoaded: boolean;
  centered: boolean;
  presentedFrames: number;
  heroSubject: "terrain" | null;
}): boolean {
  return (
    input.glbLoaded &&
    input.centered &&
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

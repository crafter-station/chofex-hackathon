/** Signals that can try to hide the painted hero fallback. */
export type WorldRevealSignal = "pending" | "canvas" | "procedural" | "citadel";

/**
 * Painted fallback stays up until the citadel GLB is presented.
 * A first Canvas frame or the rocky procedural stand-in is not ready.
 */
export function isWorldReadyToReveal(signal: WorldRevealSignal): boolean {
  return signal === "citadel";
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

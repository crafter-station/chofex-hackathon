/** Signals that can try to hide the painted hero fallback. */
export type WorldRevealSignal =
  | "pending"
  | "canvas"
  | "procedural"
  | "uncentered"
  | "citadel";

/**
 * Painted fallback stays up until the citadel GLB is centered and drawn.
 * A first Canvas frame, the rocky procedural stand-in, or the uncentered
 * source mesh is not ready.
 */
export function isWorldReadyToReveal(signal: WorldRevealSignal): boolean {
  return signal === "citadel";
}

export function isCitadelPresented(input: {
  glbLoaded: boolean;
  centered: boolean;
  presentedFrames: number;
}): boolean {
  return input.glbLoaded && input.centered && input.presentedFrames >= 2;
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

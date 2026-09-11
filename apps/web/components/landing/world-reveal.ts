/** Painted fallback stays up until the first WebGL world frame exists. */
export function isPaintedFallbackVisible(worldReady: boolean): boolean {
  return !worldReady;
}

export function paintedFallbackClassName(worldReady: boolean): string {
  if (worldReady) {
    return "landing-world-fallback landing-world-fallback--ready";
  }
  return "landing-world-fallback";
}

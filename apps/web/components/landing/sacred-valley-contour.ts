/** Isoline spacing in terrain world units. */
export const CONTOUR_INTERVAL = 6.5;

/** Half-width of a contour band, as a fraction of the interval. */
export const CONTOUR_HALF_WIDTH = 0.035;

export function contourBand(height: number, interval: number): number {
  const phase = height / interval;
  const wrapped = phase - Math.floor(phase);
  return Math.abs(wrapped - 0.5);
}

export function isContourLine(
  height: number,
  interval = CONTOUR_INTERVAL,
  halfWidth = CONTOUR_HALF_WIDTH,
): boolean {
  return contourBand(height, interval) <= halfWidth;
}

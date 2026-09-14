/**
 * Temporal smoothing for the hero camera.
 *
 * The camera used to read scroll position and place itself in the same frame,
 * which tied its velocity — and, worse, its angular velocity — directly to how
 * hard the reader was scrolling. A flick of the wheel threw the view across
 * the valley in three frames, which reads as disorder rather than as flight.
 *
 * Everything here is frame-rate independent. A fixed per-frame lerp factor is
 * the usual shortcut and it is wrong twice over: the same code smooths twice
 * as fast on a 120 Hz display as on a 60 Hz one, and a dropped frame silently
 * halves the damping. These take the elapsed time and derive the fraction, so
 * the motion is identical wherever it runs.
 *
 * Kept free of `three` so the behaviour can be tested without standing up a
 * WebGL context; the canvas applies these numbers to the actual camera.
 */

/**
 * Longest frame the smoothing will believe, in seconds.
 *
 * The render loop stops while the hero is offscreen or the tab is hidden, so
 * the first frame after it resumes can report several seconds of elapsed time.
 * Fed to the damping unclamped, that resolves to "catch up completely", which
 * is exactly the instant jump this module exists to prevent — and it would
 * happen precisely when the reader scrolls back to the hero. Clamping means a
 * resume eases in over a few frames like anything else.
 */
const MAX_FRAME_DELTA = 1 / 15;

/**
 * Seconds for the camera to close half the distance to the scroll position.
 *
 * Short enough that the camera never feels detached from the reader's input,
 * long enough that a violent scroll arrives as a glide. At 0.12 s a flick that
 * jumps a third of the page settles in roughly half a second.
 */
const SCROLL_HALF_LIFE = 0.12;

/** The same, for orientation. Slightly slower: rotation is what reads as harsh. */
const TURN_HALF_LIFE = 0.16;

/**
 * Hard ceiling on how fast the view may rotate, in radians per second.
 *
 * Measured rather than picked. Sweeping the solved path shows a median demand
 * of 208 degrees per unit of scroll, but two transfers — Moray to Maras, and
 * Maras to Ollantaytambo, where the framing bearings are nearly opposed —
 * concentrate 70 to 90 degrees of turn into 2% of the page. At a calm reading
 * pace those spikes alone demand almost 400 degrees per second; under a hard
 * flick, over 3,000.
 *
 * 75 deg/s sits above the p90 of a calm scroll (59 deg/s), so ordinary reading
 * never touches the ceiling and the camera tracks the scroll exactly. It only
 * engages on the spikes, which is the whole point: the cap is a limiter, not a
 * general slowdown.
 */
const MAX_TURN_RATE = (75 * Math.PI) / 180;

/** Below this, treat a rotation as arrived and stop easing toward it. */
const TURN_EPSILON = 1e-5;

/** Clamp a frame time into the range the damping is meaningful over. */
export function clampFrameDelta(delta: number): number {
  if (!Number.isFinite(delta) || delta <= 0) {
    return 0;
  }
  return Math.min(delta, MAX_FRAME_DELTA);
}

/**
 * Fraction of the remaining distance to cover this frame.
 *
 * `1 - 2^(-dt/halfLife)`: the exponential decay that makes two 60 Hz frames
 * land in the same place as one 30 Hz frame.
 */
export function dampedFraction(halfLife: number, delta: number): number {
  if (halfLife <= 0 || delta <= 0) {
    return delta > 0 ? 1 : 0;
  }
  return 1 - 2 ** (-delta / halfLife);
}

/** Ease the camera's own scroll position toward where the reader has scrolled. */
export function followScroll(
  current: number,
  target: number,
  delta: number,
): number {
  const step = dampedFraction(SCROLL_HALF_LIFE, clampFrameDelta(delta));
  return current + (target - current) * step;
}

/**
 * How far to rotate toward the target orientation this frame, as a fraction of
 * the angle between them.
 *
 * Two limits, whichever is tighter. The damping gives rotation the same weight
 * the position has; the rate cap is what stops a violent scroll from whipping
 * the view around, and it is the reason this returns a fraction rather than
 * just easing — a fraction is what a quaternion slerp takes.
 */
export function turnFraction(angle: number, delta: number): number {
  if (!(angle > TURN_EPSILON)) {
    return 1;
  }
  const dt = clampFrameDelta(delta);
  if (dt <= 0) {
    return 0;
  }
  const eased = dampedFraction(TURN_HALF_LIFE, dt);
  const capped = (MAX_TURN_RATE * dt) / angle;
  return Math.min(eased, capped, 1);
}

/** Exposed for tests and for the readout that proves the cap is honoured. */
export const CAMERA_DAMPING = {
  maxFrameDelta: MAX_FRAME_DELTA,
  scrollHalfLife: SCROLL_HALF_LIFE,
  turnHalfLife: TURN_HALF_LIFE,
  maxTurnRate: MAX_TURN_RATE,
} as const;

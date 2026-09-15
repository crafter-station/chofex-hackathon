/**
 * The cursor as the only motor.
 *
 * Ported from the portfolio hero: the liquid field behind the drawing is a
 * *static* image. It has no clock of its own, it never drifts, and it does not
 * translate with the pointer — a cursor parked far left and a cursor parked far
 * right produce the identical frame. What the cursor contributes is velocity:
 * while it moves it bends the liquid locally around itself, and the moment it
 * stops that bend springs back to zero and the field is reabsorbed into exactly
 * the picture it started from.
 *
 * All of it is plain arithmetic so it can be unit tested without standing up a
 * WebGL context, the same split the flight path already uses.
 */

/** Lag on the smoothed pointer, which is what the glass lens actually follows. */
export const POINTER_EASE = 0.09;

/** Low pass on the frame-to-frame velocity, so a jittery mouse reads as one push. */
export const VELOCITY_EASE = 0.2;

/**
 * Speed to magnet amplitude.
 *
 * A brisk drag across the hero is ~0.03 uv/frame, so 32 puts a normal gesture
 * at full strength without making a slow, deliberate move feel dead.
 */
export const SPEED_GAIN = 32;

/** Fast attack: the magnet has to be felt on the first frame of a gesture. */
export const ATTACK = 0.25;

/** Slow release: the liquid is reabsorbed, it does not snap back. */
export const RELEASE = 0.06;

/** Below this the warp is invisible, and zero is what guarantees a static field. */
export const REST_EPSILON = 0.0005;

export type Pointer = {
  /** Where the pointer is, in uv. */
  readonly targetX: number;
  readonly targetY: number;
  /** Where the lens is, trailing the pointer. */
  readonly x: number;
  readonly y: number;
  /** Low-passed velocity of the *smoothed* point, in uv per frame. */
  readonly velocityX: number;
  readonly velocityY: number;
};

export const RESTING_POINTER: Pointer = {
  targetX: 0.5,
  targetY: 0.5,
  x: 0.5,
  y: 0.5,
  velocityX: 0,
  velocityY: 0,
};

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * Advance the lens one frame.
 *
 * Velocity is measured on the smoothed point rather than on the raw pointer:
 * the raw one jumps a whole viewport when a reader re-enters the window, and
 * that would fire the magnet at full strength from a gesture nobody made.
 */
export function advancePointer(pointer: Pointer): Pointer {
  const x = lerp(pointer.x, pointer.targetX, POINTER_EASE);
  const y = lerp(pointer.y, pointer.targetY, POINTER_EASE);
  return {
    targetX: pointer.targetX,
    targetY: pointer.targetY,
    x,
    y,
    velocityX: lerp(pointer.velocityX, x - pointer.x, VELOCITY_EASE),
    velocityY: lerp(pointer.velocityY, y - pointer.y, VELOCITY_EASE),
  };
}

export function pointerSpeed(pointer: Pointer): number {
  return Math.hypot(pointer.velocityX, pointer.velocityY);
}

/** Where the magnet wants to be right now, given how fast the cursor is moving. */
export function magnetTarget(speed: number, paused: boolean): number {
  if (paused) {
    return 0;
  }
  return Math.min(speed * SPEED_GAIN, 1);
}

/**
 * Asymmetric spring: quick to grab, slow to let go, and snapped to a true zero.
 *
 * The snap is not a rounding nicety. `magneticWarp` early-returns on an exact
 * rest value, so anything that only ever approaches zero would leave the field
 * imperceptibly warped forever and cost the early-out on every pixel.
 */
export function springDistort(current: number, target: number): number {
  const next =
    current + (target - current) * (target > current ? ATTACK : RELEASE);
  return next < REST_EPSILON ? 0 : next;
}

/**
 * How present the hero chrome is, as a fraction of a viewport of scroll.
 *
 * The headline and the lens clear out inside the first third of a screen, well
 * before the next section peeks in — a lens still hanging around over the
 * following copy reads as a bug, not as an effect.
 */
export function heroFadeAt(scrollY: number, viewportHeight: number): number {
  if (viewportHeight <= 0) {
    return 1;
  }
  const traveled = scrollY / (viewportHeight * 0.33);
  return Math.min(1, Math.max(0, 1 - traveled));
}

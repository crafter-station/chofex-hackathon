/**
 * The one gesture the hero has: drag the range sideways.
 *
 * There is no route to fly and nothing to find at the end of it — the reader
 * pushes the cordillera left or right and it slides, the near ranges further
 * than the far ones, exactly as a real skyline does from a moving window. Kept
 * as plain arithmetic so the feel can be unit tested without a canvas.
 */

/** How much of its speed the pan keeps each frame once the pointer lets go. */
export const FRICTION = 0.94;

/** Below this the slide is invisible, and a true zero keeps the frame static. */
export const REST_SPEED = 0.00002;

/**
 * How far the range may travel from its opening framing, in aspect-corrected
 * screen widths.
 *
 * Bounded on purpose. The ridges are procedural and go on forever, so an
 * unbounded drag lets a reader flick the composition into open sky and leave
 * the hero looking broken. Two widths either way is enough that the parallax
 * reads and the reader never reaches a place the drawing was not designed for.
 */
export const PAN_LIMIT = 2;

export type Pan = {
  /** Current offset, in aspect-corrected uv widths. */
  readonly offset: number;
  /** Offset gained per frame, carried on after the pointer lifts. */
  readonly velocity: number;
};

export const RESTING_PAN: Pan = { offset: 0, velocity: 0 };

function clampOffset(offset: number): number {
  return Math.min(PAN_LIMIT, Math.max(-PAN_LIMIT, offset));
}

/**
 * Apply a drag delta measured this frame.
 *
 * Velocity is the delta itself rather than a smoothed average: a flick should
 * throw the range at the speed the hand was actually moving when it let go.
 */
export function dragPan(pan: Pan, delta: number): Pan {
  const offset = clampOffset(pan.offset + delta);
  return {
    offset,
    // At the limit the throw dies with the drag, so a reader pushing against
    // the end of the range does not get a rebound they did not ask for.
    velocity: offset === pan.offset ? 0 : delta,
  };
}

/** Coast one frame. `dragging` holds the throw while the pointer is down. */
export function advancePan(pan: Pan, dragging: boolean): Pan {
  if (dragging) {
    return pan;
  }
  const velocity = pan.velocity * FRICTION;
  if (Math.abs(velocity) < REST_SPEED) {
    return { offset: pan.offset, velocity: 0 };
  }
  const offset = clampOffset(pan.offset + velocity);
  return { offset, velocity: offset === pan.offset ? 0 : velocity };
}

/**
 * Where the palette sits for a given pan, 0 red and 1 blue.
 *
 * The drag is the only input the hero has, so it drives the colour too: push
 * the range west and the light burns red, push it east and it cools to cobalt.
 * One gesture, everything answers to it.
 */
export function panToPalette(offset: number): number {
  return Math.min(1, Math.max(0, 0.5 + offset / (PAN_LIMIT * 2)));
}

export type LookOffset = {
  yaw: number;
  pitch: number;
};

export const LOOK_LIMITS = {
  yaw: 0.72,
  pitch: 0.22,
} as const;

export const LOOK_SENSITIVITY = {
  mouse: 0.0048,
  touch: 0.0034,
} as const;

const LOOK_GESTURE_PX = 8;

export const REST_LOOK: LookOffset = { yaw: 0, pitch: 0 };

export function clampLookAxis(value: number, limit: number): number {
  if (value < -limit) {
    return -limit;
  }
  if (value > limit) {
    return limit;
  }
  return value;
}

export function clampLookOffset(offset: LookOffset): LookOffset {
  return {
    yaw: clampLookAxis(offset.yaw, LOOK_LIMITS.yaw),
    pitch: clampLookAxis(offset.pitch, LOOK_LIMITS.pitch),
  };
}

export function lookSensitivityForPointer(pointerType: string): number {
  if (pointerType === "touch") {
    return LOOK_SENSITIVITY.touch;
  }
  return LOOK_SENSITIVITY.mouse;
}

export function lookFromPointerDelta(
  current: LookOffset,
  dx: number,
  dy: number,
  sensitivity: number,
): LookOffset {
  return clampLookOffset({
    yaw: current.yaw - dx * sensitivity,
    pitch: current.pitch + dy * sensitivity,
  });
}

export function isHorizontalLookGesture(dx: number, dy: number): boolean {
  return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > LOOK_GESTURE_PX;
}

export function isVerticalScrollGesture(dx: number, dy: number): boolean {
  return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > LOOK_GESTURE_PX;
}

/**
 * How much free look to allow, from the flight's station focus.
 *
 * Driven by focus rather than by raw scroll: the tour parks at six sites now,
 * and letting the reader look around only at the first one wasted the other
 * five. Full range while the camera is parked, none while it is in transit —
 * during a transfer the camera is already swinging its aim from one site to
 * the next, and adding pointer orbit on top of that just reads as drift.
 */
export function lookExploreScale(focus: number): number {
  if (focus < 0) {
    return 0;
  }
  if (focus > 1) {
    return 1;
  }
  return focus;
}

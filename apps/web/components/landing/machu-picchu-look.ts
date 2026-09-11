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

/** Look is strongest on the hero chapter and fades as scroll drives later stops. */
export function lookExploreScale(progress: number): number {
  const fade = 1 - progress / 0.24;
  if (fade < 0) {
    return 0;
  }
  if (fade > 1) {
    return 1;
  }
  return fade;
}

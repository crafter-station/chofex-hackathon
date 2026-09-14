import { expect, test } from "bun:test";

import {
  CAMERA_DAMPING,
  clampFrameDelta,
  dampedFraction,
  followScroll,
  turnFraction,
} from "./camera-damping";

test("closes exactly half the distance in one half-life", () => {
  expect(dampedFraction(0.12, 0.12)).toBeCloseTo(0.5, 10);
  expect(dampedFraction(0.12, 0.24)).toBeCloseTo(0.75, 10);
  expect(dampedFraction(0.12, 0)).toBe(0);
});

test("smooths identically at any frame rate", () => {
  /*
   * The bug this rules out: a fixed per-frame factor smooths twice as fast on
   * a 120 Hz display as on a 60 Hz one, and a dropped frame silently halves
   * the damping. Two 60 Hz steps have to land where one 30 Hz step does.
   */
  const target = 1;
  let fast = 0;
  for (let step = 0; step < 4; step += 1) {
    fast = followScroll(fast, target, 1 / 120);
  }
  let slow = 0;
  for (let step = 0; step < 2; step += 1) {
    slow = followScroll(slow, target, 1 / 60);
  }
  const once = followScroll(0, target, 1 / 30);

  expect(fast).toBeCloseTo(slow, 12);
  expect(slow).toBeCloseTo(once, 12);
});

test("approaches the target without overshooting it", () => {
  let at = 0;
  let previous = -1;
  for (let step = 0; step < 600; step += 1) {
    at = followScroll(at, 1, 1 / 60);
    // Monotone and never past the target: an overshoot here would read as the
    // camera rebounding off every station it settles on. Once it converges to
    // float precision it stops advancing, which is arrival, not a stall.
    expect(at).toBeGreaterThanOrEqual(previous);
    expect(at).toBeLessThanOrEqual(1);
    previous = at;
  }
  expect(at).toBeCloseTo(1, 6);

  // Symmetric going backwards, for a reader scrolling up.
  let back = 1;
  for (let step = 0; step < 600; step += 1) {
    back = followScroll(back, 0, 1 / 60);
    expect(back).toBeGreaterThanOrEqual(0);
  }
  expect(back).toBeCloseTo(0, 6);
});

test("settles a violent flick in well under a second", () => {
  // A third of the page in one frame is about as hard as a trackpad fling gets.
  let at = 0;
  let frames = 0;
  while (Math.abs(0.33 - at) > 0.33 * 0.02 && frames < 600) {
    at = followScroll(at, 0.33, 1 / 60);
    frames += 1;
  }
  /*
   * Inside 2% of the destination in about 0.7 s. That is the tail, not the
   * motion: half the distance is gone in 0.12 s and 90% within 0.4 s, so the
   * flick reads as a glide that arrives promptly and then settles. Much slower
   * and the camera stops feeling connected to the reader's input.
   */
  expect(frames / 60).toBeLessThan(0.8);
  expect(frames / 60).toBeGreaterThan(0.2);
  // The bulk of it lands early, which is what keeps it from feeling laggy.
  let half = 0;
  for (let step = 0; step < 24; step += 1) {
    half = followScroll(half, 0.33, 1 / 60);
  }
  expect(half).toBeGreaterThan(0.33 * 0.85);
});

test("refuses to believe a frame longer than the clamp", () => {
  /*
   * The render loop stops while the hero is offscreen or the tab is hidden, so
   * the frame that resumes it can report several seconds. Unclamped that means
   * "catch up completely" — an instant jump, arriving exactly when the reader
   * scrolls back to the hero.
   */
  expect(clampFrameDelta(4)).toBe(CAMERA_DAMPING.maxFrameDelta);
  expect(clampFrameDelta(1 / 60)).toBeCloseTo(1 / 60, 12);
  expect(clampFrameDelta(0)).toBe(0);
  expect(clampFrameDelta(-1)).toBe(0);
  expect(clampFrameDelta(Number.NaN)).toBe(0);

  const resumed = followScroll(0, 1, 30);
  expect(resumed).toBeLessThan(0.4);
});

test("never turns faster than the measured ceiling", () => {
  /*
   * The cap is the answer to the actual complaint. Two transfers on the solved
   * path — Moray to Maras and Maras to Ollantaytambo, whose framing bearings
   * are nearly opposed — pack 70 to 90 degrees of turn into 2% of the page.
   * Scrolled hard, that is over 3,000 deg/s of rotation.
   */
  for (const delta of [1 / 120, 1 / 60, 1 / 30]) {
    for (const angle of [0.2, 1, 2, Math.PI]) {
      const turned = angle * turnFraction(angle, delta);
      const rate = turned / delta;
      expect(rate).toBeLessThanOrEqual(CAMERA_DAMPING.maxTurnRate + 1e-9);
    }
  }
});

test("leaves an ordinary scroll alone", () => {
  /*
   * A limiter, not a general slowdown. A calm read demands about 59 deg/s at
   * the 90th percentile, well under the ceiling, so at those rates the
   * fraction has to come from the damping rather than the cap — otherwise
   * normal scrolling would feel laggy everywhere to fix two spikes.
   */
  const delta = 1 / 60;
  const gentle = ((40 * Math.PI) / 180) * delta;
  expect(turnFraction(gentle, delta)).toBeCloseTo(
    dampedFraction(CAMERA_DAMPING.turnHalfLife, delta),
    10,
  );
});

test("treats an arrived rotation as arrived", () => {
  // Otherwise the camera crawls asymptotically toward an angle it has already
  // reached, and the residual jitter shows up as a shimmering horizon.
  expect(turnFraction(0, 1 / 60)).toBe(1);
  expect(turnFraction(1e-9, 1 / 60)).toBe(1);
  // A paused loop must not rotate at all.
  expect(turnFraction(1, 0)).toBe(0);
});

test("keeps rotation weightier than translation", () => {
  // Rotation is what reads as harsh, so it settles a little slower than the
  // position does. If this ever inverts, the view snaps while the rig glides.
  expect(CAMERA_DAMPING.turnHalfLife).toBeGreaterThan(
    CAMERA_DAMPING.scrollHalfLife,
  );
});

import { expect, test } from "bun:test";

import { SACRED_SITES } from "./sacred-valley-place";
import {
  SITE_STRUCTURE_METRICS,
  SITE_STRUCTURES_GLB,
} from "./site-structures-place";

/*
 * These assert the *generated geometry* against the published dimensions of
 * the real places, in metres.
 *
 * The measurements come from the build, which reads them off the vertices it
 * actually emitted and converts each axis separately — the scene is
 * anisotropic, 200 m per unit across and 100 m per unit up, so a bounding box
 * in scene units means nothing on its own. Checking the converted numbers is
 * what makes a claim like "Moray's bowl is 130 m across" a fact the build
 * verifies rather than a comment that rots.
 *
 * This is not hypothetical: the first version of the bowl came out 303 m
 * across, 2.3x the real site, and nothing caught it until these numbers
 * existed.
 */

test("ships the structures as a content-stamped public GLB", () => {
  expect(SITE_STRUCTURES_GLB.startsWith("/models/site-structures.glb")).toBe(
    true,
  );
  // Stamped by shape, not by value: the digest is meant to change with the
  // bytes, so pinning it would fail on every rebuild and mean nothing.
  expect(SITE_STRUCTURES_GLB).toMatch(/\?v=[0-9a-f]{8,}$/);
});

test("covers every site the tour stops at", () => {
  const modelled = Object.keys(SITE_STRUCTURE_METRICS).sort();
  const visited = Object.keys(SACRED_SITES).sort();
  expect(modelled).toEqual(visited);
});

test("builds Moray to the published survey", () => {
  const moray = SITE_STRUCTURE_METRICS.moray;
  // ~65 m rim radius, so about 130 m across.
  expect(moray.widthM).toBeGreaterThan(120);
  expect(moray.widthM).toBeLessThan(145);
  // Round, within the deliberate irregularity of the rings.
  expect(Math.abs(moray.widthM - moray.depthM)).toBeLessThan(8);
  // And about 30 m from rim to floor.
  expect(moray.reliefM).toBeGreaterThan(27);
  expect(moray.reliefM).toBeLessThan(34);
});

test("keeps every site's structures inside the ground its camera frames", () => {
  for (const [name, metrics] of Object.entries(SITE_STRUCTURE_METRICS)) {
    // Nothing may sprawl past the reach the generator was given, or the
    // terraces stop belonging to a site and start ringing the whole massif.
    expect(metrics.reachM).toBeLessThan(620);
    expect(metrics.reachM).toBeGreaterThan(50);
    expect(metrics.triangles).toBeGreaterThan(0);
    expect(name.length).toBeGreaterThan(0);
  }
});

test("stays within a budget the aerial framing can justify", () => {
  const total = Object.values(SITE_STRUCTURE_METRICS).reduce(
    (sum, metrics) => sum + metrics.triangles,
    0,
  );
  /*
   * At the tour's 5 to 8 km stand-off one pixel is about 8 m of ground, so
   * detail below roughly 20 m cannot survive to the screen however many
   * triangles pay for it. This budget is what keeps the layer honest about
   * modelling massing rather than elements.
   */
  expect(total).toBeLessThan(12000);
  expect(total).toBeGreaterThan(2000);
});

test("gives the salt pans real relief down their ravine", () => {
  // The pans cascade; a flat field would lose the one thing that reads from
  // the air, which is a pale sheet spilling down a slope.
  expect(SITE_STRUCTURE_METRICS.maras.reliefM).toBeGreaterThan(60);
});

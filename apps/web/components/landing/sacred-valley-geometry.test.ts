import { expect, test } from "bun:test";
import {
  clamp01,
  lerp,
  METERS_PER_UNIT,
  SACRED_SITES,
  SACRED_VALLEY_GLB,
  SCENE_FAR_PLANE,
  samplePath,
  smoothstep,
  TERRAIN_MODEL_SCALE,
  TERRAIN_SIZE,
  URUBAMBA_PATH,
  VALLEY_PLACES,
  WORLD_FIGURES,
  worldScrollTop,
} from "./sacred-valley-geometry";
import { SACRED_VALLEY_MODEL_PATH } from "./sacred-valley-place";

test("points the hero model at the public glb path, content-stamped", () => {
  expect(SACRED_VALLEY_MODEL_PATH).toBe("/models/sacred-valley.glb");
  expect(SACRED_VALLEY_GLB.startsWith(SACRED_VALLEY_MODEL_PATH)).toBe(true);
  /*
   * The stamp is asserted by shape, never by value. Its whole job is to change
   * with the bytes, so pinning the digest would turn every terrain rebuild
   * into a failing test — and the failure would say nothing.
   */
  expect(SACRED_VALLEY_GLB).toMatch(/\?v=[0-9a-f]{8,}$/);
  expect(TERRAIN_MODEL_SCALE).toBeGreaterThan(0);
});

test("sees the whole corridor within the far plane", () => {
  expect(TERRAIN_SIZE.width).toBeGreaterThan(TERRAIN_SIZE.depth);
  expect(SCENE_FAR_PLANE).toBeGreaterThan(TERRAIN_SIZE.width);
});

test("maps scroll onto a section without dividing by zero", () => {
  expect(
    worldScrollTop({
      sectionOffsetTop: 100,
      sectionHeight: 4000,
      viewportHeight: 1000,
      progress: 0.34,
    }),
  ).toBe(1120);
  // A section shorter than the viewport has no scrollable range at all.
  expect(
    worldScrollTop({
      sectionOffsetTop: 80,
      sectionHeight: 500,
      viewportHeight: 900,
      progress: 0.5,
    }),
  ).toBe(80);
});

test("clamps and eases without running past its ends", () => {
  expect(clamp01(-3)).toBe(0);
  expect(clamp01(3)).toBe(1);
  expect(smoothstep(0, 1, 0)).toBe(0);
  expect(smoothstep(0, 1, 1)).toBe(1);
  expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 6);
  expect(lerp(10, 20, 0.25)).toBe(12.5);
});

test("traces the Urubamba downstream from Pisac to Ollantaytambo", () => {
  expect(URUBAMBA_PATH.length).toBeGreaterThan(32);

  const source = URUBAMBA_PATH[0] as readonly [number, number, number];
  const mouth = URUBAMBA_PATH[URUBAMBA_PATH.length - 1] as readonly [
    number,
    number,
    number,
  ];

  // Both ends should land on their towns, and the river should lose height.
  expect(
    Math.hypot(
      source[0] - VALLEY_PLACES.pisac.position[0],
      source[2] - VALLEY_PLACES.pisac.position[2],
    ),
  ).toBeLessThan(4);
  expect(
    Math.hypot(
      mouth[0] - VALLEY_PLACES.ollantaytambo.position[0],
      mouth[2] - VALLEY_PLACES.ollantaytambo.position[2],
    ),
  ).toBeLessThan(4);
  expect(mouth[1]).toBeLessThan(source[1]);

  // Every point has to sit inside the terrain the mesh actually covers.
  for (const point of URUBAMBA_PATH) {
    expect(Math.abs(point[0])).toBeLessThanOrEqual(TERRAIN_SIZE.width / 2);
    expect(Math.abs(point[2])).toBeLessThanOrEqual(TERRAIN_SIZE.depth / 2);
  }
});

test("interpolates a path without overshooting its ends", () => {
  const start = samplePath(URUBAMBA_PATH, 0);
  const end = samplePath(URUBAMBA_PATH, 1);
  const first = URUBAMBA_PATH[0] as readonly number[];
  const last = URUBAMBA_PATH[URUBAMBA_PATH.length - 1] as readonly number[];

  for (let axis = 0; axis < 3; axis += 1) {
    expect(start[axis]).toBeCloseTo(first[axis] as number, 6);
    expect(end[axis]).toBeCloseTo(last[axis] as number, 6);
  }

  // Clamped, so out-of-range scroll cannot fling the camera off the terrain.
  expect(samplePath(URUBAMBA_PATH, -1)).toEqual(start);
  expect(samplePath(URUBAMBA_PATH, 2)).toEqual(end);
});

test("degenerate paths do not throw", () => {
  expect(samplePath([], 0.5)).toEqual([0, 0, 0]);
  expect(samplePath([[1, 2, 3]], 0.5)).toEqual([1, 2, 3]);
});

test("labels the five real sites, not invented scan figures", () => {
  expect(WORLD_FIGURES.map((figure) => figure.id)).toEqual([
    "pisac",
    "moray",
    "maras",
    "ollantaytambo",
    "machupicchu",
  ]);

  // The old HUD framed made-up targets called TALENTO and ÉLITE. The landing's
  // whole claim is that the terrain is real, so the markers have to be too.
  const blob = JSON.stringify(WORLD_FIGURES);
  expect(blob).not.toMatch(/TALENTO|ÉLITE|SEÑAL|FILTRO/);

  for (const figure of WORLD_FIGURES) {
    expect(figure.label.length).toBeGreaterThan(0);
    // Every quoted elevation is a real Andean one, not a placeholder.
    expect(figure.elevation).toBeGreaterThan(2000);
    expect(figure.elevation).toBeLessThan(4000);
  }
});

test("keeps every town anchor on the terrain", () => {
  for (const place of Object.values(VALLEY_PLACES)) {
    expect(Math.abs(place.position[0])).toBeLessThanOrEqual(
      TERRAIN_SIZE.width / 2,
    );
    expect(Math.abs(place.position[2])).toBeLessThanOrEqual(
      TERRAIN_SIZE.depth / 2,
    );
    expect(place.label.length).toBeGreaterThan(0);
  }
});

test("knows which site the corridor mesh does not cover", () => {
  // Machu Picchu is ~30 km past the corridor's western edge and ships as its
  // own GLB. Everything else has to be inside, or its camera stop would be
  // parked over a hole.
  for (const [id, site] of Object.entries(SACRED_SITES)) {
    const inside =
      Math.abs(site.position[0]) <= TERRAIN_SIZE.width / 2 &&
      Math.abs(site.position[2]) <= TERRAIN_SIZE.depth / 2;
    expect(site.onTerrain).toBe(inside);
    expect(inside).toBe(id !== "machupicchu");
  }
});

test("places Moray on the Maras plateau, not on the town of Urubamba", () => {
  // The brief this was built from gave Moray's coordinates as -13.3042,
  // -72.1167 — which is the town of Urubamba, 9 km away on the valley floor.
  // Moray is up on the plateau, and being on the plateau is the whole point:
  // that is why it has the temperature gradient the copy quotes.
  expect(SACRED_SITES.moray.latitude).toBeCloseTo(-13.3296, 4);
  expect(SACRED_SITES.moray.longitude).toBeCloseTo(-72.1947, 4);

  const urubamba = VALLEY_PLACES.urubamba.position;
  const moray = SACRED_SITES.moray.position;
  const apart =
    Math.hypot(moray[0] - urubamba[0], moray[2] - urubamba[2]) *
    METERS_PER_UNIT;
  expect(apart).toBeGreaterThan(8000);

  // And it stands well above the valley floor it was confused with.
  expect(moray[1]).toBeGreaterThan(urubamba[1] + 5);
});

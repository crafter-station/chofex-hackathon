import {
  METERS_PER_UNIT,
  SACRED_SITES,
  SACRED_VALLEY_GLB_URL,
  type SacredSiteId,
  type ScenePoint,
  TERRAIN_SIZE,
  URUBAMBA_PATH,
  VALLEY_PLACES,
} from "@/components/landing/sacred-valley-place";

/**
 * What the loader actually fetches: the HeroScene path plus a content stamp.
 *
 * `HERO_SCENE_MODEL_URL` stays the clean public path — it is what the DOM
 * advertises and what a human types — while this carries a hash of the mesh
 * bytes. Filenames are stable across rebuilds, which is exactly what lets a
 * browser keep serving a stale mesh, and with three meshes that have to agree
 * with each other a stale one is no longer cosmetic: an old corridor beside a
 * freshly built western terrain is a visible seam.
 */
export const SACRED_VALLEY_GLB = SACRED_VALLEY_GLB_URL;

/** Terrain is authored directly in scene units by the build script. */
export const TERRAIN_MODEL_SCALE = 1;

/**
 * Far plane for the hero camera.
 *
 * The tour now runs past the corridor's own width: the last station sits over
 * Machu Picchu, ~420 units from the far end of the valley. Nothing at that
 * range survives the fog, but the plane still has to be beyond it or the
 * terrain would be clipped away before the fog could dissolve it.
 */
export const SCENE_FAR_PLANE = 620;

export function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function smoothstep(
  edge0: number,
  edge1: number,
  value: number,
): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function lerpTriple(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [
    lerp(from[0], to[0], t),
    lerp(from[1], to[1], t),
    lerp(from[2], to[2], t),
  ];
}

/**
 * Centripetal-ish Catmull-Rom over a polyline.
 *
 * Kept as plain arithmetic rather than `THREE.CatmullRomCurve3` so the flight
 * can be unit tested without standing up a WebGL context, and so the module
 * stays importable from the server.
 */
export function samplePath(
  points: readonly ScenePoint[],
  t: number,
): ScenePoint {
  if (points.length === 0) {
    return [0, 0, 0];
  }
  if (points.length === 1) {
    return points[0] as ScenePoint;
  }

  const span = clamp01(t) * (points.length - 1);
  const index = Math.min(Math.floor(span), points.length - 2);
  const local = span - index;

  const p0 = points[Math.max(0, index - 1)] as ScenePoint;
  const p1 = points[index] as ScenePoint;
  const p2 = points[index + 1] as ScenePoint;
  const p3 = points[Math.min(points.length - 1, index + 2)] as ScenePoint;

  const t2 = local * local;
  const t3 = t2 * local;

  const axis = (a: number, b: number, c: number, d: number): number =>
    0.5 *
    (2 * b +
      (c - a) * local +
      (2 * a - 5 * b + 4 * c - d) * t2 +
      (-a + 3 * b - 3 * c + d) * t3);

  return [
    axis(p0[0], p1[0], p2[0], p3[0]),
    axis(p0[1], p1[1], p2[1], p3[1]),
    axis(p0[2], p1[2], p2[2], p3[2]),
  ];
}

export function worldScrollTop(input: {
  sectionOffsetTop: number;
  sectionHeight: number;
  viewportHeight: number;
  progress: number;
}): number {
  const total = input.sectionHeight - input.viewportHeight;
  if (total <= 0) {
    return input.sectionOffsetTop;
  }
  return input.sectionOffsetTop + total * clamp01(input.progress);
}

/**
 * A site the HUD can label while it is on screen.
 *
 * These replace the invented scan figures the hero used to project. Every
 * marker is now a real place with a measured position, which is the whole
 * argument the landing is making — so having the HUD point at fictional ones
 * was working against it.
 */
export type WorldFigure = {
  id: SacredSiteId;
  label: string;
  /** Published elevation in metres, for the readout. */
  elevation: number;
  position: [number, number, number];
};

export type ProjectedTarget = {
  id: string;
  label: string;
  elevation: number;
  x: number;
  y: number;
  visible: boolean;
};

export const WORLD_FIGURES: readonly WorldFigure[] = Object.entries(
  SACRED_SITES,
).map(([id, site]) => ({
  id: id as SacredSiteId,
  label: site.label,
  elevation: site.elevation,
  position: [site.position[0], site.position[1], site.position[2]],
}));

export {
  METERS_PER_UNIT,
  SACRED_SITES,
  type SacredSiteId,
  type ScenePoint,
  TERRAIN_SIZE,
  URUBAMBA_PATH,
  VALLEY_PLACES,
};

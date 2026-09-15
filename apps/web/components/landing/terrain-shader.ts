import * as THREE from "three";

/**
 * The valley, drawn as contour lines.
 *
 * One idea, carried properly: the range is sliced at a fixed elevation
 * interval and every slice is drawn as a thin white line. Nothing else. Where
 * the ground is steep the slices crowd and the face fills bright; where it is
 * gentle they spread and the ground goes black. All the form, all the value
 * and all the depth in the drawing come out of that one relationship.
 *
 * Things that were tried here and taken out, because each of them fought the
 * line rather than serving it: a world-space particle stipple (hazy, read as
 * dirt), a soft halo past the silhouette (turned crests into fog), a depth of
 * field (blurred away the foreground the reference draws sharpest), and a
 * broken-stroke pen (a contour line is a continuous slice, and breaking it
 * reads as noise, not as hand).
 *
 * Alpha-blended but depth-writing, which gives hidden-line removal for free: a
 * ridge in front of another wins the depth test and the lines behind it never
 * reach the frame. Without the depth write, every ridge in the cordillera shows
 * through every ridge in front of it and the whole thing reads as an x-ray.
 */

export const TERRAIN_VERTEX = /* glsl */ `
uniform float uHeight;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vElevation;
varying float vRange;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;

  /*
   * Elevation is carried unscaled, straight off the mesh.
   *
   * The model is stretched vertically to read as a cordillera rather than the
   * relief map it honestly is, and contour lines drawn against the stretched
   * height would space themselves by however much it was stretched. Off the
   * original elevation they stay a fixed number of metres apart whatever the
   * exaggeration, which is what a contour interval means.
   */
  vElevation = position.y;

  /*
   * Normals are not transformed by the model matrix, they are transformed by
   * its inverse transpose — and for the diagonal scale this mesh carries, that
   * is just the vertical component divided by the exaggeration. Running the
   * normal through the model matrix instead tilts every face toward the
   * horizontal by exactly the factor the geometry was stretched.
   */
  vWorldNormal = normalize(vec3(normal.x, normal.y / uHeight, normal.z));

  vec4 viewPos = viewMatrix * world;
  vRange = -viewPos.z;
  gl_Position = projectionMatrix * viewPos;
}
`;

export const TERRAIN_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uInk;
uniform vec3 uLightDir;
uniform float uContour;     // vertical spacing between slices, in scene units
uniform float uRange;       // distance at which the drawing dissolves
uniform float uLinePixels;  // stroke width, in device pixels
uniform vec2 uExtent;       // half-extent of the terrain tile, in scene units
uniform float uEdgeFade;    // how far in from the tile edge the ink dissolves
uniform float uEdge;        // weight of the silhouette line
uniform float uShade;       // how much the light varies the stroke
uniform float uOpacity;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vElevation;
varying float vRange;

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 toEye = normalize(cameraPosition - vWorldPos);

  /*
   * Distance to the nearest slice, measured in PIXELS rather than in metres.
   *
   * This is the whole character of the drawing. Dividing by the screen-space
   * derivative keeps the stroke one pixel wide wherever the slope is gentle —
   * and where a face steepens and the slices crowd past a pixel apart, the
   * measure collapses and the coverage saturates, so the face fills solid
   * white. Every value in the reference comes from that: bright crowded flanks,
   * black open ground, and no shading anywhere.
   */
  /*
   * The interval opens with distance and tightens in the foreground.
   *
   * Both ends earn it. Far off, a fine interval crowds a dozen slices into a
   * pixel and the cordillera moires; close up, the ground the camera stands
   * over is the smooth valley floor, where 35 m of rise can take half a
   * kilometre and a fine interval is the only thing that puts any line there at
   * all. One spacing for the whole frame leaves either the back as noise or the
   * front as an empty black shelf.
   */
  float depth = smoothstep(uRange * 0.02, uRange * 0.45, vRange);
  float spacing = uContour * mix(0.85, 2.2, depth);
  float band = vElevation / spacing;
  float toLine = abs(fract(band) - 0.5) / max(fwidth(band), 1e-5);
  float contour = 1.0 - smoothstep(0.0, uLinePixels, toLine);

  // The rim where the surface turns away from the eye. Thin, and only there to
  // close the silhouette the slices leave open at a crest.
  float grazing = 1.0 - abs(dot(normal, toEye));
  float edge = smoothstep(0.86, 0.995, grazing) * uEdge;

  // Aerial perspective in ink: the far cordillera is drawn with a lighter hand
  // and then stops being drawn at all, rather than ending at a hard edge.
  float fade = 1.0 - smoothstep(uRange * 0.55, uRange, vRange);

  /*
   * The tile has edges, and a camera that turns all the way round will find
   * them. The mesh is a rectangle of finite ground: from most bearings its
   * boundary is behind the viewer or past the fog, but on a full revolution it
   * swings into frame as a dead straight line across the drawing — the one
   * shape a mountain range never has. Dissolving the ink over the last stretch
   * before the boundary turns that cut into a horizon.
   */
  fade *= smoothstep(uExtent.x, uExtent.x - uEdgeFade, abs(vWorldPos.x));
  fade *= smoothstep(uExtent.y, uExtent.y - uEdgeFade, abs(vWorldPos.z));

  // A light touch of light. Not shading — the drawing has none — just enough
  // that the faces turned toward the sun draw a shade harder than the others.
  float lambert = clamp(dot(normal, normalize(uLightDir)) * 0.5 + 0.5, 0.0, 1.0);
  float lit = (1.0 - uShade) + uShade * lambert;

  float ink = clamp(max(contour, edge), 0.0, 1.0) * fade * lit * uOpacity;

  if (ink < 0.004) {
    // Still writes depth: this fragment is paper, and paper hides what is
    // behind it. Only the ink is skipped.
    gl_FragColor = vec4(uInk, 0.0);
    return;
  }

  gl_FragColor = vec4(uInk, ink);
}
`;

export type TerrainInkOptions = {
  /** Vertical exaggeration the mesh is drawn at, so normals can be corrected. */
  readonly height?: number;
  /** Vertical spacing between slices, in scene units. */
  readonly contour?: number;
  readonly range?: number;
  readonly linePixels?: number;
  /** Half-extent of the tile in x and z, so the ink can dissolve at its edge. */
  readonly extent?: readonly [number, number];
  readonly edgeFade?: number;
  readonly edge?: number;
  readonly shade?: number;
  readonly opacity?: number;
};

/**
 * Contour spacing, in scene units.
 *
 * Heights in this model carry a 2x exaggeration over a 200 m ground unit, so
 * one vertical unit is 100 m of real elevation and this is a 55 m interval.
 *
 * It tracks the exaggeration: the interval is measured against the mesh's own
 * elevation, so stretching the geometry spreads the lines across the screen by
 * the same factor. Raising the exaggeration without tightening this leaves the
 * range drawn in a handful of lines and reading as dark noise.
 * Finer than that and the crowding stops being local to the steep flanks: at
 * 35 m every surface in the frame saturated and the range came back as one
 * bright mass with no valleys in it. The light in the reference comes from
 * SOME faces crowding, which needs the rest of them not to.
 */
export const CONTOUR_SPACING = 0.4;

/** Pure white. The reference has no warmth in the line at all. */
export const INK = new THREE.Color("#ffffff");

/** A high, raking sun, so most faces carry some light. */
export const LIGHT = new THREE.Vector3(210, 120, 130).normalize();

export function createTerrainInk(
  options: TerrainInkOptions = {},
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: TERRAIN_VERTEX,
    fragmentShader: TERRAIN_FRAGMENT,
    uniforms: {
      uInk: { value: INK.clone() },
      uHeight: { value: options.height ?? 1 },
      uLightDir: { value: LIGHT.clone() },
      uContour: { value: options.contour ?? CONTOUR_SPACING },
      uRange: { value: options.range ?? 620 },
      uLinePixels: { value: options.linePixels ?? 0.95 },
      uExtent: {
        value: new THREE.Vector2(...(options.extent ?? [1e6, 1e6])),
      },
      uEdgeFade: { value: options.edgeFade ?? 45 },
      uEdge: { value: options.edge ?? 0.85 },
      uShade: { value: options.shade ?? 0.22 },
      uOpacity: { value: options.opacity ?? 1 },
    },
    transparent: true,
    // Both, deliberately. See the note at the top of this file.
    depthTest: true,
    depthWrite: true,
    side: THREE.FrontSide,
  });
}

/**
 * Swap every material under a loaded GLB for the pen.
 *
 * Returns what it created so the caller can dispose it: these are freshly
 * compiled programs, not the shared ones the loader cached, and the GLB cache
 * will happily hand the same scene back on the next mount.
 */
export function applyTerrainInk(
  root: THREE.Object3D,
  options: TerrainInkOptions = {},
): THREE.ShaderMaterial[] {
  const created: THREE.ShaderMaterial[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    const source = child.material;
    const materials = Array.isArray(source) ? source : [source];
    const replaced = materials.map(() => {
      const ink = createTerrainInk(options);
      created.push(ink);
      return ink;
    });
    child.material = Array.isArray(source)
      ? replaced
      : (replaced[0] as THREE.Material);
  });

  return created;
}

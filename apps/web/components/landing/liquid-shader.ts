/**
 * The page's ground: a liquid field on black, with a glass lens on the cursor.
 *
 * Two rules carried over from the portfolio hero, and one that is this page's
 * own:
 *
 * 1. The liquid is STATIC. No clock, no drift, and no term that depends on
 *    where the cursor *is* — a cursor parked left and one parked right produce
 *    the identical frame.
 * 2. The cursor is a MAGNET. While it moves it bends the liquid locally around
 *    itself; the bend is driven by speed and springs to zero at rest, so the
 *    field is reabsorbed into exactly the picture it started from.
 * 3. It SETTLES. Colour pools along the foot of the frame and thins toward the
 *    top, so the hero opens on black with light lying in the bottom of it
 *    rather than on a full-bleed wash the drawing would have to fight.
 *
 * It renders once, fixed behind the whole landing, and every section sits on it
 * in transparent black.
 */

export const LIQUID_VERTEX = /* glsl */ `#version 300 es
in vec2 position;
out vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const LIQUID_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uRes;
uniform vec2 uLens;     // smoothed cursor, uv, y already flipped
uniform float uLensR;
uniform float uDistort; // magnet amplitude: speed driven, springs to 0 at rest
uniform vec2 uVel;      // smoothed cursor velocity, uv space
uniform float uScroll;  // viewports scrolled, drives the liquid's flow
uniform float uSettle;  // 1 gathers the liquid at the base line, 0 fills the frame
uniform float uBase;    // where the range meets the ground, in uv y
uniform float uDim;     // how much of the field survives below the hero

uniform vec3 uRim;
uniform vec3 uLow;
uniform vec3 uEdge;
uniform vec3 uBulk;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 M = mat2(0.80, -0.60, 0.60, 0.80);

float fbm(vec2 p) {
  float v = 0.0, a = 0.6;
  for (int i = 0; i < 3; i++) {
    v += a * noise2(p);
    p = M * p * 1.9 + 3.1;
    a *= 0.5;
  }
  return v;
}

/*
 * The magnet. Displaces the sampling coordinates in a neighbourhood of the
 * pointer and nowhere else, and only while the pointer is moving. At rest this
 * returns uv untouched, which is what makes the field provably static.
 */
vec2 magneticWarp(vec2 uv) {
  if (uDistort < 0.0002) return uv;

  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 d = (uv - uLens) * asp;
  float dist = length(d);
  float sigma = uLensR * 3.0;
  float fall = exp(-(dist * dist) / (2.0 * sigma * sigma));
  vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
  vec2 tang = vec2(-dir.y, dir.x);

  float pinch = -uDistort * fall * 0.38;
  float swirl = uDistort * fall * 0.24;
  vec2 drag = uVel * fall * 11.0;

  vec2 local = (dir * pinch + tang * swirl) / asp + drag;
  // A standing wave, not a translation: no net displacement, so it reads as the
  // surface rippling rather than sliding.
  vec2 breathe = vec2(sin(uv.y * 7.0), cos(uv.x * 7.0)) * uDistort * 0.0035;

  return uv + local + breathe;
}

/*
 * Two independent fields, which is what keeps "how much black" separate from
 * "red or blue": coverage decides where liquid exists at all, hue decides what
 * colour it is inside that. One field driving both is what turns a liquid into
 * a gradient mesh.
 */
vec3 gradient(vec2 uv) {
  vec2 p = uv;

  float sc = uScroll;
  p += vec2(0.05, -0.26) * sc;
  float ws = min(sc, 1.6);
  vec2 fw = vec2(fbm(p * 0.7 + vec2(0.0, sc * 0.55)), fbm(p * 0.7 + 6.3)) - 0.5;
  p += fw * ws * 0.34;

  vec2 w1 = vec2(fbm(p * 0.9), fbm(p * 0.9 + 4.7)) - 0.5;
  p += w1 * 0.72;

  float cover = fbm(p * 1.0 + 3.0);
  /*
   * Gravity, applied to the coverage field rather than to the colour. Raising
   * the threshold toward the top of the frame means the liquid simply stops
   * existing up there — black, not a dimmed wash — which is what keeps white
   * type and a white drawing above it readable.
   */
  /*
   * The colour gathers along the base of the range, not along the bottom of
   * the frame.
   *
   * Above the base line is sky and the drawing's silhouette needs black behind
   * it; below it is foreground and the type needs black to sit on. The band
   * between the two is where the range meets the ground, and that is the one
   * place the light can pool without taking anything away — it reads as
   * something glowing behind the mountains rather than a gradient bolted to
   * the bottom edge.
   */
  float sky = smoothstep(uBase, uBase + 0.45, uv.y);
  float ground = 1.0 - smoothstep(uBase - 0.40, uBase, uv.y);
  float atBase = exp(-pow((uv.y - uBase) / 0.22, 2.0));
  float lift = uSettle * (0.34 * sky + 0.16 * ground - 0.13 * atBase);
  float m = smoothstep(0.48 + lift, 0.64 + lift, cover);
  float hue = fbm(p * 1.35 + 11.0);

  vec3 black = vec3(0.008, 0.010, 0.016);
  vec3 liquid = uLow;
  liquid = mix(liquid, uEdge, smoothstep(0.35, 0.40, hue));
  liquid = mix(liquid, uBulk, smoothstep(0.37, 0.50, hue));
  liquid = mix(uRim, liquid, smoothstep(0.0, 0.22, m));

  return mix(black, liquid, m);
}

// Out of focus, so nothing in the background competes with an edge.
vec3 liquidAt(vec2 uv) {
  float r = 0.018;
  vec3 c = gradient(uv) * 1.2;
  c += gradient(uv + vec2(r, r) * 0.8);
  c += gradient(uv + vec2(-r, -r) * 0.8);
  c += gradient(uv + vec2(r, -r) * 0.8);
  c += gradient(uv + vec2(-r, r) * 0.8);
  return c / 5.2;
}

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);

  vec2 d = (uv - uLens) * asp;
  float dist = length(d);
  float R = uLensR;

  vec3 outside = liquidAt(magneticWarp(uv));
  vec3 col = outside;

  // The glass, carried by the cursor across the whole page.
  float edge = smoothstep(R, R - 0.006, dist);
  if (edge > 0.001) {
    float t = clamp(dist / R, 0.0, 1.0);
    float bulge = pow(1.0 - t, 0.5);
    float zoom = mix(1.0, 0.62, bulge);
    vec2 srcUv = uLens + (uv - uLens) * zoom;
    vec2 dir = dist > 0.0 ? d / dist : vec2(0.0);
    float ca = 0.010 * pow(t, 1.3);
    vec2 caOff = (dir / asp) * ca;

    // No magnetic warp inside the glass: the lens is a solid object, and
    // swirling its contents turns it into a vortex instead. The prism splits
    // the field itself, hardest at the rim.
    vec3 g = vec3(
      liquidAt(srcUv + caOff).r,
      liquidAt(srcUv).g,
      liquidAt(srcUv - caOff).b
    );

    /*
     * Glass shading, but only where there is liquid to look through.
     *
     * The rim darkening and the fresnel ring are what make the sphere read as
     * an object; over the black the field has drained to, they are all the
     * reader sees — a grey disc floating over nothing, with no liquid in it to
     * explain what it is. Scaling every term by how much light is actually
     * under the glass makes the lens appear as it crosses the pool and vanish
     * again when it leaves it.
     */
    float present = clamp(dot(g, vec3(0.2126, 0.7152, 0.0722)) * 6.0, 0.0, 1.0);

    g *= mix(1.0, 0.97, present);
    float rim = smoothstep(0.80, 1.0, t);
    g *= mix(1.0, mix(1.0, 0.72, rim), present);
    float ring = smoothstep(0.95, 0.99, t) * (1.0 - smoothstep(0.99, 1.035, t));
    g += ring * 0.22 * present;
    vec2 hp = (uv - (uLens - vec2(0.055, -0.06) / asp)) * asp;
    g += smoothstep(0.12, 0.0, length(hp)) * 0.12 * present;
    vec2 lp = (uv - (uLens + vec2(0.06, -0.07) / asp)) * asp;
    g *= 1.0 - smoothstep(0.02, 0.20, length(lp)) * 0.10 * present;

    col = mix(outside, g, edge);
  }

  /*
   * The field steps back once the hero is past.
   *
   * Measured, not judged: body copy sits directly on this with no card under
   * most of it, and at full strength the brightest patches of the pool put the
   * muted body colour at 2.5:1 and the burnt red at 2.6:1 — both well under AA,
   * and no choice of type colour fixes a background that reaches rgb(105,97,99)
   * wherever it likes. Dimming below the hero bounds the ground the type has to
   * clear, and the hero — which is all display sizes over black — keeps the
   * field at full strength.
   */
  col *= uDim;

  // Fixed grain, like film. A grain that shimmered on its own would break the
  // one promise the background makes.
  col += (hash21(gl_FragCoord.xy) - 0.5) * 0.09;

  vec2 vv = vUv - 0.5;
  col *= 1.0 - dot(vv, vv) * 0.42;

  fragColor = vec4(col, 1.0);
}
`;

/** Radius of the glass sphere, in uv. */
export const LENS_RADIUS = 0.16;

import * as THREE from "three";

/**
 * Procedural rock-detail normal map for the terrain.
 *
 * The Sentinel drape resolves about 15 m per texel and the mesh samples every
 * ~54 m. Both run out well before the camera does on the low passes, and the
 * near hillsides flatten into smooth pale sheets. Tiling a high-frequency
 * normal map over the whole corridor puts relief back at the scale the source
 * data cannot carry.
 *
 * Generated at runtime rather than shipped: it is noise, so a baked file would
 * be bytes spent on something reproducible in a few milliseconds.
 */

/**
 * Metres spanned by one repeat of the detail tile.
 *
 * This is a texel-density choice, not a feature-size one. At 110 m the tile
 * worked out to 0.43 m per texel, so the mip chain flattened it to nothing
 * before it ever reached the screen. At 600 m across a 256px tile each texel
 * is about 2.3 m, which survives mipping at the ranges the camera actually
 * flies and puts features in the 20-150 m band — gullies and spurs.
 */
const DETAIL_METRES = 600;

const SIZE = 256;

function hash(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Value noise that wraps on `period`, so the tile has no visible seam. */
function tileableNoise(
  x: number,
  y: number,
  period: number,
  seed: number,
): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const wrap = (value: number): number => ((value % period) + period) % period;
  const x0 = wrap(ix);
  const y0 = wrap(iy);
  const x1 = wrap(ix + 1);
  const y1 = wrap(iy + 1);

  return (
    hash(x0, y0, seed) * (1 - ux) * (1 - uy) +
    hash(x1, y0, seed) * ux * (1 - uy) +
    hash(x0, y1, seed) * (1 - ux) * uy +
    hash(x1, y1, seed) * ux * uy
  );
}

function heightAt(u: number, v: number): number {
  let total = 0;
  let amplitude = 1;
  let period = 4;
  let sum = 0;
  for (let octave = 0; octave < 4; octave += 1) {
    total += tileableNoise(u * period, v * period, period, octave) * amplitude;
    sum += amplitude;
    amplitude *= 0.5;
    period *= 2;
  }
  return total / sum;
}

/**
 * Build the tile. Returns null where there is no canvas to draw on, so server
 * rendering and headless tests can call this safely.
 */
export function createDetailNormalMap(repeat: number): THREE.Texture | null {
  if (typeof document === "undefined") {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const image = context.createImageData(SIZE, SIZE);
  const heights = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      heights[y * SIZE + x] = heightAt(x / SIZE, y / SIZE);
    }
  }

  // Central differences on the wrapped height field give the tangent-space
  // normal. glTF expects the OpenGL convention, so +G points along +V.
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const left = heights[y * SIZE + ((x - 1 + SIZE) % SIZE)] as number;
      const right = heights[y * SIZE + ((x + 1) % SIZE)] as number;
      const up = heights[((y - 1 + SIZE) % SIZE) * SIZE + x] as number;
      const down = heights[((y + 1) % SIZE) * SIZE + x] as number;

      const dx = (right - left) * 2.2;
      const dy = (down - up) * 2.2;
      const length = Math.hypot(dx, dy, 1);
      const offset = (y * SIZE + x) * 4;
      image.data[offset] = Math.round(((-dx / length) * 0.5 + 0.5) * 255);
      image.data[offset + 1] = Math.round(((-dy / length) * 0.5 + 0.5) * 255);
      image.data[offset + 2] = Math.round((1 / length) * 0.5 * 255 + 127.5);
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** How many times the tile repeats across a terrain `metres` wide. */
export function detailRepeat(metres: number): number {
  return Math.max(1, Math.round(metres / DETAIL_METRES));
}

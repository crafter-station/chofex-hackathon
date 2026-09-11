import { HERO_SCENE_MODEL_URL } from "@/components/landing/hero-scene";

/** Same public URL the HeroScene mount advertises. */
export const MACHU_PICCHU_GLB = HERO_SCENE_MODEL_URL;

/** Source-space bbox of the provided export (units before scene scale). */
export const MACHU_SOURCE_BBOX = {
  min: [-2025, 0, -2017],
  max: [2025, 1101, 2017],
} as const;

/** Fits the ~4 km source mesh into a navigable hero volume. */
export const MACHU_MODEL_SCALE = 0.036;

export type WorldChapter = "hero" | "valley" | "scan";

export const WORLD_CHAPTERS = [
  { id: "hero", label: "Cumbre", progress: 0 },
  { id: "valley", label: "Valle", progress: 0.34 },
  { id: "scan", label: "Escaneo", progress: 0.64 },
] as const;

export function chapterStartProgress(chapter: WorldChapter): number {
  if (chapter === "hero") {
    return 0;
  }
  if (chapter === "valley") {
    return 0.34;
  }
  return 0.64;
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

export type CameraKeyframe = {
  position: [number, number, number];
  lookAt: [number, number, number];
};

export type WorldFigure = {
  id: string;
  kind: "judge" | "candidate";
  label: string;
  position: [number, number, number];
};

export type ProjectedTarget = {
  id: string;
  kind: "judge" | "candidate";
  label: string;
  x: number;
  y: number;
  visible: boolean;
};

const CAMERA_STOPS: ReadonlyArray<{
  progress: number;
  frame: CameraKeyframe;
}> = [
  {
    progress: 0,
    frame: { position: [46, 18, 58], lookAt: [2, 9, -4] },
  },
  {
    progress: 0.22,
    frame: { position: [34, 14, 42], lookAt: [3, 8, -1] },
  },
  {
    progress: 0.46,
    frame: { position: [20, 9.5, 38], lookAt: [5.2, 2.6, 8.4] },
  },
  {
    progress: 0.74,
    frame: { position: [13, 7.8, 22], lookAt: [4.4, 2.3, 7.2] },
  },
  {
    progress: 1,
    frame: { position: [11, 8.4, 18], lookAt: [4.8, 2.5, 7.6] },
  },
];

export const WORLD_FIGURES: readonly WorldFigure[] = [
  { id: "j-01", kind: "judge", label: "QUISPE", position: [5.2, 0, 9.1] },
  { id: "j-02", kind: "judge", label: "VALLE", position: [9.8, 0, 8.4] },
  { id: "c-01", kind: "candidate", label: "TALENTO", position: [7.4, 0, 6.8] },
  { id: "c-02", kind: "candidate", label: "SIGNAL", position: [2.6, 0, 10.6] },
  {
    id: "c-03",
    kind: "candidate",
    label: "CANDIDATO",
    position: [8.8, 0, 11.4],
  },
  { id: "c-04", kind: "candidate", label: "BEST OF", position: [3.8, 0, 6.4] },
];

export function chapterFromProgress(progress: number): WorldChapter {
  if (progress < 0.34) {
    return "hero";
  }
  if (progress < 0.64) {
    return "valley";
  }
  return "scan";
}

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

export function sampleCameraPath(progress: number): CameraKeyframe {
  const p = clamp01(progress);
  let start = CAMERA_STOPS[0];
  let end = CAMERA_STOPS[CAMERA_STOPS.length - 1];

  for (let index = 0; index < CAMERA_STOPS.length - 1; index += 1) {
    const current = CAMERA_STOPS[index];
    const next = CAMERA_STOPS[index + 1];
    if (!current || !next) {
      continue;
    }
    if (p >= current.progress && p <= next.progress) {
      start = current;
      end = next;
      break;
    }
  }

  if (!start || !end) {
    return { position: [92, 40, 108], lookAt: [0, 14, -6] };
  }

  const span = end.progress - start.progress;
  let t = 0;
  if (span > 0) {
    t = smoothstep(0, 1, (p - start.progress) / span);
  }

  return {
    position: lerpTriple(start.frame.position, end.frame.position, t),
    lookAt: lerpTriple(start.frame.lookAt, end.frame.lookAt, t),
  };
}

export function scaledSourceSize(): {
  width: number;
  height: number;
  depth: number;
} {
  const width =
    (MACHU_SOURCE_BBOX.max[0] - MACHU_SOURCE_BBOX.min[0]) * MACHU_MODEL_SCALE;
  const height =
    (MACHU_SOURCE_BBOX.max[1] - MACHU_SOURCE_BBOX.min[1]) * MACHU_MODEL_SCALE;
  const depth =
    (MACHU_SOURCE_BBOX.max[2] - MACHU_SOURCE_BBOX.min[2]) * MACHU_MODEL_SCALE;
  return { width, height, depth };
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  return (
    hash2(ix, iy) * (1 - ux) * (1 - uy) +
    hash2(ix + 1, iy) * ux * (1 - uy) +
    hash2(ix, iy + 1) * (1 - ux) * uy +
    hash2(ix + 1, iy + 1) * ux * uy
  );
}

export function ridgeHeight(x: number, z: number): number {
  const noise = valueNoise(x * 0.04 + 3, z * 0.04 + 8);
  const huaynaDist = Math.hypot(x - 6, z + 38);
  const huayna = Math.max(0, 1 - huaynaDist / 20) ** 1.55 * 36;
  const saddleX = Math.exp(-(((x + 1) / 24) ** 2));
  const saddleZ = Math.exp(-(((z + 4) / 16) ** 2));
  const saddle = saddleX * saddleZ * 18;
  const valleyDrop = Math.max(0, x - 16) * 0.28 + Math.max(0, z - 8) * 0.18;

  let height = 4 + saddle + huayna + noise * 2.4 - valleyDrop;

  const plaza = Math.hypot(x - 6, z - 9);
  if (plaza < 14) {
    height = Math.max(0.15, height * 0.22);
  }

  return height;
}

export type CitadelBlock = {
  position: [number, number, number];
  size: [number, number, number];
};

export function buildCitadelBlocks(): CitadelBlock[] {
  const blocks: CitadelBlock[] = [];
  const originX = -4;
  const originZ = -6;

  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const skip = (row + col) % 5 === 0;
      if (skip) {
        continue;
      }
      const height = 1.1 + ((row * 3 + col) % 4) * 0.45;
      blocks.push({
        position: [originX + col * 2.15, height / 2, originZ + row * 1.85],
        size: [1.7, height, 1.45],
      });
    }
  }

  blocks.push({ position: [-1.2, 2.1, -8.4], size: [3.2, 4.2, 2.4] });
  blocks.push({ position: [3.4, 1.6, -5.2], size: [2.4, 3.2, 2.1] });
  return blocks;
}

export type TerraceStep = {
  position: [number, number, number];
  size: [number, number, number];
};

export function buildTerraceSteps(): TerraceStep[] {
  const steps: TerraceStep[] = [];
  for (let index = 0; index < 7; index += 1) {
    steps.push({
      position: [10 + index * 2.2, 0.18 + index * 0.08, -2 - index * 1.1],
      size: [18 - index * 1.1, 0.36, 2.4],
    });
  }
  return steps;
}

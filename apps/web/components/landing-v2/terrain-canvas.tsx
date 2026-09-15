"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type PointerEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import { ModelErrorBoundary } from "@/components/landing/model-error-boundary";
import {
  isHorizontalLookGesture,
  isVerticalScrollGesture,
} from "@/components/landing/sacred-valley-look";
import {
  SACRED_VALLEY_GLB,
  SCENE_FAR_PLANE,
  TERRAIN_MODEL_SCALE,
} from "@/components/landing/sacred-valley-geometry";
import { SITE_STRUCTURES_GLB } from "@/components/landing/site-structures-place";
import {
  advancePan,
  dragPan,
  type Pan,
  RESTING_PAN,
} from "@/components/landing-v2/pan";
import { applyTerrainInk } from "@/components/landing-v2/terrain-shader";

/** Same Draco decoder the lit hero uses — served locally, no CDN at runtime. */
const USE_DRACO = "/draco/";
const USE_MESHOPT = false;

/**
 * The vantage: high, far, and level with the range.
 *
 * Looking straight down turns a cordillera into a relief map — every peak reads
 * as a contour blob and nothing is silhouetted, because there is no sky in the
 * frame for anything to be silhouetted against. The eye is kept high but the
 * aim is level, so the range meets black sky along the top and the foreground
 * ridges run out of the bottom of the frame.
 *
 * The camera is parked: the reader is looking at an illustration, not flying
 * through it. Dragging turns the whole range about its own centre, which is the
 * difference between turning a model on a table and being taken somewhere.
 */
/*
 * Absolute heights, not an offset from the aim point.
 *
 * The earlier form added the eye height to the target's, which quietly put the
 * camera forty units higher than the number said and tilted the whole view
 * down with it. Naming both ends in world units makes the pitch something you
 * can read off the file.
 */
/*
 * The vantage sits INSIDE the terrain's footprint, which is the whole reason
 * there is a foreground at all.
 *
 * The corridor is a finite tile, 308 by 184 units. Parked outside it and
 * looking in, everything between the camera and the tile's near edge is empty
 * space, and that edge projects as a hard horizontal cut across the frame with
 * black below it — which is exactly what the first few attempts produced, and
 * no amount of fading or masking fixes a missing surface. From a point inside
 * the footprint the ground runs out from under the camera in every direction
 * and the near ridges sweep out of the bottom of the frame the way they do in
 * the reference.
 */
const ORBIT_RADIUS = 118;
/**
 * How far above the ground under it the eye rides.
 *
 * The camera is inside the range, not above it — that is the only way a peak
 * can stand against black sky — so its height cannot be a constant. Parked at a
 * fixed 54 units it spent most bearings *inside* a mountain: front faces
 * culled, everything near invisible, and a frame with distant ridges floating
 * over nothing. Riding a clearance above the measured ground keeps it in open
 * air at every bearing, and keeps the peaks elsewhere towering over it.
 */
const EYE_CLEARANCE = 22;
/** A floor for the valley bottoms, so the eye never scrapes the river. */
const MIN_EYE = 26;
/** How far below the eye the aim sits: a shallow look down the valley. */
const AIM_DROP = 15;

/**
 * Vertical exaggeration.
 *
 * The corridor is honest terrain: 25 units of relief across 308 of ground, an
 * eight percent rise. Seen from the side that is a crumpled sheet, not a
 * cordillera, and no camera position rescues it — the Andes in a drawing are
 * about as tall as they are wide. The mesh already carries a 2x exaggeration
 * from the build; this takes it to roughly the proportions the eye remembers,
 * which is what an illustration is for.
 *
 * Held to 2.2 rather than pushed further because the camera now stands inside
 * the range: every unit of stretch raises the peaks toward the eye, and past
 * this the vantage ends up inside a mountain on some bearings.
 */
const HEIGHT_GAIN = 2.4;
/**
 * How far a full drag swings the range, in radians.
 *
 * Half a radian either side, not a full turn. The corridor was framed from one
 * bearing and it has a good side; letting the reader spin it a hundred degrees
 * hands them views the composition was never checked against.
 */
const YAW_RANGE = 0.5;
/** Opening bearing, chosen so the corridor runs across the frame. */
const YAW_REST = -0.35;

const EYE = new THREE.Vector3();
const AIM = new THREE.Vector3();
const VERTEX = new THREE.Vector3();

/** How many bearings the ground profile is sampled at. */
const PROFILE_BINS = 180;
/** Half-width of the ring the profile samples, in scene units. */
const PROFILE_BAND = 10;

export type Vantage = {
  /** The highest point in the mesh, which is what the camera is aimed at. */
  readonly summit: THREE.Vector3;
  /** Ground height around the orbit circle, by bearing. */
  readonly ground: Float32Array;
};

/**
 * Find the range's summit and the ground around the circle drawn about it.
 *
 * Both in one pass over the vertices, and read straight off the position
 * attribute rather than raycast: the pass is milliseconds, where 180 rays
 * against a few hundred thousand un-accelerated triangles is seconds of blocked
 * main thread for the same answer.
 *
 * Orbiting the summit rather than the model's origin is what gives the frame a
 * subject. The origin of this corridor is the valley floor: a camera circling
 * it stands in a bowl with ridges of much the same height all around, which is
 * a claustrophobic frame with no horizon and nothing to look at. Circling the
 * highest massif puts it in the middle of every bearing, with sky above it.
 */
function surveyVantage(
  object: THREE.Object3D,
  radius: number,
  gain: number,
): Vantage {
  const summit = new THREE.Vector3(0, -Infinity, 0);

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    const position = child.geometry.getAttribute("position");
    if (!position) {
      return;
    }
    for (let i = 0; i < position.count; i += 1) {
      VERTEX.fromBufferAttribute(position, i);
      if (VERTEX.y * gain > summit.y) {
        summit.set(VERTEX.x, VERTEX.y * gain, VERTEX.z);
      }
    }
  });

  const ground = new Float32Array(PROFILE_BINS);

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    const position = child.geometry.getAttribute("position");
    if (!position) {
      return;
    }
    for (let i = 0; i < position.count; i += 1) {
      VERTEX.fromBufferAttribute(position, i);
      const dx = VERTEX.x - summit.x;
      const dz = VERTEX.z - summit.z;
      if (Math.abs(Math.hypot(dx, dz) - radius) > PROFILE_BAND) {
        continue;
      }
      // atan2(x, z), matching how the eye is placed from its yaw below.
      const yaw = Math.atan2(dx, dz);
      let bin = Math.floor(((yaw + Math.PI) / (Math.PI * 2)) * PROFILE_BINS);
      bin = ((bin % PROFILE_BINS) + PROFILE_BINS) % PROFILE_BINS;
      const height = VERTEX.y * gain;
      // The read is written this way because a typed-array index is
      // `number | undefined` under noUncheckedIndexedAccess.
      if (height > (ground[bin] ?? 0)) {
        ground[bin] = height;
      }
    }
  });

  return { summit, ground };
}

/** The sampled ground at a bearing, interpolated between bins. */
function groundAt(
  profile: Float32Array | null | undefined,
  yaw: number,
): number {
  if (!profile) {
    return 0;
  }
  const turn = ((yaw + Math.PI) / (Math.PI * 2)) * PROFILE_BINS;
  const low = Math.floor(turn);
  const t = turn - low;
  const a = profile[((low % PROFILE_BINS) + PROFILE_BINS) % PROFILE_BINS] ?? 0;
  const b =
    profile[(((low + 1) % PROFILE_BINS) + PROFILE_BINS) % PROFILE_BINS] ?? 0;
  return a + (b - a) * t;
}

function useInkedGltf(
  url: string,
  options?: Parameters<typeof applyTerrainInk>[1],
) {
  const gltf = useGLTF(url, USE_DRACO, USE_MESHOPT);
  const clone = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    const created = applyTerrainInk(clone, options ?? {});
    return () => {
      for (const material of created) {
        material.dispose();
      }
    };
  }, [clone, options]);

  return clone;
}

function ValleyInk({
  onDrawn,
  profileRef,
}: {
  readonly onDrawn?: () => void;
  readonly profileRef: { current: Vantage | null };
}) {
  const options = useMemo(() => ({ height: HEIGHT_GAIN }), []);
  const clone = useInkedGltf(SACRED_VALLEY_GLB, options);
  const sent = useRef(false);

  useEffect(() => {
    profileRef.current = surveyVantage(clone, ORBIT_RADIUS, HEIGHT_GAIN);
  }, [clone, profileRef]);

  useFrame(() => {
    if (sent.current || !onDrawn) {
      return;
    }
    sent.current = true;
    onDrawn();
  });

  return (
    <primitive
      object={clone}
      scale={[
        TERRAIN_MODEL_SCALE,
        TERRAIN_MODEL_SCALE * HEIGHT_GAIN,
        TERRAIN_MODEL_SCALE,
      ]}
    />
  );
}

function StructuresInk() {
  // Terraces and salt pans carry no drape, so the pen has nothing to trace but
  // their own faceting — which is the point: they read as ruled lines against
  // the mountain's wandering ones.
  const options = useMemo(
    () => ({ contour: 0.25, height: HEIGHT_GAIN, shade: 0.2 }),
    [],
  );
  const clone = useInkedGltf(SITE_STRUCTURES_GLB, options);
  // Stretched with the terrain it stands on, or it sinks into it.
  return <primitive object={clone} scale={[1, HEIGHT_GAIN, 1]} />;
}

function ParkedCamera({
  panRef,
  profileRef,
}: {
  readonly panRef: { current: Pan };
  readonly profileRef: { current: Vantage | null };
}) {
  const { camera } = useThree();
  const yaw = useRef(YAW_REST);
  const eyeHeight = useRef(MIN_EYE);

  useFrame(() => {
    const target = YAW_REST + panRef.current.offset * YAW_RANGE;
    // Eased, so a flick of the range coasts to a stop rather than snapping to
    // wherever the pointer was released.
    yaw.current += (target - yaw.current) * 0.12;

    const vantage = profileRef.current;
    const summit = vantage?.summit;
    const wanted = Math.max(
      MIN_EYE,
      groundAt(vantage?.ground, yaw.current) + EYE_CLEARANCE,
    );
    // Eased as well: the ground under the orbit rises and falls by tens of
    // units, and tracking it exactly makes the drag feel like a rollercoaster.
    eyeHeight.current += (wanted - eyeHeight.current) * 0.08;

    const cx = summit ? summit.x : 0;
    const cz = summit ? summit.z : 0;
    EYE.set(
      cx + Math.sin(yaw.current) * ORBIT_RADIUS,
      eyeHeight.current,
      cz + Math.cos(yaw.current) * ORBIT_RADIUS,
    );
    camera.position.copy(EYE);
    /*
     * Aimed at the massif's shoulder, not its top: pointing at the summit puts
     * it dead centre with the frame's whole lower half given over to the ground
     * between here and there. From the shoulder the peak rises into the upper
     * third and the sky opens above it.
     */
    AIM.set(cx, summit ? summit.y * 0.42 : eyeHeight.current - AIM_DROP, cz);
    camera.lookAt(AIM);
  });

  return null;
}

function PanLoop({
  panRef,
  draggingRef,
}: {
  readonly panRef: { current: Pan };
  readonly draggingRef: { current: boolean };
}) {
  useFrame(() => {
    panRef.current = advancePan(panRef.current, draggingRef.current);
  });
  return null;
}

export type TerrainCanvasProps = {
  readonly quality: "low" | "high";
  readonly onContextLost?: () => void;
  readonly onDrawn?: () => void;
};

export function TerrainCanvas({
  quality,
  onContextLost,
  onDrawn,
}: TerrainCanvasProps) {
  const panRef = useRef<Pan>(RESTING_PAN);
  const profileRef = useRef<Vantage | null>(null);
  const draggingRef = useRef(false);
  const gestureRef = useRef<{ x: number; y: number; pan: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" && event.button !== 0) {
      return;
    }
    gestureRef.current = {
      x: event.clientX,
      y: event.clientY,
      pan: panRef.current.offset,
    };
    if (event.pointerType === "touch") {
      // A touch has not committed to anything yet: it could still be the page
      // being scrolled, and claiming it here would trap the reader in the hero.
      return;
    }
    draggingRef.current = true;
    setGrabbing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) {
      return;
    }

    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;

    if (!draggingRef.current) {
      if (isVerticalScrollGesture(dx, dy)) {
        gestureRef.current = null;
        return;
      }
      if (!isHorizontalLookGesture(dx, dy)) {
        return;
      }
      draggingRef.current = true;
      setGrabbing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const travel = dx / Math.max(1, rect.width);
    const wanted = gesture.pan + travel * 2.4;
    panRef.current = dragPan(panRef.current, wanted - panRef.current.offset);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    gestureRef.current = null;
    draggingRef.current = false;
    setGrabbing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={`absolute inset-0 size-full ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerCancel={endDrag}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      style={{ touchAction: "pan-y" }}
    >
      <Canvas
        camera={{
          far: SCENE_FAR_PLANE,
          fov: 58,
          near: 1,
          position: [0, MIN_EYE, ORBIT_RADIUS],
        }}
        className="pointer-events-none absolute inset-0 size-full"
        dpr={quality === "high" ? [1, 1.5] : [1, 1]}
        gl={{
          alpha: true,
          antialias: quality === "high",
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          // No tone mapping: the drawing is ink on transparent, and a film
          // curve applied to "how much ink" means nothing.
          gl.toneMapping = THREE.NoToneMapping;
          gl.setClearColor("#000000", 0);
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              onContextLost?.();
            },
            { once: true },
          );
        }}
      >
        <ParkedCamera panRef={panRef} profileRef={profileRef} />
        <PanLoop draggingRef={draggingRef} panRef={panRef} />
        <ModelErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <ValleyInk onDrawn={onDrawn} profileRef={profileRef} />
          </Suspense>
        </ModelErrorBoundary>
        <ModelErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <StructuresInk />
          </Suspense>
        </ModelErrorBoundary>
      </Canvas>
    </div>
  );
}

useGLTF.preload(SACRED_VALLEY_GLB, USE_DRACO, USE_MESHOPT);

"use client";

import { cn } from "@chofex/ui/lib/utils";
import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type MutableRefObject,
  type PointerEvent,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import {
  followScroll,
  turnFraction,
} from "@/components/landing/camera-damping";
import {
  sampleCameraPath,
  shouldLoadWestTerrain,
  stationAt,
} from "@/components/landing/sacred-valley-flight";
import {
  type ProjectedTarget,
  SCENE_FAR_PLANE,
  WORLD_FIGURES,
} from "@/components/landing/sacred-valley-geometry";
import {
  isHorizontalLookGesture,
  isVerticalScrollGesture,
  type LookOffset,
  lookExploreScale,
  lookFromPointerDelta,
  lookSensitivityForPointer,
  REST_LOOK,
} from "@/components/landing/sacred-valley-look";
import {
  SacredValleyAsset,
  SiteStructuresAsset,
  WestTerrainAsset,
} from "@/components/landing/sacred-valley-model";
import { worldFrameLoop } from "@/components/landing/world-loop";
import {
  shouldPlaySceneEffects,
  worldMotionScale,
} from "@/components/landing/world-motion";

const LOOK = new THREE.Vector3();
const PROJECT = new THREE.Vector3();
const OFFSET = new THREE.Vector3();
const RIGHT = new THREE.Vector3();
const AIM = new THREE.Matrix4();
const FACING = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Where the framed site should sit across the frame, while its panel is up.
 *
 * Aiming dead centre is what a camera wants and the wrong thing here: the copy
 * panel covers the left half of a landscape viewport, so the subject the panel
 * is describing ends up behind it. Pushing the aim left moves the site into
 * the clear side without moving the camera, so the solved vantage — and its
 * terrain clearance — is untouched.
 */
const SUBJECT_ACROSS = 0.68;

type SceneQuality = "low" | "high";

/**
 * How far a site marker can be from the camera and still be labelled.
 *
 * 110 units is 22 km. The stops are aerial now — 4 to 8 km out — and pointing
 * the sites out from a distance is the whole job the HUD is left with, so this
 * has to reach well past the framed subject to catch its neighbours. It still
 * culls the case that made it necessary: Machu Picchu is 169 units from the
 * stop over Ollantaytambo, behind a cordillera and long since lost to fog, and
 * projection alone was happily labelling it.
 */
const MARKER_RANGE = 110;

export type SacredValleyCanvasProps = {
  readonly quality: SceneQuality;
  readonly progressRef: MutableRefObject<number>;
  readonly visible?: boolean;
  readonly reducedMotion?: boolean;
  readonly onContextLost?: () => void;
  readonly onWorldReady?: () => void;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
};

function WorldLights() {
  return (
    <>
      {/*
       * Exponential fog, not linear: the corridor runs 300+ units deep and
       * linear fog banded visibly across the ridge lines at that range.
       *
       * Density is the whole game for aerial perspective, and it is a balance
       * between two failures. At 0.0062 the far ridges collapsed into one flat
       * grey cut-out; at 0.0026 distance stopped reading at all and the ranges
       * stacked flat. Here the near hillsides — 40 to 80 units out — stay
       * lightly hazed while the far cordillera sits above 75%, which is what
       * separates the ridge lines into distinct receding planes.
       */}
      <fogExp2 attach="fog" args={["#000000", 0.0042]} />
      <ambientLight color="#ffffff" intensity={1} />
    </>
  );
}

function FlightCamera({
  progressRef,
  quality,
  reducedMotion,
  lookRef,
  draggingRef,
  onTargets,
}: {
  readonly progressRef: MutableRefObject<number>;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
  readonly lookRef: MutableRefObject<LookOffset>;
  readonly draggingRef: MutableRefObject<boolean>;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
}) {
  const { camera, size } = useThree();
  const frame = useRef(0);
  const smoothed = useRef<number | null>(null);
  const facing = useRef(false);

  useFrame(({ clock }, delta) => {
    /*
     * The camera trails the scroll rather than tracking it.
     *
     * It is the scroll *parameter* that is damped, not the camera's position
     * in space, and that is deliberate. The path was solved offline against
     * the elevation model, so every point on it is known to stand in open air;
     * easing the position directly would let the camera cut the chord across a
     * bend and fly through the ridge the solver went around. Easing the
     * parameter keeps it on the cleared path at all times and only changes how
     * fast it travels along it.
     *
     * First frame snaps: a reader who lands mid-page, or reloads there, should
     * open on their own scroll position rather than watch the hero fly in from
     * the top of the valley.
     */
    if (smoothed.current === null || reducedMotion) {
      smoothed.current = progressRef.current;
    } else {
      smoothed.current = followScroll(
        smoothed.current,
        progressRef.current,
        delta,
      );
    }
    const progress = smoothed.current;
    const path = sampleCameraPath(progress);
    const station = stationAt(progress);
    const time = clock.elapsedTime;
    const motion = worldMotionScale(reducedMotion);
    const explore = lookExploreScale(station.focus);
    const hold = draggingRef.current ? 0.12 : 1;
    const drift = (0.4 + explore * 0.6) * motion * hold;
    const look = lookRef.current;

    LOOK.set(path.lookAt[0], path.lookAt[1], path.lookAt[2]);
    OFFSET.set(
      path.position[0] - path.lookAt[0],
      path.position[1] - path.lookAt[1],
      path.position[2] - path.lookAt[2],
    );

    const portrait = size.height > size.width;
    if (portrait && station.id === "overlook") {
      OFFSET.multiplyScalar(1.18);
    }

    // Pointer look and idle drift both swing the camera around what it is
    // aimed at, so the subject stays put while the vantage moves.
    OFFSET.applyAxisAngle(
      UP,
      look.yaw * explore + Math.sin(time * 0.055) * 0.06 * drift,
    );
    OFFSET.y +=
      look.pitch * explore * OFFSET.length() * 0.45 +
      Math.sin(time * 0.045) * 0.9 * drift;

    camera.position.copy(LOOK).add(OFFSET);

    /*
     * Portrait needs the horizon pushed up, not the camera pulled back.
     *
     * `fov` is vertical, so a tall viewport frames the same slice of sky and
     * stacks it above the terrain — then the chapter panels cover the bottom
     * half and the valley is left in a thin band. Dropping the aim point here,
     * after the camera is placed, tilts the view down without moving the rig;
     * doing it earlier would sink the camera itself toward the riverbed.
     */
    if (portrait) {
      LOOK.y -= OFFSET.length() * 0.2;
    } else if (station.focus > 0 && camera instanceof THREE.PerspectiveCamera) {
      /*
       * Portrait stacks the panel below the frame instead of beside it, so it
       * takes the vertical tilt above and none of this.
       */
      const halfWidth =
        Math.tan((camera.fov * Math.PI) / 360) * (size.width / size.height);
      const bias =
        (SUBJECT_ACROSS - 0.5) * 2 * halfWidth * OFFSET.length() * station.focus;
      RIGHT.copy(OFFSET).cross(UP).normalize();
      LOOK.addScaledVector(RIGHT, bias);
    }

    /*
     * Rotation is eased and rate-limited, which is a separate problem from the
     * one above and the one that actually reads as disorder. Even with the
     * scroll damped, the solved path's aim swings hard at two transfers — Moray
     * to Maras and Maras to Ollantaytambo, where the framing bearings are
     * nearly opposed — and slamming the view around there is what makes a
     * landing feel chaotic rather than flown.
     *
     * Slerped rather than eased per axis: interpolating yaw and pitch
     * separately takes a different route than the shortest one between two
     * orientations, and tips the horizon on the way.
     */
    AIM.lookAt(camera.position, LOOK, UP);
    FACING.setFromRotationMatrix(AIM);
    if (!facing.current || reducedMotion) {
      camera.quaternion.copy(FACING);
      facing.current = true;
    } else {
      camera.quaternion.slerp(
        FACING,
        turnFraction(camera.quaternion.angleTo(FACING), delta),
      );
    }

    if (!onTargets) {
      return;
    }

    frame.current += 1;
    const sampleEvery = quality === "high" ? 2 : 4;
    if (frame.current % sampleEvery !== 0) {
      return;
    }

    const targets = WORLD_FIGURES.map((figure) => {
      PROJECT.set(figure.position[0], figure.position[1], figure.position[2]);
      /*
       * Distance first, because being on screen is not the same as being
       * visible. Projection alone happily labelled Machu Picchu from the stop
       * over Ollantaytambo — 30 km away, behind a 4,000 m cordillera and well
       * past the point the fog has swallowed everything. A HUD that names
       * things the reader cannot see stops being a readout and starts being
       * decoration.
       */
      const range = PROJECT.distanceTo(camera.position);
      PROJECT.project(camera);
      const x = (PROJECT.x * 0.5 + 0.5) * 100;
      const y = (-PROJECT.y * 0.5 + 0.5) * 100;
      const inFront = PROJECT.z > -1 && PROJECT.z < 1;
      // Inset, not overhanging: a box is ~7.5rem wide and is centred on this
      // point, so allowing it past the edge clipped the label off it.
      const onScreen = x > 4 && x < 94 && y > 6 && y < 92;
      const inRange = range < MARKER_RANGE;
      return {
        id: figure.id,
        label: figure.label,
        elevation: figure.elevation,
        x,
        y,
        visible: inFront && onScreen && inRange,
      };
    });
    onTargets(targets);
  });

  return null;
}

/**
 * Mounts the western terrain when the scroll is close enough to want it.
 *
 * Polled on the frame loop rather than derived from React state: scroll
 * position lives in a ref precisely so that moving the camera never re-renders
 * the tree, and this flips once, near the end, and then stays flipped.
 */
function WestTerrainGate({
  progressRef,
}: {
  readonly progressRef: MutableRefObject<number>;
}) {
  const [wanted, setWanted] = useState(false);

  useFrame(() => {
    if (!wanted && shouldLoadWestTerrain(progressRef.current)) {
      setWanted(true);
    }
  });

  if (!wanted) {
    return null;
  }
  return <WestTerrainAsset />;
}

function SacredValleyWorld({
  quality,
  progressRef,
  reducedMotion,
  lookRef,
  draggingRef,
  onWorldReady,
  onTargets,
}: {
  readonly quality: SceneQuality;
  readonly progressRef: MutableRefObject<number>;
  readonly reducedMotion: boolean;
  readonly lookRef: MutableRefObject<LookOffset>;
  readonly draggingRef: MutableRefObject<boolean>;
  readonly onWorldReady?: () => void;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
}) {
  return (
    <>
      <WorldLights />
      <SacredValleyAsset onPresented={onWorldReady} quality={quality} />
      <SiteStructuresAsset />
      <WestTerrainGate progressRef={progressRef} />
      <FlightCamera
        draggingRef={draggingRef}
        lookRef={lookRef}
        onTargets={onTargets}
        progressRef={progressRef}
        quality={quality}
        reducedMotion={reducedMotion}
      />
      <AdaptiveDpr pixelated={false} />
    </>
  );
}

export function SacredValleyCanvas({
  quality,
  progressRef,
  visible = true,
  reducedMotion = false,
  onContextLost,
  onWorldReady,
  onTargets,
}: SacredValleyCanvasProps) {
  const animate = visible && shouldPlaySceneEffects(reducedMotion);
  const frameLoop = worldFrameLoop(animate);
  const lookEnabled = shouldPlaySceneEffects(reducedMotion);
  const lookRef = useRef<LookOffset>(REST_LOOK);
  const draggingRef = useRef(false);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    look: LookOffset;
    pointerType: string;
  } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const beginLook = (event: PointerEvent<HTMLDivElement>) => {
    if (!lookEnabled) {
      return;
    }
    if (event.pointerType !== "touch" && event.button !== 0) {
      return;
    }

    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      look: { ...lookRef.current },
      pointerType: event.pointerType,
    };

    if (event.pointerType === "touch") {
      return;
    }

    draggingRef.current = true;
    setGrabbing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveLook = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || !lookEnabled) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (!draggingRef.current) {
      if (isVerticalScrollGesture(dx, dy)) {
        pointerStartRef.current = null;
        return;
      }
      if (!isHorizontalLookGesture(dx, dy)) {
        return;
      }
      draggingRef.current = true;
      setGrabbing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    lookRef.current = lookFromPointerDelta(
      start.look,
      dx,
      dy,
      lookSensitivityForPointer(start.pointerType),
    );
  };

  const endLook = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = null;
    draggingRef.current = false;
    setGrabbing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 size-full",
        lookEnabled ? "pointer-events-auto cursor-grab" : "pointer-events-none",
        grabbing && "cursor-grabbing",
      )}
      data-world-look={lookEnabled ? "ready" : "paused"}
      onPointerCancel={endLook}
      onPointerDown={beginLook}
      onPointerMove={moveLook}
      onPointerUp={endLook}
      style={{ touchAction: "pan-y" }}
    >
      <Canvas
        camera={{ far: SCENE_FAR_PLANE, fov: 46, near: 0.4, position: [0, 40, 90] }}
        className="pointer-events-none absolute inset-0 size-full"
        dpr={quality === "high" ? [1, 1.5] : [1, 1]}
        frameloop={frameLoop}
        gl={{
          alpha: false,
          antialias: quality === "high",
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.toneMappingExposure = 1;
          gl.setClearColor("#000000", 1);
          gl.domElement.style.pointerEvents = "none";
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              onContextLost?.();
            },
            { once: true },
          );
        }}
        style={{
          background: "#000000",
          pointerEvents: "none",
        }}
      >
        <SacredValleyWorld
          draggingRef={draggingRef}
          lookRef={lookRef}
          onTargets={onTargets}
          onWorldReady={onWorldReady}
          progressRef={progressRef}
          quality={quality}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}

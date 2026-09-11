"use client";

import { cn } from "@chofex/ui/lib/utils";
import { AdaptiveDpr, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type MutableRefObject,
  type PointerEvent,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import {
  chapterFromProgress,
  type ProjectedTarget,
  sampleCameraPath,
  WORLD_FIGURES,
} from "@/components/landing/machu-picchu-geometry";
import {
  isHorizontalLookGesture,
  isVerticalScrollGesture,
  type LookOffset,
  lookExploreScale,
  lookFromPointerDelta,
  lookSensitivityForPointer,
  REST_LOOK,
} from "@/components/landing/machu-picchu-look";
import { MachuPicchuAsset } from "@/components/landing/machu-picchu-model";
import { worldFrameLoop } from "@/components/landing/world-loop";
import {
  shouldPlaySceneEffects,
  worldMotionScale,
} from "@/components/landing/world-motion";

const LOOK = new THREE.Vector3();
const PROJECT = new THREE.Vector3();

type SceneQuality = "low" | "high";

export type MachuPicchuCanvasProps = {
  readonly quality: SceneQuality;
  readonly progressRef: MutableRefObject<number>;
  readonly visible?: boolean;
  readonly reducedMotion?: boolean;
  readonly onContextLost?: () => void;
  readonly onWorldReady?: () => void;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
};

function WorldLights({ quality }: { readonly quality: SceneQuality }) {
  const mapSize = quality === "high" ? 2048 : 512;

  return (
    <>
      <color args={["#3d7eef"]} attach="background" />
      <fog attach="fog" args={["#7eb4ff", 90, 240]} />
      <ambientLight color="#fff1d6" intensity={0.58} />
      <hemisphereLight args={["#c5e2ff", "#8a9bb0", 0.92]} />
      <directionalLight
        castShadow={quality === "high"}
        color="#ffe2a8"
        intensity={2.15}
        position={[46, 28, 58]}
        shadow-bias={-0.0004}
        shadow-camera-bottom={-50}
        shadow-camera-far={180}
        shadow-camera-left={-50}
        shadow-camera-near={8}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-mapSize={[mapSize, mapSize]}
      />
      <directionalLight
        color="#fff6d8"
        intensity={1.15}
        position={[-24, 22, 36]}
      />
      <directionalLight
        color="#d6ff00"
        intensity={0.22}
        position={[42, 16, -30]}
      />
      <pointLight
        color="#ffd19a"
        intensity={22}
        position={[8, 10, 14]}
        distance={56}
      />
    </>
  );
}

function HeroSparkles({
  quality,
  reducedMotion,
}: {
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
}) {
  if (quality !== "high" || !shouldPlaySceneEffects(reducedMotion)) {
    return null;
  }

  return (
    <Sparkles
      color="#fff4d2"
      count={90}
      opacity={0.55}
      position={[4, 10, 6]}
      scale={[36, 14, 36]}
      size={3.2}
      speed={0.18}
    />
  );
}

function DriftDiscs({
  quality,
  reducedMotion,
}: {
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const discs = [
    { color: "#f4f7fb", position: [-10, 8, 16] as const, radius: 1.6 },
    { color: "#d6ff00", position: [14, 11, 8] as const, radius: 1.1 },
    { color: "#ffe4b0", position: [6, 14, 22] as const, radius: 0.85 },
  ];

  useFrame(({ clock }) => {
    const node = group.current;
    if (!node || !shouldPlaySceneEffects(reducedMotion)) {
      return;
    }
    const time = clock.elapsedTime;
    node.children.forEach((child, index) => {
      child.position.y = discs[index]?.position[1] ?? 8;
      child.position.y += Math.sin(time * 0.35 + index * 1.3) * 0.7;
      child.rotation.y = time * 0.12 + index;
      child.rotation.x = Math.sin(time * 0.18 + index) * 0.2;
    });
  });

  return (
    <group ref={group}>
      {discs.map((disc) => (
        <mesh key={disc.color} position={disc.position}>
          <cylinderGeometry args={[disc.radius, disc.radius, 0.18, 32]} />
          <meshPhysicalMaterial
            clearcoat={quality === "high" ? 0.85 : 0}
            clearcoatRoughness={0.18}
            color={disc.color}
            metalness={0.12}
            roughness={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}

function ValleyFigures({ quality }: { readonly quality: SceneQuality }) {
  return (
    <group>
      <mesh position={[6, 0.04, 8.6]} receiveShadow={quality === "high"}>
        <cylinderGeometry args={[16, 16, 0.12, 48]} />
        <meshStandardMaterial color="#dfe6f2" roughness={0.62} />
      </mesh>
      {WORLD_FIGURES.map((figure) => {
        const isJudge = figure.kind === "judge";
        let accent = "#ffffff";
        if (isJudge) {
          accent = "#d6ff00";
        }
        return (
          <group key={figure.id} position={figure.position}>
            <mesh castShadow={quality === "high"} position={[0, 1.15, 0]}>
              <capsuleGeometry args={[0.28, 0.95, 6, 12]} />
              <meshPhysicalMaterial
                clearcoat={0.55}
                color="#f7f9ff"
                roughness={0.28}
              />
            </mesh>
            <mesh castShadow={quality === "high"} position={[0, 2.05, 0]}>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshPhysicalMaterial
                clearcoat={0.7}
                color={accent}
                roughness={0.18}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ExploreCamera({
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

  useFrame(({ clock }) => {
    const progress = progressRef.current;
    const path = sampleCameraPath(progress);
    const chapter = chapterFromProgress(progress);
    const time = clock.elapsedTime;
    const motion = worldMotionScale(reducedMotion);
    const explore = lookExploreScale(progress);
    const hold = draggingRef.current ? 0.12 : 1;
    const drift = (0.4 + explore * 0.6) * motion * hold;
    const portrait = size.height > size.width;
    const orbit = Math.sin(time * 0.055) * 0.26 * drift;
    const look = lookRef.current;
    const pointerYaw = look.yaw * explore;
    const pointerPitch = look.pitch * explore;

    let radiusBoost = 0;
    if (portrait && chapter === "hero") {
      radiusBoost = 14;
    }

    camera.position.set(
      path.position[0] + Math.sin(orbit + pointerYaw) * (8 + radiusBoost),
      path.position[1] +
        pointerPitch * 7 +
        Math.sin(time * 0.045) * 0.85 * drift,
      path.position[2] + Math.cos(orbit + pointerYaw) * (6 + radiusBoost * 0.4),
    );
    LOOK.set(path.lookAt[0], path.lookAt[1], path.lookAt[2]);
    camera.lookAt(LOOK);

    if (!onTargets) {
      return;
    }

    frame.current += 1;
    const sampleEvery = quality === "high" ? 2 : 4;
    if (frame.current % sampleEvery !== 0) {
      return;
    }

    const targets = WORLD_FIGURES.map((figure) => {
      PROJECT.set(
        figure.position[0],
        figure.position[1] + 1.6,
        figure.position[2],
      );
      PROJECT.project(camera);
      const x = (PROJECT.x * 0.5 + 0.5) * 100;
      const y = (-PROJECT.y * 0.5 + 0.5) * 100;
      const inFront = PROJECT.z > -1 && PROJECT.z < 1;
      const onScreen = x > -4 && x < 104 && y > -4 && y < 104;
      return {
        id: figure.id,
        kind: figure.kind,
        label: figure.label,
        x,
        y,
        visible: inFront && onScreen,
      };
    });
    onTargets(targets);
  });

  return null;
}

function MachuWorld({
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
      <WorldLights quality={quality} />
      <MachuPicchuAsset onPresented={onWorldReady} quality={quality} />
      <ValleyFigures quality={quality} />
      <DriftDiscs quality={quality} reducedMotion={reducedMotion} />
      <HeroSparkles quality={quality} reducedMotion={reducedMotion} />
      <ExploreCamera
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

export function MachuPicchuCanvas({
  quality,
  progressRef,
  visible = true,
  reducedMotion = false,
  onContextLost,
  onWorldReady,
  onTargets,
}: MachuPicchuCanvasProps) {
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
        camera={{ far: 420, fov: 38, near: 0.1, position: [46, 18, 58] }}
        className="pointer-events-none absolute inset-0 size-full"
        dpr={quality === "high" ? [1, 1.5] : [1, 1]}
        frameloop={frameLoop}
        gl={{
          alpha: false,
          antialias: quality === "high",
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.32;
          gl.setClearColor("#3d7eef");
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
        shadows={quality === "high"}
        style={{ pointerEvents: "none" }}
      >
        <MachuWorld
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

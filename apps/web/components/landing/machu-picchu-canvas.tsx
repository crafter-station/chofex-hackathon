"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type MutableRefObject, Suspense, useRef } from "react";
import * as THREE from "three";

import {
  chapterFromProgress,
  type ProjectedTarget,
  sampleCameraPath,
  WORLD_FIGURES,
} from "@/components/landing/machu-picchu-geometry";
import { MachuPicchuAsset } from "@/components/landing/machu-picchu-model";

const LOOK = new THREE.Vector3();
const PROJECT = new THREE.Vector3();

type SceneQuality = "low" | "high";

export type MachuPicchuCanvasProps = {
  readonly quality: SceneQuality;
  readonly progressRef: MutableRefObject<number>;
  readonly visible?: boolean;
  readonly onContextLost?: () => void;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
};

function WorldLights({ quality }: { readonly quality: SceneQuality }) {
  const mapSize = quality === "high" ? 2048 : 512;

  return (
    <>
      <color args={["#0a3dff"]} attach="background" />
      <fog attach="fog" args={["#3d7dff", 40, 220]} />
      <ambientLight color="#9ec4ff" intensity={0.42} />
      <hemisphereLight args={["#7eb6ff", "#2a3550", 0.55]} />
      <directionalLight
        castShadow={quality === "high"}
        color="#ffe566"
        intensity={1.85}
        position={[-48, 62, 28]}
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
        color="#e8ff00"
        intensity={0.22}
        position={[36, 18, -24]}
      />
    </>
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
          accent = "#e8ff00";
        }
        return (
          <group key={figure.id} position={figure.position}>
            <mesh castShadow={quality === "high"} position={[0, 1.15, 0]}>
              <capsuleGeometry args={[0.28, 0.95, 6, 12]} />
              <meshStandardMaterial color="#f7f9ff" roughness={0.35} />
            </mesh>
            <mesh castShadow={quality === "high"} position={[0, 2.05, 0]}>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial color={accent} roughness={0.28} />
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
  onTargets,
}: {
  readonly progressRef: MutableRefObject<number>;
  readonly quality: SceneQuality;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
}) {
  const { camera, size, pointer } = useThree();
  const frame = useRef(0);

  useFrame(({ clock }) => {
    const progress = progressRef.current;
    const path = sampleCameraPath(progress);
    const chapter = chapterFromProgress(progress);
    const time = clock.elapsedTime;
    const explore = Math.max(0, 1 - progress / 0.24);
    const portrait = size.height > size.width;
    const orbit = Math.sin(time * 0.07) * 0.16 * explore;
    const pointerYaw = pointer.x * 0.42 * explore;
    const pointerPitch = pointer.y * 0.1 * explore;

    let radiusBoost = 0;
    if (portrait && chapter === "hero") {
      radiusBoost = 14;
    }

    camera.position.set(
      path.position[0] + Math.sin(orbit + pointerYaw) * (8 + radiusBoost),
      path.position[1] +
        pointerPitch * 6 +
        Math.sin(time * 0.05) * 0.55 * explore,
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
  onTargets,
}: {
  readonly quality: SceneQuality;
  readonly progressRef: MutableRefObject<number>;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
}) {
  return (
    <>
      <WorldLights quality={quality} />
      <Suspense fallback={null}>
        <MachuPicchuAsset quality={quality} />
      </Suspense>
      <ValleyFigures quality={quality} />
      <ExploreCamera
        onTargets={onTargets}
        progressRef={progressRef}
        quality={quality}
      />
      <AdaptiveDpr pixelated={false} />
    </>
  );
}

export function MachuPicchuCanvas({
  quality,
  progressRef,
  visible = true,
  onContextLost,
  onTargets,
}: MachuPicchuCanvasProps) {
  return (
    <Canvas
      camera={{ far: 420, fov: 42, near: 0.1, position: [92, 40, 108] }}
      className="pointer-events-none absolute inset-0 size-full"
      dpr={quality === "high" ? [1, 1.5] : [1, 1]}
      frameloop={visible ? "always" : "never"}
      gl={{
        alpha: false,
        antialias: quality === "high",
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#0a3dff");
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
        onTargets={onTargets}
        progressRef={progressRef}
        quality={quality}
      />
    </Canvas>
  );
}

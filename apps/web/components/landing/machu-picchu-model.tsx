"use client";

import { Center, useGLTF } from "@react-three/drei";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import {
  buildCitadelBlocks,
  buildTerraceSteps,
  MACHU_MODEL_SCALE,
  MACHU_PICCHU_GLB,
  ridgeHeight,
} from "@/components/landing/machu-picchu-geometry";
import { ModelErrorBoundary } from "@/components/landing/model-error-boundary";

type SceneQuality = "low" | "high";

function useModelAvailable(url: string): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(url, { method: "HEAD" })
      .then((response) => {
        if (!cancelled) {
          setAvailable(response.ok);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailable(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return available;
}

function MachuPicchuGltf({ quality }: { readonly quality: SceneQuality }) {
  const { scene } = useGLTF(MACHU_PICCHU_GLB);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.castShadow = quality === "high";
      child.receiveShadow = quality === "high";
    });
  }, [clone, quality]);

  return (
    <Center disableY>
      <primitive object={clone} scale={MACHU_MODEL_SCALE} />
    </Center>
  );
}

export function ProceduralMachuPicchu({
  quality,
}: {
  readonly quality: SceneQuality;
}) {
  const segments = quality === "high" ? 72 : 40;
  const terrain = useMemo(() => {
    const next = new THREE.PlaneGeometry(180, 180, segments, segments);
    next.rotateX(-Math.PI / 2);
    const position = next.attributes.position;
    if (!position) {
      return next;
    }
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const z = position.getZ(index);
      position.setY(index, ridgeHeight(x, z));
    }
    next.computeVertexNormals();
    return next;
  }, [segments]);

  useEffect(() => () => terrain.dispose(), [terrain]);

  const blocks = useMemo(() => buildCitadelBlocks(), []);
  const terraces = useMemo(() => buildTerraceSteps(), []);

  return (
    <group>
      <mesh geometry={terrain} receiveShadow={quality === "high"}>
        <meshStandardMaterial color="#9aa6b8" roughness={0.86} />
      </mesh>
      {blocks.map((block) => (
        <mesh
          castShadow={quality === "high"}
          key={`${block.position.join("-")}`}
          position={block.position}
          receiveShadow={quality === "high"}
        >
          <boxGeometry args={block.size} />
          <meshStandardMaterial color="#f4f7fb" roughness={0.42} />
        </mesh>
      ))}
      {terraces.map((step) => (
        <mesh
          key={`${step.position.join("-")}`}
          position={step.position}
          receiveShadow={quality === "high"}
        >
          <boxGeometry args={step.size} />
          <meshStandardMaterial color="#d7dde8" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[6, 18, -38]}>
        <coneGeometry args={[11, 34, 7]} />
        <meshStandardMaterial color="#c5cedb" roughness={0.7} />
      </mesh>
    </group>
  );
}

function GltfOrFallback({
  quality,
  fallback,
}: {
  readonly quality: SceneQuality;
  readonly fallback: ReactNode;
}) {
  const available = useModelAvailable(MACHU_PICCHU_GLB);

  if (available !== true) {
    return fallback;
  }

  return (
    <ModelErrorBoundary fallback={fallback}>
      <MachuPicchuGltf quality={quality} />
    </ModelErrorBoundary>
  );
}

export function MachuPicchuAsset({
  quality,
}: {
  readonly quality: SceneQuality;
}) {
  const fallback = <ProceduralMachuPicchu quality={quality} />;

  return <GltfOrFallback fallback={fallback} quality={quality} />;
}

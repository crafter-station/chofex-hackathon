"use client";

import { Center, useGLTF } from "@react-three/drei";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { HERO_SCENE_MODEL_URL } from "@/components/landing/hero-scene";
import {
  buildCitadelBlocks,
  buildTerraceSteps,
  MACHU_MODEL_SCALE,
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

function polishStoneMaterial(
  source: THREE.Material,
  quality: SceneQuality,
): THREE.Material {
  if (!(source instanceof THREE.MeshStandardMaterial)) {
    return source;
  }

  if (quality === "low") {
    source.roughness = Math.min(source.roughness, 0.62);
    return source;
  }

  const next = new THREE.MeshPhysicalMaterial();
  next.copy(source);
  next.metalness = Math.min(0.12, source.metalness + 0.04);
  next.roughness = Math.min(0.42, source.roughness);
  next.clearcoat = 0.48;
  next.clearcoatRoughness = 0.32;
  next.envMapIntensity = 1.15;
  return next;
}

function MachuPicchuGltf({ quality }: { readonly quality: SceneQuality }) {
  const { scene } = useGLTF(HERO_SCENE_MODEL_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const extras: THREE.Material[] = [];
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.castShadow = quality === "high";
      child.receiveShadow = quality === "high";
      const source = child.material;
      if (Array.isArray(source)) {
        child.material = source.map((entry) => {
          const next = polishStoneMaterial(entry, quality);
          if (next !== entry) {
            extras.push(next);
          }
          return next;
        });
        return;
      }
      if (source) {
        const next = polishStoneMaterial(source, quality);
        child.material = next;
        if (next !== source) {
          extras.push(next);
        }
      }
    });

    return () => {
      for (const material of extras) {
        material.dispose();
      }
    };
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
        <meshStandardMaterial color="#8f9a7a" roughness={0.78} />
      </mesh>
      {blocks.map((block) => (
        <mesh
          castShadow={quality === "high"}
          key={`${block.position.join("-")}`}
          position={block.position}
          receiveShadow={quality === "high"}
        >
          <boxGeometry args={block.size} />
          <meshPhysicalMaterial
            clearcoat={0.55}
            color="#f4f7fb"
            roughness={0.32}
          />
        </mesh>
      ))}
      {terraces.map((step) => (
        <mesh
          key={`${step.position.join("-")}`}
          position={step.position}
          receiveShadow={quality === "high"}
        >
          <boxGeometry args={step.size} />
          <meshPhysicalMaterial
            clearcoat={0.4}
            color="#d7dde8"
            roughness={0.4}
          />
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
  const available = useModelAvailable(HERO_SCENE_MODEL_URL);

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

useGLTF.preload(HERO_SCENE_MODEL_URL);

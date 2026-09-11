export type HeroGltfManifest = {
  title: string;
  heroSubject: string | null;
  extensionsRequired: readonly string[];
  imageMimeTypes: readonly string[];
  materialNames: readonly string[];
};

const UNSAFE_REQUIRED_EXTENSIONS = new Set([
  "EXT_texture_webp",
  "KHR_texture_basisu",
]);

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function readU32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
    offset,
    true,
  );
}

export function parseGlbManifest(bytes: Uint8Array): HeroGltfManifest {
  if (bytes.byteLength < 20 || readAscii(bytes, 0, 4) !== "glTF") {
    throw new Error("hero model is not a GLB");
  }

  const jsonLength = readU32(bytes, 12);
  const jsonType = readAscii(bytes, 16, 4);
  if (jsonType !== "JSON") {
    throw new Error("hero GLB is missing a JSON chunk");
  }

  const jsonBytes = bytes.subarray(20, 20 + jsonLength);
  const jsonText = new TextDecoder().decode(jsonBytes).replace(/\0+$/g, "");
  const gltf = JSON.parse(jsonText) as {
    asset?: { extras?: { title?: unknown; heroSubject?: unknown } };
    extensionsRequired?: unknown;
    images?: Array<{ mimeType?: unknown }>;
    materials?: Array<{ name?: unknown }>;
    nodes?: Array<{ extras?: { heroSubject?: unknown } }>;
    scenes?: Array<{ extras?: { heroSubject?: unknown } }>;
  };

  const extras = gltf.asset?.extras;
  const nodeSubject = gltf.nodes?.find(
    (node) => node.extras?.heroSubject === "terrain",
  )?.extras?.heroSubject;
  const sceneSubject = gltf.scenes?.find(
    (scene) => scene.extras?.heroSubject === "terrain",
  )?.extras?.heroSubject;
  const heroSubject = [extras?.heroSubject, nodeSubject, sceneSubject].find(
    (value) => typeof value === "string",
  );

  const extensionsRequired = Array.isArray(gltf.extensionsRequired)
    ? gltf.extensionsRequired.filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  return {
    title: typeof extras?.title === "string" ? extras.title : "",
    heroSubject: heroSubject ?? null,
    extensionsRequired,
    imageMimeTypes: (gltf.images ?? [])
      .map((image) => image.mimeType)
      .filter((value): value is string => typeof value === "string"),
    materialNames: (gltf.materials ?? [])
      .map((material) => material.name)
      .filter((value): value is string => typeof value === "string"),
  };
}

export function isHeroGltfTerrain(manifest: HeroGltfManifest): boolean {
  const title = manifest.title.toLowerCase();
  return (
    manifest.heroSubject === "terrain" && title.includes("sacred valley")
  );
}

export function isHeroGltfLoaderSafe(manifest: HeroGltfManifest): boolean {
  return !manifest.extensionsRequired.some((extension) =>
    UNSAFE_REQUIRED_EXTENSIONS.has(extension),
  );
}

export function readHeroSubject(
  ...sources: Array<{ heroSubject?: unknown } | undefined>
): "terrain" | null {
  for (const source of sources) {
    if (source?.heroSubject === "terrain") {
      return "terrain";
    }
  }
  return null;
}

export function heroSubjectFromLoadedGltf(input: {
  asset?: { extras?: { heroSubject?: unknown } };
  scene: {
    userData?: { heroSubject?: unknown };
    children: Array<{ userData?: { heroSubject?: unknown } }>;
  };
}): "terrain" | null {
  const childSubjects = input.scene.children.map((child) => child.userData);
  return readHeroSubject(
    input.asset?.extras,
    input.scene.userData,
    ...childSubjects,
  );
}

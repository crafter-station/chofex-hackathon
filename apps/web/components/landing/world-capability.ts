export type WorldQuality = "auto" | "low" | "high";

export type WorldFallbackReason =
  | "ssr"
  | "no-webgl"
  | "reduced-motion"
  | "weak-device"
  | "constrained-network"
  | "forced";

export type NetworkConstraint = {
  saveData?: boolean;
  effectiveType?: string;
};

export type WorldPresentation =
  | { mode: "fallback"; reason: WorldFallbackReason }
  | { mode: "webgl"; quality: "low" | "high" };

const SOFTWARE_GPU =
  /swiftshader|llvmpipe|softpipe|virtualbox|microsoft basic render|gdi generic/i;

export function detectWebGL(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return context !== null;
  } catch {
    return false;
  }
}

export function readGpuRenderer(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl || !("getExtension" in gl)) {
      return undefined;
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) {
      return undefined;
    }

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return typeof renderer === "string" ? renderer : undefined;
  } catch {
    return undefined;
  }
}

export function prefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isSoftwareGpu(renderer: string | undefined): boolean {
  if (!renderer) {
    return false;
  }

  return SOFTWARE_GPU.test(renderer);
}

export function isConstrainedNetwork(
  network: NetworkConstraint | undefined,
): boolean {
  if (!network) {
    return false;
  }
  if (network.saveData) {
    return true;
  }
  return network.effectiveType === "slow-2g" || network.effectiveType === "2g";
}

export function readNetworkConstraint(): NetworkConstraint | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  const connection = (
    navigator as Navigator & { connection?: NetworkConstraint }
  ).connection;
  if (!connection) {
    return undefined;
  }

  return {
    saveData: connection.saveData,
    effectiveType: connection.effectiveType,
  };
}

export function resolveWorldPresentation(input: {
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  gpuRenderer?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  network?: NetworkConstraint;
  quality?: WorldQuality;
  forceFallback?: boolean;
}): WorldPresentation {
  if (input.forceFallback) {
    return { mode: "fallback", reason: "forced" };
  }

  if (!input.hasWebGL) {
    return { mode: "fallback", reason: "no-webgl" };
  }

  // Static painted fallback: no WebGL loop, sparkles, or camera drift.
  if (input.prefersReducedMotion) {
    return { mode: "fallback", reason: "reduced-motion" };
  }

  if ((input.deviceMemory ?? 8) <= 2) {
    return { mode: "fallback", reason: "weak-device" };
  }

  if (isConstrainedNetwork(input.network)) {
    return { mode: "fallback", reason: "constrained-network" };
  }

  if (input.quality === "low" || input.quality === "high") {
    return { mode: "webgl", quality: input.quality };
  }

  const software = isSoftwareGpu(input.gpuRenderer);
  const lowMemory = (input.deviceMemory ?? 8) <= 4;
  const lowCpu = (input.hardwareConcurrency ?? 8) <= 4;
  if (software || lowMemory || lowCpu) {
    return { mode: "webgl", quality: "low" };
  }

  return { mode: "webgl", quality: "high" };
}

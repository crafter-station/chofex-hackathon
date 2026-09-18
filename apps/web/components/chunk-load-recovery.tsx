"use client";

import { useEffect } from "react";
import { clearChunkReloadGuard } from "@/lib/chunk-load-recovery";

/** Clears the one-shot reload guard after Clerk and the application load. */
export function ChunkLoadRecoverySuccess() {
  useEffect(() => {
    clearChunkReloadGuard(window.sessionStorage);
  }, []);

  return null;
}

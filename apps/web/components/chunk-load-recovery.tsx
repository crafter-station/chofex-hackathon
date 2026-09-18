"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearChunkReloadGuard,
  clerkUiComponentForPath,
} from "@/lib/chunk-load-recovery";

/** Clears the guard only after the route's critical UI has rendered. */
export function ChunkLoadRecoverySuccess() {
  const pathname = usePathname();
  const clerkComponent = clerkUiComponentForPath(pathname);

  useEffect(() => {
    const clearGuard = () => {
      clearChunkReloadGuard(() => window.sessionStorage);
    };

    if (!clerkComponent) {
      clearGuard();
      return;
    }

    const selector = `[data-clerk-component="${clerkComponent}"]`;
    const clerkUiHasRendered = () => {
      const root = document.querySelector(selector);
      return Boolean(root?.childElementCount);
    };

    if (clerkUiHasRendered()) {
      clearGuard();
      return;
    }

    const observer = new MutationObserver(() => {
      if (clerkUiHasRendered()) {
        clearGuard();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [clerkComponent]);

  return null;
}

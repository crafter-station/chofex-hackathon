"use client";

import { useEffect } from "react";

/**
 * Top-level error boundary. Without it a failed chunk — the auth UI bundle
 * timing out, or a stale reference after a deploy — has nothing to catch it and
 * the page renders blank. `global-error` replaces the root layout, so it owns
 * its own `<html>`/`<body>` and stays on inline styles: the CSS it would need
 * may be part of the same load that just failed.
 */

const RELOAD_GUARD_KEY = "hta:global-error-reload-at";
const RELOAD_GUARD_WINDOW_MS = 10_000;

function isChunkLoadError(error: { name?: string; message?: string }): boolean {
  const name = error.name ?? "";
  const message = error.message ?? "";
  if (name === "ChunkLoadError") {
    return true;
  }
  return (
    /Loading chunk [^\s]+ failed/.test(message) ||
    /Loading CSS chunk/.test(message) ||
    /Failed to fetch dynamically imported module/.test(message)
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    if (!chunkError) {
      return;
    }
    // A failed chunk is usually transient, so reload once to pull fresh chunk
    // URLs. The guard stops a reload loop when the chunk stays unreachable.
    const now = Date.now();
    const last = Number(window.sessionStorage.getItem(RELOAD_GUARD_KEY) ?? "0");
    if (now - last > RELOAD_GUARD_WINDOW_MS) {
      window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(now));
      window.location.reload();
    }
  }, [chunkError]);

  const retry = () => {
    if (chunkError) {
      window.location.reload();
      return;
    }
    reset();
  };

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          backgroundColor: "#050406",
          color: "#f3efe7",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
            No pudimos cargar la página
          </h1>
          <p
            style={{
              margin: "0.75rem 0 1.5rem",
              lineHeight: 1.5,
              color: "rgb(243 239 231 / 72%)",
            }}
          >
            Un recurso no terminó de cargar. Volvé a intentarlo; suele
            resolverse al reintentar.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              backgroundColor: "#2459c9",
              color: "#f3efe7",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}

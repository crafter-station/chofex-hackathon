import { expect, test } from "bun:test";
import { statSync } from "node:fs";
import { resolve } from "node:path";

import { HERO_POSTER } from "./hero-poster";
import { SACRED_VALLEY_GLB } from "./sacred-valley-geometry";

test("hero poster stays far smaller than the terrain mesh", () => {
  const poster = statSync(
    resolve(import.meta.dir, "../../public", HERO_POSTER.src.slice(1)),
  );
  const mesh = statSync(
    resolve(import.meta.dir, "../../public/models/sacred-valley.glb"),
  );

  expect(SACRED_VALLEY_GLB.startsWith("/models/sacred-valley.glb")).toBe(true);
  expect(poster.size).toBeGreaterThan(20_000);
  expect(poster.size).toBeLessThanOrEqual(120_000);
  expect(mesh.size).toBeGreaterThan(2_000_000);
  expect(mesh.size).toBeLessThanOrEqual(2_700_000);
  expect(poster.size * 10).toBeLessThan(mesh.size);
});

import { expect, test } from "bun:test";

import { HERO_POSTER, HERO_POSTER_PRELOAD } from "./hero-poster";

test("poster is a local still, not the multi-megabyte terrain mesh", () => {
  expect(HERO_POSTER.src).toBe("/hero/sacred-valley-poster.webp");
  expect(HERO_POSTER_PRELOAD.href).toBe(HERO_POSTER.src);
  expect(HERO_POSTER_PRELOAD.as).toBe("image");
  expect(HERO_POSTER_PRELOAD.type).toBe("image/webp");
});

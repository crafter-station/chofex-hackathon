import { expect, test } from "bun:test";

test("ships a decorative static valley when the live hero cannot draw", async () => {
  const fallback = await Bun.file(
    new URL("./terrain-fallback.tsx", import.meta.url),
  ).text();
  const terrain = await Bun.file(
    new URL("./terrain.tsx", import.meta.url),
  ).text();

  expect(fallback).toContain('aria-hidden="true"');
  expect(fallback).not.toMatch(/<img/);
  expect(terrain).toContain("TerrainFallback");
  expect(terrain).toContain("landing-world-fallback");
  expect(terrain).toContain("data-terrain={terrainState}");
});

test("uses a shared tighter vertical rhythm for content sections", async () => {
  const shell = await Bun.file(new URL("./shell.tsx", import.meta.url)).text();
  expect(shell).toContain('landingSectionYClassName = "py-14 sm:py-20"');

  const sections = [
    "apply.tsx",
    "event.tsx",
    "faq.tsx",
    "people.tsx",
    "qualifier-challenges.tsx",
    "sponsors.tsx",
    "tracks.tsx",
  ];
  for (const file of sections) {
    const source = await Bun.file(new URL(`./${file}`, import.meta.url)).text();
    expect(source).toContain("landingSectionYClassName");
  }
});

test("keeps meaningful landing metadata at a readable rem size", async () => {
  const css = await Bun.file(new URL("./landing.css", import.meta.url)).text();
  const hud = await Bun.file(new URL("./hud.tsx", import.meta.url)).text();
  const prizes = await Bun.file(
    new URL("./prizes.tsx", import.meta.url),
  ).text();

  expect(css).toMatch(/\.landing-type-meta[\s\S]*?font-size:\s*0\.75rem/);
  expect(css).toContain("forced-colors");
  expect(hud).toContain("landing-type-meta");
  expect(hud).not.toMatch(/text-\[10px\]/);
  expect(prizes).toContain("landing-type-meta");
  expect(prizes).not.toMatch(/text-\[10px\]/);
});

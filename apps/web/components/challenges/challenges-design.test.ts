import { expect, test } from "bun:test";

const sourceFor = (name: string) =>
  Bun.file(new URL(`./${name}`, import.meta.url)).text();

test("challenge pages use the light landing identity", async () => {
  const shell = await sourceFor("challenges-shell.tsx");

  expect(shell).toContain('"challenges-light flex flex-col"');
  expect(shell).toContain("landingBrand.variable");
  expect(shell).toContain('import "@/components/challenges/challenges.css"');
  expect(shell).not.toContain("landing-dark");
  expect(shell).toContain('<LandingSkipLinks applyHref="/#apply" />');
  expect(shell).toContain('<LandingFooter sectionHrefPrefix="/" />');
});

test("the challenge light palette keeps page, panels, and labels distinct", async () => {
  const palette = await sourceFor("challenges.css");

  expect(palette).toContain(".challenges-light");
  expect(palette).toContain("--hud-paper: #eee9df");
  expect(palette).toContain("--hud-card: #fcfaf5");
  expect(palette).toContain("--hud-kicker: #95443c");
  expect(palette).toContain("--hud-muted: #62666d");
});

test("challenge views use landing tokens instead of the retired neon palette", async () => {
  const index = await sourceFor("challenges-index.tsx");
  const ranking = await sourceFor("ranking-view.tsx");
  const challengeViews = `${index}\n${ranking}`;

  expect(challengeViews).not.toContain("#d6ff00");
  expect(challengeViews).not.toContain("#07152b");
  expect(index).toContain("landingSectionYClassName");
  expect(index).toContain("ContourSeal");
});

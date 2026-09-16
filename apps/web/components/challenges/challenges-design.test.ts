import { expect, test } from "bun:test";

const sourceFor = (name: string) =>
  Bun.file(new URL(`./${name}`, import.meta.url)).text();

test("challenge pages inherit the current landing identity", async () => {
  const shell = await sourceFor("challenges-shell.tsx");

  expect(shell).toContain('"landing-dark flex flex-col"');
  expect(shell).toContain("landingBrand.variable");
  expect(shell).toContain('import "@/components/landing/dark.css"');
  expect(shell).toContain('<LandingSkipLinks applyHref="/#apply" />');
  expect(shell).toContain('<LandingFooter sectionHrefPrefix="/" />');
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

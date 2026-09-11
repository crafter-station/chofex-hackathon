import { expect, test } from "bun:test";

import {
  applyCopy,
  expeditionSignals,
  facts,
  footerCopy,
  formatSoles,
  heroCopy,
  hudChrome,
  metadataCopy,
  prizeAmountsPen,
  prizeAmountsUsd,
  scanCopy,
  sectionNav,
  skipLinks,
  usdToPenRate,
  valleySignal,
  whyCopy,
  worldChapters,
} from "./content";

test("publishes the 17–18 octubre 2026 weekend in participant-facing copy", () => {
  const cuando = facts.find((fact) => fact.label === "Cuándo");
  expect(cuando?.value).toBe("17–18 oct 2026");
  expect(metadataCopy.description).toContain("17–18 de octubre 2026");
  expect(heroCopy.meta).toContain("17–18 oct 2026");
  expect(heroCopy.ctaMeta).toContain("17–18 oct 2026");
  expect(footerCopy.meta).toContain("17–18 oct 2026");

  const blob = JSON.stringify({
    facts,
    footerCopy,
    heroCopy,
    metadataCopy,
  });
  expect(blob).not.toMatch(/10–11/);
  expect(blob).not.toMatch(/10-11/);
});

test("converts published USD prizes to soles at the documented rate", () => {
  expect(usdToPenRate).toBe(3.35);
  expect(prizeAmountsUsd.first).toBe(2_000);
  expect(prizeAmountsUsd.second).toBe(500);
  expect(prizeAmountsPen.first).toBe(6_700);
  expect(prizeAmountsPen.second).toBe(1_675);
  expect(prizeAmountsPen.travelPool).toBe(1_005);
});

test("formats soles with the Peru locale", () => {
  expect(formatSoles(6_700)).toContain("6");
  expect(formatSoles(6_700)).toContain("700");
});

test("keeps participant-facing HUD chrome in Spanish", () => {
  const blob = JSON.stringify({
    applyCopy,
    footerCopy,
    heroCopy,
    hudChrome,
    scanCopy,
    sectionNav,
    whyCopy,
  });
  expect(blob).not.toMatch(/nav unlocked/i);
  expect(blob).not.toMatch(/best of the best/i);
  expect(blob).not.toMatch(/window \/ facts/i);
  expect(blob).not.toMatch(/sponsored by/i);
  expect(hudChrome.unit).toBe("unidad");
  expect(hudChrome.scan).toBe("escaneo");
});

test("does not invent people for the expedition signals", () => {
  const blob = JSON.stringify({ expeditionSignals, valleySignal, whyCopy });
  expect(blob).not.toMatch(/QUISPE/i);
  expect(blob).not.toMatch(/Juez 0/i);
  expect(whyCopy.rosterNote.toLowerCase()).toContain("se anuncia pronto");
});

test("exposes skip links and section jumps for keyboard users", () => {
  expect(skipLinks[0]?.href).toBe("#contenido");
  expect(skipLinks[1]?.href).toBe("#apply");
  expect(sectionNav.map((item) => item.href)).toEqual([
    "#why",
    "#scan",
    "#prizes",
    "#apply",
  ]);
  expect(worldChapters.map((chapter) => chapter.id)).toEqual([
    "hero",
    "valley",
    "scan",
  ]);
});

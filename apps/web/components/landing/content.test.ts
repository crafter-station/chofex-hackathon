import { expect, test } from "bun:test";

import {
  applyCopy,
  audienceCopy,
  audienceRoles,
  challengeCount,
  challengeSeats,
  chromeCopy,
  facts,
  footerCopy,
  formatSoles,
  heroCopy,
  metadataCopy,
  peopleCopy,
  prizeAmountsPen,
  prizeAmountsUsd,
  prizesCopy,
  seatCount,
  sectionNav,
  skipLinks,
  partners,
  sponsorsCopy,
} from "./content";

test("publishes the 17–18 octubre 2026 weekend in participant-facing copy", () => {
  const cuando = facts.find((fact) => fact.label === "Fecha");
  expect(cuando?.value).toBe("17–18 oct 2026");
  expect(metadataCopy.title).toContain("17–18 oct 2026");
  expect(heroCopy.metaDate).toBe("17–18 oct 2026");
  expect(heroCopy.metaLocation).toBe("Lima, Perú");
  expect(footerCopy.meta).toContain("17–18 oct 2026");
  expect(footerCopy.credits).toBe("Créditos");

  const blob = JSON.stringify({
    facts,
    footerCopy,
    heroCopy,
    metadataCopy,
  });
  expect(blob).not.toMatch(/10–11/);
  expect(blob).not.toMatch(/10-11/);
  expect(blob).not.toMatch(/Terreno: Mapzen \/ USGS/);
});

test("publishes the confirmed prizes directly in soles", () => {
  expect(prizeAmountsUsd.first).toBe(2_000);
  expect(prizeAmountsUsd.second).toBe(500);
  expect(prizeAmountsPen.first).toBe(6_700);
  expect(prizeAmountsPen.second).toBe(1_675);
  expect(facts.find((fact) => fact.label === "Premios")?.value).toContain(
    "8,000",
  );
  expect(prizesCopy.tripTitle).toBe("Chofex Headquarters");
  expect(prizesCopy).not.toHaveProperty("tripLabel");
  expect(prizesCopy).not.toHaveProperty("tripBody");
});

test("formats soles with the Peru locale", () => {
  expect(formatSoles(6_700)).toContain("6");
  expect(formatSoles(6_700)).toContain("700");
});

test("keeps the public pitch in Spanish and names Chofex as principal sponsor", () => {
  const blob = JSON.stringify({
    applyCopy,
    audienceCopy,
    chromeCopy,
    footerCopy,
    heroCopy,
    peopleCopy,
    sectionNav,
    partners,
    sponsorsCopy,
  });
  expect(blob).not.toMatch(/nav unlocked/i);
  expect(blob).not.toMatch(/best of the best/i);
  expect(blob).not.toMatch(/window \/ facts/i);
  expect(blob).not.toMatch(/sponsored by/i);
  expect(blob).not.toMatch(/la élite/i);
  expect(sponsorsCopy.kicker).toBe("quiénes lo hacen");
  // Three partners, and the principal sponsor in the middle: the hero gives
  // the centre to Chofex and flanks it, so the order here is the layout.
  expect(partners.map((partner) => partner.id)).toEqual([
    "peru-tech-week",
    "chofex",
    "crafter-station",
  ]);
  // Every mark has to be white on transparent, or it arrives in a box.
  for (const partner of partners) {
    expect(partner.logoSrc).toMatch(/^\/sponsors\/[a-z-]+-white\.png$/);
    expect(partner.role.length).toBeGreaterThan(0);
  }
  expect(sponsorsCopy.mark).toBe("Chofex");
  // White for the dark page, black kept for light surfaces. Both transparent —
  // the mark is never to be boxed in a plate to make it legible.
  expect(sponsorsCopy.logoSrc).toBe("/sponsors/chofex-white.png");
  expect(sponsorsCopy.logoOnLightSrc).toBe("/sponsors/chofex-black.png");
  expect(partners.find((partner) => partner.id === "chofex")?.role).toBe(
    "Sponsor principal",
  );
  expect(footerCopy.meta).not.toMatch(/sponsor principal/i);
  expect(metadataCopy.description).not.toMatch(/sponsor principal/i);
  expect(heroCopy).not.toHaveProperty("sponsor");
});

test("withholds panel claims until identities are confirmed", () => {
  expect(peopleCopy.kicker).toBe("Panel");
  expect(peopleCopy.lede.toLowerCase()).toContain("confirmada");
  expect(peopleCopy.status).toBe("Sin nombres ni afiliaciones anunciadas.");

  const blob = JSON.stringify(peopleCopy);
  expect(blob).not.toMatch(/\b10\b/);
  expect(blob).not.toMatch(
    /MIT|Y Combinator|Google|Meta|Stanford|Microsoft|Harvard|University of Toronto|DP World|Hochschild|Palantir/i,
  );
});

test("publishes a senior, hundred-seat, three-challenge event", () => {
  expect(seatCount).toBe(100);
  expect(challengeCount).toBe(3);
  expect(challengeSeats).toHaveLength(3);
  expect(challengeSeats.every((challenge) => challenge.hint.length > 0)).toBe(
    true,
  );
  expect(facts.find((fact) => fact.label === "Cupos")?.value).toBe("100");
  expect(metadataCopy.description).toContain("100 cupos");
  expect(audienceCopy.lede.toLowerCase()).toContain("status quo");
  expect(audienceRoles.map((role) => role.title)).toEqual([
    "Ship mata cartón",
    "Work hard, Play Hard",
    "HardCore Mode",
  ]);
  // Issue #47: body copy tightened by ≥35 %. Total must stay ≤ 47 words.
  const totalBodyWords = audienceRoles.reduce(
    (sum, role) => sum + role.body.split(/\s+/).length,
    0,
  );
  expect(totalBodyWords).toBeLessThanOrEqual(47);
});

test("keeps the social preview lockup free of sponsor-principal phrasing", async () => {
  const og = await Bun.file(
    new URL("../../app/opengraph-image.tsx", import.meta.url),
  ).text();
  expect(og).not.toMatch(/sponsor principal/i);
});

test("exposes skip links and section jumps for keyboard users", () => {
  expect(skipLinks[0]?.href).toBe("#contenido");
  expect(skipLinks[1]?.href).toBe("#apply");
  expect(sectionNav.map((item) => item.href)).toEqual([
    "#why",
    "#people",
    "#apply",
    "#prizes",
    "#challenges",
  ]);
  expect(sectionNav.map((item) => item.label)).toEqual([
    "Evento",
    "Panel",
    "Postular",
    "Premios",
    "Tracks",
  ]);
});

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
  judgeCount,
  judgeSeats,
  metadataCopy,
  mentorCount,
  mentorSeats,
  peopleCopy,
  prizeAmountsPen,
  prizeAmountsUsd,
  seatCount,
  sectionNav,
  skipLinks,
  sponsorsCopy,
  worldChapterCopy,
  worldChapters,
} from "./content";

test("publishes the 17–18 octubre 2026 weekend in participant-facing copy", () => {
  const cuando = facts.find((fact) => fact.label === "Fecha");
  expect(cuando?.value).toBe("17–18 oct 2026");
  expect(metadataCopy.title).toContain("17–18 oct 2026");
  expect(heroCopy.meta).toContain("17–18 de octubre de 2026");
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

test("publishes the confirmed prizes directly in soles", () => {
  expect(prizeAmountsUsd.first).toBe(2_000);
  expect(prizeAmountsUsd.second).toBe(500);
  expect(prizeAmountsPen.first).toBe(6_700);
  expect(prizeAmountsPen.second).toBe(1_675);
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
    sponsorsCopy,
  });
  expect(blob).not.toMatch(/nav unlocked/i);
  expect(blob).not.toMatch(/best of the best/i);
  expect(blob).not.toMatch(/window \/ facts/i);
  expect(blob).not.toMatch(/sponsored by/i);
  expect(blob).not.toMatch(/la élite/i);
  expect(sponsorsCopy.kicker).toBe("sponsor principal");
  expect(sponsorsCopy.mark).toBe("Chofex");
  expect(sponsorsCopy.logoSrc).toBe("/sponsors/chofex.png");
  expect(heroCopy.sponsor.toLowerCase()).toContain("chofex");
});

test("reserves unnamed seats instead of inventing a roster", () => {
  expect(judgeSeats).toHaveLength(judgeCount);
  expect(mentorSeats).toHaveLength(mentorCount);
  expect(peopleCopy.reveal.toLowerCase()).toContain("revelar");
  const blob = JSON.stringify({ peopleCopy, judgeSeats, mentorSeats });
  expect(blob).not.toMatch(/QUISPE/i);
  expect(blob).not.toMatch(/Juez 0/i);
});

test("publishes a senior, hundred-seat, three-challenge event", () => {
  expect(seatCount).toBe(100);
  expect(challengeCount).toBe(3);
  expect(challengeSeats).toHaveLength(3);
  expect(challengeSeats.every((challenge) => challenge.hint.length > 0)).toBe(
    true,
  );
  expect(facts.find((fact) => fact.label === "Cupos")?.value).toBe("100");
  expect(heroCopy.lede).toContain("100 builders con experiencia");
  expect(audienceCopy.lede.toLowerCase()).toContain("experiencia demostrable");
  expect(audienceRoles.map((role) => role.title)).toEqual([
    "AI engineers",
    "Product engineers",
    "Software engineers",
  ]);
});

test("exposes skip links and section jumps for keyboard users", () => {
  expect(skipLinks[0]?.href).toBe("#contenido");
  expect(skipLinks[1]?.href).toBe("#apply");
  expect(sectionNav.map((item) => item.href)).toEqual([
    "#why",
    "#challenges",
    "#people",
    "#prizes",
    "#experience",
    "#apply",
  ]);
  expect(worldChapters.map((chapter) => chapter.id)).toEqual([
    "overlook",
    "pisac",
    "moray",
    "maras",
    "ollantaytambo",
    "machupicchu",
  ]);
});

test("labels every world chapter and gives each one its copy", () => {
  for (const chapter of worldChapters) {
    expect(chapter.label.length).toBeGreaterThan(0);
    const copy = worldChapterCopy[chapter.id];
    expect(copy).toBeDefined();
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.body.length).toBeGreaterThan(0);
    expect(copy.metric.length).toBeGreaterThan(0);
  }
});

test("quotes each site's real elevation, not a neighbouring town's", () => {
  // Both of these were wrong in the brief this came from: the coordinates
  // given for Moray were the town of Urubamba's, and the 3,380 m quoted for
  // the Salineras is the elevation of Maras town, 5 km up the hill from the
  // pans. Numbers on the landing have to match the ground the camera shows.
  expect(worldChapterCopy.moray.eyebrow).toContain("3,500");
  expect(worldChapterCopy.ollantaytambo.eyebrow).toContain("2,792");
  expect(worldChapterCopy.machupicchu.eyebrow).toContain("2,430");
  expect(worldChapterCopy.maras.eyebrow).not.toContain("3,380");
});

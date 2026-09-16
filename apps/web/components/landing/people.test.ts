import { expect, test } from "bun:test";

test("renders the panel chapter without invented identities", async () => {
  const people = await Bun.file(
    new URL("./people.tsx", import.meta.url),
  ).text();
  const page = await Bun.file(
    new URL("../../app/page.tsx", import.meta.url),
  ).text();

  expect(page).toContain("LandingPeople");
  expect(people).toContain('id="people"');
  expect(people).toContain("peopleCopy.status");
  expect(people).not.toMatch(/<img|next\/image|avatarSrc|linkedin/i);
});

test("locks landing chapters as Evento, Panel, Postular, Premios, Tracks", async () => {
  const page = await Bun.file(
    new URL("../../app/page.tsx", import.meta.url),
  ).text();
  const order = [
    "LandingHero",
    "LandingEvent",
    "LandingPeople",
    "LandingApply",
    "LandingPrizes",
    "LandingChallenges",
    "LandingSponsors",
  ];
  const indexes = order.map((name) => page.indexOf(`<${name}`));

  expect(indexes.every((index) => index >= 0)).toBe(true);
  expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
  expect(page).not.toContain("LandingAudience");
  expect(page).not.toContain("LandingExperience");
  expect(page).not.toContain("#experience");
});

import { expect, test } from "bun:test";

test("keeps FAQs in their own section instead of inside Evento", async () => {
  const event = await Bun.file(new URL("./event.tsx", import.meta.url)).text();
  const faq = await Bun.file(new URL("./faq.tsx", import.meta.url)).text();
  const page = await Bun.file(
    new URL("../../app/page.tsx", import.meta.url),
  ).text();

  expect(page).toContain("LandingFaq");
  expect(faq).toContain('id="faq"');
  expect(faq).toContain("faqCopy.title");
  expect(event).not.toContain("faqCopy");
  expect(event).not.toContain('id="faq"');
});

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

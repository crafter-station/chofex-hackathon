import { expect, test } from "bun:test";

import { detectPostUrl } from "./post-url";

function idOf(value: string): string | null | undefined {
  const match = detectPostUrl(value);
  return match === null ? undefined : match.id;
}

test("treats plain text as a typed id, not a link", () => {
  expect(detectPostUrl("launch-reel")).toBeNull();
  expect(detectPostUrl("  Reel 42 / Carrusel  ")).toBeNull();
  expect(detectPostUrl("")).toBeNull();
  expect(detectPostUrl("1234567890_9876543210")).toBeNull();
});

test("flags links from sites we do not build links for", () => {
  expect(detectPostUrl("https://example.com/posts/123")).toEqual({
    network: null,
    kind: null,
    id: null,
  });
  // facebook.com as a path segment must not be read as the host.
  expect(
    detectPostUrl("https://www.example.com/facebook.com/posts/12345"),
  ).toEqual({ network: null, kind: null, id: null });
});

test("reads instagram shortcodes from every post shape", () => {
  expect(detectPostUrl("https://www.instagram.com/p/C7_Hlo8y9aP/")).toEqual({
    network: "instagram",
    kind: "post",
    id: "C7_Hlo8y9aP",
  });
  expect(detectPostUrl("https://instagram.com/reel/C2sAwA5vGaT")).toEqual({
    network: "instagram",
    kind: "reel",
    id: "C2sAwA5vGaT",
  });
  expect(idOf("www.instagram.com/reels/C2sAwA5vGaT/")).toBe("C2sAwA5vGaT");
  expect(idOf("http://instagr.am/p/tsxp1hhQTG/")).toBe("tsxp1hhQTG");
  expect(detectPostUrl("https://www.instagram.com/tv/BkQjBdEA3ov/")).toEqual({
    network: "instagram",
    kind: "video",
    id: "BkQjBdEA3ov",
  });
  expect(idOf("https://www.instagram.com/p/C0CZ4cALqzs/?img_index=2")).toBe(
    "C0CZ4cALqzs",
  );
  expect(
    idOf("https://www.instagram.com/reel/DUajw4YkorV/?igsh=aGJ2ZnZ3"),
  ).toBe("DUajw4YkorV");
});

test("drops the author segment on profile-scoped instagram links", () => {
  expect(idOf("https://www.instagram.com/nike/p/Cx1234abcDE/")).toBe(
    "Cx1234abcDE",
  );
  expect(idOf("https://www.instagram.com/nike/reel/Cx1234abcDE/")).toBe(
    "Cx1234abcDE",
  );
});

test("reads the numeric media id from an instagram story", () => {
  expect(
    detectPostUrl(
      "https://www.instagram.com/stories/purely.anand/2884886531427631361/",
    ),
  ).toEqual({
    network: "instagram",
    kind: "story",
    id: "2884886531427631361",
  });
});

test("marks instagram share links as carrying no readable id", () => {
  for (const url of [
    "https://www.instagram.com/share/BQqZ8x9F2aA/",
    "https://www.instagram.com/share/p/XyZ12345678/",
    "https://www.instagram.com/share/reel/AbCdEfGhIjK/",
  ]) {
    expect(detectPostUrl(url)).toEqual({
      network: "instagram",
      kind: "share",
      id: null,
    });
  }
});

test("finds no id in instagram links that are not posts", () => {
  for (const url of [
    "https://www.instagram.com/nike/",
    "https://www.instagram.com/explore/tags/style/",
    "https://www.instagram.com/p/",
    "https://www.instagram.com/reelsomeword/abc/",
    "https://www.instagram.com/accounts/login/",
  ]) {
    expect(detectPostUrl(url)).toEqual({
      network: "instagram",
      kind: null,
      id: null,
    });
  }
});

test("reads tweet ids across domains and status shapes", () => {
  expect(detectPostUrl("https://twitter.com/jack/status/20")).toEqual({
    network: "x",
    kind: "post",
    id: "20",
  });
  expect(idOf("https://x.com/gruber/status/1480739110017015810")).toBe(
    "1480739110017015810",
  );
  expect(
    idOf("http://www.twitter.com/gruber/statuses/1480739110017015810"),
  ).toBe("1480739110017015810");
  expect(
    idOf("https://mobile.twitter.com/EikoFried/status/995601093001400320"),
  ).toBe("995601093001400320");
  expect(
    idOf("https://x.com/mattnavarra/status/1044147538922803201?s=21"),
  ).toBe("1044147538922803201");
  expect(idOf("https://twitter.com/i/web/status/932586791953158144")).toBe(
    "932586791953158144",
  );
  expect(idOf("https://x.com/i/status/932586791953158144")).toBe(
    "932586791953158144",
  );
});

test("keeps the tweet id when the link points at attached media", () => {
  expect(
    idOf("https://twitter.com/FloodSocial/status/861627479294746624/photo/1"),
  ).toBe("861627479294746624");
  expect(
    idOf("http://twitter.com/katiemoffat/status/567972190639022080/video/1"),
  ).toBe("567972190639022080");
  expect(
    idOf("https://x.com/someuser/status/1234567890123456789/analytics"),
  ).toBe("1234567890123456789");
});

test("finds no id in x links without a status", () => {
  for (const url of [
    "https://twitter.com/elonmusk",
    "https://x.com/i/flow/login",
    "https://x.com/settings/profile",
    "https://x.com/i/status/",
  ]) {
    expect(detectPostUrl(url)).toEqual({ network: "x", kind: null, id: null });
  }
});

test("marks t.co links as carrying no readable id", () => {
  expect(detectPostUrl("https://t.co/KIcdWSj6gN")).toEqual({
    network: "x",
    kind: "share",
    id: null,
  });
});

test("reads the linkedin activity id from both post shapes", () => {
  expect(
    detectPostUrl(
      "https://www.linkedin.com/posts/thatjoshspector_4-ways-to-use-a-linkedin-newsletter-to-grow-activity-7340397943612391425-IAtL",
    ),
  ).toEqual({ network: "linkedin", kind: "post", id: "7340397943612391425" });
  expect(
    idOf(
      "https://www.linkedin.com/posts/stripe_kraken-is-launching-krak-cards-in-the-us-activity-7496332962540589056-vQLE",
    ),
  ).toBe("7496332962540589056");
  expect(
    idOf(
      "https://www.linkedin.com/feed/update/urn:li:activity:6304737154639716352",
    ),
  ).toBe("6304737154639716352");
  expect(
    idOf(
      "https://www.linkedin.com/feed/update/urn:li:activity:7237526974112432128/",
    ),
  ).toBe("7237526974112432128");
  expect(
    idOf(
      "https://www.linkedin.com/feed/update/urn:li:activity:7277191384095174657?trk=public_profile_like_view",
    ),
  ).toBe("7277191384095174657");
  expect(
    idOf(
      "https://es.linkedin.com/posts/janedoe_something-activity-7300000000000000000-WxYz?originalSubdomain=es",
    ),
  ).toBe("7300000000000000000");
});

test("falls back to share and ugcPost urns", () => {
  expect(
    idOf(
      "https://www.linkedin.com/feed/update/urn:li:share:6173878065928642560/",
    ),
  ).toBe("6173878065928642560");
  expect(
    idOf(
      "https://www.linkedin.com/feed/update/urn:li:ugcPost:7100000000000000000/",
    ),
  ).toBe("7100000000000000000");
});

test("uses the slug for pulse articles, which expose no numeric id", () => {
  expect(
    detectPostUrl(
      "https://www.linkedin.com/pulse/how-generate-effective-url-slug-seo-paul-slaney-jkase",
    ),
  ).toEqual({
    network: "linkedin",
    kind: "article",
    id: "how-generate-effective-url-slug-seo-paul-slaney-jkase",
  });
});

test("finds no id in linkedin links that are not a single post", () => {
  for (const url of [
    "https://www.linkedin.com/company/microsoft/posts/?feedView=all",
    "https://www.linkedin.com/in/johndoe-12a3b4c5/",
    "https://www.linkedin.com/feed/update/urn:li:activity:12345",
  ]) {
    expect(detectPostUrl(url)).toEqual({
      network: "linkedin",
      kind: null,
      id: null,
    });
  }
  expect(detectPostUrl("https://lnkd.in/dQ3xYzAB")).toEqual({
    network: "linkedin",
    kind: "share",
    id: null,
  });
});

test("reads facebook post ids, including opaque pfbid tokens", () => {
  expect(
    detectPostUrl(
      "https://www.facebook.com/NASA/posts/pfbid02kYMcM2ExtiZ1aAxtrrDTGkUmvC3s3Y8fEUtbHkp2KHZ3HWrcTtbXUhx9y8pq8kZUl",
    ),
  ).toEqual({
    network: "facebook",
    kind: "post",
    id: "pfbid02kYMcM2ExtiZ1aAxtrrDTGkUmvC3s3Y8fEUtbHkp2KHZ3HWrcTtbXUhx9y8pq8kZUl",
  });
  expect(
    idOf(
      "https://www.facebook.com/username.123/posts/pfbid0abcDEF456ghiJKL789mno?__cft__[0]=AZXyz&mibextid=xyz123",
    ),
  ).toBe("pfbid0abcDEF456ghiJKL789mno");
  expect(
    idOf(
      "https://www.facebook.com/groups/2106162202855060/posts/2235977459873533/",
    ),
  ).toBe("2235977459873533");
});

test("prefers story_fbid over the page id on permalink urls", () => {
  expect(
    detectPostUrl(
      "https://www.facebook.com/permalink.php?story_fbid=1744466238918243&id=1388921564472714",
    ),
  ).toEqual({ network: "facebook", kind: "post", id: "1744466238918243" });
  expect(
    idOf(
      "https://m.facebook.com/story.php?story_fbid=987654321098765&id=123456789012345",
    ),
  ).toBe("987654321098765");
  expect(
    idOf(
      "https://web.facebook.com/permalink.php?story_fbid=555555555555555&id=222222222222222&__cft__[0]=AZ&__tn__=%2CO%2CP-R",
    ),
  ).toBe("555555555555555");
  expect(
    idOf(
      "https://www.facebook.com/permalink.php?story_fbid=pfbid0WuqdxKi9geNcB72QT8L97G4z7jBfxA6aFuRRjPxcFa8upRNXc6JSbdgUCWmh6g8fl&id=100083036365627",
    ),
  ).toBe(
    "pfbid0WuqdxKi9geNcB72QT8L97G4z7jBfxA6aFuRRjPxcFa8upRNXc6JSbdgUCWmh6g8fl",
  );
});

test("reads facebook photos, videos and reels", () => {
  expect(
    detectPostUrl(
      "https://www.facebook.com/photo.php?fbid=10151052362543337&set=a.123456.7891.100000&type=3",
    ),
  ).toEqual({ network: "facebook", kind: "photo", id: "10151052362543337" });
  expect(
    idOf(
      "https://www.facebook.com/photo/?fbid=709812345678901&set=pcb.709812399999999",
    ),
  ).toBe("709812345678901");
  expect(
    detectPostUrl("https://www.facebook.com/watch/?v=1234567890123456"),
  ).toEqual({
    network: "facebook",
    kind: "video",
    id: "1234567890123456",
  });
  expect(
    idOf(
      "https://www.facebook.com/FacebookDevelopers/videos/10152454700553553/",
    ),
  ).toBe("10152454700553553");
  expect(
    idOf(
      "https://www.facebook.com/somepage/videos/vb.100000/10152454700553553/",
    ),
  ).toBe("10152454700553553");
  expect(
    detectPostUrl("https://www.facebook.com/reel/917525744151644/"),
  ).toEqual({
    network: "facebook",
    kind: "reel",
    id: "917525744151644",
  });
});

test("marks facebook share links as carrying no readable id", () => {
  for (const url of [
    "https://fb.watch/6gcTonZXeD/",
    "https://www.facebook.com/share/r/17c4N6YdDc/",
    "https://www.facebook.com/share/p/18mdUVDAt8/",
    "https://www.facebook.com/share/v/6gcTonZXeD/",
  ]) {
    expect(detectPostUrl(url)).toEqual({
      network: "facebook",
      kind: "share",
      id: null,
    });
  }
});

test("finds no id in facebook links that are not posts", () => {
  for (const url of [
    "https://www.facebook.com/zuck",
    "https://www.facebook.com/groups/somegroupname/",
    "https://www.facebook.com/photo.php",
    "https://www.facebook.com/watch",
    "https://www.facebook.com/notreal/posts/abcSHORT",
    "https://www.facebook.com/marketplace/item/1234567890123456/",
    "https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2Fsomething&h=AT0",
  ]) {
    expect(detectPostUrl(url)).toEqual({
      network: "facebook",
      kind: null,
      id: null,
    });
  }
});

test("matches routes regardless of casing, keeping the id as pasted", () => {
  expect(idOf("INSTAGRAM.COM/P/C7_Hlo8y9aP/")).toBe("C7_Hlo8y9aP");
  expect(idOf("https://TWITTER.COM/Foo_Bar1/STATUS/1480739110017015810")).toBe(
    "1480739110017015810",
  );
  expect(
    idOf("https://WWW.FACEBOOK.COM/NASA/Posts/pfbid0abcDEF456ghiJKL"),
  ).toBe("pfbid0abcDEF456ghiJKL");
});

test("keeps the post id when the link points deeper into the thread", () => {
  expect(
    idOf("https://www.facebook.com/somepage/posts/1234567890/comments/999"),
  ).toBe("1234567890");
});

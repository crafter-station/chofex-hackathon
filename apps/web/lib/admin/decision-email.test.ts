import { describe, expect, test } from "bun:test";

import { buildDecisionEmail } from "./decision-email";

describe("buildDecisionEmail", () => {
  test("renders approval copy with concrete attendance next steps", () => {
    const email = buildDecisionEmail({
      decision: "accepted",
      firstName: "Ada",
    });

    expect(email.subject).toBe("You’re in — welcome to Hack the Andes");
    expect(email.text).toContain("Hi Ada,");
    expect(email.text).toContain("chofex confirm");
    expect(email.html).toContain("APPLICATION APPROVED");
    expect(email.html).toContain("Complete your attendance details");
  });

  test("renders respectful denial copy and reapplication next steps", () => {
    const email = buildDecisionEmail({
      decision: "rejected",
      firstName: "Grace",
    });

    expect(email.subject).toBe("An update on your Hack the Andes application");
    expect(email.text).toContain("unable to offer you a place");
    expect(email.text).toContain("chofex register");
    expect(email.html).toContain("Thank you for applying.");
  });

  test("includes the review note and escapes HTML input", () => {
    const email = buildDecisionEmail({
      decision: "accepted",
      firstName: '<Ada & "friends">',
      message: "Bring <ideas> & curiosity.",
    });

    expect(email.text).toContain("A note from our review team:");
    expect(email.text).toContain("Bring <ideas> & curiosity.");
    expect(email.html).toContain("&lt;Ada &amp; &quot;friends&quot;&gt;");
    expect(email.html).toContain("Bring &lt;ideas&gt; &amp; curiosity.");
    expect(email.html).not.toContain("Bring <ideas>");
  });
});

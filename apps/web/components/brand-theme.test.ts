import { describe, expect, test } from "bun:test";
import { brandColors, brandColorWithAlpha } from "@chofex/ui/lib/brand-theme";

describe("brand theme", () => {
  test("keeps non-CSS render colors aligned with the browser tokens", async () => {
    const css = await Bun.file(
      new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
    ).text();

    for (const color of Object.values(brandColors.dark)) {
      expect(css).toContain(color);
    }
    for (const color of Object.values(brandColors.light)) {
      expect(css).toContain(color);
    }
  });

  test("converts shared colors for renderers that require rgba", () => {
    expect(brandColorWithAlpha(brandColors.dark.ink, 0.72)).toBe(
      "rgba(246, 243, 238, 0.72)",
    );
  });
});

import { describe, expect, test } from "bun:test";
import { brandColors, brandColorWithAlpha } from "@chofex/ui/lib/brand-theme";

describe("brand theme", () => {
  test("keeps non-CSS render colors aligned with the browser tokens", async () => {
    const css = await Bun.file(
      new URL(import.meta.resolve("@chofex/ui/globals.css")),
    ).text();
    const lightPaletteStart = css.indexOf(".brand-light");
    const darkCss = css.slice(0, lightPaletteStart);
    const lightCss = css.slice(lightPaletteStart);

    expect(darkCss).toContain(`--hud-paper: ${brandColors.dark.paper};`);
    expect(darkCss).toContain(`--sidebar: ${brandColors.dark.surface};`);
    expect(darkCss).toContain(`--hud-ink: ${brandColors.dark.ink};`);
    expect(darkCss).toContain(`--hud-action: ${brandColors.dark.action};`);
    expect(darkCss).toContain(
      `--hud-action-hover: ${brandColors.dark.actionHover};`,
    );
    expect(darkCss).toContain(`--hud-status: ${brandColors.dark.status};`);
    expect(darkCss).toContain(`--hud-accent: ${brandColors.dark.accent};`);
    expect(darkCss).toContain(`--hud-muted: ${brandColors.dark.muted};`);

    expect(lightCss).toContain(`--hud-paper: ${brandColors.light.paper};`);
    expect(lightCss).toContain(`--hud-card: ${brandColors.light.surface};`);
    expect(lightCss).toContain(`--hud-ink: ${brandColors.light.ink};`);
    expect(lightCss).toContain(`--hud-action: ${brandColors.light.action};`);
    expect(lightCss).toContain(
      `--hud-action-hover: ${brandColors.light.actionHover};`,
    );
    expect(lightCss).toContain(`--hud-status: ${brandColors.light.status};`);
    expect(lightCss).toContain(`--hud-accent: ${brandColors.light.accent};`);
    expect(lightCss).toContain(`--hud-muted: ${brandColors.light.muted};`);
  });

  test("converts shared colors for renderers that require rgba", () => {
    expect(brandColorWithAlpha(brandColors.dark.ink, 0.72)).toBe(
      "rgba(246, 243, 238, 0.72)",
    );
  });
});

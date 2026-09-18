import { expect, test } from "bun:test";

function luminance(hex: string) {
  return [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
    const channel =
      Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    const linear =
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + weight * linear;
  }, 0);
}

test("live challenge banner meets WCAG AAA contrast for normal text", async () => {
  const css = await Bun.file(new URL("./landing.css", import.meta.url)).text();
  const theme = await Bun.file(
    new URL("../../../../packages/ui/src/styles/globals.css", import.meta.url),
  ).text();
  const banner = css.match(/\.landing-live-banner\s*\{([^}]+)\}/)?.[1];
  const darkTheme = theme.match(/\.brand-dark\s*\{([^}]+)\}/)?.[1];

  if (!banner || !darkTheme) {
    throw new Error("Missing live banner styles or dark brand palette");
  }

  function resolveColor(property: string) {
    const token = banner?.match(
      new RegExp(`(?:^|;)\\s*${property}:\\s*var\\((--[\\w-]+)\\)`),
    )?.[1];
    const hex = darkTheme?.match(
      new RegExp(`${token}:\\s*(#[0-9a-f]{6})\\s*;`, "i"),
    )?.[1];

    if (!token || !hex) {
      throw new Error(`Missing brand color for banner ${property}`);
    }

    return hex;
  }

  const foreground = luminance(resolveColor("color"));
  const background = luminance(resolveColor("background"));
  const ratio =
    (Math.max(foreground, background) + 0.05) /
    (Math.min(foreground, background) + 0.05);

  expect(ratio).toBeGreaterThanOrEqual(7);
});

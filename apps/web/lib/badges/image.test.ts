import { describe, expect, test } from "bun:test";

import { badgeFrameSvg, escapeXml } from "./image";

describe("badge image", () => {
  test("escapes participant names before placing them in SVG", () => {
    expect(escapeXml('Ada <script> & "Grace"')).toBe(
      "Ada &lt;script&gt; &amp; &quot;Grace&quot;",
    );
    const svg = badgeFrameSvg("Ada <script>").toString();
    expect(svg).toContain("Ada &lt;script&gt;");
    expect(svg).not.toContain("Ada <script>");
  });

  test("fits long names to the available width", () => {
    const svg = badgeFrameSvg(
      "Ada Augusta King, Countess of Lovelace",
    ).toString();
    expect(svg).toContain('textLength="840"');
  });

  test("uses the font installed in the Trigger.dev image", () => {
    const svg = badgeFrameSvg("Ada Lovelace").toString();

    expect(svg).toContain('font-family="Liberation Sans"');
    expect(svg).not.toContain('font-family="Arial');
  });
});

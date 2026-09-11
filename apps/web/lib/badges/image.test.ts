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
});

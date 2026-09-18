export const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const nameText = (fullName: string): string => {
  const safeName = escapeXml(fullName.trim());
  let fit = "";
  if (fullName.length > 24) {
    fit = ' textLength="840" lengthAdjust="spacingAndGlyphs"';
  }
  return `<text x="512" y="1130" text-anchor="middle"${fit}>${safeName}</text>`;
};

export const badgeFrameSvg = (fullName: string): Buffer =>
  Buffer.from(`
    <svg width="1024" height="1280" viewBox="0 0 1024 1280" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1280" fill="${light.paper}"/>
      <rect x="48" y="48" width="928" height="928" fill="${dark.paper}"/>
      <rect x="48" y="1008" width="928" height="224" fill="${dark.action}"/>
      <g fill="${dark.paper}" font-family="Liberation Sans" font-size="68" font-weight="800">
        ${nameText(fullName)}
      </g>
      <text x="512" y="1190" text-anchor="middle" fill="${dark.paper}" font-family="Liberation Sans" font-size="28" font-weight="700" letter-spacing="5">HACK THE ANDES</text>
    </svg>
  `);

import { brandColors } from "@chofex/ui/lib/brand-theme";

const dark = brandColors.dark;
const light = brandColors.light;

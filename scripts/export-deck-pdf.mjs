#!/usr/bin/env node
/**
 * Deck web → PDF.
 *
 *   node scripts/export-deck-pdf.mjs <url> <output.pdf>
 *
 * Screenshots each slide from the live page and stitches them into a 16:9 PDF.
 * It is a screenshot pass, not a print stylesheet: what renders on the web is
 * exactly what lands in the PDF, so a deck never has two divergent layouts.
 *
 * Requires Playwright with Chromium:
 *   bun add -d playwright && bunx playwright install chromium
 *
 * Unlike the version this was ported from, it resolves Playwright normally
 * (no absolute path into one machine's home directory) and assembles the PDF
 * with Chromium itself, so ImageMagick is not needed.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const WIDTH = 1600;
const HEIGHT = 900;
/** Retina: the PDF is read zoomed-in on a laptop as often as printed. */
const SCALE = 2;
const SLIDE_SETTLE_MS = 250;

function usage(message) {
  if (message) console.error(`\n  ${message}`);
  console.error(`
  Uso: node scripts/export-deck-pdf.mjs <url> <salida.pdf>

  Ejemplo:
    node scripts/export-deck-pdf.mjs \\
      http://localhost:3000/deck/main \\
      hack-the-andes-deck.pdf
`);
  process.exit(1);
}

const [url, output] = process.argv.slice(2);
if (!url || !output) usage("Faltan argumentos.");
if (!/^https?:\/\//.test(url)) usage(`URL inválida: ${url}`);

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  usage(
    "Playwright no está instalado. Corre:\n  bun add -d playwright && bunx playwright install chromium",
  );
}

const outputPath = resolve(process.cwd(), output);
const workDir = await mkdtemp(join(tmpdir(), "deck-export-"));
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  });

  console.log(`→ Abriendo ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });

  // Hide the chrome: it is navigation, not content.
  await page.addStyleTag({
    content: `
      .deck-chrome, .deck-controls, .deck-index, nextjs-portal {
        display: none !important;
      }
    `,
  });

  const slideCount = await page.locator(".deck-slide").count();
  if (slideCount === 0) {
    throw new Error(
      "No se encontró ninguna .deck-slide. ¿Es una URL de deck y el servidor está corriendo?",
    );
  }
  console.log(`→ ${slideCount} slides`);

  const shots = [];
  for (let i = 0; i < slideCount; i += 1) {
    const file = join(workDir, `${String(i).padStart(3, "0")}.png`);
    await page.screenshot({ path: file, type: "png" });
    shots.push(file);
    process.stdout.write(`\r  capturado ${i + 1}/${slideCount}`);
    if (i < slideCount - 1) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(SLIDE_SETTLE_MS);
    }
  }
  process.stdout.write("\n");

  // Assemble: one full-bleed image per page, printed by the same browser.
  const pages = shots
    .map((file) => `<img src="file://${file}" alt="">`)
    .join("\n");
  const docPath = join(workDir, "deck.html");
  await writeFile(
    docPath,
    `<!doctype html><meta charset="utf-8">
<style>
  @page { size: ${WIDTH / 100}in ${HEIGHT / 100}in; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  img { display: block; width: 100%; height: auto; break-after: page; }
  img:last-child { break-after: auto; }
</style>
${pages}`,
    "utf-8",
  );

  const printer = await browser.newPage();
  await printer.goto(`file://${docPath}`, { waitUntil: "networkidle" });
  await printer.pdf({
    path: outputPath,
    width: `${WIDTH / 100}in`,
    height: `${HEIGHT / 100}in`,
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  console.log(`✓ ${outputPath}`);
} finally {
  await browser.close();
  await rm(workDir, { recursive: true, force: true });
}

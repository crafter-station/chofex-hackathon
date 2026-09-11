import { describe, expect, test } from "bun:test";
import sharp from "sharp";

import {
  normalizePixelArtOutput,
  preparePixelArtInput,
} from "./pixel-art-image";

describe("pixel-art image processing", () => {
  test("downscales and compresses the OpenAI reference image", async () => {
    const source = await sharp({
      create: {
        width: 1_600,
        height: 1_200,
        channels: 3,
        background: "#e879f9",
      },
    })
      .png()
      .toBuffer();

    const input = await preparePixelArtInput(new Uint8Array(source).buffer);
    const metadata = await sharp(input).metadata();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(512);
    expect(metadata.height).toBe(512);
    expect(input.byteLength).toBeLessThan(source.byteLength);
  });

  test("normalizes generated images to an 800px square PNG", async () => {
    const source = await sharp({
      create: {
        width: 1_024,
        height: 1_024,
        channels: 3,
        background: "#111827",
      },
    })
      .jpeg()
      .toBuffer();

    const output = await normalizePixelArtOutput(source);
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(800);
  });
});

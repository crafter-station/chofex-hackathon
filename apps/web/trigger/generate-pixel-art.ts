import { eq } from "@chofex/db/orm";
import { participantBadges } from "@chofex/db/schema";
import { db } from "@chofex/db/worker";
import { logger, task } from "@trigger.dev/sdk";
import { generateImage } from "ai";

import { pixelArtGenerationSize, pixelArtModel } from "../lib/badges/config";
import {
  normalizePixelArtOutput,
  preparePixelArtInput,
} from "../lib/badges/pixel-art-image";
import { downloadImage, uploadPng } from "./badge-assets";

const pixelArtPrompt = [
  "Transform this profile portrait into polished 16-bit pixel art.",
  "Keep the person's recognizable face, hairstyle, expression, skin tone, and pose.",
  "Use crisp square pixels, a limited vibrant palette, clean edges, and a simple dark navy background.",
  "Centered head-and-shoulders portrait, no text, no logos, no frame.",
].join(" ");

export interface GeneratePixelArtPayload {
  readonly applicationId: string;
  readonly pictureUrl: string;
}

export const generatePixelArt = task({
  id: "generate-pixel-art",
  queue: { concurrencyLimit: 3 },
  maxDuration: 600,
  run: async (payload: GeneratePixelArtPayload) => {
    logger.info("Generating pixel-art portrait", {
      applicationId: payload.applicationId,
      model: pixelArtModel,
    });
    const original = await downloadImage(payload.pictureUrl);
    const referenceImage = await preparePixelArtInput(original);
    const { image, usage, warnings } = await generateImage({
      model: pixelArtModel,
      prompt: {
        text: pixelArtPrompt,
        images: [referenceImage],
      },
      size: pixelArtGenerationSize,
      providerOptions: {
        openai: {
          quality: "low",
          outputFormat: "png",
        },
      },
      abortSignal: AbortSignal.timeout(300_000),
    });
    logger.info("Generated pixel-art portrait", { usage, warnings });
    const normalizedImage = await normalizePixelArtOutput(image.uint8Array);
    const blob = await uploadPng(
      `participant-badges/${payload.applicationId}/pixel-art.png`,
      normalizedImage,
    );
    await db
      .update(participantBadges)
      .set({
        pixelArtUrl: blob.url,
        pixelArtPathname: blob.pathname,
        updatedAt: new Date(),
      })
      .where(eq(participantBadges.applicationId, payload.applicationId));

    return { url: blob.url, pathname: blob.pathname };
  },
});

import { eq } from "@chofex/db/orm";
import { participantBadges } from "@chofex/db/schema";
import { db } from "@chofex/db/worker";
import { fal } from "@fal-ai/client";
import { logger, task } from "@trigger.dev/sdk";

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
    const model =
      process.env.FAL_PIXEL_ART_MODEL ?? "fal-ai/flux/dev/image-to-image";
    logger.info("Generating pixel-art portrait", {
      applicationId: payload.applicationId,
      model,
    });
    const result = await fal.subscribe(model, {
      input: {
        image_url: payload.pictureUrl,
        prompt: pixelArtPrompt,
        strength: 0.78,
        num_images: 1,
        output_format: "png",
        enable_safety_checker: true,
      },
    });
    const data = result.data as {
      readonly images?: ReadonlyArray<{ readonly url?: string }>;
    };
    const generatedUrl = data.images?.[0]?.url;
    if (!generatedUrl) throw new Error("FLUX did not return an image URL");

    const image = await downloadImage(generatedUrl);
    const blob = await uploadPng(
      `participant-badges/${payload.applicationId}/pixel-art.png`,
      image,
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

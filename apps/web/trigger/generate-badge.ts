import { eq } from "@chofex/db/orm";
import { participantBadges } from "@chofex/db/schema";
import { db } from "@chofex/db/worker";
import { task } from "@trigger.dev/sdk";
import sharp from "sharp";

import { badgeFrameSvg } from "../lib/badges/image";
import { downloadImage, uploadPng } from "./badge-assets";

export interface GenerateBadgePayload {
  readonly applicationId: string;
  readonly fullName: string;
  readonly pixelArtUrl: string;
}

export const generateBadge = task({
  id: "generate-badge",
  queue: { concurrencyLimit: 5 },
  maxDuration: 300,
  run: async (payload: GenerateBadgePayload) => {
    const source = await downloadImage(payload.pixelArtUrl);
    const portrait = await sharp(source)
      .resize(896, 896, { fit: "cover", position: "attention" })
      .png()
      .toBuffer();
    const badge = await sharp(badgeFrameSvg(payload.fullName))
      .composite([{ input: portrait, left: 64, top: 64 }])
      .png()
      .toBuffer();
    const bytes = new Uint8Array(badge).buffer;
    const blob = await uploadPng(
      `participant-badges/${payload.applicationId}/badge.png`,
      bytes,
    );
    await db
      .update(participantBadges)
      .set({
        badgeUrl: blob.url,
        badgePathname: blob.pathname,
        updatedAt: new Date(),
      })
      .where(eq(participantBadges.applicationId, payload.applicationId));

    return { url: blob.url, pathname: blob.pathname };
  },
});

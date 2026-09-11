import { readFile, stat } from "node:fs/promises";

import {
  detectPictureContentType,
  maximumPictureBytes,
} from "@chofex/registration-contract";
import { put } from "@vercel/blob/client";
import { Effect } from "effect";

import {
  type ApiClientOptions,
  beginPictureUpload,
  completePictureUpload,
} from "./api-client.js";
import { cliError } from "./errors.js";

const readPicture = (path: string) =>
  Effect.tryPromise({
    try: async () => {
      const metadata = await stat(path);
      if (!metadata.isFile()) throw new Error("Path is not a regular file");
      if (metadata.size < 1 || metadata.size > maximumPictureBytes) {
        throw new Error("Picture must be between 1 byte and 5 MB");
      }
      const contents = await readFile(path);
      const contentType = detectPictureContentType(contents);
      if (!contentType) throw new Error("Picture must be JPEG, PNG, or WebP");
      return { contents, contentType, size: metadata.size };
    },
    catch: (error) =>
      cliError(
        "INVALID_PICTURE_FILE",
        `Could not use ${path}: ${String(error)}`,
      ),
  });

const progressLine = (percentage: number): Effect.Effect<void> =>
  Effect.sync(() => {
    const rounded = Math.min(100, Math.max(0, Math.round(percentage)));
    process.stderr.write(`\rUploading picture: ${rounded}%`);
    if (rounded === 100) process.stderr.write("\n");
  });

export const uploadPicture = Effect.fn("uploadPicture")(function* (
  options: ApiClientOptions,
  path: string,
) {
  const picture = yield* readPicture(path);
  const grant = yield* beginPictureUpload(options, {
    contentType: picture.contentType,
    size: picture.size,
  });
  const blob = yield* Effect.tryPromise({
    try: () =>
      put(grant.data.pathname, picture.contents, {
        access: "public",
        token: grant.data.clientToken,
        contentType: picture.contentType,
        onUploadProgress: ({ percentage }) => {
          Effect.runSync(progressLine(percentage));
        },
      }),
    catch: (error) =>
      cliError(
        "PICTURE_UPLOAD_FAILED",
        `Picture upload failed: ${String(error)}`,
        true,
      ),
  });
  return yield* completePictureUpload(options, {
    pathname: blob.pathname,
    url: blob.url,
  });
});

import sharp from "sharp";

import {
  pixelArtInputJpegQuality,
  pixelArtInputMaxSize,
  pixelArtOutputSize,
} from "./config";

export const preparePixelArtInput = async (
  source: ArrayBuffer,
): Promise<Uint8Array> => {
  const compressed = await sharp(source)
    .rotate()
    .resize(pixelArtInputMaxSize, pixelArtInputMaxSize, {
      fit: "contain",
      background: "#111827",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: pixelArtInputJpegQuality,
      chromaSubsampling: "4:2:0",
      mozjpeg: true,
    })
    .toBuffer();
  return new Uint8Array(compressed);
};

export const normalizePixelArtOutput = async (
  source: Uint8Array,
): Promise<ArrayBuffer> => {
  const normalized = await sharp(source)
    .resize(pixelArtOutputSize, pixelArtOutputSize, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  return new Uint8Array(normalized).buffer;
};

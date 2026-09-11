import { put } from "@vercel/blob";

export const downloadImage = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Could not download image: HTTP ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("Downloaded badge asset is not an image");
  }
  return response.arrayBuffer();
};

export const uploadPng = async (pathname: string, bytes: ArrayBuffer) =>
  put(pathname, bytes, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });

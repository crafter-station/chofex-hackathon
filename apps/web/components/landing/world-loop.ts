export type WorldFrameLoop = "always" | "never";

export function isDocumentVisible(
  visibilityState: DocumentVisibilityState | undefined,
): boolean {
  if (visibilityState === undefined) {
    return true;
  }
  return visibilityState === "visible";
}

export function shouldRunWorldFrameLoop(input: {
  intersecting: boolean;
  documentVisible: boolean;
  reducedMotion?: boolean;
}): boolean {
  if (!input.intersecting || !input.documentVisible) {
    return false;
  }
  if (input.reducedMotion) {
    return false;
  }
  return true;
}

export function worldFrameLoop(run: boolean): WorldFrameLoop {
  if (run) {
    return "always";
  }
  return "never";
}

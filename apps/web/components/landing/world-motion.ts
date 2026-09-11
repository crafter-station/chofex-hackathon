/** Scene-motion policy for the Machu Picchu hero world. */

export function worldMotionScale(reducedMotion: boolean): number {
  if (reducedMotion) {
    return 0;
  }
  return 1;
}

export function shouldPlaySceneEffects(reducedMotion: boolean): boolean {
  return !reducedMotion;
}

export function subscribePrefersReducedMotion(
  listener: (matches: boolean) => void,
): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    listener(false);
    return () => {};
  }

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const notify = () => {
    listener(media.matches);
  };

  notify();
  media.addEventListener("change", notify);
  return () => {
    media.removeEventListener("change", notify);
  };
}

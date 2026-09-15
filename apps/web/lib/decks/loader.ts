import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import matter from "gray-matter";

const DECKS_DIR = join(process.cwd(), "content", "decks");

/**
 * Typographic variant, opted into per deck from its deck.json.
 *
 * - `editorial` (default): Barlow Condensed display over IBM Plex Mono chrome,
 *   the landing's own pairing. Use it unless there's a reason not to.
 * - `plain`: IBM Plex Mono throughout, no display pair. For sober decks aimed
 *   at institutions, where the condensed display reads as marketing.
 */
export type DeckStyle = "plain" | "editorial";

export type DeckMeta = {
  title: string;
  description: string;
  image?: string;
  icon?: string;
  appleIcon?: string;
  style?: DeckStyle;
} & Record<string, unknown>;

export type SlideMeta = {
  title: string;
} & Record<string, unknown>;

export type SlideSource = {
  meta: SlideMeta;
  source: string;
  number: number;
  id: string;
};

export type LoadedDeck = {
  meta: DeckMeta;
  slug: string;
  slides: SlideSource[];
};

const SLIDE_FILE_RE = /^(\d{2,})-.+\.mdx$/;

function parseSlideFilename(
  name: string,
): { number: number; id: string } | null {
  const match = SLIDE_FILE_RE.exec(name);
  const digits = match?.[1];
  if (!digits) return null;
  return {
    number: Number.parseInt(digits, 10),
    id: name.replace(/\.mdx$/, ""),
  };
}

/** A missing directory is an empty deck list, not a crash. */
async function readDirEntries(dir: string) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** A folder only counts as a deck when it has a readable deck.json. */
export async function listDecks(): Promise<string[]> {
  const entries = await readDirEntries(DECKS_DIR);
  const slugs: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await readFile(join(DECKS_DIR, entry.name, "deck.json"), "utf-8");
      slugs.push(entry.name);
    } catch {
      // no deck.json — not a deck
    }
  }

  return slugs.sort();
}

export async function loadDeck(slug: string): Promise<LoadedDeck | null> {
  const deckDir = join(DECKS_DIR, slug);

  let rawMeta: string;
  try {
    rawMeta = await readFile(join(deckDir, "deck.json"), "utf-8");
  } catch {
    return null;
  }

  let meta: DeckMeta;
  try {
    meta = JSON.parse(rawMeta) as DeckMeta;
  } catch (error) {
    // Name the deck: a bare JSON.parse error doesn't say which file broke.
    throw new Error(`deck.json inválido en content/decks/${slug}`, {
      cause: error,
    });
  }

  const entries = await readdir(deckDir, { withFileTypes: true });
  const slides: SlideSource[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
    const parsed = parseSlideFilename(entry.name);
    if (!parsed) continue;

    const raw = await readFile(join(deckDir, entry.name), "utf-8");
    const { data, content } = matter(raw);

    slides.push({
      meta: data as SlideMeta,
      source: content,
      number: parsed.number,
      id: parsed.id,
    });
  }

  // Order by the filename number, not lexicographically: renaming a file
  // reorders the deck, and dropping the numeric prefix disables a slide.
  slides.sort((a, b) => a.number - b.number);

  return { meta, slug, slides };
}

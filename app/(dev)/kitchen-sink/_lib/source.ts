import { readFile } from "node:fs/promises";
import path from "node:path";

/* Read at request/build time from the real file, never a copied string.
 *
 * A source block transcribed by hand is a second copy that goes stale silently —
 * and a gallery showing source that no longer matches the component it renders
 * beside is worse than one showing none, because it is believed. */

const ROOT = "components";

export type Source = { path: string; code: string };

export async function readSources(rels: readonly string[]): Promise<Source[]> {
  return Promise.all(
    rels.map(async (rel) => ({
      path: `${ROOT}/${rel}`,
      code: (await readFile(path.join(process.cwd(), ROOT, rel), "utf8")).trimEnd(),
    })),
  );
}

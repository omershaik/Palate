// src/corpus/parser/altname-bucket.ts
//
// Extracts a five-bucket AltnameBucket from a list block matching the
// spec's altname pattern. The pattern is:
//
//   - **Vibes:** *premium* — *quiet luxury* — *expensive-feeling*
//   - **Brand exemplars:** *like Aman* — *like Hermès*
//   - **Vernacular labels:** *editorial layout* — *long-form layout*
//   - **Anti-vibes:** *not SaaS-y* — *not startup-coded*
//   - **Compositional intent:** *I want it to feel expensive but not loud*
//
// Each list item begins with a `<strong>Label:</strong>` (note: COLON,
// not period — that's how altnames distinguish from substyles, which
// use `**Name.**` with a period). The content after the strong is a
// sequence of `<em>phrase</em>` nodes separated by " — " text nodes.
//
// The same pattern appears in two places in the spec:
//   - inline within each grammar block (Turn 5, 6, 7 — post-Turn-4)
//   - in the standalone Turn 4 revised altnames file, where each
//     grammar heading has the altname list as its only content
//
// This extractor handles both — the caller passes in a BlockContent[]
// that contains the altname list somewhere, and we find it.

import { toString as mdastToString } from "mdast-util-to-string";
import type { ListItem, PhrasingContent } from "mdast";
import type { AltnameBucket } from "../../types/grammar.js";
import type { BlockContent } from "./heading-tree.js";

/** Maps the label (lowercased, colon stripped) to the AltnameBucket field. */
const LABEL_TO_BUCKET: ReadonlyMap<string, keyof AltnameBucket> = new Map<
  string,
  keyof AltnameBucket
>([
  ["vibes", "vibes"],
  ["brand exemplars", "brand_exemplars"],
  ["vernacular labels", "vernacular"],
  ["anti-vibes", "anti_vibes"],
  ["compositional intent", "compositional_intent"],
]);

/**
 * Empty AltnameBucket factory — used both as the default return when no
 * altname list is found, and as the starting accumulator before
 * parsing.
 */
export function emptyAltnameBucket(): AltnameBucket {
  return {
    vibes: [],
    brand_exemplars: [],
    vernacular: [],
    anti_vibes: [],
    compositional_intent: [],
  };
}

/**
 * Extract the AltnameBucket from a sequence of mdast block content,
 * typically the `contentBlocks` of a grammar's HeadingNode. Returns an
 * empty bucket if no altname list is found — callers (the per-document
 * loaders) decide whether missing altnames are an error.
 *
 * Strategy: find the first list block whose first item looks like an
 * altname item (bold label ending in colon that matches one of the
 * known labels). Parse all items in that list; ignore items whose
 * label is unrecognized.
 */
export function extractAltnameBucket(blocks: BlockContent[]): AltnameBucket {
  const list = findAltnameList(blocks);
  if (list === undefined) return emptyAltnameBucket();

  const bucket = emptyAltnameBucket();
  for (const item of list.children) {
    const parsed = parseAltnameItem(item);
    if (parsed === null) continue;
    bucket[parsed.bucket] = parsed.entries;
  }
  return bucket;
}

/**
 * Find the first list block that contains at least one altname-shaped
 * list item (bold-label-with-colon matching a known bucket name).
 */
function findAltnameList(blocks: BlockContent[]) {
  for (const block of blocks) {
    if (block.type !== "list") continue;
    for (const item of block.children) {
      const label = readItemLabel(item);
      if (label !== null && LABEL_TO_BUCKET.has(label)) {
        return block;
      }
    }
  }
  return undefined;
}

/**
 * Read the bold-label-with-colon prefix of a list item. Returns the
 * lowercased label without the colon, or null if the item doesn't open
 * with a `<strong>...:</strong>` matching the altname pattern.
 *
 * Substyle list items use `**Name.**` with a period, so `endsWith(":")`
 * cleanly distinguishes them.
 */
function readItemLabel(item: ListItem): string | null {
  // List items typically wrap content in a paragraph. Look at the first
  // child node and find the first strong inside.
  const para = item.children.find((c) => c.type === "paragraph");
  if (para === undefined || para.type !== "paragraph") return null;
  const first = para.children[0];
  if (first?.type !== "strong") return null;
  const text = mdastToString(first).trim();
  if (!text.endsWith(":")) return null;
  return text.slice(0, -1).trim().toLowerCase();
}

/**
 * Parse one altname list item into a (bucket, entries) pair. Returns
 * null when the item's label isn't recognized.
 */
function parseAltnameItem(
  item: ListItem,
): { bucket: keyof AltnameBucket; entries: string[] } | null {
  const label = readItemLabel(item);
  if (label === null) return null;
  const bucket = LABEL_TO_BUCKET.get(label);
  if (bucket === undefined) return null;

  // Walk past the leading strong + colon-trailing-space text and collect
  // emphasis nodes' text values. The em-dash separators between phrases
  // appear as text nodes between emphasis nodes; we ignore them.
  const para = item.children.find((c) => c.type === "paragraph");
  if (para === undefined || para.type !== "paragraph") {
    return { bucket, entries: [] };
  }
  const phrasing = para.children.slice(1) as PhrasingContent[];
  const entries: string[] = [];
  for (const node of phrasing) {
    if (node.type === "emphasis") {
      const text = mdastToString(node).trim();
      if (text.length > 0) entries.push(text);
    }
  }
  return { bucket, entries };
}

/**
 * Test predicate exposed for the loader's missing-bucket validation.
 * Returns true when every bucket in the AltnameBucket has at least one
 * entry.
 */
export function isAltnameBucketComplete(bucket: AltnameBucket): boolean {
  return (
    bucket.vibes.length > 0 &&
    bucket.brand_exemplars.length > 0 &&
    bucket.vernacular.length > 0 &&
    bucket.anti_vibes.length > 0 &&
    bucket.compositional_intent.length > 0
  );
}

/**
 * Returns the names of buckets that are empty in the given AltnameBucket.
 * The Group D7 merger uses this for the aggregated LoadError.
 */
export function emptyBuckets(bucket: AltnameBucket): Array<keyof AltnameBucket> {
  const out: Array<keyof AltnameBucket> = [];
  if (bucket.vibes.length === 0) out.push("vibes");
  if (bucket.brand_exemplars.length === 0) out.push("brand_exemplars");
  if (bucket.vernacular.length === 0) out.push("vernacular");
  if (bucket.anti_vibes.length === 0) out.push("anti_vibes");
  if (bucket.compositional_intent.length === 0) out.push("compositional_intent");
  return out;
}

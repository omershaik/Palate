// src/mcp/tools/get-brand-fingerprint.ts
//
// Phase 3 Task 7 — `get_brand_fingerprint` tool implementation.
//
// Looks up a brand fingerprint from corpus.brand_fingerprints (the
// hand-populated v0.1 file at spec/derived/brand-fingerprints.json,
// 15 brands shipped). Returns the fingerprint or — on miss — an
// error response with fuzzy-match suggestions plus the full
// available-brands list.
//
// Per the Task 7 review: AI tools that get back "did you mean
// stripe?" + a list of available brands can recover; getting back
// generic "not found" can't.
//
// Brand id convention (matching spec/derived/brand-fingerprints.json):
// lowercase, hyphenated. Aliases like "Stripe" / "stripe-press" are
// matched case-insensitively + with light substring tolerance.

import type { Corpus } from "../../types/corpus.js";
import {
  errorResponse,
  jsonResponse,
  requireNonEmptyString,
  suggestSimilar,
  type ToolResponse,
} from "./helpers.js";

export async function callGetBrandFingerprint(
  corpus: Corpus,
  args: Record<string, unknown> | undefined,
): Promise<ToolResponse> {
  const queryRaw = requireNonEmptyString(args, "brand");
  if (queryRaw === null) {
    return errorResponse(
      "Missing or empty `brand` argument. Pass a brand identifier (lowercase slug, e.g., 'stripe', 'apple', 'soho-house').",
    );
  }

  // Normalize the query: lowercase, replace whitespace with hyphens,
  // strip non-alphanumeric-or-hyphen. Matches the brand-fingerprints
  // file's slug convention.
  const query = queryRaw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "");

  const fingerprints = corpus.brand_fingerprints.fingerprints;
  const tombstones = corpus.brand_fingerprints.known_unfingerprinted ?? {};
  const availableBrands = Object.keys(fingerprints).sort();
  const tombstoneSlugs = Object.keys(tombstones).sort();

  // Direct hit on the slug.
  if (fingerprints[query] !== undefined) {
    const fp = fingerprints[query];
    return jsonResponse({
      brand: query,
      fingerprint: fp,
      source_version: corpus.brand_fingerprints.version,
    });
  }

  // Phase 3 Task 9: tombstone hit — brand is documented in corpus
  // brand_exemplars but doesn't have a full fingerprint yet. Return
  // a structured "documented gap" response distinguishing this from
  // generic NOT FOUND. AI tools follow the fallback_guidance to
  // route around the missing fingerprint without fabricating data.
  if (tombstones[query] !== undefined) {
    const tomb = tombstones[query];
    return jsonResponse({
      brand: query,
      fingerprint_status: "documented_unfingerprinted",
      tombstone: tomb,
      source_version: corpus.brand_fingerprints.version,
      note:
        "This brand is referenced in the corpus's brand_exemplars buckets but doesn't have a full fingerprint in v0.1. Use `tombstone.fallback_guidance` to route. Phase 4 worker will fill the actual fingerprint over time.",
    });
  }

  // No direct hit and no tombstone — surface suggestions across both
  // sets and the full list.
  const allSearchable = [...availableBrands, ...tombstoneSlugs];
  const suggestions = suggestSimilar(query, allSearchable);
  let diagnostic = `Brand '${queryRaw}' not found in v0.1 brand fingerprints or documented gaps.`;
  if (suggestions.length > 0) {
    diagnostic += ` Did you mean: ${suggestions.join(", ")}?`;
  }
  diagnostic +=
    `\n\nv0.1 ships ${availableBrands.length} hand-populated fingerprints + ${tombstoneSlugs.length} documented unfingerprinted gaps (Phase 4 worker territory). To request a brand for the next refresh, see docs/v0.2-backlog.md.`;

  return errorResponse(diagnostic, {
    label: "Available brands (fingerprinted + documented gaps)",
    values: allSearchable.sort(),
  });
}

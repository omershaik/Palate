// src/mcp/tools/route.ts
//
// Phase 3 Task 7 — `route` tool implementation. Calls the routing
// pipeline with deterministic Stage 1 (no LLM dependency) and
// returns the routed Card.
//
// Per src/routing/stage1/index.ts: deterministic Stage 1 walks the
// corpus altname phrases for a novel brief and produces
// ExtractedSignals. Lower recall than an LLM-grade extractor but
// zero operational complexity (no API key, no network).
//
// AI clients that want LLM-grade extraction can read the
// `palate.brief-template` prompt resource (Task 8) and run their
// own extraction before calling `route` with a more structured
// brief; the deterministic extractor still handles the result.

import type { Corpus } from "../../types/corpus.js";
import { route } from "../../routing/index.js";
import { createDeterministicStage1 } from "../../routing/stage1/index.js";
import {
  errorResponse,
  jsonResponse,
  requireNonEmptyString,
  type ToolResponse,
} from "./helpers.js";

/**
 * Implement the `route` tool. Takes a brief, runs the full routing
 * pipeline, returns a single Card. Phase 3 Task 1's wiring already
 * populates `cards: [card]` on the routing output; we surface
 * `cards[0]` as the primary response.
 *
 * Error responses:
 *   - Missing or empty `brief` → isError with diagnostic.
 *   - Routing surfaces conflict warnings → returned in the response
 *     payload (not as isError); the consuming AI tool decides
 *     whether the warnings are blocking. A brief that produces a
 *     conflict-severity warning is "served with caveats", not
 *     "rejected".
 */
export async function callRoute(
  corpus: Corpus,
  args: Record<string, unknown> | undefined,
): Promise<ToolResponse> {
  const brief = requireNonEmptyString(args, "brief");
  if (brief === null) {
    return errorResponse(
      "Missing or empty `brief` argument. Pass a non-empty string describing the desired site or page (e.g., 'Build a luxury hotel website like Aman with editorial typography').",
    );
  }

  const result = await route(brief, {
    corpus,
    signalExtractor: createDeterministicStage1(corpus),
  });

  // The Card is the primary artifact. We also surface the routing
  // envelope's canonical_match, alternatives, and warnings so the
  // consuming AI tool can show provenance / confidence to the user
  // without a second tool call.
  const card = result.cards[0];
  return jsonResponse({
    card,
    canonical_match: result.canonical_match,
    canonical_match_confidence: result.canonical_match_confidence,
    alternatives: result.alternatives,
    open_warnings: result.open_warnings,
  });
}

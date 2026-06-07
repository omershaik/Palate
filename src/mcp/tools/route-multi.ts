// src/mcp/tools/route-multi.ts
//
// Phase 3 Task 7 — `route_multi` tool implementation.
//
// v0.1 ships per-page card routing only. Multi-page consistency
// (linked cards across home / product / about / etc.) is v0.2 work
// per PRD §6.4. This tool exists in v0.1 for forward compatibility
// with the v0.2 contract — consuming AI tools that integrate
// against the v0.1 surface won't have to migrate when v0.2 lands.
//
// v0.1 behavior: returns a single-card array (the same card route()
// produces for the brief). The response shape matches what v0.2
// will return; just with 1 card instead of N. AI clients can rely
// on response[0] being a valid Card without conditional handling.

import type { Corpus } from "../../types/corpus.js";
import { route } from "../../routing/index.js";
import { createDeterministicStage1 } from "../../routing/stage1/index.js";
import {
  errorResponse,
  jsonResponse,
  requireNonEmptyString,
  type ToolResponse,
} from "./helpers.js";

export async function callRouteMulti(
  corpus: Corpus,
  args: Record<string, unknown> | undefined,
): Promise<ToolResponse> {
  const brief = requireNonEmptyString(args, "brief");
  if (brief === null) {
    return errorResponse(
      "Missing or empty `brief` argument. Pass a non-empty string describing the desired multi-page site (e.g., 'Build a luxury hotel brand site with hero, rooms, dining, and contact pages, in the Aman register').",
    );
  }

  const result = await route(brief, {
    corpus,
    signalExtractor: createDeterministicStage1(corpus),
  });

  // v0.1 single-card array. Documented in the response so AI
  // clients understand the shape is forward-compatible with v0.2's
  // multi-page semantics.
  return jsonResponse({
    cards: result.cards,
    canonical_match: result.canonical_match,
    canonical_match_confidence: result.canonical_match_confidence,
    alternatives: result.alternatives,
    open_warnings: result.open_warnings,
    v01_note:
      "v0.1 ships per-page routing only; this array always has length 1. Multi-page consistency (linked cards) is v0.2 per PRD §6.4. The shape is forward-compatible — v0.2 returns multiple cards in the same array structure.",
  });
}

// src/cards/voice/conventions.ts
//
// Phase 3 Task 4 — Voice guidelines schema lock. Per the refinement:
// every voice profile produces a consistent shape (do_use / do_not_use)
// before per-profile population. AI tools consume this consistency;
// inconsistent shapes across profiles would force the consumer to
// reason about each profile's structure individually.
//
// THE VOICE GUIDELINES CONTRACT:
//
//   1. Each entry in do_use / do_not_use is a DIRECTIVE — a sentence
//      the consuming AI tool follows, not a phrase the user types.
//      "Use first-person plural when discussing decisions" rather than
//      "we / our".
//
//   2. Three categories of directives can mix in either list:
//      - Phrase-level: specific words / phrases to use or avoid
//      - Register-level: tone, formality, distance
//      - Structure-level: sentence shape, rhythm, opening / closing
//        patterns
//
//   3. Both lists may be empty for some profiles where the spec
//      genuinely doesn't differentiate. exactOptionalPropertyTypes
//      discipline applies — empty arrays are explicit, not inferred.
//
//   4. Per-profile guidance is grounded in the spec's voice profile
//      definitions (internal_logic, brand_exemplars, anti_vibes).
//      Don't invent guidance not attested by the spec; the routing
//      engine's voice profile attribution is the source of truth.

import type { VoiceGuidelines } from "../../types/card.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a VoiceGuidelines object from per-profile lists. Both lists
 * are required by the schema; profiles that have no specific guidance
 * for one direction supply an empty array explicitly.
 *
 * The arrays are NOT deduplicated — if a profile lists the same
 * directive twice (which shouldn't happen but defensive against
 * hand-edit duplication), the consumer sees both.
 */
export function buildGuidelines(
  do_use: string[],
  do_not_use: string[],
): VoiceGuidelines {
  return {
    do_use: [...do_use],
    do_not_use: [...do_not_use],
  };
}

/**
 * Default empty guidelines. Used as fall-through for unknown voice
 * profile ids (defensive against future profile additions; consuming
 * AI tool gets explicit empty rather than missing field).
 */
export const EMPTY_GUIDELINES: VoiceGuidelines = {
  do_use: [],
  do_not_use: [],
};

// ---------------------------------------------------------------------------
// Universal anti-LLM-default directives
// ---------------------------------------------------------------------------

/**
 * AI-slop verb avoidance — directives that apply to every voice
 * profile. These are the LLM-default "tells" that signal generated
 * copy regardless of register: "delve", "unleash", "unlock",
 * "navigate" (metaphorical), "leverage", "robust", "seamless",
 * "elevate".
 *
 * Per Phase 2.1's grounding discipline: these are well-attested in
 * design / writing critique literature (NN/G's "writing for the web"
 * series, the Plain Language guidelines, multiple AI-content audits).
 * Including them on every profile's do_not_use is correct because
 * they're slop everywhere — luxury hospitality, neo-brutalist indie
 * SaaS, B2B dashboards — none of those registers want "delve into
 * the world of X" copy.
 */
export const UNIVERSAL_ANTI_LLM_DIRECTIVES: string[] = [
  "Avoid LLM-default verbs: 'delve', 'unleash', 'unlock', 'navigate' (metaphorical), 'leverage', 'elevate'.",
  "Avoid hype adjectives without specifics: 'robust', 'seamless', 'powerful', 'cutting-edge', 'innovative', 'revolutionary'.",
  "Avoid throat-clearing openers: 'In today's fast-paced world', 'Imagine a world where', 'It's no secret that'.",
];

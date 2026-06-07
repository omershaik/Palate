// src/routing/matching.ts
//
// Signal-to-altname matching primitives used by Stage 2. Both sides
// (signal text and altname text) get normalized — lowercased, hyphens
// and punctuation collapsed to spaces, multi-space collapsed — so
// "no Inter everywhere" matches "No Inter Everywhere" and
// "Aman-coded" matches "aman coded". Matching is bidirectional
// substring: signal includes altname OR altname includes signal,
// after a length floor that prevents trivially-short matches.
//
// The bucket weights from Turn 8 §5.2 are exported here so Stage 2
// uses the canonical numbers and any future tuning happens in one
// place.

import type { AltnameBucket } from "../types/grammar.js";

/**
 * Per-bucket confidence weights from Turn 8 §5.2. The five values
 * mirror the five altname buckets; anti-vibes weight is the absolute
 * value (the inversion is applied separately when scoring).
 *
 *   brand_exemplars: 0.9 — direct invocation
 *   vernacular     : 0.7 — designer terms are precise
 *   anti_vibes     : 0.8 — INVERTED (eliminates the matched grammar)
 *   vibes          : 0.6 — less specific
 *   compositional_intent: 0.5 — needs interpretation
 */
export const BUCKET_WEIGHTS: Record<keyof AltnameBucket, number> = {
  brand_exemplars: 0.9,
  vernacular: 0.7,
  anti_vibes: 0.8,
  vibes: 0.6,
  compositional_intent: 0.5,
};

/**
 * Anti-vibe disambiguation multiplier (Turn 8 §5.2.5). "Anti-vibes
 * are weighted 1.5×" — they're more diagnostic than positive signals
 * because they eliminate more grammars. Applied to the
 * BUCKET_WEIGHTS.anti_vibes magnitude when scoring.
 *
 * Effective anti-vibe weight: 0.8 × 1.5 = 1.2 (signed negative).
 */
export const ANTI_VIBE_WEIGHT_MULTIPLIER = 1.5;

/**
 * Normalize a signal or altname string for matching: lowercase,
 * hyphens and punctuation collapsed to spaces, multi-space collapsed,
 * trimmed.
 */
export function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Length floor for substring matches. Prevents degenerate matches
 * like signal "a" matching every altname containing "a" as a
 * substring. Three normalized characters is the threshold; "AI",
 * "3D", and other meaningful 2-char tokens are kept by relaxing the
 * floor when the signal is identical to a normalized altname.
 */
const MIN_MATCH_LENGTH = 3;

/**
 * Bidirectional substring match. Returns true when signal includes
 * altname or altname includes signal AFTER normalization, and the
 * shorter of the two has length >= MIN_MATCH_LENGTH (or when both
 * are exactly equal after normalization, regardless of length).
 *
 * Examples (all true):
 *   matchesAltname("Aman", "like Aman")               → true
 *   matchesAltname("like Aman", "Aman")               → true
 *   matchesAltname("Stillness-as-Discipline",
 *                  "stillness as discipline")          → true
 *   matchesAltname("no Inter everywhere",
 *                  "no Inter everywhere")              → true
 *
 * Examples (false):
 *   matchesAltname("a", "amazon")                     → false (below floor)
 *   matchesAltname("xyz", "abc")                      → false (no overlap)
 */
export function matchesAltname(signal: string, altname: string): boolean {
  const s = normalizeForMatching(signal);
  const a = normalizeForMatching(altname);
  if (s.length === 0 || a.length === 0) return false;
  if (s === a) return true;

  const shorter = s.length < a.length ? s : a;
  if (shorter.length < MIN_MATCH_LENGTH) return false;

  return s.includes(a) || a.includes(s);
}

// src/types/voice.ts
//
// The Voice axis is hybrid by design (Turn 6): nine named profiles at
// common points in a six-dimensional continuous space. Both layers ship
// in v0.1 — the dimensions enable precise routing, the profiles enable
// vibe-coder-friendly entry points like "make it sound like Stripe".
//
// The override rule (explicit dimensional coordinates in a brief beat
// profile matches in Stage 3) is Phase 2 routing logic, not Phase 1.
// The Phase 1 contract here just lets `profile` and `dimensions` be
// populated independently on a routed/built artifact.

import type { Axis } from "./axis.js";
import type { AltnameBucket, Substyle } from "./grammar.js";

/**
 * The six voice dimensions. The first four (humor, formality,
 * respectfulness, enthusiasm) are the empirically-validated NN/G
 * framework. The last two (rhythm, vocabulary) are working extensions
 * for v0.1, flagged for empirical validation in v0.2.
 *
 * Each value is a 0–10 score. The dimensions are continuous; integer
 * scores are convention, not requirement. Scoring conventions per the
 * NN/G framework's documented end-points.
 */
export interface VoiceDimensions {
  /** 0 = serious / 10 = funny */
  humor: number;
  /** 0 = casual / 10 = formal */
  formality: number;
  /** 0 = irreverent / 10 = respectful */
  respectfulness: number;
  /** 0 = matter-of-fact / 10 = enthusiastic */
  enthusiasm: number;
  /** 0 = flowing / 10 = punchy */
  rhythm: number;
  /** 0 = plain / 10 = expert */
  vocabulary: number;
}

/**
 * One of the six voice dimensions defined as a typed entity (so the
 * loader can carry their prose definitions and end-point descriptions
 * without flattening them into VoiceDimensions). Used in the Corpus.voice
 * block alongside the named profiles.
 */
export interface VoiceDimensionDef {
  id: keyof VoiceDimensions;
  name: string;
  /** Prose paragraph from the spec describing the dimension. */
  description: string;
  /** End-point descriptions from the spec. */
  endpoints: {
    low: string;
    high: string;
    middle?: string;
  };
  /** "Working effect" prose from the spec — empirical notes about
   *  the dimension's measured impact on user perception. */
  working_effect?: string;
}

/**
 * A named voice profile — a discrete grammar at a specific point in the
 * six-dimensional space. Shares the structural shape of a grammar
 * (definition, canonical examples, failure mode, altnames) and adds the
 * dimensional coordinates that locate it in the continuous space.
 *
 * Voice profiles are NOT full Grammars (the Grammar type's `axis` is the
 * Axis union, but a voice profile is the unit of the Voice axis — using
 * a separate type avoids forcing the Grammar shape onto an entity that
 * has different identity semantics).
 */
export interface VoiceProfile {
  id: string;
  axis: Extract<Axis, "voice">;
  name: string;
  definition: string;
  distinguishing_edge: string;
  /** Voice profiles rarely have substyles in v0.1; Substyle[] kept
   *  for symmetry with Grammar in case they're added later. */
  substyles: Substyle[];
  canonical_examples: string[];
  internal_logic: string[];
  failure_mode: string;
  /** Approximate dimensional coordinates per Turn 6's profile entries. */
  dimensional_coordinates: VoiceDimensions;
  altnames: AltnameBucket;
}

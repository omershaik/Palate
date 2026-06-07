// src/types/grammar.ts
//
// Core grammar shapes loaded from spec/turns/. A `Grammar` is the typed
// representation of one named pattern within an axis (e.g., the Layout
// axis's "Vertical-Rhythm Editorial" grammar, or the Component axis's
// "Hard-Bordered" grammar).
//
// Each axis grammar in the spec follows a consistent prose schema:
//   - Definition
//   - Distinguishing edge
//   - Substyles
//   - Canonical examples
//   - Internal logic
//   - Registers it hosts
//   - Registers it resists
//   - Failure mode
//   - five altname buckets (Vibes, Brand exemplars, Vernacular,
//     Anti-vibes, Compositional intent)
//
// The post-Turn-4 documents (Turns 5, 6, 7) include altnames inline with
// the grammar definition. Pre-Turn-4 documents (v0.1 Layout, Turn 1
// Typography+Color, Turn 2 Component+Motion) keep grammar prose separate
// from altnames; their altnames live in the Turn 4 revised altnames file
// and are merged into the grammar during loading (Phase 1 Group D7).

import type { Axis } from "./axis.js";

/**
 * The five altname buckets per Turn 4 (revised). These are the entry
 * vocabulary vibe coders use to invoke a grammar in their own language.
 *
 * Every grammar must have all five buckets present after loading; bucket
 * arrays may be short (per Turn 4's "honest where vocabulary is thin"
 * note) but never absent. The Group D7 merger validates this and
 * aggregates missing-bucket failures into a single typed error.
 */
export interface AltnameBucket {
  /** Feeling-coded phrases. e.g., "premium and sleek", "calm and reassuring". */
  vibes: string[];
  /** Specific brands as patterns. e.g., "like Stripe", "like Aman". */
  brand_exemplars: string[];
  /** Community shorthand. e.g., "editorial layout", "bento grid". */
  vernacular: string[];
  /** Negative identification. e.g., "not SaaS-y", "no Inter everywhere". */
  anti_vibes: string[];
  /** Design problem in user voice. e.g., "I want it to feel expensive but not loud". */
  compositional_intent: string[];
}

/**
 * A named substyle within a parent grammar. Substyles share their parent's
 * compositional logic but diverge in expression (e.g., the Hard-Bordered
 * Component grammar has Pure Brutalist, Soft-Brutalist, Mono-Brutalist,
 * and Hard-Shadow Brutalist substyles).
 *
 * Substyles earn their place by the routing-test discipline (Turn 3): a
 * substyle exists only if a brief can route to it without routing to the
 * parent grammar's other substyles.
 */
export interface Substyle {
  id: string;
  name: string;
  /** Prose definition, copied verbatim from the spec. */
  definition: string;
  /** Identifier of the parent Grammar. */
  parent_grammar_id: string;
}

/**
 * One named grammar within an axis. The full structural unit that briefs
 * route to.
 *
 * `id` is the stable spec identifier from the heading prefix —
 * "LAYOUT-1", "TYPE-3", "COMP-2", "MOTION-7", "IMG-1", "DENSITY-3",
 * "VOICE-2", "RP-4". The id survives across spec versions; the name may
 * change.
 */
export interface Grammar {
  id: string;
  axis: Axis;
  name: string;
  /** Prose definition copied verbatim from the spec. */
  definition: string;
  /** Distinguishing-edge prose (how this grammar differs from its neighbors). */
  distinguishing_edge: string;
  substyles: Substyle[];
  /** List of canonical example brands or sites named in the spec. */
  canonical_examples: string[];
  /** Bullet-list items from the "Internal logic" section. */
  internal_logic: string[];
  /** Bullet-list items from the "Registers it hosts" section. */
  registers_hosts: string[];
  /** Bullet-list items from the "Registers it resists" section. */
  registers_resists: string[];
  /** Prose paragraph from the "Failure mode" section. */
  failure_mode: string;
  /** All five altname buckets. Populated for post-Turn-4 docs at parse time;
   *  populated for pre-Turn-4 docs by the Group D7 merger. */
  altnames: AltnameBucket;
}

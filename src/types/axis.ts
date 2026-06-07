// src/types/axis.ts
//
// The eight design axes of the Palate spec, plus shared cross-axis types.
//
// The axis names map 1:1 to the JSON shape returned by the routing engine
// (Turn 8 §5.3) — the `reading_pattern` snake_case key is intentional and
// must match the wire format. TypeScript identifiers below use the same
// snake_case for fields that hit the wire; camelCase is reserved for purely
// internal helpers.

/**
 * The nine axis identifiers. Voice is one axis even though it has two
 * representational layers (named profiles + six continuous dimensions);
 * see src/types/voice.ts.
 *
 * Adding a new axis is a v0.2+ concern (PRD §6.8 — per-vertical extensions
 * are explicitly out of scope for v0.1). Updating this union also requires
 * updating the corpus loader, the canonical-combination type, and the card
 * schema in lockstep — touching one without the others breaks the contract.
 */
export type Axis =
  | "layout"
  | "typography"
  | "color"
  | "component"
  | "motion"
  | "imagery"
  | "density"
  | "voice"
  | "reading_pattern";

/**
 * All nine axis values, ordered to match the spec's reading order
 * (Turn 9 §1). Useful for iterating axes deterministically (loader
 * determinism test in Group F8).
 */
export const ALL_AXES: readonly Axis[] = [
  "layout",
  "typography",
  "color",
  "component",
  "motion",
  "imagery",
  "density",
  "voice",
  "reading_pattern",
] as const;

/**
 * A reference to a specific grammar within an axis. Used by canonical
 * and broken combinations to point at grammars without duplicating
 * their full content.
 *
 * Grammar ids are the stable identifiers from the spec heading prefixes
 * (e.g., "LAYOUT-1", "TYPE-3", "COMP-2", "MOTION-7", "IMG-1", "DENSITY-3",
 * "VOICE-2", "RP-4"). The corpus loader is responsible for ensuring
 * GrammarRefs resolve to real grammars at load time (Group F7 cross-
 * reference integrity test).
 */
export interface GrammarRef {
  axis: Axis;
  grammar_id: string;
  /**
   * Optional substyle within the grammar. When present, indicates the
   * spec calls for a specific substyle rather than the grammar at large.
   */
  substyle_id?: string;
}

/**
 * Confidence score on a [0, 1] interval. Used per-axis in routing
 * outputs and rolled up to a single Card.metadata.confidence value via
 * the min-of-axes rule (decision documented in src/types/card.ts).
 */
export type Confidence = number;

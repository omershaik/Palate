// src/types/card.ts
//
// The Card schema per Turn 8 §8 — the artifact the consuming AI tool
// (Cursor, Lovable, v0, Claude Code, Bolt) actually receives. A card is
// the rendered design context for one routed brief: tokens, component
// recipes, voice guidelines, anti-patterns, accessibility commitments.
//
// Phase 1 contract: every top-level Card field is required (per the
// kickoff B4 adjustment — type as required interfaces, not Partial<Card>).
// The Phase 3 card generator populates these from a routed axis
// combination; Phase 1 just establishes the contracts.
//
// Implementation note (PRD §4.7): the card schema can grow incrementally
// across phases — start with the axis combination, add tokens, add
// component recipes, etc. The shape below is the v0.1.0 ship target.

import type { Axis } from "./axis.js";
import type {
  AccessibilityCommitments,
  ReducedMotionFallback,
} from "./compatibility.js";
import type { VoiceDimensions } from "./voice.js";

// ---------------------------------------------------------------------------
// Per-axis selections embedded in Card.axes
// ---------------------------------------------------------------------------

/**
 * The selection record for a non-voice axis: which grammar (and optional
 * substyle) was routed to, with confidence and a short rationale string.
 *
 * `grammar_name` and `substyle_name` are denormalized into the card so
 * the consuming AI tool doesn't need access to the corpus to read the
 * card. The `_id` fields remain the stable cross-reference handle.
 */
export interface AxisSelection {
  grammar_id: string;
  grammar_name: string;
  substyle_id?: string;
  substyle_name?: string;
  /** Routing confidence on [0, 1]. */
  confidence: number;
  /** One-line summary of the grammar's compositional discipline,
   *  for the AI tool to consume directly. */
  internal_logic_summary: string;
}

/**
 * The voice axis selection: a profile (when one was matched) plus
 * dimensional coordinates. Both populate independently — a brief can
 * route via dimensions alone with no profile, or to a profile whose
 * dimensions are inherited verbatim. See the kickoff B2 / Step 3 voice
 * notes for the override rule (Phase 2 routing logic).
 */
export interface VoiceAxisSelection {
  profile?: {
    id: string;
    name: string;
  };
  dimensions: VoiceDimensions;
  confidence: number;
}

/**
 * The full per-axis combination block on a Card. Each axis is required
 * to have a selection; voice has its own shape; the others share AxisSelection.
 */
export interface CardAxes {
  layout: AxisSelection;
  typography: AxisSelection;
  color: AxisSelection;
  component: AxisSelection;
  motion: AxisSelection;
  imagery: AxisSelection;
  density: AxisSelection;
  voice: VoiceAxisSelection;
  reading_pattern: AxisSelection;
}

// ---------------------------------------------------------------------------
// Design tokens (CSS-variable-ready)
// ---------------------------------------------------------------------------

/**
 * Color tokens: a record from semantic token name (e.g., "bg.surface",
 * "fg.muted", "accent.primary") to a CSS color value (hex, rgb, rgba,
 * oklch). The naming convention is dot-separated semantic slots; the
 * card builder owns the convention — the loader just stores strings.
 */
export type ColorTokens = Record<string, string>;

/**
 * Typography tokens. The display/body/mono families correspond to the
 * type-pairing logic of the routed Typography grammar. Scale and
 * line_heights use semantic keys ("display.lg", "body.md", "label.sm").
 */
export interface TypographyTokens {
  font_family: {
    display: string;
    body: string;
    mono?: string;
  };
  scale: Record<string, string>;
  line_heights: Record<string, string | number>;
  /** Letter-spacing tokens, where the routed grammar specifies them
   *  (Two-Hand display tightening, Mono-Discipline neutral, etc.). */
  letter_spacing?: Record<string, string>;
}

/** Spacing scale, e.g., { "xs": "4px", "md": "16px", "lg": "32px" }. */
export type SpacingTokens = Record<string, string>;

/** Border-radius scale, e.g., { "none": "0", "md": "6px", "pill": "9999px" }. */
export type RadiusTokens = Record<string, string>;

/**
 * Motion tokens: timing values and easing functions. Reduced-motion
 * overrides are NOT in this block; they live on Card.reduced_motion_fallback
 * to keep the regular and accessible variants explicit and separate.
 */
export interface MotionTokens {
  duration: Record<string, string>;
  easing: Record<string, string>;
}

export interface CardTokens {
  color: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  motion: MotionTokens;
}

// ---------------------------------------------------------------------------
// Component recipes
// ---------------------------------------------------------------------------

/**
 * The standard variant set per component, per the spec's hierarchy
 * conventions (primary action, secondary action, tertiary/text). Some
 * grammars (Typographic-Discreet) collapse these — the card builder
 * may emit identical recipes for primary and secondary in those cases.
 */
export type ComponentVariantKey = "primary" | "secondary" | "tertiary";

/**
 * One variant of one component. The token references are semantic
 * (not literal CSS values) — they point into Card.tokens. Notes
 * carry the prose anti-defaults (e.g., "no shadow on hover" for
 * Hard-Bordered grammars).
 */
export interface ComponentVariant {
  token_refs: Record<string, string>;
  notes?: string[];
}

export interface ComponentRecipe {
  variants: Record<ComponentVariantKey, ComponentVariant>;
}

/**
 * The component library shipped on every card. The minimum-viable set
 * for v0.1 covers the components AI tools generate most often. The
 * recipes are populated from the routed Component grammar.
 */
export interface CardComponents {
  button: ComponentRecipe;
  card: ComponentRecipe;
  input: ComponentRecipe;
  nav: ComponentRecipe;
  modal: ComponentRecipe;
}

// ---------------------------------------------------------------------------
// Voice guidelines
// ---------------------------------------------------------------------------

/**
 * Voice guidelines bridge Palate's voice profile/dimensions to the
 * consuming AI tool's copy generation (Turn 8 §9 Voice-4 resolution).
 * Palate dictates the voice; the AI tool generates the copy using
 * `do_use` and `do_not_use` patterns.
 *
 * The `do_not_use` list is where AI-slop voice tells go: "delve",
 * "unleash", "unlock", "Build the future of X", etc.
 */
export interface VoiceGuidelines {
  do_use: string[];
  do_not_use: string[];
}

// ---------------------------------------------------------------------------
// Card metadata
// ---------------------------------------------------------------------------

/**
 * Card metadata — provenance and confidence.
 *
 * `confidence` is the rolled-up overall confidence for the card. Per
 * the kickoff Step 3 / Note 4 decision: it's the MIN of per-axis
 * confidences, not the mean. A card with one weak axis is a weak card;
 * surfacing the minimum is honest. Phase 3 implements the rollup; Phase
 * 1 just types the field.
 */
export interface CardMetadata {
  /** ISO-8601 timestamp the card was generated. */
  last_updated: string;
  /** Spec version (semver) of the curated grammars used. */
  source_grammars_version: string;
  /** Spec version (semver) of the brand-fingerprints.json used. */
  source_fingerprints_version: string;
  /** Min-of-axes confidence rollup, on [0, 1]. */
  confidence: number;
}

// ---------------------------------------------------------------------------
// The Card itself
// ---------------------------------------------------------------------------

/**
 * The Palate card. One card per routed brief (or per page in a multi-page
 * site, in v0.2+).
 *
 * `canonical_combination` carries the canonical name (e.g., "Luxury
 * Hospitality") when the routed combination snaps to one of the 15
 * canonicals; null when the combination is novel-but-coherent.
 */
export interface Card {
  card_id: string;
  /** Spec version this card was generated against (semver). */
  version: string;
  canonical_combination: string | null;
  axes: CardAxes;
  tokens: CardTokens;
  components: CardComponents;
  /** Explicit AI-slop patterns to avoid for this combination. */
  anti_patterns: string[];
  voice_guidelines: VoiceGuidelines;
  reduced_motion_fallback: ReducedMotionFallback;
  accessibility: AccessibilityCommitments & {
    /** Alternative tokens for users with prefers-contrast: more. */
    high_contrast_variant: {
      tokens: Pick<CardTokens, "color">;
    };
  };
  metadata: CardMetadata;
}

/**
 * Re-export the per-axis selection types so card consumers can import
 * them from a single module without reaching into the file path.
 *
 * (intentionally typeof-exported above as separate interfaces; this
 * comment documents the public-API surface of card.ts)
 */
export type { Axis };

// src/types/compatibility.ts
//
// Types for the integration logic in Turn 8: the 22 broken combinations,
// the 15 canonical combinations, and the cross-cutting Reduced-Motion
// fallback layer. These are loaded from
// spec/turns/palate-grammar-survey-v0.2-turn8-compatibility-model.md by
// the Group D8 loader.

import type { Axis, GrammarRef } from "./axis.js";

/**
 * The five families of broken combinations defined in Turn 8 §2.
 *
 * - A: Register Mismatches (e.g., quiet-luxury layout + Conversion-Punchy voice)
 * - B: Functional Mismatches (e.g., F-Pattern reading + centered-everything layout)
 * - C: Motion-Component Mismatches (e.g., Glass components + Stillness motion)
 * - D: Voice-Visual Mismatches (e.g., Technical Precise voice + Pastel-Vibrant color)
 * - E: Reading-Pattern / Layout Forcing (strain rather than break)
 *
 * The family classification matters for Stage 5 conflict resolution:
 * Family E combinations may surface a warning rather than refuse to route,
 * while Families A–D usually trigger a snap-to-canonical resolution.
 */
export type BrokenCombinationFamily = "A" | "B" | "C" | "D" | "E";

/**
 * One broken combination — a pairing of grammars across two (or more)
 * axes that produces incoherent output regardless of how well each
 * grammar is implemented.
 *
 * The 22 broken combinations in v0.1 are mostly pairs, but the schema
 * supports n-way conflicts (e.g., Family D's "Irreverent Bold voice +
 * Editorial-Spacious + Restrained-Atmospheric motion" is three-way).
 */
export interface BrokenCombination {
  id: string;
  family: BrokenCombinationFamily;
  /**
   * Raw combination text as written in the spec (e.g., "Vertical-Rhythm
   * Editorial layout + Conversion-Punchy voice"). Source of truth — the
   * conflicting_grammars below are a best-effort parse of this string;
   * Phase 2's routing engine can fall back to text matching when the
   * parse is incomplete.
   */
  combination_text: string;
  /** Two or more grammar references that together form the broken
   *  pairing. Best-effort parse from combination_text; some entries
   *  may have grammar_id set to the human name rather than a stable
   *  spec id (e.g., "Vertical-Rhythm Editorial" rather than "LAYOUT-1")
   *  when the corpus loader hasn't resolved names to ids. */
  conflicting_grammars: GrammarRef[];
  /**
   * F3-3: clauses from combination_text that the parser couldn't
   * confidently attribute to a specific axis (no trailing axis word
   * like "layout"/"motion", and not a parens-stripped axis-tagged
   * grammar). Emitted at parse time so load-corpus can attempt a
   * post-process resolution against the loaded grammars across all
   * axes — recovering refs the parser dropped.
   *
   * Empty array when the parser fully resolved the combination.
   */
  unresolved_clauses?: string[];
  /** Prose explaining why the combination breaks, copied from the spec. */
  why_it_breaks: string;
}

/**
 * One canonical combination — a multi-axis pairing that has been
 * validated as coherent in the wild. v0.1 ships 15 of these
 * (Turn 8 §3); they're the system's reliable defaults.
 *
 * The axis_mappings record uses a Partial<Record<Axis, GrammarRef>>
 * for the PRIMARY (first) option per axis. Many canonicals list
 * multiple acceptable options (e.g., "Color: Three-Color Discipline
 * OR Earth-Pulled Restraint"); axis_alternatives carries the FULL
 * option list (including the primary) for any axis that has more
 * than one option. F3-1 (Phase 2 Group F iteration 1) extended this
 * to support membership-based canonical matching: a candidate that
 * picks any option in axis_alternatives counts as matching the
 * canonical on that axis, not just the primary.
 *
 * Voice within a canonical can specify either a profile by ref OR
 * dimensional coordinates; for v0.1 the canonicals all name profiles,
 * so the GrammarRef pattern is sufficient.
 */
export interface CanonicalCombination {
  id: string;
  /** Human-readable name from Turn 8 §3 (e.g., "Luxury Hospitality"). */
  name: string;
  /** Per-axis primary grammar ref (the first option listed in the
   *  spec). Some axes may be unspecified if the canonical is
   *  genuinely register-agnostic on that axis (rare in v0.1). */
  axis_mappings: Partial<Record<Axis, GrammarRef>>;
  /**
   * Per-axis FULL option list when the canonical lists multiple
   * acceptable grammars on an axis (e.g., "Color: Three-Color
   * Discipline OR Earth-Pulled Restraint"). Includes the primary.
   * Axes with a single option are absent from this map entirely —
   * consumers should fall back to axis_mappings for those.
   */
  axis_alternatives?: Partial<Record<Axis, GrammarRef[]>>;
  /** Brand exemplars that operate at this canonical, from the spec. */
  brand_exemplars: string[];
}

/**
 * Reduced-motion fallback specification per motion grammar (Turn 8 §6.1).
 * Every motion grammar declares its reduced-motion behavior; cards
 * embed the fallback alongside the primary motion grammar so AI tools
 * generate accessible code without re-deriving the fallback themselves.
 */
export interface ReducedMotionFallback {
  /** The motion grammar id this fallback applies to. */
  motion_grammar_id: string;
  /** Prose description of the fallback behavior, from the spec table. */
  description: string;
  /**
   * Whether the fallback is trivial (no motion to fall back from), partial
   * (some motion suppressed, functional motion kept), or substantial (the
   * page works without the cinema, or a separate reduced-motion version
   * may be required). Drives Phase 3 card generation defaults.
   */
  severity: "trivial" | "partial" | "substantial";
}

/**
 * The accessibility commitments that every Palate-generated card carries
 * (Turn 8 §6.2). Loaded as constants; the values rarely change between
 * spec versions.
 */
export interface AccessibilityCommitments {
  contrast_validation: "WCAG_2.2_AA";
  touch_target_minimum_px: 44;
  keyboard_navigation: "all_interactive_elements_focusable";
  high_contrast_mode_support: true;
}

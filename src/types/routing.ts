// src/types/routing.ts
//
// The routing-output envelope per Turn 8 §5.3. The output of `route(brief)`
// in the MCP server. Wraps one or more Cards with routing metadata —
// canonical match info, alternatives kept for reference, warnings the
// consumer should surface to the user.
//
// Phase 1 contract: types only. The routing engine in Phase 2 produces
// these; the card builder in Phase 3 populates the embedded Card(s).

import type { Axis, GrammarRef } from "./axis.js";
import type { Card } from "./card.js";
import type { ReducedMotionFallback } from "./compatibility.js";
import type { VoiceDimensions } from "./voice.js";

/**
 * Per-axis routing decision in the routing output envelope. Lighter than
 * a Card's AxisSelection — this records the routing engine's decision
 * (which grammar, which substyle, what confidence) without the
 * denormalized card-consumption data.
 */
export interface AxisRoutingDecision {
  grammar_id: string;
  substyle_id?: string;
  confidence: number;
}

/**
 * The voice axis equivalent in the routing output. Profile may be null
 * when the brief routes via dimensional coordinates only.
 */
export interface VoiceRoutingDecision {
  profile_id: string | null;
  dimensions: VoiceDimensions;
  confidence: number;
}

/**
 * The full per-axis combination the routing engine selected. Every axis
 * has a decision — there's no "axis unspecified" state in v0.1; ambiguous
 * routes resolve to a default at Stage 5 or fail with an open warning.
 */
export interface RoutedCombination {
  layout: AxisRoutingDecision;
  typography: AxisRoutingDecision;
  color: AxisRoutingDecision;
  component: AxisRoutingDecision;
  motion: AxisRoutingDecision;
  imagery: AxisRoutingDecision;
  density: AxisRoutingDecision;
  voice: VoiceRoutingDecision;
  reading_pattern: AxisRoutingDecision;
}

/**
 * One alternative per-axis route the engine considered but didn't pick.
 * Returned in `alternatives` so the consuming AI tool can surface
 * options when confidence is low.
 */
export interface AxisAlternative {
  axis: Axis;
  candidate: GrammarRef;
  confidence: number;
}

/**
 * Severity tiers for routing warnings.
 *
 * - info: a routing decision the consumer should be aware of (e.g.,
 *   "snapped to canonical despite lower-confidence axis match").
 * - warning: a real coherence issue the resolver patched but the user
 *   should know about (e.g., "Family E reading-pattern strain").
 * - conflict: an unresolvable conflict surfaced to the user — the
 *   consuming AI tool should ask the user to choose between options.
 */
export type WarningSeverity = "info" | "warning" | "conflict";

/**
 * One routing warning — surfaced to the consuming AI tool so it can
 * decide whether to ask the user a clarifying question.
 */
export interface RoutingWarning {
  severity: WarningSeverity;
  /** Stable code for programmatic handling (e.g., "broken_combination_resolved",
   *  "low_axis_confidence", "novel_combination_served"). */
  code: string;
  /** Human-readable message for the user-facing layer. */
  message: string;
  /** Optional grammar refs the warning concerns. */
  related_grammars?: GrammarRef[];
}

/**
 * The full routing output. Returned by `palate.route(brief)`.
 *
 * `cards` is a `Card[]` rather than a single `Card` to support
 * `route_multi` in the same shape — for single-brief routing the array
 * contains one card. (PRD §6.4 — multi-page consistency is v0.2; v0.1
 * ships per-page card routing, so the multi-card shape here is
 * forward-compatible without enabling multi-page semantics.)
 */
export interface RoutingOutput {
  combination: RoutedCombination;
  /** Name of the canonical the combination matched, or null for
   *  novel-but-coherent. */
  canonical_match: string | null;
  /** Confidence the combination matches its canonical, on [0, 1]. */
  canonical_match_confidence: number;
  reduced_motion_fallback: ReducedMotionFallback;
  cards: Card[];
  alternatives: AxisAlternative[];
  open_warnings: RoutingWarning[];
}

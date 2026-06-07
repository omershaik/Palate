// src/routing/types.ts
//
// Routing engine types per PRD §4.5 + Turn 8 §5. The five routing
// stages each produce a typed intermediate that the next stage
// consumes:
//
//   Brief
//     ↓ Stage 1: Extract Signals
//   ExtractedSignals
//     ↓ Stage 2: Bucket Match
//   AxisCandidate[][] (per-axis ranked candidates)
//     ↓ Stage 3: Confidence Scoring per Axis
//   RoutedCombination + alternatives
//     ↓ Stage 4: Coherence Check
//   CoherenceVerdict
//     ↓ Stage 5: Conflict Resolution
//   ResolutionResult → RoutingOutput envelope (Phase 1 type)
//
// RoutingOutput is defined in src/types/routing.ts (Phase 1); the
// types here are the intermediate stage-to-stage contracts.

import type { Axis } from "../types/axis.js";
import type { AltnameBucket } from "../types/grammar.js";
import type { BrokenCombination } from "../types/compatibility.js";
import type { RoutingWarning } from "../types/routing.js";

// ---------------------------------------------------------------------------
// Stage 1 output: ExtractedSignals
// ---------------------------------------------------------------------------

/**
 * The eight signal categories Stage 1 extracts from a brief, per
 * Turn 8 §5.1.1. The first five mirror the five altname buckets so
 * Stage 2's bucket matching is direct. The last three are
 * disambiguation context per Turn 8 §5.2: domain biases routing across
 * all axes, functional context distinguishes marketing vs application,
 * audience expertise pulls density and component grammar.
 */
export interface ExtractedSignals {
  /** Specific brand or site invocations: "like Stripe", "Aman", "OpenAI launch". */
  brand_exemplars: string[];
  /** Feeling phrases: "premium and sleek", "calm", "playful". */
  vibes: string[];
  /** Designer/vibe-coder shorthand: "bento grid", "neo-brutalism". */
  vernacular: string[];
  /** Negative identification: "not SaaS-y", "no Inter everywhere". */
  anti_vibes: string[];
  /** Design problem in user voice: "expensive but not loud". */
  compositional_intent: string[];
  /** Vertical / industry: "hospitality", "fintech", "indie SaaS". */
  domain: string[];
  /** Functional context: "marketing page", "application UI", "documentation". */
  functional_context: string[];
  /** Audience expertise / segment: "for power users", "first-time visitors". */
  audience_signals: string[];
}

/**
 * Helper for tests/callers to construct a fully-populated empty
 * signal object.
 */
export function emptyExtractedSignals(): ExtractedSignals {
  return {
    brand_exemplars: [],
    vibes: [],
    vernacular: [],
    anti_vibes: [],
    compositional_intent: [],
    domain: [],
    functional_context: [],
    audience_signals: [],
  };
}

// ---------------------------------------------------------------------------
// Stage 2 output: SignalMatch + AxisCandidate
// ---------------------------------------------------------------------------

/**
 * One signal-to-altname match. Stage 2 produces a list of these per
 * grammar; aggregating them yields the grammar's confidence on its
 * axis. The bucket-specific weight comes from Turn 8 §5.2:
 *
 *   brand_exemplars : 0.9 (high — direct invocation)
 *   vernacular      : 0.7 (medium-high — designer terms are precise)
 *   anti_vibes      : 0.8 (high, INVERTED — locates the OPPOSITE grammar)
 *   vibes           : 0.6 (medium — less specific)
 *   compositional_intent : 0.5 (medium-low — needs interpretation)
 *
 * `signal_text` is the verbatim signal from ExtractedSignals;
 * `matched_text` is the altname entry from the corpus that matched.
 */
export interface SignalMatch {
  signal_text: string;
  bucket: keyof AltnameBucket;
  matched_text: string;
  weight: number;
  /**
   * True when the match comes from an anti-vibe signal (which negates
   * the grammar matched). Anti-vibe signals weight against the
   * matched grammar and FOR siblings on the same axis.
   */
  inverted: boolean;
}

/**
 * One grammar's score on its axis after Stage 2. `evidence` records
 * every signal that contributed; `confidence` is the aggregated score.
 * Confidence is in [0, 1]; values >1 are capped at 1 in Stage 3.
 */
export interface AxisCandidate {
  axis: Axis;
  grammar_id: string;
  confidence: number;
  evidence: SignalMatch[];
}

/** Stage 2 output: ranked candidates per axis. */
export type BucketMatchOutput = Record<Axis, AxisCandidate[]>;

/**
 * Per-axis set of grammar IDs that Stage 2 eliminated via anti-vibe
 * matching. Stage 5 uses this to honor anti-vibe semantics through
 * the resolution pipeline: fill-from-canonical and snap-to-canonical
 * must skip axes whose canonical primary (or any of its alternatives)
 * is in the eliminated set, because re-introducing an eliminated
 * grammar would silently override the user's explicit "no X" signal.
 *
 * Empty per-axis set is the common case; only axes with anti-vibe
 * elimination produce a non-empty entry. Implemented as a Map for
 * convenient `.get(axis)` access; the keys are the same Axis values
 * used elsewhere.
 */
export type EliminatedGrammars = Map<Axis, Set<string>>;

// ---------------------------------------------------------------------------
// Stage 3 output: ranked candidates with alternatives
// ---------------------------------------------------------------------------

/**
 * Stage 3 picks a top candidate per axis and keeps secondaries for
 * surface-conflict resolution. The "top" candidate is the highest-
 * confidence AxisCandidate; alternatives are the next two ranked.
 */
export interface RankedAxis {
  axis: Axis;
  top: AxisCandidate;
  alternatives: AxisCandidate[];
}

export type RankedCombination = Record<Axis, RankedAxis>;

// ---------------------------------------------------------------------------
// Stage 4 output: CoherenceVerdict
// ---------------------------------------------------------------------------

/**
 * Whether the candidate combination is coherent, and how. Stage 5
 * uses the verdict to decide whether to serve the combination, snap
 * to a nearby canonical, override an axis, or surface the conflict.
 *
 * `register_coherence_score` is the implicit-register-map measure:
 * the maximum fraction of axes (out of 9) that match any single
 * canonical's axis assignments. Per the kickoff D3 adjustment: ≥6/9
 * is the proposed coherent threshold; tunable during F3.
 */
export interface CoherenceVerdict {
  is_coherent: boolean;
  /** Whether the combination matches a canonical exactly. */
  is_canonical_match: boolean;
  /** If matched, the canonical's id (e.g., "CANONICAL-1"). */
  canonical_match_id: string | null;
  /** If matched, the canonical's overall confidence on [0, 1]. */
  canonical_match_confidence: number | null;
  /** Any broken combinations the candidate triggers. Empty if coherent. */
  broken_pairs: BrokenCombination[];
  /**
   * Best canonical-axis-overlap score on [0, 1]. 1.0 = exact match
   * to some canonical. >= 6/9 = 0.667 is the v0.1 coherent threshold.
   */
  register_coherence_score: number;
  /** Which canonical (if any) gave the best register-overlap score. */
  register_coherence_canonical_id: string | null;
  /**
   * All canonicals scored, sorted by the Phase 2.1b Task 6a tie-
   * breaker hierarchy descending: overlap → directMatch count →
   * directConfidenceSum. Stage 5 uses this to detect contradictory
   * canonicals (Phase 2.1a Task 2): when two canonicals score within
   * ~15% of each other AND they share fewer than 5/9 axes (different
   * register families), the brief is invoking incompatible registers
   * and routing should surface a conflict warning rather than pick
   * one silently.
   *
   * direct_match_count and direct_confidence_sum (Phase 2.1b Task 6a)
   * are exposed alongside score so consumers can inspect signal-routed
   * vs. lenient-overlap alignment without re-walking the per-axis
   * picks. They're load-bearing for the tie-breaker; downstream
   * stages can also use them to surface "weak signal-routed alignment"
   * warnings if needed.
   */
  canonical_scores: Array<{
    canonical_id: string;
    score: number;
    direct_match_count: number;
    direct_confidence_sum: number;
  }>;
  /**
   * Phase 2.1b Task 6a: top-1 and top-2 canonicals tied at every
   * level of the tie-breaker hierarchy (overlap, directMatch count,
   * directConfidenceSum). The brief has not provided enough
   * differentiating signal to prefer one canonical over another in
   * the same register family; route() surfaces this as a
   * `routing_ambiguous` info-severity warning so the consuming AI
   * tool can ask a clarifying question. Distinct from
   * `contradictory_canonicals` (different register families); see
   * docs/architectural-patterns.md entry 8.
   */
  routing_ambiguous: boolean;
}

// ---------------------------------------------------------------------------
// Stage 5 output: ResolutionResult
// ---------------------------------------------------------------------------

/**
 * The strategy Stage 5 picked. "no_resolution_needed" means the
 * combination passed coherence as-is. The other three correspond to
 * Turn 8 §5.1.5 resolution paths.
 */
export type ResolutionStrategy =
  | "no_resolution_needed"
  | "override_axis"
  | "snap_to_canonical"
  | "surface_conflict";

/**
 * One axis change applied during resolution. Returned for
 * transparency — the consumer can show the user what was changed.
 */
export interface AxisChange {
  axis: Axis;
  from_grammar_id: string;
  to_grammar_id: string;
  reason: string;
}

/**
 * Stage 5 output. The `resolved_combination` field has the same shape
 * as Stage 3's output but represents the final combination after
 * any conflict resolution was applied. `changes` records what was
 * changed; `warnings` carries the surface-conflict messages.
 */
export interface ResolutionResult {
  strategy: ResolutionStrategy;
  resolved_combination: RankedCombination;
  changes: AxisChange[];
  warnings: RoutingWarning[];
}

// ---------------------------------------------------------------------------
// Stage 1 abstract interface
// ---------------------------------------------------------------------------

/**
 * The abstraction Stage 2+ depend on. Real implementations call the
 * Anthropic API; the test stub returns pre-canned fixture-keyed
 * signals; the cache layer wraps either with a brief-hash lookup.
 */
export type SignalExtractor = (brief: string) => Promise<ExtractedSignals>;

// src/routing/stage3-confidence.ts
//
// Stage 3 — Confidence Scoring per Axis per Turn 8 §5.1.3. Aggregate
// Stage 2's per-axis ranked candidates into a single top pick per
// axis with a small list of alternatives kept for surface-conflict
// resolution in Stage 5.
//
// When Stage 2 produces no candidates for an axis (the brief simply
// didn't signal anything for that axis), Stage 3 falls back to the
// AI-default grammar for the axis with very low confidence (0.1).
// The defaults below are documented in the spec as "the AI default"
// for each axis (per Turn 9 §1 grammar listings). The very-low
// confidence flags downstream stages that the choice is a guess; the
// Card builder may surface this as a routing warning.

import type { Axis } from "../types/axis.js";
import { ALL_AXES } from "../types/axis.js";
import type { Corpus } from "../types/corpus.js";
import type { CanonicalCombination } from "../types/compatibility.js";
import type {
  AxisCandidate,
  BucketMatchOutput,
  CoherenceVerdict,
  EliminatedGrammars,
  RankedAxis,
  RankedCombination,
} from "./types.js";

/**
 * AI-default grammars per axis. Used as fallback when Stage 2
 * produces no candidates. Documented in spec turns:
 *
 *   layout          — LAYOUT-4a Conversion-Stack (Turn 8 §3 §4)
 *   typography      — TYPE-5  Geometric-Modernist (Turn 1 "the AI default")
 *   color           — COLOR-8a Marketing Single-Accent (Turn 3 split)
 *   component       — COMP-2  Soft-Container System (Turn 2 "the AI default")
 *   motion          — MOTION-3 Functional-Snappy (Turn 2)
 *   imagery         — IMG-7   Stock Photography (Turn 5 "the AI-default failure mode")
 *   density         — DEN-3   Standard-Marketing (Turn 5 "the modern SaaS default")
 *   voice           — VOICE-7 Conversion-Punchy (Turn 6 "the AI default")
 *   reading_pattern — RP-2    Z-Pattern (the marketing-page default)
 */
export const AI_DEFAULT_GRAMMAR_PER_AXIS: Record<Axis, string> = {
  layout: "LAYOUT-4a",
  typography: "TYPE-5",
  color: "COLOR-8a",
  component: "COMP-2",
  motion: "MOTION-3",
  imagery: "IMG-7",
  density: "DEN-3",
  voice: "VOICE-7",
  reading_pattern: "RP-2",
};

/**
 * Confidence value for AI-default fallback. Very low (0.1) so
 * downstream stages can flag the axis as "guessed" rather than
 * "routed." Above-zero so it shows up in the routing output (zero
 * would be filtered).
 */
const AI_DEFAULT_CONFIDENCE = 0.1;

/** Number of alternatives to keep per axis after the top pick. */
const ALTERNATIVES_KEPT_PER_AXIS = 2;

/**
 * Stage 3 entrypoint. Picks top + alternatives per axis from Stage 2
 * candidates, falling back to AI-default grammars for axes with no
 * candidates.
 *
 * Phase 2.1a fix: takes optional `eliminated` and `corpus` parameters
 * to honor Stage 2 anti-vibe elimination through the AI-default
 * fallback. Without this, when Stage 2 eliminates a grammar that
 * happens to be the AI default for its axis (e.g., TYPE-5 is the AI
 * default for typography AND the target of "no Inter everywhere"
 * anti-vibes), Stage 3's AI-default synth would re-introduce the
 * eliminated grammar — same architectural pattern as the Stage 5
 * fill bypass fixed earlier in Phase 2.1a. Both parameters are
 * optional so legacy unit tests calling rankCombination without
 * elimination info continue to work.
 */
export function rankCombination(
  bucketMatches: BucketMatchOutput,
  eliminated?: EliminatedGrammars,
  corpus?: Corpus,
): RankedCombination {
  const elim = eliminated ?? EMPTY_ELIMINATIONS;
  return {
    layout: rankAxis("layout", bucketMatches.layout, elim, corpus),
    typography: rankAxis("typography", bucketMatches.typography, elim, corpus),
    color: rankAxis("color", bucketMatches.color, elim, corpus),
    component: rankAxis("component", bucketMatches.component, elim, corpus),
    motion: rankAxis("motion", bucketMatches.motion, elim, corpus),
    imagery: rankAxis("imagery", bucketMatches.imagery, elim, corpus),
    density: rankAxis("density", bucketMatches.density, elim, corpus),
    voice: rankAxis("voice", bucketMatches.voice, elim, corpus),
    reading_pattern: rankAxis(
      "reading_pattern",
      bucketMatches.reading_pattern,
      elim,
      corpus,
    ),
  };
}

const EMPTY_ELIMINATIONS: EliminatedGrammars = new Map();
for (const axis of ALL_AXES) {
  EMPTY_ELIMINATIONS.set(axis, new Set());
}

function rankAxis(
  axis: Axis,
  candidates: AxisCandidate[],
  eliminated: EliminatedGrammars,
  corpus: Corpus | undefined,
): RankedAxis {
  if (candidates.length === 0) {
    return {
      axis,
      top: synthesizeAIDefault(axis, eliminated, corpus),
      alternatives: [],
    };
  }
  const [top, ...rest] = candidates;
  return {
    axis,
    top: top!,
    alternatives: rest.slice(0, ALTERNATIVES_KEPT_PER_AXIS),
  };
}

/**
 * Synthesize an AI-default candidate, honoring Stage 2 elimination.
 * If the canonical AI default for the axis is in the eliminated set,
 * walk the axis's loaded grammars and pick the first non-eliminated
 * grammar instead. The arbitrary-but-deterministic fallback preserves
 * the spec semantic that anti-vibes ELIMINATE (Turn 8 §5.2.5) — the
 * engine never returns an eliminated grammar even as a low-confidence
 * fallback.
 *
 * If corpus is undefined (legacy callers without elimination info),
 * synthesize the canonical AI default unconditionally — preserves
 * pre-fix behavior for tests that don't supply corpus.
 */
function synthesizeAIDefault(
  axis: Axis,
  eliminated: EliminatedGrammars,
  corpus: Corpus | undefined,
): AxisCandidate {
  const primaryId = AI_DEFAULT_GRAMMAR_PER_AXIS[axis];
  const elimSet = eliminated.get(axis) ?? new Set<string>();

  if (!elimSet.has(primaryId) || corpus === undefined) {
    return {
      axis,
      grammar_id: primaryId,
      confidence: AI_DEFAULT_CONFIDENCE,
      evidence: [],
    };
  }

  // Primary AI default is eliminated. Walk axis grammars to find the
  // first non-eliminated id. Voice is loaded under corpus.voice;
  // other axes under corpus.axes.
  const grammarIds: string[] =
    axis === "voice"
      ? corpus.voice.profiles.map((p) => p.id)
      : corpus.axes[axis].map((g) => g.id);

  for (const id of grammarIds) {
    if (!elimSet.has(id)) {
      return {
        axis,
        grammar_id: id,
        confidence: AI_DEFAULT_CONFIDENCE,
        evidence: [],
      };
    }
  }

  // Every grammar on the axis is eliminated — pathological case;
  // shouldn't happen in practice. Return the primary AI default
  // anyway so the routing pipeline doesn't crash; downstream stages
  // can surface a warning about exhausted candidates.
  return {
    axis,
    grammar_id: primaryId,
    confidence: AI_DEFAULT_CONFIDENCE,
    evidence: [],
  };
}

/**
 * Whether a ranked top pick is the AI-default fallback (no signal
 * support) rather than a routed match. Useful for downstream stages
 * deciding whether to surface a "low confidence on axis X" warning.
 *
 * Phase 2.1a: relaxed the grammar_id check. The canonical AI default
 * per axis (TYPE-5 etc.) used to be the only grammar an AI-default
 * pick could carry; Phase 2.1a's elimination-respect fix means an
 * AI-default pick may carry a different grammar id when the canonical
 * default was eliminated. The semantic of isAIDefault — "this axis
 * fell back, no real signal routed it" — is the same regardless of
 * which specific grammar got picked; check evidence and confidence
 * only.
 */
export function isAIDefault(top: AxisCandidate): boolean {
  return top.evidence.length === 0 && top.confidence === AI_DEFAULT_CONFIDENCE;
}

// ---------------------------------------------------------------------------
// Phase 2.1b Task 4a — Stage 3b: cross-axis canonical alignment tie-breaker
// ---------------------------------------------------------------------------

/**
 * Tie tolerance for Stage 3b cross-axis canonical alignment. Two
 * candidates within this confidence delta are considered tied for
 * the top-pick spot. v0.1 starting point: 0.05. Tunable in F3 if
 * calibration data warrants.
 */
const STAGE3_TIE_TOLERANCE = 0.05;

/**
 * Stage 3b: refine Stage 3a's per-axis picks using Stage 4's
 * canonical ranking as the alignment target.
 *
 * Problem this solves: Stage 3a picks the top candidate per axis by
 * confidence. When multiple candidates tie within tolerance, the
 * selection falls back to Stage 2's sort order (effectively grammar-
 * id order), which is arbitrary with respect to which canonical the
 * brief is actually invoking. A brief that signals canonical-9 might
 * end up with TYPE-2 picked over TYPE-5 (both tied at 0.90) just
 * because TYPE-2 sorted first — even though canonical-9 specifies
 * TYPE-5 / TYPE-4 and TYPE-2 is unrelated.
 *
 * Solution: when ties exist on an axis, prefer the candidate that
 * matches the top-scoring canonical's primary or alternatives. The
 * canonical-aligned pick is more likely to be what the brief
 * actually invokes than a sort-order accident.
 *
 * Tie-breaker uses Stage 4's canonical ranking. If Stage 4
 * misclassifies a brief's canonical (Cat A territory, Task 6), the
 * tie-breaker will amplify the misclassification across tied axes.
 * This is intentional for v0.1 — better test signal than fixtures
 * that "almost" route correctly. Task 6 fixes the upstream Stage 2/3
 * routing precision; tie-breaker behavior automatically improves
 * once Stage 4 classifies canonicals correctly.
 *
 * Architectural pattern: refinement passes should use stable
 * upstream rankings as alignment targets, not re-derive targets
 * from current picks. See docs/architectural-patterns.md
 * "Refinement passes should use stable upstream rankings."
 *
 * Single-pass and convergent. Stage 4's canonical_scores is
 * computed against full Stage 2 candidate sets, not just Stage 3a's
 * picks; so the alignment target is stable as Stage 3b refines per-
 * axis picks. No iteration needed.
 *
 * Returns the input combination unchanged (by reference) when no
 * ties trigger a tie-break. Callers can use reference equality to
 * detect "did anything change" cheaply for re-running Stage 4.
 */
export function refineRankingWithCanonicalAlignment(
  combination: RankedCombination,
  bucketMatches: BucketMatchOutput,
  verdict: CoherenceVerdict,
  corpus: Corpus,
): RankedCombination {
  const scores = verdict.canonical_scores;
  if (scores.length === 0) return combination;

  const topCanonicalId = scores[0]!.canonical_id;
  const canonical = corpus.canonical_combinations.find(
    (c) => c.id === topCanonicalId,
  );
  if (canonical === undefined) return combination;

  let refined: RankedCombination | null = null;

  for (const axis of ALL_AXES) {
    const candidates = bucketMatches[axis];
    if (candidates.length < 2) continue;

    const top = combination[axis].top;
    // Tied candidates: those within STAGE3_TIE_TOLERANCE of the top
    // pick's confidence. Includes the top itself.
    const tied = candidates.filter(
      (c) => Math.abs(c.confidence - top.confidence) <= STAGE3_TIE_TOLERANCE,
    );
    if (tied.length < 2) continue;

    const aligned = findCanonicalAlignedCandidate(tied, axis, canonical);
    if (aligned === null) continue;
    if (aligned.grammar_id === top.grammar_id) continue;

    // Replace top with the canonical-aligned candidate. Move the
    // displaced top into alternatives (and dedupe to avoid a
    // duplicate of the new top).
    if (refined === null) refined = { ...combination };
    const newAlts = [top, ...refined[axis].alternatives]
      .filter((c) => c.grammar_id !== aligned.grammar_id)
      .slice(0, ALTERNATIVES_KEPT_PER_AXIS);
    refined[axis] = {
      axis,
      top: aligned,
      alternatives: newAlts,
    };
  }

  return refined ?? combination;
}

/**
 * Among a set of tied candidates, return the first that matches the
 * canonical's primary axis grammar OR any of its axis_alternatives.
 * Returns null if no tied candidate matches.
 *
 * Uses F3-1's axis_alternatives when present (multi-option
 * canonicals); falls back to single-primary match when the canonical
 * specifies only one option for the axis.
 */
function findCanonicalAlignedCandidate(
  tied: AxisCandidate[],
  axis: Axis,
  canonical: CanonicalCombination,
): AxisCandidate | null {
  const ref = canonical.axis_mappings[axis];
  if (ref === undefined) return null;
  const alternatives = canonical.axis_alternatives?.[axis];
  const acceptableIds =
    alternatives !== undefined && alternatives.length > 0
      ? new Set(alternatives.map((r) => r.grammar_id))
      : new Set([ref.grammar_id]);
  for (const c of tied) {
    if (acceptableIds.has(c.grammar_id)) return c;
  }
  return null;
}

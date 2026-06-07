// src/routing/stage4-coherence.ts
//
// Stage 4 — Coherence Check per Turn 8 §5.1.4. Three sub-checks
// against the candidate combination from Stage 3:
//
//   1. Broken combinations: does the candidate trigger any of the
//      22 documented broken pairs from Turn 8 §2?
//   2. Canonical match: does the candidate exactly match one of the
//      15 canonicals (all 9 axes), or close to one?
//   3. Register coherence: per the kickoff D3 adjustment, the
//      register coherence score is the maximum fraction of axes
//      (out of 9) that match any single canonical's axis assignments.
//      ≥ 6/9 (~0.667) is the v0.1 coherent threshold; tunable in F3.
//
// Returns a CoherenceVerdict that Stage 5 consumes for resolution.
//
// Phase 2.1b Task 6a — directMatch tie-breaker:
//   The canonical_scores list is sorted by overlap (directMatch +
//   AI-default match), then by directMatch count. When BOTH levels
//   tie at top-1 vs top-2 (and top-1 is above the 6/9 coherence
//   threshold), `routing_ambiguous` is set on the verdict so Stage 5
//   / route() can surface an info-severity warning rather than
//   committing arbitrarily. Rationale: AI-default fills count toward
//   overlap to enable sparse-signal intent-path canonical fills, but
//   they don't reflect the brief's deliberate signal. When two
//   canonicals tie on overlap, the one with more SIGNAL-ROUTED axes
//   is the better register match.
//
//   directConfidenceSum is computed and surfaced on the score record
//   as v0.2 scaffolding (downstream consumers can inspect signal-
//   confidence aggregates) but NOT used as a tertiary tie-breaker.
//   Per architectural-patterns.md entry 6, bucket weights reflect
//   signal-type discriminative power, not deliberateness — so
//   confSum-as-tie-breaker would discriminate by bucket weight
//   rather than by the deliberate-signal axis we want. The Task 6a
//   checkpoint surfaced this empirically (a confSum tier broke
//   novel-saas-quiet-authority by re-ordering top-1 to a canonical
//   whose specs are all AI defaults). See entry 8 for full
//   rationale and the v0.2 score-restructure path.

import type { Axis } from "../types/axis.js";
import type { Corpus } from "../types/corpus.js";
import type {
  BrokenCombination,
  CanonicalCombination,
} from "../types/compatibility.js";
import { ALL_AXES } from "../types/axis.js";
import type { CoherenceVerdict, RankedCombination } from "./types.js";
import { isAIDefault } from "./stage3-confidence.js";

/**
 * Threshold for register-coherence-by-canonical-overlap. ≥ 6 of 9
 * axes matching a single canonical = the combination is in that
 * canonical's register family. Below 6 = potentially novel, must
 * pass other coherence checks to be served.
 */
export const REGISTER_COHERENCE_AXIS_THRESHOLD = 6;


/**
 * Stage 4 entrypoint. Runs all three sub-checks and assembles a
 * verdict.
 */
export function checkCoherence(
  combination: RankedCombination,
  corpus: Corpus,
): CoherenceVerdict {
  const broken_pairs = detectBrokenPairs(
    combination,
    corpus.broken_combinations,
  );
  const {
    canonical_match_id,
    register_coherence_score,
    register_coherence_canonical_id,
    canonical_scores,
    routing_ambiguous,
  } = scoreAgainstCanonicals(combination, corpus.canonical_combinations);

  const is_canonical_match = canonical_match_id !== null;
  const overlapAxisCount = Math.round(register_coherence_score * ALL_AXES.length);
  const register_coherent =
    overlapAxisCount >= REGISTER_COHERENCE_AXIS_THRESHOLD;

  const is_coherent =
    broken_pairs.length === 0 && (is_canonical_match || register_coherent);

  // Confidence on the canonical match: when it's an exact match,
  // confidence is 1.0; otherwise null. Stage 5 uses this to weigh
  // snap-to-canonical decisions.
  const canonical_match_confidence = is_canonical_match ? 1.0 : null;

  return {
    is_coherent,
    is_canonical_match,
    canonical_match_id,
    canonical_match_confidence,
    broken_pairs,
    register_coherence_score,
    register_coherence_canonical_id,
    canonical_scores,
    routing_ambiguous,
  };
}

// ---------------------------------------------------------------------------
// Broken-pair detection
// ---------------------------------------------------------------------------

/**
 * Returns every broken combination whose conflicting_grammars are
 * ALL present in the candidate combination. A broken pair "matches"
 * when every grammar reference it names appears in the candidate's
 * top picks for the corresponding axis.
 *
 * GrammarRefs without a grammar_id we can resolve (the
 * known-unresolvable allowlist from corpus loading — Mission-Earnest
 * etc.) are skipped: they'd never match a real top-pick id.
 */
function detectBrokenPairs(
  combination: RankedCombination,
  brokenCombinations: BrokenCombination[],
): BrokenCombination[] {
  const out: BrokenCombination[] = [];
  for (const broken of brokenCombinations) {
    // Broken combinations are inherently multi-axis: a single grammar
    // can't conflict with itself. Skip entries with fewer than two
    // resolved grammar refs — those are parser artifacts where the
    // compatibility-model parser dropped one clause (e.g., "Stock
    // Photography" in BROKEN-A-4 has no trailing axis word so it
    // didn't resolve to IMG-7). Without this guard, the surviving
    // single ref would match any combination with that grammar in
    // it, false-positiving on every Aman-style routing where LAYOUT-1
    // is naturally selected. The combination_text still preserves the
    // full pairing for the F3-iteration parser improvement work.
    if (broken.conflicting_grammars.length < 2) continue;

    let allMatch = true;
    for (const ref of broken.conflicting_grammars) {
      const axisPick = combination[ref.axis];
      if (axisPick === undefined) {
        allMatch = false;
        break;
      }
      if (axisPick.top.grammar_id !== ref.grammar_id) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) out.push(broken);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Canonical match + register-coherence-by-overlap
// ---------------------------------------------------------------------------

interface CanonicalScoreResult {
  canonical_match_id: string | null;
  register_coherence_score: number;
  register_coherence_canonical_id: string | null;
  /**
   * Phase 2.1a Task 2 + Phase 2.1b Task 6a: all canonicals scored,
   * sorted by overlap then directMatch count descending. Stable sort
   * preserves canonical_combinations iteration order on residual
   * ties. Stage 5's contradictory-canonicals detector reads top-2
   * from this list; route() reads top-1 as the canonical_match
   * candidate; Stage 3b reads top-1 as the cross-axis canonical-
   * alignment target.
   */
  canonical_scores: Array<{
    canonical_id: string;
    score: number;
    /**
     * Phase 2.1b Task 6a: count of axes where the candidate's pick
     * matches the canonical via signal (not AI-default). Used as
     * the secondary sort key after overlap; load-bearing for the
     * tie-breaker. Downstream consumers can also inspect signal-
     * routed alignment vs. lenient overlap directly.
     */
    direct_match_count: number;
    /**
     * Phase 2.1b Task 6a: sum of confidences of the directMatch
     * picks. v0.2 scaffolding — surfaced for downstream inspection
     * of signal-confidence aggregates, but NOT used as a tie-
     * breaker in v0.1. See architectural-patterns.md entry 8 for
     * the v0.2 score-restructure path that uses signal-routed-axes
     * as the score denominator (which obviates per-axis confidence
     * aggregation as a discriminator).
     */
    direct_confidence_sum: number;
  }>;
  /**
   * Phase 2.1b Task 6a: true when the top two canonicals tie on
   * BOTH overlap and directMatch count, AND top-1 is above the 6/9
   * register-coherence threshold. The brief has provided no signal-
   * axis basis to prefer one over the other; route() surfaces this
   * as an info-severity `routing_ambiguous` warning so the consuming
   * AI tool can ask a clarifying question rather than picking
   * arbitrarily.
   *
   * Distinct from contradictory_canonicals (Task 2): contradictory
   * fires when top-1 and top-2 are in DIFFERENT register families
   * with comparable scores; routing_ambiguous fires when top-1 and
   * top-2 are register-adjacent (Cat A) and the engine has no
   * signal-axis discriminator. Contradictory routes to a conflict
   * warning blocking canonical_match; routing_ambiguous routes to
   * an info-severity warning that still serves the top combination
   * but surfaces the ambiguity for clarification.
   */
  routing_ambiguous: boolean;
}

/**
 * Score the candidate against every canonical. Returns:
 *   - canonical_match_id: id of an EXACT-match canonical (every
 *     specified axis matches), or null.
 *   - register_coherence_score: max fraction of 9 axes that overlap
 *     any single canonical's axis_mappings.
 *   - register_coherence_canonical_id: which canonical gave the best
 *     overlap (after the tie-breaker hierarchy resolves).
 *
 * Canonicals don't always specify all 9 axes (e.g., CANONICAL-9
 * Application UI omits reading_pattern per the KNOWN_UNRESOLVABLE
 * allowlist). For exact matching we require every SPECIFIED axis to
 * match; unspecified axes are ignored (don't penalize the candidate
 * for picking something on an axis the canonical leaves open).
 *
 * Phase 2.1b Task 6a tie-breaker hierarchy (applied in
 * canonical_scores sort):
 *   1. Overlap score (directMatch + AI-default) — primary.
 *   2. directMatch count — prefer canonicals with more signal-routed
 *      alignment over canonicals with the same lenient overlap but
 *      more AI-default fills.
 *   3. (Residual) Stable sort preserves canonical_combinations
 *      iteration order. When top-1 vs top-2 tie at overlap AND
 *      directMatch (and top-1 is above the 6/9 register-coherence
 *      threshold), surface routing_ambiguous so route() can warn
 *      the consumer rather than picking arbitrarily.
 *
 * Note on confidence-sum: directConfidenceSum is computed and
 * surfaced on each score record (v0.2 scaffolding) but NOT used as
 * a tertiary tie-breaker. Per architectural-patterns.md entry 6,
 * bucket weights aren't reliable deliberateness proxies; using
 * confSum as a discriminator would route ties by bucket weight
 * rather than by deliberate signal. The Task 6a checkpoint
 * empirically confirmed this (a draft confSum tier broke novel-
 * saas-quiet-authority by reordering top-1 to a canonical whose
 * specs are all AI defaults, producing trivial-fill 1.0 confidence
 * where novel routing was correct). See entry 8.
 */
function scoreAgainstCanonicals(
  combination: RankedCombination,
  canonicals: CanonicalCombination[],
): CanonicalScoreResult {
  let exactMatchId: string | null = null;
  const allScores: Array<{
    canonical_id: string;
    score: number;
    direct_match_count: number;
    direct_confidence_sum: number;
  }> = [];

  for (const c of canonicals) {
    const result = scoreOneCanonical(combination, c);
    if (result.isExactMatch) {
      exactMatchId = c.id;
    }
    allScores.push({
      canonical_id: c.id,
      score: result.overlapCount / ALL_AXES.length,
      direct_match_count: result.directMatchCount,
      direct_confidence_sum: result.directConfidenceSum,
    });
  }

  // Phase 2.1b Task 6a: sort by overlap, then directMatch count.
  // Stable sort preserves canonical_combinations iteration order on
  // residual ties (overlap + directMatch both equal). The
  // directConfidenceSum field stays on the score record as v0.2
  // scaffolding for the score-restructure path documented in
  // architectural-patterns.md entry 8 — but it is NOT used as a
  // tie-breaker in v0.1. Per entry 6 (bucket weights reflect
  // signal-type discriminative power, not deliberateness),
  // confSum-as-tie-breaker would discriminate by bucket weight rather
  // than by the deliberate-signal axis the tie-breaker is meant to
  // capture. Empirical confirmation: an early Task 6a draft applied a
  // confSum tertiary tie-breaker and immediately broke novel-saas-
  // quiet-authority by reordering top-1 to a canonical whose specs
  // ARE all AI defaults (canonical-4), producing a trivial-fill 1.0
  // score where novel routing was correct. Dropped per option 2 of
  // the Task 6a checkpoint.
  allScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.direct_match_count - a.direct_match_count;
  });

  // Residual tie: top-1 and top-2 tie on overlap AND directMatch.
  // The engine has no signal-axis basis to prefer one canonical over
  // the other; surface as ambiguous. confSum is intentionally NOT
  // checked here for the same reason it isn't a tie-breaker — bucket-
  // weight noise shouldn't gate the warning either.
  let routing_ambiguous = false;
  if (allScores.length >= 2) {
    const top1 = allScores[0]!;
    const top2 = allScores[1]!;
    const top1Above = Math.round(top1.score * ALL_AXES.length) >=
      REGISTER_COHERENCE_AXIS_THRESHOLD;
    const tiesOnDiscriminators =
      top1.score === top2.score &&
      top1.direct_match_count === top2.direct_match_count;
    // Only surface ambiguity when top-1 is above coherence threshold
    // (otherwise the brief is too sparse for the ambiguity warning to
    // be meaningful — route's signal-density gate or
    // contradictory-canonicals detector handles those cases).
    routing_ambiguous = top1Above && tiesOnDiscriminators;
  }

  const top = allScores[0];
  const bestOverlap = top !== undefined
    ? Math.round(top.score * ALL_AXES.length)
    : 0;
  const bestOverlapId = top !== undefined ? top.canonical_id : null;

  return {
    canonical_match_id: exactMatchId,
    register_coherence_score: bestOverlap / ALL_AXES.length,
    register_coherence_canonical_id: bestOverlap > 0 ? bestOverlapId : null,
    canonical_scores: allScores,
    routing_ambiguous,
  };
}

interface OneCanonicalScore {
  overlapCount: number;
  directMatchCount: number;
  directConfidenceSum: number;
  isExactMatch: boolean;
}

function scoreOneCanonical(
  combination: RankedCombination,
  canonical: CanonicalCombination,
): OneCanonicalScore {
  let directMatchCount = 0;
  let directConfidenceSum = 0;
  let unsignalledMatchCount = 0;
  let allSpecifiedMatchStrict = true;
  let specifiedCount = 0;

  for (const axis of ALL_AXES) {
    const ref = canonical.axis_mappings[axis];
    if (ref === undefined) {
      // Canonical leaves this axis open; not a mismatch, not a hit.
      continue;
    }
    specifiedCount++;
    const candidatePick = combination[axis];
    if (candidatePick === undefined) {
      allSpecifiedMatchStrict = false;
      continue;
    }

    // F3-1: Multi-option canonicals. If the canonical lists multiple
    // acceptable grammars on this axis (e.g., "Color: Three-Color
    // Discipline OR Earth-Pulled Restraint"), any of those options
    // counts as a direct match. Falls back to single-option compare
    // when axis_alternatives doesn't have an entry for this axis.
    const acceptableIds = getAcceptableGrammarIds(canonical, axis, ref);
    if (acceptableIds.has(candidatePick.top.grammar_id)) {
      // Phase 2.1b Task 6a: distinguish signal-routed direct matches
      // from AI-default matches. Both count toward overlapCount (the
      // lenient register-coherence view), but only signal-routed
      // matches count toward directMatchCount + directConfidenceSum
      // (the "deliberate signal" view used by the tie-breaker).
      if (isAIDefault(candidatePick.top)) {
        // The candidate's pick happens to match the canonical's spec
        // on this axis but did so via AI-default fallback rather
        // than signal. This DOES count toward overlap (the canonical
        // can fill the AI default cleanly) but NOT toward direct
        // match — there's no deliberate signal preferring this
        // canonical's choice over a sibling's.
        unsignalledMatchCount++;
        // Strict match requires actual signal; AI-default doesn't
        // count toward exact-match either.
        allSpecifiedMatchStrict = false;
      } else {
        directMatchCount++;
        directConfidenceSum += candidatePick.top.confidence;
      }
    } else if (isAIDefault(candidatePick.top)) {
      // Candidate had no signal on this axis and fell back to the
      // AI default, which doesn't match this canonical. Counts
      // toward register-coherence overlap but NOT toward exact
      // match — an "open" pick is informational for the lenient
      // register match but isn't a confirmed signal-routed match
      // for the canonical.
      unsignalledMatchCount++;
      allSpecifiedMatchStrict = false;
    } else {
      allSpecifiedMatchStrict = false;
    }
  }

  // Exact match: every specified axis matches DIRECTLY (signal-
  // routed, not AI-defaulted). This avoids the trivial empty-brief
  // case where all-AI-default axes would otherwise pretend to match
  // every canonical's spec at 9/9.
  const isExactMatch = allSpecifiedMatchStrict && specifiedCount >= 7;

  return {
    // Register-coherence overlap counts both direct AND AI-default
    // matches (the lenient view for filling un-signaled axes from a
    // canonical when the brief invokes that register).
    overlapCount: directMatchCount + unsignalledMatchCount,
    directMatchCount,
    directConfidenceSum,
    isExactMatch,
  };
}

/**
 * Resolve the set of grammar ids that count as a direct match for a
 * canonical's axis. When the canonical lists multiple options
 * (axis_alternatives), all of them are acceptable. Otherwise the
 * single primary option in axis_mappings is the only acceptable id.
 */
function getAcceptableGrammarIds(
  canonical: CanonicalCombination,
  axis: Axis,
  primaryRef: { grammar_id: string },
): Set<string> {
  const alternatives = canonical.axis_alternatives?.[axis];
  if (alternatives !== undefined && alternatives.length > 0) {
    return new Set(alternatives.map((r) => r.grammar_id));
  }
  return new Set([primaryRef.grammar_id]);
}

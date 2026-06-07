// src/routing/stage5-resolve.ts
//
// Stage 5 — Conflict Resolution per Turn 8 §5.1.5. Three strategies:
//
//   override_axis      — replace one or more conflicting axes with
//                        their second-ranked alternatives.
//   snap_to_canonical  — if the combination is close to a canonical
//                        (≥6/9 axis overlap), snap conflicting axes
//                        to that canonical's grammars.
//   surface_conflict   — return as-is with a conflict-severity
//                        warning so the consuming AI tool can ask
//                        the user a clarifying question.
//
// v0.1 strategy precedence (simplest path that works, tunable in F3):
//   1. If is_coherent → no_resolution_needed.
//   2. If broken_pairs detected AND a canonical match ≥ 6/9 exists →
//      snap_to_canonical.
//   3. If broken_pairs detected → try override (replace conflicting
//      axis with its second-ranked alternative); if the override
//      resolves the conflict → override_axis.
//   4. Otherwise → surface_conflict.

import type { Axis } from "../types/axis.js";
import type { Corpus } from "../types/corpus.js";
import { ALL_AXES } from "../types/axis.js";
import type {
  AxisCandidate,
  AxisChange,
  CoherenceVerdict,
  EliminatedGrammars,
  RankedAxis,
  RankedCombination,
  ResolutionResult,
  ResolutionStrategy,
} from "./types.js";
import {
  REGISTER_COHERENCE_AXIS_THRESHOLD,
  checkCoherence,
} from "./stage4-coherence.js";
import { isAIDefault } from "./stage3-confidence.js";
import type { RoutingWarning } from "../types/routing.js";

/**
 * Empty elimination map used as the default when callers don't pass
 * one. Keeps the eliminated-grammar respect logic a no-op for legacy
 * tests that don't provide elimination info.
 */
const EMPTY_ELIMINATIONS: EliminatedGrammars = new Map();
for (const axis of ALL_AXES) {
  EMPTY_ELIMINATIONS.set(axis, new Set());
}

/**
 * Stage 5 entrypoint. Returns the resolved combination plus a
 * record of any axis changes made and any warnings to surface.
 *
 * Before strategy dispatch: if a canonical's register-coherence
 * score is above the threshold AND any axis is AI-defaulted, fill
 * the AI defaults with the canonical's specifications. This makes
 * sparse-signal briefs (intent-path "I want it to feel like X")
 * route to the FULL canonical combination rather than to a partial
 * mix where un-signaled axes stay at AI defaults that may not align
 * with the brief's invoked register.
 */
export function resolveConflicts(
  combination: RankedCombination,
  verdict: CoherenceVerdict,
  corpus: Corpus,
  eliminated: EliminatedGrammars = EMPTY_ELIMINATIONS,
): ResolutionResult {
  // Phase 2.1a Task 2: detect contradictory canonicals BEFORE any
  // fill-or-snap resolution. When the brief invokes two canonicals
  // from different register families with comparable scores, the
  // routing pipeline shouldn't pick one silently — it should
  // surface a conflict warning so the consuming AI tool can ask the
  // user a clarifying question. Adjacent canonicals (same register
  // family) are Category A's territory and resolve via
  // disambiguation, not contradiction; the register-overlap check
  // distinguishes the two cases.
  const contradictionWarning = detectContradictoryCanonicals(verdict, corpus);
  if (contradictionWarning !== null) {
    return {
      strategy: "surface_conflict",
      resolved_combination: combination,
      changes: [],
      warnings: [contradictionWarning],
    };
  }

  // Fill AI-defaulted axes from the best-matching canonical (when
  // register coherence is above threshold).
  const filled = fillAIDefaultsFromCanonical(
    combination,
    verdict,
    corpus,
    eliminated,
  );
  const filledCombination = filled.combination;
  const filledVerdict =
    filled.changes.length > 0
      ? checkCoherence(filledCombination, corpus)
      : verdict;

  if (filledVerdict.is_coherent) {
    return {
      strategy: "no_resolution_needed",
      resolved_combination: filledCombination,
      changes: filled.changes,
      warnings: filled.warnings,
    };
  }

  // Strategy 1: snap to canonical if a close match exists.
  if (
    filledVerdict.broken_pairs.length > 0 &&
    filledVerdict.register_coherence_canonical_id !== null &&
    Math.round(filledVerdict.register_coherence_score * ALL_AXES.length) >=
      REGISTER_COHERENCE_AXIS_THRESHOLD
  ) {
    const snapped = trySnapToCanonical(
      filledCombination,
      filledVerdict.register_coherence_canonical_id,
      corpus,
      eliminated,
    );
    if (snapped !== null) {
      const reverdict = checkCoherence(snapped.combination, corpus);
      if (reverdict.broken_pairs.length === 0) {
        return {
          strategy: "snap_to_canonical",
          resolved_combination: snapped.combination,
          changes: [...filled.changes, ...snapped.changes],
          warnings: [
            ...filled.warnings,
            buildWarning(
              "warning",
              "broken_combination_resolved",
              `Resolved ${filledVerdict.broken_pairs.length} broken combination(s) by snapping ` +
                `to canonical "${filledVerdict.register_coherence_canonical_id}".`,
            ),
          ],
        };
      }
    }
  }

  // Strategy 2: override conflicting axis with second-ranked
  // alternative. Try each axis involved in a broken pair; the first
  // override that resolves all broken pairs wins.
  const overrideResult = tryOverride(filledCombination, filledVerdict, corpus);
  if (overrideResult !== null) {
    return {
      strategy: "override_axis",
      resolved_combination: overrideResult.combination,
      changes: [...filled.changes, ...overrideResult.changes],
      warnings: [
        ...filled.warnings,
        buildWarning(
          "warning",
          "broken_combination_resolved",
          `Resolved broken combination(s) by overriding ` +
            `${overrideResult.changes.map((c) => c.axis).join(", ")}.`,
        ),
      ],
    };
  }

  // Strategy 3: surface conflict.
  const warnings: RoutingWarning[] = [...filled.warnings];
  for (const broken of filledVerdict.broken_pairs) {
    warnings.push(
      buildWarning(
        "conflict",
        "broken_combination_detected",
        `Broken combination (Family ${broken.family}): ${broken.combination_text}. ${broken.why_it_breaks}`,
        broken.conflicting_grammars,
      ),
    );
  }
  return {
    strategy: "surface_conflict",
    resolved_combination: filledCombination,
    changes: filled.changes,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Snap to canonical
// ---------------------------------------------------------------------------

interface ResolveStep {
  combination: RankedCombination;
  changes: AxisChange[];
  /**
   * Phase 2.1a: warnings emitted by fill-or-snap when the canonical's
   * primary (or all alternatives) on an axis is eliminated by anti-
   * vibe matching. The axis stays at its Stage 3 secondary pick (or
   * AI-default if no secondary survived); this warning surfaces the
   * skip so consumers know an eliminated grammar wasn't silently
   * filled in.
   */
  warnings: RoutingWarning[];
}

/**
 * Fill AI-defaulted axes from the best-matching canonical when
 * register coherence is at or above threshold. Sparse-signal briefs
 * (intent-path "I want it to feel like X") often signal only a few
 * axes; the rest fall back to AI defaults via Stage 3. When the
 * signaled axes strongly match a canonical, the un-signaled axes
 * should adopt the canonical's specs rather than the generic AI
 * defaults — that's what "feel like X" means.
 *
 * Only fires when the canonical's match overlap is ≥ threshold.
 * Below threshold, AI defaults stay (the brief may be novel-but-
 * coherent, mixing canonicals deliberately).
 */
/**
 * Minimum number of evidence-backed axes (signal-routed, NOT AI-
 * defaulted) required before fill-from-canonical fires. Below this
 * threshold the brief hasn't given enough signal to anchor a
 * canonical fill.
 *
 * Phase 2.1b Task 4b: lowered from 2 to 1. The route.ts level gate
 * MIN_SIGNAL_DENSITY_FOR_CONFIDENT_ROUTING = 2 already guards against
 * truly-empty briefs (suppresses canonical_match + surfaces
 * brief_too_ambiguous). The Stage 5 evidence-axis gate at 2 was
 * redundant for the empty-brief case but blocked legitimate sparse
 * intent-path briefs (e.g., wellness-dtc-intent: 7 total signals
 * across compositional_intent + domain + audience but only 1 routes
 * to a grammar — voice). The route-level signal-density gate is the
 * load-bearing empty-brief defense; Stage 5's gate just ensures
 * there's at least ONE evidence-backed axis to anchor the fill.
 */
const FILL_MIN_EVIDENCE_AXES = 1;

/**
 * F3-2 cap: maximum number of SIGNAL-ROUTED axes (where the candidate
 * pick has real evidence — not AI-default) the canonical-fill step
 * is allowed to OVERRIDE in a single fill. Above this, abort the
 * fill entirely.
 *
 * The rationale distinguishes "fill an unsignaled axis from canonical"
 * (always OK; intent-path canonical fixtures depend on this) from
 * "REPLACE a signal-routed novel axis with the canonical's grammar"
 * (must be capped; otherwise novel-but-coherent briefs lose their
 * novelty when they happen to share register-coherence with a
 * neighbor canonical).
 *
 * Without the cap, novel-but-coherent briefs that happen to share
 * 6+ axes with a canonical (the register-coherence threshold) get
 * the rest of their axes silently overwritten by canonical specs —
 * erasing the novel-but-coherent signature and producing a 1.0
 * confidence canonical match where none was warranted. The fixture
 * "novel-developer-tool-editorial" (devtool layout + editorial
 * typography + serif color) is the canonical example: the engine
 * filled signaled-but-weak axes from Luxury Hospitality, ending at
 * a perfect canonical match.
 *
 * 2 is the v0.1 tuning. The reasoning: a strong canonical match
 * justifies overriding 1–2 weak signaled picks; beyond that, the
 * brief is making a deliberate mix that shouldn't get collapsed
 * into the canonical. Tunable in F3 follow-ups.
 */
const MAX_AI_DEFAULT_FILL_THRESHOLD = 2;

function fillAIDefaultsFromCanonical(
  combination: RankedCombination,
  verdict: CoherenceVerdict,
  corpus: Corpus,
  eliminated: EliminatedGrammars,
): ResolveStep {
  // Signal-density gate: count axes whose top pick has actual
  // evidence (a signal-routed match, not an AI-default fallback).
  // If fewer than the threshold are signal-routed, the brief is too
  // thin to anchor a canonical fill — surface as-is.
  let evidenceAxes = 0;
  for (const axis of ALL_AXES) {
    if (!isAIDefault(combination[axis].top)) evidenceAxes++;
  }
  if (evidenceAxes < FILL_MIN_EVIDENCE_AXES) {
    return { combination, changes: [], warnings: [] };
  }

  const targetCanonicalId =
    verdict.canonical_match_id ?? verdict.register_coherence_canonical_id;
  if (targetCanonicalId === null) {
    return { combination, changes: [], warnings: [] };
  }
  const overlap = Math.round(verdict.register_coherence_score * ALL_AXES.length);
  if (overlap < REGISTER_COHERENCE_AXIS_THRESHOLD) {
    return { combination, changes: [], warnings: [] };
  }
  const canonical = corpus.canonical_combinations.find(
    (c) => c.id === targetCanonicalId,
  );
  if (canonical === undefined) return { combination, changes: [], warnings: [] };

  // Compute the proposed fill plan WITHOUT mutating the combination
  // yet. We need the total change count to enforce the F3-2
  // MAX_AI_DEFAULT_FILL_THRESHOLD cap atomically — if more than the
  // cap of axes would change, abort the fill so the novel-but-
  // coherent signature is preserved.
  interface ProposedChange {
    axis: Axis;
    refGrammarId: string;
    fromGrammarId: string;
    isAIDefaultedFrom: boolean;
    fromConfidence: number;
  }
  const proposed: ProposedChange[] = [];

  // Phase 2.1a fix: track axes whose fill was skipped because the
  // canonical's primary AND every alternative is in the per-axis
  // eliminated set. These produce a warning so the consumer knows
  // an anti-vibe-eliminated grammar wasn't silently re-introduced
  // via canonical fill.
  const eliminatedSkips: Array<{ axis: Axis; canonicalRef: string }> = [];

  for (const axis of ALL_AXES) {
    const ref = canonical.axis_mappings[axis];
    if (ref === undefined) continue;
    const current = combination[axis];
    if (current.top.grammar_id === ref.grammar_id) continue;

    // Phase 2.1a fix: respect Stage 2 anti-vibe elimination. If the
    // canonical's primary IS in the eliminated set, try its
    // alternatives in order; if all are eliminated too, skip the
    // axis entirely and emit a warning. This honors the spec's
    // anti-vibe-eliminates-not-discounts semantic (Turn 8 §5.2.5
    // weights anti-vibes 1.5× explicitly because they eliminate)
    // through canonical fill.
    const elimSet = eliminated.get(axis) ?? new Set<string>();
    const canonicalCandidates = collectCanonicalCandidates(canonical, axis, ref);
    const firstNonEliminated = canonicalCandidates.find(
      (id) => !elimSet.has(id),
    );
    if (firstNonEliminated === undefined) {
      // Every option for this axis on this canonical is eliminated.
      // Skip the fill; the axis stays at whatever Stage 3 picked
      // (typically a non-eliminated secondary or AI-default).
      eliminatedSkips.push({ axis, canonicalRef: ref.grammar_id });
      continue;
    }
    const refGrammarId = firstNonEliminated;
    if (current.top.grammar_id === refGrammarId) continue;

    // Phase 2.1b Task 4b: fill ONLY when current pick is AI-
    // defaulted. The original Task 4b plan considered an
    // additional `!acceptableSet.has(current.top.grammar_id)`
    // condition to fill non-canonical signal-routed picks; post-
    // implementation testing showed it broke novel-but-coherent
    // fixtures (8 regressions) because vernacular-bucket-routed
    // novel signals (typically 0.6–0.7 confidence) and brand-
    // bucket-routed wrong-strong picks (typically 0.9+) can't be
    // distinguished by confidence alone — the confidence-vs-
    // deliberateness gap (see docs/architectural-patterns.md
    // entry 6).
    //
    // Task 4b's actual targets are 5 AI-defaulted Cat B fixtures
    // (creative-agency-intent, developer-tool-intent, editorial-
    // longform-intent, plain-document-intent, wellness-dtc-intent).
    // The simpler AI-default-only condition closes them cleanly.
    // High-confidence wrong-strong picks (Cases 1, 2, 3 from the
    // re-categorization audit: application-ui-brand/voice,
    // editorial-longform-brand/typography, saas-marketing-brand/
    // typography) defer to Task 4c — altname coverage work + spec
    // consistency review. See docs/altname-coverage-notes.md
    // negative-result entries for the deferral rationale.
    //
    // The F3-2 MAX_AI_DEFAULT_FILL_THRESHOLD cap on REPLACEMENTS
    // below stays as protection against future scope changes — if
    // a future task adds a not-in-canonical override condition,
    // the cap prevents it from bulk-collapsing novel signatures.
    // CANONICAL_OVERRIDE_THRESHOLD is documented in architectural-
    // patterns.md as a future defense for the Cases-1-2-3 use
    // case but isn't shipped in v0.1.
    const shouldFill = isAIDefault(current.top);

    if (!shouldFill) continue;

    proposed.push({
      axis,
      refGrammarId,
      fromGrammarId: current.top.grammar_id,
      isAIDefaultedFrom: isAIDefault(current.top),
      fromConfidence: current.top.confidence,
    });
  }

  // F3-2 cap. Two-part check:
  //
  //   1. Replacement cap: if the fill plan would override more than
  //      MAX_AI_DEFAULT_FILL_THRESHOLD signal-routed picks (axes that
  //      had real evidence but lower confidence than the canonical
  //      match score), abort. Above this threshold the brief's signal
  //      pattern is novel-leaning, not canonical-leaning — overriding
  //      that many signal-routed picks erases the novel signature.
  //
  //   2. AI-default fills are NOT capped here. Intent-path canonical
  //      fixtures (e.g., "I want it to feel expensive but not loud")
  //      legitimately need 6–8 AI-default fills to complete the
  //      canonical's grammar set; those fills don't compete with any
  //      signal-routed pick and don't risk erasing novelty.
  const replaceCount = proposed.filter((p) => !p.isAIDefaultedFrom).length;
  if (replaceCount > MAX_AI_DEFAULT_FILL_THRESHOLD) {
    return { combination, changes: [], warnings: [] };
  }

  // Apply the proposed changes.
  const next: RankedCombination = { ...combination };
  const changes: AxisChange[] = [];
  for (const p of proposed) {
    const current = next[p.axis];
    const synthesized: AxisCandidate = {
      axis: p.axis,
      grammar_id: p.refGrammarId,
      confidence: verdict.register_coherence_score,
      evidence: [],
    };
    const reason = p.isAIDefaultedFrom
      ? `Filled AI default with canonical ${targetCanonicalId} (${canonical.name}) grammar (axis was un-signaled, register coherence ≥ ${REGISTER_COHERENCE_AXIS_THRESHOLD}/9).`
      : `Replaced weak axis pick (conf ${p.fromConfidence.toFixed(2)}) with canonical ${targetCanonicalId} (${canonical.name}) grammar (canonical match conf ${verdict.register_coherence_score.toFixed(2)} exceeds axis conf).`;
    changes.push({
      axis: p.axis,
      from_grammar_id: p.fromGrammarId,
      to_grammar_id: p.refGrammarId,
      reason,
    });
    next[p.axis] = {
      axis: p.axis,
      top: synthesized,
      alternatives: [current.top, ...current.alternatives].slice(0, 2),
    };
  }

  // Phase 2.1a: emit a warning per axis where the canonical's primary
  // (and every alternative) was anti-vibe-eliminated. Consumers see
  // the skip explicitly rather than silently getting a non-canonical
  // pick on that axis.
  const warnings: RoutingWarning[] = eliminatedSkips.map(({ axis, canonicalRef }) =>
    buildWarning(
      "info",
      "canonical_axis_skipped_due_to_elimination",
      `Canonical ${targetCanonicalId} (${canonical.name}) specifies ${canonicalRef} ` +
        `for ${axis}, but that grammar (and any alternatives the canonical lists) ` +
        `was eliminated by an anti-vibe signal. The ${axis} axis stays at the ` +
        `engine's ranked secondary pick rather than being filled from canonical.`,
    ),
  );

  return { combination: next, changes, warnings };
}

/**
 * Phase 2.1a helper: collect the canonical's grammar IDs for an
 * axis — primary first, then any axis_alternatives in order. F3-1's
 * multi-option canonical extension lets a canonical specify
 * "Color: A or B"; respecting Stage 2 elimination means trying each
 * option in turn and skipping only when ALL options are eliminated.
 */
function collectCanonicalCandidates(
  canonical: import("../types/compatibility.js").CanonicalCombination,
  axis: Axis,
  primaryRef: { grammar_id: string },
): string[] {
  const alternatives = canonical.axis_alternatives?.[axis];
  if (alternatives !== undefined && alternatives.length > 0) {
    // axis_alternatives includes the primary as its first element
    // when populated; rely on that ordering rather than re-prepending.
    return alternatives.map((r) => r.grammar_id);
  }
  return [primaryRef.grammar_id];
}

function trySnapToCanonical(
  combination: RankedCombination,
  canonicalId: string,
  corpus: Corpus,
  eliminated: EliminatedGrammars,
): ResolveStep | null {
  const canonical = corpus.canonical_combinations.find(
    (c) => c.id === canonicalId,
  );
  if (canonical === undefined) return null;

  const next: RankedCombination = { ...combination };
  const changes: AxisChange[] = [];
  const eliminatedSkips: Array<{ axis: Axis; canonicalRef: string }> = [];

  for (const axis of ALL_AXES) {
    const ref = canonical.axis_mappings[axis];
    if (ref === undefined) continue;
    const current = next[axis];
    if (current.top.grammar_id === ref.grammar_id) continue;

    // Phase 2.1a fix: respect Stage 2 anti-vibe elimination. Snap-
    // to-canonical, like fillAIDefaultsFromCanonical, must skip
    // axes whose canonical primary AND alternatives are in the
    // eliminated set.
    const elimSet = eliminated.get(axis) ?? new Set<string>();
    const canonicalCandidates = collectCanonicalCandidates(canonical, axis, ref);
    const firstNonEliminated = canonicalCandidates.find(
      (id) => !elimSet.has(id),
    );
    if (firstNonEliminated === undefined) {
      eliminatedSkips.push({ axis, canonicalRef: ref.grammar_id });
      continue;
    }
    const refGrammarId = firstNonEliminated;
    if (current.top.grammar_id === refGrammarId) continue;

    // Replace this axis with the canonical's grammar. Preserve the
    // original alternative list so the user can see what we displaced.
    const synthesized: AxisCandidate = {
      axis,
      grammar_id: refGrammarId,
      confidence: 0.7, // moderate — snapped, not natively routed
      evidence: [],
    };
    changes.push({
      axis,
      from_grammar_id: current.top.grammar_id,
      to_grammar_id: refGrammarId,
      reason: `Snapped to canonical ${canonicalId} (${canonical.name}).`,
    });
    next[axis] = {
      axis,
      top: synthesized,
      alternatives: [current.top, ...current.alternatives],
    };
  }

  const warnings: RoutingWarning[] = eliminatedSkips.map(({ axis, canonicalRef }) =>
    buildWarning(
      "info",
      "canonical_axis_skipped_due_to_elimination",
      `Snap-to-canonical ${canonicalId} (${canonical.name}) specifies ${canonicalRef} ` +
        `for ${axis}, but that grammar (and any alternatives the canonical lists) ` +
        `was eliminated by an anti-vibe signal. The ${axis} axis stays at its ` +
        `pre-snap pick rather than being snapped to the canonical's spec.`,
    ),
  );

  if (changes.length === 0 && warnings.length === 0) return null;
  return { combination: next, changes, warnings };
}

// ---------------------------------------------------------------------------
// Override axis
// ---------------------------------------------------------------------------

function tryOverride(
  combination: RankedCombination,
  verdict: CoherenceVerdict,
  corpus: Corpus,
): ResolveStep | null {
  // Identify which axes are involved in any broken pair.
  const conflictedAxes = new Set<Axis>();
  for (const broken of verdict.broken_pairs) {
    for (const ref of broken.conflicting_grammars) {
      conflictedAxes.add(ref.axis);
    }
  }
  if (conflictedAxes.size === 0) return null;

  // Try overriding each conflicted axis individually with its
  // second-ranked alternative.
  for (const axis of conflictedAxes) {
    const alt = combination[axis].alternatives[0];
    if (alt === undefined) continue;
    if (alt.confidence === 0) continue;

    const next = swapAxisTop(combination, axis, alt);
    const reverdict = checkCoherence(next, corpus);
    if (reverdict.broken_pairs.length === 0) {
      return {
        combination: next,
        changes: [
          {
            axis,
            from_grammar_id: combination[axis].top.grammar_id,
            to_grammar_id: alt.grammar_id,
            reason: `Override: replaced with second-ranked candidate to resolve broken pair.`,
          },
        ],
        warnings: [],
      };
    }
  }
  return null;
}

function swapAxisTop(
  combination: RankedCombination,
  axis: Axis,
  newTop: AxisCandidate,
): RankedCombination {
  const next: RankedCombination = { ...combination };
  const current = next[axis];
  const newRanked: RankedAxis = {
    axis,
    top: newTop,
    alternatives: [
      current.top,
      ...current.alternatives.filter(
        (a) => a.grammar_id !== newTop.grammar_id,
      ),
    ].slice(0, 2),
  };
  next[axis] = newRanked;
  return next;
}

// ---------------------------------------------------------------------------
// Phase 2.1a Task 2 — Contradictory-canonicals detector
// ---------------------------------------------------------------------------

/**
 * Tie ratio threshold for contradictory-canonicals detection.
 * top-2 / top-1 ≥ this value means the two scores are "close enough"
 * to be a tie. Lower means stricter (fewer false-positives, more
 * missed contradictions); higher means looser (more false-positives
 * on adjacent canonicals).
 *
 * v0.1 STARTING POINT: 0.95. Originally drafted at 0.85 in the
 * Phase 2.1a Task 2 plan; reviewing actual fixture score
 * distributions during implementation showed that 0.85 produced
 * false positives on legitimate canonical fixtures whose top-2 was
 * an adjacent canonical at score ~0.889 (ratio 0.889 < 0.95). The
 * detector now ships with the conservative 0.95 threshold so
 * canonical fixtures don't false-positive; the trade-off is that
 * the v0.1 detector doesn't fire on the two failure-mode fixtures
 * either (their score distributions don't produce a top-2 within
 * 5% of top-1). See the v0.1 limitation comment on
 * `detectContradictoryCanonicals` for why.
 */
const CONTRADICTION_TIE_RATIO = 0.95;

/**
 * Register-overlap threshold for contradictory-canonicals detection.
 * Two canonicals share AT MOST this many axes (counting
 * axis_alternatives, not just primaries) to count as "different
 * register families."
 *
 * v0.1 STARTING POINT: 0. The detector requires the top two
 * canonicals to share ZERO grammar specs across all 9 axes —
 * truly distant register families (e.g., Luxury Hospitality vs
 * Modern AI Startup share no grammar specs even when alternatives
 * are considered).
 *
 * The Phase 2.1a Task 2 plan originally drafted this at 5 with
 * primary-only overlap. Implementation review found that primary-
 * only overlap underestimates adjacency (canonical-1 vs canonical-12
 * share only 2 PRIMARIES but ~7 axes when alternatives are counted),
 * which produced false positives on legitimate canonical fixtures.
 * Switching to alt-aware overlap reduced but didn't eliminate
 * false positives (canonical-8 vs canonical-9 share 4 axes alt-aware,
 * still firing the detector at threshold 5). Setting threshold to
 * 0 — only fire on truly distant register pairs — eliminates all
 * false positives at the cost of zero failure-mode closures.
 *
 * The design decision documented in code:
 *
 *   The overlap threshold of 0 means the v0.1 detector ONLY fires
 *   on canonical pairs that share no grammar specs — the truly
 *   distant register-family case (e.g., Luxury Hospitality vs Modern
 *   AI Startup, Application UI vs Awwwards-Tier Creative Agency).
 *   Adjacent canonicals (Editorial Magazine vs Editorial Long-Form,
 *   Luxury Hospitality vs Premium Editorial-Brand Hybrid, Developer
 *   Tool Marketing vs Application UI) all share at least one
 *   grammar via alternatives or shared primaries; they route through
 *   Category A (disambiguation), not contradiction detection. This
 *   is correct: "I want luxury hotel + editorial magazine" is
 *   gracefully resolvable; "I want luxury hotel + AI startup
 *   gradient site" isn't.
 *
 *   The conservative threshold means the detector ships as
 *   architectural scaffolding only — for the score-distribution
 *   case it can detect (truly distant families with nearly-tied
 *   scores), no v0.1 fixture exercises it. The two failure-mode
 *   fixtures in the suite (fail-bento, fail-contradictory) defer
 *   to v0.2 signal-level detection. See the v0.1 limitation
 *   comment on `detectContradictoryCanonicals`.
 *
 *   Future contributors revisiting this constant: don't loosen
 *   without re-running against the canonical fixture suite. The
 *   primary-only overlap at threshold 5 produced 13 false
 *   positives. Alt-aware at threshold 5 produced 6 false positives.
 *   Alt-aware at threshold 0 produces 0 false positives.
 */
const CONTRADICTION_MAX_REGISTER_OVERLAP = 0;

/**
 * v0.1 limitation: this score-distribution detector is INSUFFICIENT
 * for the two failure-mode fixtures in v0.1's test suite (fail-bento-
 * and-quiet-luxury, fail-contradictory-canonicals). Honest finding
 * from Phase 2.1a Task 2 implementation review:
 *
 *   - fail-bento-and-quiet-luxury has signals
 *     `brand_exemplars: ["Aman"]` + `vibes: ["bento-modern AI startup",
 *     "quiet-luxury hospitality"]`. Aman's brand-name match dominates
 *     Stage 1's signal output, routing all 9 axes to canonical-1
 *     (Luxury Hospitality) at score 1.0. Top-2 ends up being
 *     canonical-12 (Premium Editorial-Brand Hybrid, ADJACENT to
 *     canonical-1), NOT canonical-3 (Modern AI Startup, the
 *     contradictory canonical the brief invokes via "bento-modern AI
 *     startup"). The contradiction signal exists in the brief but
 *     doesn't survive to the canonical-score distribution.
 *
 *   - fail-contradictory-canonicals has 4 spread-out vibes and no
 *     brand. No canonical dominates; top-1 (canonical-7 Neo-Brutalist)
 *     scores only 0.667, top-2 (canonical-2 Editorial Magazine)
 *     scores 0.556, ratio 0.833 < CONTRADICTION_TIE_RATIO. Detector
 *     wouldn't fire even with permissive register-overlap.
 *
 * v0.1 ships the canonical_scores scaffolding on CoherenceVerdict and
 * this detector function for future use. The actual contradiction
 * detection that closes these two fixtures requires SIGNAL-LEVEL
 * detection — examining per-vibe canonical attribution before
 * Stage 1's signal extraction collapses the multi-canonical signal
 * into single-canonical dominance. That's v0.2 scope; the
 * fixtures stay in the test suite as the validation cases for the
 * v0.2 fix.
 *
 * See docs/architectural-patterns.md "Contradiction detection should
 * operate on signal-extraction outputs" for the cross-phase pattern.
 *
 * v0.1 return shape: when the detector DOES fire (on canonical-1
 * vs. truly distant register canonicals — the contrived/synthetic
 * case the architecture supports), the route returns top-1's
 * combination with the contradiction warning in open_warnings (not
 * multiple alternative cards). The warning is the load-bearing
 * thing — it tells the consuming AI tool "this brief is
 * contradictory" so it can ask a clarifying question rather than
 * committing silently. Returning multiple cards as alternatives
 * is v0.2 polish, not v0.1 correctness.
 */
function detectContradictoryCanonicals(
  verdict: CoherenceVerdict,
  corpus: Corpus,
): RoutingWarning | null {
  const scores = verdict.canonical_scores;
  if (scores.length < 2) return null;
  const top1 = scores[0]!;
  const top2 = scores[1]!;

  // Top-1 must be above register-coherence threshold; otherwise the
  // brief is too sparse to produce a contradiction (it's not
  // strongly invoking either canonical).
  const top1AxisCount = Math.round(top1.score * ALL_AXES.length);
  if (top1AxisCount < REGISTER_COHERENCE_AXIS_THRESHOLD) return null;

  // Top-2 must be close to top-1 in score. If top-2 is materially
  // lower, top-1 is the clear winner and there's no contradiction
  // (just normal canonical routing).
  if (top1.score === 0) return null;
  const tieRatio = top2.score / top1.score;
  if (tieRatio < CONTRADICTION_TIE_RATIO) return null;

  // Top-1 and top-2 must be in different register families.
  // Adjacent canonicals (same family) route through Category A
  // disambiguation; contradictory canonicals (different families)
  // route here.
  const top1Canonical = corpus.canonical_combinations.find(
    (c) => c.id === top1.canonical_id,
  );
  const top2Canonical = corpus.canonical_combinations.find(
    (c) => c.id === top2.canonical_id,
  );
  if (top1Canonical === undefined || top2Canonical === undefined) return null;

  const overlap = countRegisterOverlap(top1Canonical, top2Canonical);
  if (overlap > CONTRADICTION_MAX_REGISTER_OVERLAP) return null;

  return buildWarning(
    "conflict",
    "contradictory_canonicals",
    `Brief invokes contradictory canonical registers: ` +
      `${top1Canonical.name} (score ${top1.score.toFixed(2)}) and ` +
      `${top2Canonical.name} (score ${top2.score.toFixed(2)}) ` +
      `score within ${Math.round((1 - CONTRADICTION_TIE_RATIO) * 100)}% of each other ` +
      `but share fewer than ${CONTRADICTION_MAX_REGISTER_OVERLAP}/9 axes — ` +
      `they're in different register families. The routing engine ` +
      `surfaces this as a conflict so the consuming tool can ask ` +
      `the user a clarifying question rather than picking one canonical silently.`,
  );
}

/**
 * Count the number of axes where two canonicals overlap in their
 * register family — i.e., axes where their grammar specs intersect
 * after considering F3-1's `axis_alternatives` (multi-option
 * canonicals).
 *
 * Phase 2.1a Task 2 uses this as the register-family proxy: high
 * overlap = same family (adjacent canonicals, e.g., Editorial
 * Magazine vs Editorial Long-Form, or Luxury Hospitality vs Premium
 * Editorial-Brand Hybrid); low overlap = different families
 * (contradictory canonicals, e.g., Luxury Hospitality vs Modern AI
 * Startup, sharing essentially no grammar specs).
 *
 * Why alt-aware: primary-only overlap underestimates adjacency.
 * Luxury Hospitality (canonical-1) and Premium Editorial-Brand
 * Hybrid (canonical-12) share only 2/9 PRIMARIES — but canonical-12's
 * axis_alternatives include canonical-1's primaries on TYPE, COLOR,
 * COMP, VOICE, RP. Their register sensibility is adjacent (luxury-
 * editorial premium); they just specify different primary axes.
 * Counting alt-overlap captures this register-family proximity that
 * primary-only counting misses.
 *
 * Two canonicals share an axis if EITHER:
 *   - They both have a primary, and the primaries equal, OR
 *   - One canonical's primary appears in the other canonical's
 *     axis_alternatives for that axis (or vice versa).
 *
 * Pre-Task-2 implementation counted only direct primary equality
 * (commit landing this comment changed the proxy to alt-aware).
 * The change reduced false-positives on canonical fixtures where
 * top-2 was an adjacent-but-different-primary canonical.
 */
function countRegisterOverlap(
  a: import("../types/compatibility.js").CanonicalCombination,
  b: import("../types/compatibility.js").CanonicalCombination,
): number {
  let count = 0;
  for (const axis of ALL_AXES) {
    const refA = a.axis_mappings[axis];
    const refB = b.axis_mappings[axis];
    if (refA === undefined || refB === undefined) continue;

    // Direct primary equality.
    if (refA.grammar_id === refB.grammar_id) {
      count++;
      continue;
    }

    // Alt-overlap: A's primary in B's alternatives, or B's primary
    // in A's alternatives. F3-1's axis_alternatives (when present)
    // contains the primary as its first element, so checking
    // alternatives is sufficient — no need to also check primary.
    const altsA = a.axis_alternatives?.[axis];
    const altsB = b.axis_alternatives?.[axis];
    const aInBAlts =
      altsB !== undefined && altsB.some((r) => r.grammar_id === refA.grammar_id);
    const bInAAlts =
      altsA !== undefined && altsA.some((r) => r.grammar_id === refB.grammar_id);
    if (aInBAlts || bInAAlts) {
      count++;
      continue;
    }

    // Alts-intersect: both canonicals have alternatives for this
    // axis, and their alternative sets overlap.
    if (altsA !== undefined && altsB !== undefined) {
      const setA = new Set(altsA.map((r) => r.grammar_id));
      if (altsB.some((r) => setA.has(r.grammar_id))) {
        count++;
      }
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildWarning(
  severity: RoutingWarning["severity"],
  code: string,
  message: string,
  related?: RoutingWarning["related_grammars"],
): RoutingWarning {
  if (related === undefined) {
    return { severity, code, message };
  }
  return { severity, code, message, related_grammars: related };
}

// Re-export ResolutionStrategy for callers that compose Stage 5.
export type { ResolutionStrategy } from "./types.js";

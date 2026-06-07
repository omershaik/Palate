// src/routing/route.ts
//
// Top-level route() function — composes Stages 1–5 into a single
// RoutingOutput per the Phase 1 envelope shape (src/types/routing.ts
// §5.3 of Turn 8). The Stage 1 implementation is injected so route()
// can be exercised with the stub (validation suite) or the
// deterministic extractor (production routing of novel briefs).
//
// Phase 2 ships routing without card generation. The cards[] field
// of RoutingOutput is an empty array; Phase 3's card generator
// populates it from the resolved axis combination.

import type { Axis } from "../types/axis.js";
import { ALL_AXES } from "../types/axis.js";
import type { Corpus } from "../types/corpus.js";
import type {
  AxisAlternative,
  AxisRoutingDecision,
  RoutedCombination,
  RoutingOutput,
  VoiceRoutingDecision,
} from "../types/routing.js";
import type { ReducedMotionFallback } from "../types/compatibility.js";
import type {
  AxisCandidate,
  RankedCombination,
  SignalExtractor,
} from "./types.js";
import { bucketMatch, computeEliminatedGrammars } from "./stage2-bucket.js";
import {
  rankCombination,
  refineRankingWithCanonicalAlignment,
} from "./stage3-confidence.js";
import { checkCoherence } from "./stage4-coherence.js";
import { resolveConflicts } from "./stage5-resolve.js";
import { generateCard } from "../cards/generate.js";

export interface RouteOptions {
  /**
   * Stage 1 signal extractor. Inject the stub for validation-suite
   * tests; inject createDeterministicStage1(corpus) for production
   * routing on novel briefs; or a future LLM-backed extractor at
   * the consuming AI tool's discretion.
   */
  signalExtractor: SignalExtractor;
  corpus: Corpus;
}

/**
 * Run the five-stage routing pipeline. Returns the Phase 1
 * RoutingOutput envelope with cards[] empty (Phase 3 builds cards).
 */
/**
 * Minimum signal density (sum of signals across all eight extracted
 * buckets) required to attempt confident routing. Below this, the
 * brief is treated as too ambiguous and a conflict warning is
 * surfaced. Counts ALL signals not just signal-routed axes — a
 * brief with vibe "cool" still has signal density 1, which is
 * below threshold; we surface conflict rather than guess.
 */
const MIN_SIGNAL_DENSITY_FOR_CONFIDENT_ROUTING = 2;

import type { RoutingWarning } from "../types/routing.js";

function totalSignalCount(signals: import("./types.js").ExtractedSignals): number {
  return (
    signals.brand_exemplars.length +
    signals.vibes.length +
    signals.vernacular.length +
    signals.anti_vibes.length +
    signals.compositional_intent.length +
    signals.domain.length +
    signals.functional_context.length +
    signals.audience_signals.length
  );
}

export async function route(
  brief: string,
  options: RouteOptions,
): Promise<RoutingOutput> {
  const signals = await options.signalExtractor(brief);
  const signalDensity = totalSignalCount(signals);
  const bucketMatched = bucketMatch(signals, options.corpus);
  const eliminated = computeEliminatedGrammars(signals, options.corpus);

  // Stage 3a: initial per-axis ranking from Stage 2 candidates.
  const rankedInitial = rankCombination(
    bucketMatched,
    eliminated,
    options.corpus,
  );

  // Stage 4 (first pass): coherence check against the initial ranking.
  // Produces canonical_scores (full canonical-overlap distribution)
  // that Stage 3b uses as a stable alignment target. Stage 4's score
  // is computed against full Stage 2 candidate sets per-axis, not
  // just Stage 3a's picks, so the alignment target doesn't shift as
  // Stage 3b refines per-axis picks.
  const verdictInitial = checkCoherence(rankedInitial, options.corpus);

  // Stage 3b (Phase 2.1b Task 4a): cross-axis canonical alignment
  // tie-breaker. When ≥2 candidates tie within tolerance on an axis,
  // prefer the candidate matching the top-scoring canonical's primary
  // or alternatives. Returns rankedInitial unchanged (by reference)
  // when no tie-breaks fire.
  const ranked = refineRankingWithCanonicalAlignment(
    rankedInitial,
    bucketMatched,
    verdictInitial,
    options.corpus,
  );

  // Re-run Stage 4 only if Stage 3b actually refined the combination.
  // Reference equality is the cheap "did anything change" check.
  const verdict =
    ranked === rankedInitial
      ? verdictInitial
      : checkCoherence(ranked, options.corpus);

  const resolution = resolveConflicts(
    ranked,
    verdict,
    options.corpus,
    eliminated,
  );

  // Re-run coherence on the RESOLVED combination so canonical_match
  // reflects the post-resolution state (e.g., snap-to-canonical
  // resolves an exact match where the pre-resolution combination
  // wasn't one).
  const finalVerdict = checkCoherence(
    resolution.resolved_combination,
    options.corpus,
  );

  const combination = toRoutedCombination(
    resolution.resolved_combination,
    options.corpus,
  );

  const motionGrammarId =
    resolution.resolved_combination.motion.top.grammar_id;
  const reduced_motion_fallback =
    options.corpus.reduced_motion_fallbacks[motionGrammarId] ??
    fallbackReducedMotion(motionGrammarId);

  const alternatives = collectAlternatives(resolution.resolved_combination);

  // Resolve canonical match: prefer exact-match id; fall back to
  // best register-coherence id when above threshold. Return the
  // canonical's NAME (e.g., "Luxury Hospitality") rather than its
  // internal id (e.g., "CANONICAL-1"); consumers care about the
  // human-readable name.
  const canonicalId =
    finalVerdict.canonical_match_id ??
    finalVerdict.register_coherence_canonical_id;
  const canonicalName =
    canonicalId !== null
      ? options.corpus.canonical_combinations.find((c) => c.id === canonicalId)
          ?.name ?? null
      : null;

  // Confidence: 1.0 on exact match, register-coherence score
  // otherwise. A consumer seeing "match: Luxury Hospitality, conf:
  // 0.89" understands the engine is confident this is a luxury-
  // hospitality combination even though one axis differs from the
  // canonical's spec.
  const canonicalConfidence = finalVerdict.canonical_match_id !== null
    ? 1.0
    : finalVerdict.register_coherence_canonical_id !== null
      ? finalVerdict.register_coherence_score
      : 0;

  // Signal-density gate: if the brief produced too few signals
  // overall, surface a brief_too_ambiguous conflict warning and
  // suppress the canonical match. The combination still goes back
  // to the consumer (they may want to see what the engine guessed)
  // but with no claim to a specific canonical and a clear flag that
  // the brief was too thin.
  const tooAmbiguousWarnings: RoutingWarning[] =
    signalDensity < MIN_SIGNAL_DENSITY_FOR_CONFIDENT_ROUTING
      ? [
          {
            severity: "conflict",
            code: "brief_too_ambiguous",
            message:
              `Brief produced ${signalDensity} signal(s) total — below the ` +
              `${MIN_SIGNAL_DENSITY_FOR_CONFIDENT_ROUTING}-signal threshold for ` +
              `confident routing. Add brand exemplars, vibe phrases, or ` +
              `functional context to disambiguate.`,
          },
        ]
      : [];

  // Phase 2.1b Task 6a: routing_ambiguous warning. Top-1 and top-2
  // canonicals tied on both overlap AND signal-routed (directMatch)
  // alignment. The engine has no signal-axis basis to prefer one
  // canonical over its sibling — info-severity (the combination is
  // still served) so consumers can decide whether to ask the user a
  // clarifying question. Suppressed when the signal-density gate
  // already surfaced a stronger warning (don't double-warn).
  const routingAmbiguousWarnings: RoutingWarning[] =
    finalVerdict.routing_ambiguous && tooAmbiguousWarnings.length === 0
      ? [
          {
            severity: "info",
            code: "routing_ambiguous",
            message:
              `Routing tied between adjacent canonicals on overlap and ` +
              `signal-routed match count. Engine served the iteration-order ` +
              `top canonical (${canonicalName ?? "unknown"}); consider asking ` +
              `the user to disambiguate against the runner-up.`,
          },
        ]
      : [];

  // Compose the routing output envelope without cards yet, then
  // generate the card from it. The card-generator depends on the
  // envelope's combination/canonical_match/reduced_motion_fallback
  // so we pass the partial envelope it needs. cards: [card] populates
  // the array Phase 1 left empty.
  const envelopeWithoutCards: Omit<RoutingOutput, "cards"> = {
    combination,
    canonical_match:
      tooAmbiguousWarnings.length > 0 ? null : canonicalName,
    canonical_match_confidence:
      tooAmbiguousWarnings.length > 0 ? 0 : canonicalConfidence,
    reduced_motion_fallback,
    alternatives,
    open_warnings: [
      ...resolution.warnings,
      ...tooAmbiguousWarnings,
      ...routingAmbiguousWarnings,
    ],
  };

  // Phase 3 Task 1: card generator wired in. The card surfaces axis
  // selections + canonical_combination + metadata + reduced-motion
  // fallback. Tasks 2-5 fill tokens / components / voice_guidelines
  // / anti_patterns / accessibility.
  const card = generateCard(
    { ...envelopeWithoutCards, cards: [] },
    options.corpus,
  );

  return {
    ...envelopeWithoutCards,
    cards: [card],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toRoutedCombination(
  ranked: RankedCombination,
  corpus: Corpus,
): RoutedCombination {
  return {
    layout: toAxisRoutingDecision(ranked.layout.top),
    typography: toAxisRoutingDecision(ranked.typography.top),
    color: toAxisRoutingDecision(ranked.color.top),
    component: toAxisRoutingDecision(ranked.component.top),
    motion: toAxisRoutingDecision(ranked.motion.top),
    imagery: toAxisRoutingDecision(ranked.imagery.top),
    density: toAxisRoutingDecision(ranked.density.top),
    voice: toVoiceRoutingDecision(ranked.voice.top, corpus),
    reading_pattern: toAxisRoutingDecision(ranked.reading_pattern.top),
  };
}

function toAxisRoutingDecision(c: AxisCandidate): AxisRoutingDecision {
  return {
    grammar_id: c.grammar_id,
    confidence: c.confidence,
  };
}

function toVoiceRoutingDecision(
  c: AxisCandidate,
  corpus: Corpus,
): VoiceRoutingDecision {
  // Voice profiles in the corpus carry dimensional_coordinates. Look
  // up the resolved profile by id and embed its coordinates.
  const profile = corpus.voice.profiles.find((p) => p.id === c.grammar_id);
  if (profile === undefined) {
    return {
      profile_id: c.grammar_id,
      dimensions: {
        humor: 5,
        formality: 5,
        respectfulness: 5,
        enthusiasm: 5,
        rhythm: 5,
        vocabulary: 5,
      },
      confidence: c.confidence,
    };
  }
  return {
    profile_id: profile.id,
    dimensions: profile.dimensional_coordinates,
    confidence: c.confidence,
  };
}

function collectAlternatives(ranked: RankedCombination): AxisAlternative[] {
  const out: AxisAlternative[] = [];
  for (const axis of ALL_AXES) {
    const r = ranked[axis as keyof RankedCombination];
    if (r === undefined) continue;
    for (const alt of r.alternatives) {
      out.push({
        axis: axis as Axis,
        candidate: { axis: axis as Axis, grammar_id: alt.grammar_id },
        confidence: alt.confidence,
      });
    }
  }
  return out;
}

/**
 * Build a generic reduced-motion fallback when the resolved motion
 * grammar isn't in the corpus's reduced_motion_fallbacks map. Should
 * be unreachable in practice — every loaded motion grammar is keyed
 * — but defensive.
 */
function fallbackReducedMotion(motionGrammarId: string): ReducedMotionFallback {
  return {
    motion_grammar_id: motionGrammarId,
    description:
      "Disable decorative motion; preserve functional state changes (focus, hover feedback).",
    severity: "partial",
  };
}

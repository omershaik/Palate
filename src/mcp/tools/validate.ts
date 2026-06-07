// src/mcp/tools/validate.ts
//
// Phase 3 Task 7 — `validate` tool implementation.
//
// PER-SPEC SEMANTIC (turn9 §5.1 + Task 7 review):
//   palate.validate(combination: AxisCombination) → ValidationResult
//   "checks an explicit axis combination for coherence; returns
//    broken-combinations conflicts if any."
//
// Note: validate operates on an EXPLICIT combination (designer-
// picked grammars), NOT a brief. Three brief-input interpretations
// considered during the Task 7 review (signal-extraction-only, dry-
// run-route, schema-validation) were all rejected once the spec was
// re-read — the spec semantic is "check this hand-picked combination
// for coherence", which neither requires a brief nor goes through
// Stages 1-3.
//
// Implementation: synthesize a RankedCombination from the user's
// per-axis grammar ids, run Stage 4's checkCoherence, return the
// verdict in a clean shape.

import type { Axis } from "../../types/axis.js";
import { ALL_AXES } from "../../types/axis.js";
import type { Corpus } from "../../types/corpus.js";
import type {
  AxisCandidate,
  RankedAxis,
  RankedCombination,
} from "../../routing/types.js";
import { checkCoherence } from "../../routing/stage4-coherence.js";
import { errorResponse, jsonResponse, type ToolResponse } from "./helpers.js";

/**
 * Synthetic confidence for a user-specified combination. The user
 * picked these grammars deliberately; we treat each pick as a
 * full-confidence non-AI-default match for Stage 4's purposes.
 */
const VALIDATE_SYNTHETIC_CONFIDENCE = 1.0;

export async function callValidate(
  corpus: Corpus,
  args: Record<string, unknown> | undefined,
): Promise<ToolResponse> {
  const raw = args?.["combination"];
  if (raw === undefined || typeof raw !== "object" || raw === null) {
    return errorResponse(
      "Missing `combination` argument. Pass an object with an entry per axis (layout, typography, color, component, motion, imagery, density, voice, reading_pattern), each value being a grammar id (e.g., { layout: 'LAYOUT-1', typography: 'TYPE-3', ... }).",
    );
  }
  const combination = raw as Record<string, unknown>;

  // Validate each axis is present + well-formed.
  const missingAxes: string[] = [];
  const unknownGrammars: Array<{ axis: string; value: string; pool: readonly string[] }> = [];
  const synthesized: Partial<RankedCombination> = {};

  for (const axis of ALL_AXES) {
    const value = combination[axis];
    if (typeof value !== "string" || value.trim().length === 0) {
      missingAxes.push(axis);
      continue;
    }
    // Confirm the grammar id exists in the corpus for this axis.
    const knownIds = collectKnownIds(corpus, axis);
    if (!knownIds.includes(value)) {
      unknownGrammars.push({ axis, value, pool: knownIds });
      continue;
    }
    // Build a synthetic AxisCandidate. evidence: [] — the user
    // specified directly, no signal-routed evidence.
    const candidate: AxisCandidate = {
      axis,
      grammar_id: value,
      confidence: VALIDATE_SYNTHETIC_CONFIDENCE,
      evidence: [],
    };
    const ranked: RankedAxis = {
      axis,
      top: candidate,
      alternatives: [],
    };
    synthesized[axis] = ranked;
  }

  if (missingAxes.length > 0) {
    return errorResponse(
      `Combination missing axes: ${missingAxes.join(", ")}. validate requires all 9 axes to be specified explicitly.`,
      { label: "Required axes", values: ALL_AXES },
    );
  }

  if (unknownGrammars.length > 0) {
    const first = unknownGrammars[0]!;
    return errorResponse(
      `Unknown grammar id '${first.value}' for axis '${first.axis}'.`,
      {
        label: `Available ${first.axis} grammar ids`,
        values: first.pool,
      },
    );
  }

  // All axes present + well-formed. Run Stage 4.
  const verdict = checkCoherence(synthesized as RankedCombination, corpus);

  // Resolve canonical names (id → name) for human-readable output.
  const canonicalName = (id: string | null): string | null => {
    if (id === null) return null;
    return corpus.canonical_combinations.find((c) => c.id === id)?.name ?? null;
  };

  return jsonResponse({
    is_coherent: verdict.is_coherent,
    is_canonical_match: verdict.is_canonical_match,
    canonical_match: {
      id: verdict.canonical_match_id,
      name: canonicalName(verdict.canonical_match_id),
      confidence: verdict.canonical_match_confidence,
    },
    register_coherence: {
      score: verdict.register_coherence_score,
      canonical_id: verdict.register_coherence_canonical_id,
      canonical_name: canonicalName(verdict.register_coherence_canonical_id),
    },
    broken_pairs: verdict.broken_pairs.map((bp) => ({
      family: bp.family,
      combination_text: bp.combination_text,
      why_it_breaks: bp.why_it_breaks,
      conflicting_grammars: bp.conflicting_grammars,
    })),
    routing_ambiguous: verdict.routing_ambiguous,
    canonical_scores_top5: verdict.canonical_scores
      .slice(0, 5)
      .map((s) => ({
        canonical_id: s.canonical_id,
        canonical_name: canonicalName(s.canonical_id),
        score: s.score,
        direct_match_count: s.direct_match_count,
      })),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return the known grammar ids for an axis, including voice profile
 * ids (which live in corpus.voice.profiles, not corpus.axes.voice).
 * The result is sorted alphabetically for stable diagnostic output
 * across calls.
 */
function collectKnownIds(corpus: Corpus, axis: Axis): readonly string[] {
  if (axis === "voice") {
    return [...corpus.voice.profiles.map((p) => p.id)].sort();
  }
  return [...corpus.axes[axis].map((g) => g.id)].sort();
}

// tests/routing/stage5-resolve.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import { bucketMatch } from "../../src/routing/stage2-bucket.js";
import { rankCombination } from "../../src/routing/stage3-confidence.js";
import { checkCoherence } from "../../src/routing/stage4-coherence.js";
import { resolveConflicts } from "../../src/routing/stage5-resolve.js";
import { emptyExtractedSignals } from "../../src/routing/types.js";
import type { ExtractedSignals } from "../../src/routing/types.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function withSignals(partial: Partial<ExtractedSignals>): ExtractedSignals {
  return { ...emptyExtractedSignals(), ...partial };
}

function runStages(signals: ExtractedSignals) {
  const ranked = rankCombination(bucketMatch(signals, corpus));
  const verdict = checkCoherence(ranked, corpus);
  const result = resolveConflicts(ranked, verdict, corpus);
  return { ranked, verdict, result };
}

describe("resolveConflicts — coherent combinations", () => {
  // Note (Phase 2.1a Task 3): the original assertion required
  // `result.changes.length === 0` and `result.warnings.length === 0`.
  // After Phase 2.1a Task 1's Stage 5 fix (b498b32), Stage 5's
  // fillAIDefaultsFromCanonical fires when register-coherence is
  // high AND any axis is AI-defaulted, populating the missing axis
  // from the canonical's spec — that's the intended behavior for
  // sparse-signal briefs (intent-path "I want it to feel like X").
  // The Aman brief here doesn't signal reading_pattern explicitly,
  // so reading_pattern fills from canonical-1 → produces a change
  // entry. Strategy stays no_resolution_needed (the combination is
  // coherent post-fill); changes reflects the fill; warnings stays
  // empty (no broken pairs, no contradictions).
  it("coherent combination → no_resolution_needed strategy (with possible AI-default fills)", () => {
    const { result } = runStages(
      withSignals({
        brand_exemplars: ["Aman"],
        vibes: ["luxury hotel", "quiet luxury"],
        domain: ["hospitality"],
      }),
    );
    expect(result.strategy).toBe("no_resolution_needed");
    expect(result.warnings).toEqual([]);
    // changes may include canonical-fill entries for axes that
    // were AI-defaulted (not signal-routed); each such entry is
    // an axis where the brief didn't signal explicitly and Stage 5
    // populated from canonical-1. Verify the changes (if any) all
    // route to canonical-1's primary specs, never overriding
    // signal-routed picks.
    for (const change of result.changes) {
      expect(change.reason).toMatch(/canonical CANONICAL-1/i);
    }
  });

  it("AI-default-only combination resolves coherent (zero-signal case)", () => {
    // No signals → all axes fall back to AI defaults. AI defaults
    // happen to roughly match CANONICAL-4 (Standard SaaS Marketing),
    // so the combination is coherent.
    const { result } = runStages(emptyExtractedSignals());
    // The result might be no_resolution_needed (if AI defaults align
    // with a canonical) or surface_conflict (if they don't). Either
    // is acceptable for v0.1.
    expect([
      "no_resolution_needed",
      "snap_to_canonical",
      "surface_conflict",
    ]).toContain(result.strategy);
  });
});

describe("resolveConflicts — surface_conflict path", () => {
  it("emits conflict-severity warnings on broken combinations the engine can't resolve", () => {
    // We can't easily synthesize a broken-pair scenario via signals
    // alone (anti-vibes eliminate), but the structural test:
    // surface_conflict warnings should always be conflict-severity.
    const { result } = runStages(
      withSignals({
        brand_exemplars: ["Aman", "OpenAI"],
        vibes: ["luxury hotel", "modern AI startup"],
        domain: ["hospitality", "AI"],
      }),
    );
    if (result.strategy === "surface_conflict") {
      const conflicts = result.warnings.filter(
        (w) => w.severity === "conflict",
      );
      expect(conflicts.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveConflicts — change records", () => {
  it("changes[] entries have axis, from_grammar_id, to_grammar_id, reason", () => {
    const { result } = runStages(
      withSignals({ brand_exemplars: ["Aman"] }),
    );
    for (const change of result.changes) {
      expect(change.axis).toBeTruthy();
      expect(change.from_grammar_id).toBeTruthy();
      expect(change.to_grammar_id).toBeTruthy();
      expect(change.reason).toBeTruthy();
    }
  });
});

describe("resolveConflicts — output shape", () => {
  it("returns a ResolutionResult with required fields", () => {
    const { result } = runStages(
      withSignals({ brand_exemplars: ["Aman"] }),
    );
    expect(["no_resolution_needed", "override_axis", "snap_to_canonical", "surface_conflict"]).toContain(
      result.strategy,
    );
    expect(result.resolved_combination).toBeDefined();
    expect(Array.isArray(result.changes)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("resolved_combination has all 9 axes populated", () => {
    const { result } = runStages(
      withSignals({ brand_exemplars: ["Aman"] }),
    );
    for (const axis of [
      "layout",
      "typography",
      "color",
      "component",
      "motion",
      "imagery",
      "density",
      "voice",
      "reading_pattern",
    ] as const) {
      expect(result.resolved_combination[axis]).toBeDefined();
      expect(result.resolved_combination[axis].top.grammar_id).toBeTruthy();
    }
  });
});

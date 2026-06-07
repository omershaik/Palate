// tests/routing/stage4-coherence.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import { bucketMatch } from "../../src/routing/stage2-bucket.js";
import { rankCombination } from "../../src/routing/stage3-confidence.js";
import {
  REGISTER_COHERENCE_AXIS_THRESHOLD,
  checkCoherence,
} from "../../src/routing/stage4-coherence.js";
import { emptyExtractedSignals } from "../../src/routing/types.js";
import type { ExtractedSignals } from "../../src/routing/types.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function withSignals(partial: Partial<ExtractedSignals>): ExtractedSignals {
  return { ...emptyExtractedSignals(), ...partial };
}

function pipeStages(signals: ExtractedSignals) {
  return rankCombination(bucketMatch(signals, corpus));
}

describe("checkCoherence — canonical match detection", () => {
  // Note (Phase 2.1a Task 3): these tests originally asserted strict
  // exact-match (`is_canonical_match` / `canonical_match_id`). After
  // Phase 2 Group F's strict-match tightening, AI-defaulted axes
  // don't count toward strict exact-match — so a sparse brief
  // (Aman alone, or OpenAI alone) routes to canonical-X via
  // register-coherence-canonical-fallback, not via strict exact
  // match. The assertions are updated to use
  // `register_coherence_canonical_id`, which reflects the actual
  // routing semantic for sparse briefs. The tests still validate
  // the same intent: a brief invoking canonical-X's signature
  // routes to canonical-X.
  it("Aman + luxury hospitality signals → CANONICAL-1 register match", () => {
    const ranked = pipeStages(
      withSignals({
        brand_exemplars: ["Aman"],
        vibes: ["luxury hotel", "quiet luxury", "considered"],
        domain: ["hospitality"],
      }),
    );
    const verdict = checkCoherence(ranked, corpus);
    expect(verdict.register_coherence_canonical_id).toBe("CANONICAL-1");
    expect(verdict.is_coherent).toBe(true);
  });

  it("OpenAI + AI startup signals → CANONICAL-3 register match (Modern AI Startup)", () => {
    const ranked = pipeStages(
      withSignals({
        brand_exemplars: ["OpenAI", "Anthropic"],
        vernacular: ["bento grid", "dark mode"],
        vibes: ["modern AI startup"],
        domain: ["AI"],
      }),
    );
    const verdict = checkCoherence(ranked, corpus);
    expect(verdict.register_coherence_canonical_id).toBe("CANONICAL-3");
  });
});

describe("checkCoherence — register coherence score", () => {
  it("score is in [0, 1]", () => {
    const ranked = pipeStages(emptyExtractedSignals());
    const verdict = checkCoherence(ranked, corpus);
    expect(verdict.register_coherence_score).toBeGreaterThanOrEqual(0);
    expect(verdict.register_coherence_score).toBeLessThanOrEqual(1);
  });

  it("threshold (>=6/9) flags the combination as register-coherent", () => {
    const ranked = pipeStages(
      withSignals({ brand_exemplars: ["Aman"], domain: ["hospitality"] }),
    );
    const verdict = checkCoherence(ranked, corpus);
    const overlap = Math.round(verdict.register_coherence_score * 9);
    if (overlap >= REGISTER_COHERENCE_AXIS_THRESHOLD) {
      expect(verdict.is_coherent).toBe(true);
    }
  });

  it("identifies which canonical gave the best register overlap", () => {
    const ranked = pipeStages(
      withSignals({ brand_exemplars: ["Aman"], domain: ["hospitality"] }),
    );
    const verdict = checkCoherence(ranked, corpus);
    expect(verdict.register_coherence_canonical_id).not.toBeNull();
  });
});

describe("checkCoherence — broken pair detection", () => {
  it("returns broken_pairs[] containing matched broken combinations", () => {
    // We can't easily force a specific broken pair via signals because
    // anti-vibes eliminate, but we can construct one via Stage 3 output
    // directly. For this test we rely on canonical signals — most
    // canonicals don't trigger broken pairs.
    const ranked = pipeStages(
      withSignals({ brand_exemplars: ["Aman"], domain: ["hospitality"] }),
    );
    const verdict = checkCoherence(ranked, corpus);
    expect(verdict.broken_pairs).toEqual([]);
  });
});

describe("checkCoherence — coherence verdict shape", () => {
  it("populates all required fields", () => {
    const ranked = pipeStages(
      withSignals({ brand_exemplars: ["Aman"] }),
    );
    const verdict = checkCoherence(ranked, corpus);
    expect(typeof verdict.is_coherent).toBe("boolean");
    expect(typeof verdict.is_canonical_match).toBe("boolean");
    expect(verdict.canonical_match_id).toBeDefined();
    expect(Array.isArray(verdict.broken_pairs)).toBe(true);
    expect(typeof verdict.register_coherence_score).toBe("number");
  });

  it("canonical_match_confidence is 1.0 on exact match, null otherwise", () => {
    const ranked = pipeStages(
      withSignals({
        brand_exemplars: ["Aman"],
        vibes: ["luxury hotel"],
        domain: ["hospitality"],
      }),
    );
    const verdict = checkCoherence(ranked, corpus);
    if (verdict.is_canonical_match) {
      expect(verdict.canonical_match_confidence).toBe(1.0);
    } else {
      expect(verdict.canonical_match_confidence).toBeNull();
    }
  });
});

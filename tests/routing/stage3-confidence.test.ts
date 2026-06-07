// tests/routing/stage3-confidence.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import { bucketMatch } from "../../src/routing/stage2-bucket.js";
import {
  AI_DEFAULT_GRAMMAR_PER_AXIS,
  isAIDefault,
  rankCombination,
} from "../../src/routing/stage3-confidence.js";
import { emptyExtractedSignals } from "../../src/routing/types.js";
import type { ExtractedSignals } from "../../src/routing/types.js";
import { ALL_AXES } from "../../src/types/axis.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function withSignals(partial: Partial<ExtractedSignals>): ExtractedSignals {
  return { ...emptyExtractedSignals(), ...partial };
}

describe("rankCombination — top + alternatives", () => {
  it("picks top candidate per axis from Stage 2 output", () => {
    const stage2 = bucketMatch(
      withSignals({ brand_exemplars: ["Aman"] }),
      corpus,
    );
    const ranked = rankCombination(stage2);
    expect(ranked.layout.top.grammar_id).toBe("LAYOUT-1");
    expect(ranked.voice.top.grammar_id).toBe("VOICE-1");
  });

  it("alternatives is at most 2 entries per axis", () => {
    const stage2 = bucketMatch(
      withSignals({
        brand_exemplars: ["Stripe", "Linear"],
        vibes: ["modern", "clean"],
      }),
      corpus,
    );
    const ranked = rankCombination(stage2);
    for (const axis of ALL_AXES) {
      expect(ranked[axis].alternatives.length).toBeLessThanOrEqual(2);
    }
  });

  it("alternatives don't include the top pick", () => {
    const stage2 = bucketMatch(
      withSignals({ vibes: ["modern", "luxury", "casual"] }),
      corpus,
    );
    const ranked = rankCombination(stage2);
    for (const axis of ALL_AXES) {
      const r = ranked[axis];
      for (const alt of r.alternatives) {
        expect(alt.grammar_id).not.toBe(r.top.grammar_id);
      }
    }
  });
});

describe("rankCombination — AI-default fallback", () => {
  it("falls back to AI-default grammar when no Stage 2 candidates exist on an axis", () => {
    // Empty signals → all axes should fall back.
    const stage2 = bucketMatch(emptyExtractedSignals(), corpus);
    const ranked = rankCombination(stage2);
    for (const axis of ALL_AXES) {
      expect(ranked[axis].top.grammar_id).toBe(
        AI_DEFAULT_GRAMMAR_PER_AXIS[axis],
      );
      expect(isAIDefault(ranked[axis].top)).toBe(true);
    }
  });

  it("AI-default fallback has very low confidence (< 0.2)", () => {
    const stage2 = bucketMatch(emptyExtractedSignals(), corpus);
    const ranked = rankCombination(stage2);
    for (const axis of ALL_AXES) {
      expect(ranked[axis].top.confidence).toBeLessThan(0.2);
    }
  });

  it("AI-default fallback has empty evidence array", () => {
    const stage2 = bucketMatch(emptyExtractedSignals(), corpus);
    const ranked = rankCombination(stage2);
    for (const axis of ALL_AXES) {
      expect(ranked[axis].top.evidence).toEqual([]);
    }
  });
});

describe("AI_DEFAULT_GRAMMAR_PER_AXIS", () => {
  it("specifies a grammar id for every axis", () => {
    for (const axis of ALL_AXES) {
      expect(AI_DEFAULT_GRAMMAR_PER_AXIS[axis]).toBeTruthy();
    }
  });

  it("every default grammar id resolves to a real loaded grammar", () => {
    for (const axis of ALL_AXES) {
      const id = AI_DEFAULT_GRAMMAR_PER_AXIS[axis];
      let found = false;
      if (axis === "voice") {
        found = corpus.voice.profiles.some((p) => p.id === id);
      } else {
        const grammars = corpus.axes[axis as Exclude<typeof axis, "voice">];
        found = grammars.some((g) => g.id === id);
      }
      expect(found, `AI default ${id} for axis ${axis} not in corpus`).toBe(true);
    }
  });
});

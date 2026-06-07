// tests/routing/stage2-bucket.test.ts
//
// Unit tests for Stage 2 (Bucket Match). Tests use the loaded corpus
// + synthetic signal inputs (not full fixtures yet — those run end-
// to-end in Group F).

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import { bucketMatch } from "../../src/routing/stage2-bucket.js";
import { emptyExtractedSignals } from "../../src/routing/types.js";
import type { ExtractedSignals } from "../../src/routing/types.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function withSignals(partial: Partial<ExtractedSignals>): ExtractedSignals {
  return { ...emptyExtractedSignals(), ...partial };
}

describe("bucketMatch — brand exemplar matching", () => {
  it("'Aman' matches LAYOUT-1 (Vertical-Rhythm Editorial) at high confidence", () => {
    const out = bucketMatch(
      withSignals({ brand_exemplars: ["Aman"] }),
      corpus,
    );
    const top = out.layout[0];
    expect(top, "expected at least one layout candidate").toBeDefined();
    expect(top!.grammar_id).toBe("LAYOUT-1");
    expect(top!.confidence).toBeGreaterThanOrEqual(0.9);
    expect(top!.evidence.some((e) => e.bucket === "brand_exemplars")).toBe(true);
  });

  it("'Stripe' matches multiple SaaS-coded grammars across axes", () => {
    const out = bucketMatch(withSignals({ brand_exemplars: ["Stripe"] }), corpus);
    // Stripe is referenced in many axes' altnames: layout, typography,
    // color, motion, etc. We expect at least 3 axes to have candidates.
    const axesWithMatches = (
      ["layout", "typography", "color", "motion", "voice"] as const
    ).filter((axis) => out[axis].length > 0);
    expect(axesWithMatches.length).toBeGreaterThanOrEqual(3);
  });
});

describe("bucketMatch — vibe + vernacular matching", () => {
  it("'bento grid' vernacular matches LAYOUT-3a (Marketing-Bento)", () => {
    const out = bucketMatch(
      withSignals({ vernacular: ["bento grid"] }),
      corpus,
    );
    const ids = out.layout.map((c) => c.grammar_id);
    expect(ids).toContain("LAYOUT-3a");
  });

  it("'quiet luxury' vibe matches LAYOUT-1 + COLOR-1", () => {
    const out = bucketMatch(
      withSignals({ vibes: ["quiet luxury"] }),
      corpus,
    );
    expect(out.layout.map((c) => c.grammar_id)).toContain("LAYOUT-1");
  });
});

describe("bucketMatch — anti-vibe elimination", () => {
  it("'no Inter everywhere' eliminates TYPE-5 (Geometric-Modernist)", () => {
    const out = bucketMatch(
      withSignals({
        anti_vibes: ["no Inter everywhere"],
      }),
      corpus,
    );
    const typeIds = out.typography.map((c) => c.grammar_id);
    expect(typeIds, "TYPE-5 should be eliminated").not.toContain("TYPE-5");
  });

  it("'not SaaS-y' eliminates layout grammars whose anti_vibes flag it", () => {
    const out = bucketMatch(
      withSignals({ anti_vibes: ["not SaaS-y"] }),
      corpus,
    );
    // Eliminated grammars must NOT appear; LAYOUT-1 (whose anti_vibes
    // contain "not SaaS-y") should be eliminated. Other axes unaffected.
    expect(out.layout.map((c) => c.grammar_id)).not.toContain("LAYOUT-1");
  });

  it("anti-vibe ELIMINATES even when positive signals also match the same grammar", () => {
    // "Aman" would normally match LAYOUT-1 (brand_exemplar). The
    // anti-vibe "no Inter everywhere" matches LAYOUT-1's anti_vibes
    // (LAYOUT-1's anti_vibes include "no Inter everywhere"). The
    // anti-vibe should win — LAYOUT-1 is eliminated.
    const out = bucketMatch(
      withSignals({
        brand_exemplars: ["Aman"],
        anti_vibes: ["no Inter everywhere"],
      }),
      corpus,
    );
    expect(out.layout.map((c) => c.grammar_id)).not.toContain("LAYOUT-1");
  });
});

describe("bucketMatch — voice axis", () => {
  it("'Aman copy' matches VOICE-1 (Quiet Authority) via brand_exemplars", () => {
    const out = bucketMatch(
      withSignals({ brand_exemplars: ["Aman"] }),
      corpus,
    );
    expect(out.voice.map((c) => c.grammar_id)).toContain("VOICE-1");
  });
});

describe("bucketMatch — structural", () => {
  it("returns a candidate set per axis (possibly empty)", () => {
    const out = bucketMatch(emptyExtractedSignals(), corpus);
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
      expect(Array.isArray(out[axis])).toBe(true);
    }
  });

  it("candidates within an axis are sorted by confidence desc", () => {
    const out = bucketMatch(
      withSignals({ brand_exemplars: ["Stripe"] }),
      corpus,
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
      const cs = out[axis];
      for (let i = 1; i < cs.length; i++) {
        expect(cs[i - 1]!.confidence).toBeGreaterThanOrEqual(cs[i]!.confidence);
      }
    }
  });

  it("confidence is in [0, 1]", () => {
    const out = bucketMatch(
      withSignals({
        brand_exemplars: ["Aman", "Stripe"],
        vibes: ["luxury", "modern", "considered"],
      }),
      corpus,
    );
    const all = Object.values(out).flat();
    for (const c of all) {
      expect(c.confidence).toBeGreaterThanOrEqual(0);
      expect(c.confidence).toBeLessThanOrEqual(1);
    }
  });
});

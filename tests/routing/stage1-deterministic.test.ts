// tests/routing/stage1-deterministic.test.ts
//
// Tests for the deterministic Stage 1 extractor. The extractor is
// the production-side default — it walks corpus altnames + a small
// dictionary for domain/functional/audience and returns
// ExtractedSignals without any LLM call.
//
// These are smoke tests, not full fixture coverage. The validation
// suite (Group F) uses the stub Stage 1 with fixtures' stub_signals
// directly so test outcomes don't depend on this extractor's recall.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import {
  createDeterministicStage1,
  deterministicExtract,
} from "../../src/routing/stage1/deterministic.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

describe("deterministicExtract — brand exemplars", () => {
  it("'like Aman' in brief surfaces the 'like Aman' altname", () => {
    const signals = deterministicExtract(
      "Build a hotel site like Aman.",
      corpus,
    );
    const lowered = signals.brand_exemplars.map((s) => s.toLowerCase());
    expect(lowered.some((s) => s.includes("aman"))).toBe(true);
  });

  it("bare 'Aman' in brief surfaces brand even when altname has 'like ' prefix", () => {
    const signals = deterministicExtract(
      "Aman-style luxury resort in Bali.",
      corpus,
    );
    const lowered = signals.brand_exemplars.map((s) => s.toLowerCase());
    expect(lowered.some((s) => s.includes("aman"))).toBe(true);
  });

  it("'Stripe' in brief surfaces stripe-related brand altnames", () => {
    const signals = deterministicExtract(
      "Build a SaaS landing page like Stripe.",
      corpus,
    );
    const lowered = signals.brand_exemplars.map((s) => s.toLowerCase());
    expect(lowered.some((s) => s.includes("stripe"))).toBe(true);
  });
});

describe("deterministicExtract — vibes + vernacular + anti-vibes", () => {
  it("'bento grid' surfaces as a vernacular signal", () => {
    const signals = deterministicExtract(
      "Modern AI startup site with a bento grid.",
      corpus,
    );
    expect(
      signals.vernacular.some((s) => s.toLowerCase().includes("bento")),
    ).toBe(true);
  });

  it("'no Inter everywhere' surfaces as an anti-vibe signal", () => {
    const signals = deterministicExtract(
      "Build a B2B page but no Inter everywhere.",
      corpus,
    );
    expect(
      signals.anti_vibes.some((s) =>
        s.toLowerCase().includes("no inter everywhere"),
      ),
    ).toBe(true);
  });

  it("'quiet luxury' surfaces as a vibe", () => {
    const signals = deterministicExtract(
      "Quiet luxury hotel landing page.",
      corpus,
    );
    expect(
      signals.vibes.some((s) => s.toLowerCase().includes("quiet luxury")),
    ).toBe(true);
  });
});

describe("deterministicExtract — dictionary-based categories", () => {
  it("'hospitality' surfaces as a domain signal", () => {
    const signals = deterministicExtract(
      "Build a hospitality brand site.",
      corpus,
    );
    expect(signals.domain).toContain("hospitality");
  });

  it("'landing page' surfaces as a functional_context signal", () => {
    const signals = deterministicExtract(
      "Make a landing page for our launch.",
      corpus,
    );
    expect(signals.functional_context).toContain("landing page");
  });

  it("'engineers' surfaces as an audience_signal", () => {
    const signals = deterministicExtract(
      "Marketing site for engineers.",
      corpus,
    );
    expect(signals.audience_signals).toContain("engineers");
  });
});

describe("deterministicExtract — output shape", () => {
  it("returns all eight buckets even on an empty-ish brief", () => {
    const signals = deterministicExtract("hello", corpus);
    expect(Array.isArray(signals.brand_exemplars)).toBe(true);
    expect(Array.isArray(signals.vibes)).toBe(true);
    expect(Array.isArray(signals.vernacular)).toBe(true);
    expect(Array.isArray(signals.anti_vibes)).toBe(true);
    expect(Array.isArray(signals.compositional_intent)).toBe(true);
    expect(Array.isArray(signals.domain)).toBe(true);
    expect(Array.isArray(signals.functional_context)).toBe(true);
    expect(Array.isArray(signals.audience_signals)).toBe(true);
  });

  it("dedupes within each bucket", () => {
    const signals = deterministicExtract(
      "Aman Aman Aman luxury hotel luxury hotel",
      corpus,
    );
    const brandSet = new Set(signals.brand_exemplars);
    expect(brandSet.size).toBe(signals.brand_exemplars.length);
    const vibeSet = new Set(signals.vibes);
    expect(vibeSet.size).toBe(signals.vibes.length);
  });

  it("is deterministic across calls", () => {
    const a = deterministicExtract("Aman luxury hotel landing page.", corpus);
    const b = deterministicExtract("Aman luxury hotel landing page.", corpus);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("createDeterministicStage1 — SignalExtractor closure", () => {
  it("conforms to the SignalExtractor type (returns Promise<ExtractedSignals>)", async () => {
    const extract = createDeterministicStage1(corpus);
    const signals = await extract("Aman luxury hotel.");
    expect(signals.brand_exemplars.length).toBeGreaterThan(0);
  });
});

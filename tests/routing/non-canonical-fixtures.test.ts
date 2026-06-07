// tests/routing/non-canonical-fixtures.test.ts
//
// Cross-validates the four non-canonical fixture categories (broken,
// novel-but-coherent, anti-vibe, failure-mode) against the loaded
// corpus where applicable, plus enforces per-category schema
// invariants that the generic loader.ts validator doesn't already
// catch.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import { loadFixturesByCategory } from "./loader.js";
import type { Axis } from "../../src/types/axis.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function buildAxisIdSets(): Map<Axis, Set<string>> {
  const out = new Map<Axis, Set<string>>();
  for (const [axis, grammars] of Object.entries(corpus.axes)) {
    out.set(axis as Axis, new Set(grammars.map((g) => g.id)));
  }
  out.set("voice", new Set(corpus.voice.profiles.map((p) => p.id)));
  return out;
}
const idsByAxis = buildAxisIdSets();

// ---------------------------------------------------------------------------
// Broken combinations
// ---------------------------------------------------------------------------

describe("broken combination fixtures", () => {
  const fixtures = loadFixturesByCategory("broken");

  it("at least 22 fixtures (one per Turn 8 §2 broken combination)", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(22);
  });

  it("every fixture expects a broken_combination_detected warning", () => {
    for (const f of fixtures) {
      const warnings = f.expected.expected_warnings ?? [];
      expect(
        warnings.some((w) => w.code === "broken_combination_detected"),
        `${f.id}: missing expected broken_combination_detected warning`,
      ).toBe(true);
    }
  });

  it("every fixture has stub_signals populated", () => {
    for (const f of fixtures) {
      expect(f.stub_signals, `${f.id}: stub_signals missing`).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Novel-but-coherent
// ---------------------------------------------------------------------------

describe("novel-but-coherent fixtures", () => {
  const fixtures = loadFixturesByCategory("novel-but-coherent");

  it("at least 10 fixtures", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(10);
  });

  it("every fixture is flagged as novel", () => {
    for (const f of fixtures) {
      expect(f.expected.is_novel).toBe(true);
    }
  });

  it("every fixture has stub_signals populated", () => {
    for (const f of fixtures) {
      expect(f.stub_signals, `${f.id}: stub_signals missing`).toBeDefined();
    }
  });

  it("min_confidence (when specified) is below 1.0 to signal novelty", () => {
    for (const f of fixtures) {
      if (f.expected.min_confidence !== undefined) {
        expect(
          f.expected.min_confidence,
          `${f.id}: novel-but-coherent min_confidence should be < 1.0`,
        ).toBeLessThan(1.0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Anti-vibe
// ---------------------------------------------------------------------------

describe("anti-vibe fixtures", () => {
  const fixtures = loadFixturesByCategory("anti-vibe");

  it("at least 10 fixtures", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(10);
  });

  it("every fixture either populates stub_signals.anti_vibes OR specifies must_avoid OR carries a _methodology_note explaining the conversion", () => {
    for (const f of fixtures) {
      const hasAntiSignals = (f.stub_signals?.anti_vibes.length ?? 0) > 0;
      const hasMustAvoid = (f.expected.must_avoid?.length ?? 0) > 0;
      // Phase 2.1a allowance: fixtures converted from anti-vibe-driven
      // to positive-routing tests during attestation audits (where
      // search-first methodology found the anti-vibe vocabulary
      // wasn't attested as design-community language) carry a
      // _methodology_note field documenting the conversion. They
      // remain in the anti-vibe directory as historical record + a
      // positive-routing test for the same brief intent. See
      // docs/altname-coverage-notes.md negative-result entries.
      const hasMethodologyNote =
        typeof (f as unknown as Record<string, unknown>)["_methodology_note"] ===
        "string";
      expect(
        hasAntiSignals || hasMustAvoid || hasMethodologyNote,
        `${f.id}: anti-vibe fixtures need anti_vibes signals or must_avoid (or both), or a _methodology_note documenting why neither is populated`,
      ).toBe(true);
    }
  });

  it("must_avoid grammar IDs (when specified) reference real loaded grammars", () => {
    for (const f of fixtures) {
      for (const grammarId of f.expected.must_avoid ?? []) {
        const found = anyAxisHas(grammarId);
        expect(
          found,
          `${f.id}: must_avoid id "${grammarId}" not in loaded grammars`,
        ).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Failure mode
// ---------------------------------------------------------------------------

describe("failure-mode fixtures", () => {
  const fixtures = loadFixturesByCategory("failure-mode");

  it("at least 5 fixtures", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(5);
  });

  it("every fixture is flagged should_fail", () => {
    for (const f of fixtures) {
      expect(f.expected.should_fail).toBe(true);
    }
  });

  it("every fixture expects a conflict-severity warning", () => {
    for (const f of fixtures) {
      const warnings = f.expected.expected_warnings ?? [];
      expect(
        warnings.some((w) => w.severity === "conflict"),
        `${f.id}: failure-mode fixtures should expect a conflict-severity warning`,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function anyAxisHas(grammarId: string): boolean {
  for (const ids of idsByAxis.values()) {
    if (ids.has(grammarId)) return true;
  }
  return false;
}

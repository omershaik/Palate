// tests/routing/validation-suite.test.ts
//
// Phase 2 validation suite — drives route() against all 95 fixtures
// using stub Stage 1. The Phase 2 done-criterion (PRD §7) is "All
// 80+ validation tests pass; route(brief) reliably produces correct
// combinations for canonical briefs." This file is the executable
// form of that criterion.
//
// Each fixture category has its own assertions:
//
//   canonical            — engine must match the expected canonical
//                          name + every specified axis grammar.
//   broken               — engine must surface a broken_combination_*
//                          warning OR resolve via canonical snap.
//   novel-but-coherent   — engine must NOT report exact canonical
//                          match (canonical_match_confidence < 1.0
//                          OR canonical_match null).
//   anti-vibe            — engine must NOT return any axis grammar
//                          listed in must_avoid.
//   failure-mode         — engine must surface a conflict-severity
//                          warning OR fail to produce a coherent
//                          combination.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import {
  createStubStage1,
  route,
  type RouteOptions,
} from "../../src/routing/index.js";
import {
  loadFixturesByCategory,
  type RoutingFixture,
} from "./loader.js";
import type { Axis } from "../../src/types/axis.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function buildOptions(fixture: RoutingFixture): RouteOptions {
  if (fixture.stub_signals === undefined) {
    throw new Error(`Fixture ${fixture.id} has no stub_signals`);
  }
  return {
    corpus,
    signalExtractor: createStubStage1(
      new Map([[fixture.brief, fixture.stub_signals]]),
    ),
  };
}

// ---------------------------------------------------------------------------
// Canonical (45 fixtures)
// ---------------------------------------------------------------------------

describe("validation suite — canonical fixtures", () => {
  const fixtures = loadFixturesByCategory("canonical");

  for (const fixture of fixtures) {
    describe(fixture.id, () => {
      it("matches the expected canonical name", async () => {
        const result = await route(fixture.brief, buildOptions(fixture));
        expect(result.canonical_match).toBe(fixture.expected.canonical);
      });

      it("meets the min_confidence floor", async () => {
        const result = await route(fixture.brief, buildOptions(fixture));
        const floor = fixture.expected.min_confidence ?? 0;
        expect(
          result.canonical_match_confidence,
          `${fixture.id}: got ${result.canonical_match_confidence}, floor ${floor}`,
        ).toBeGreaterThanOrEqual(floor);
      });

      it("routes every specified axis to the expected grammar", async () => {
        const result = await route(fixture.brief, buildOptions(fixture));
        for (const [axisKey, expected] of Object.entries(
          fixture.expected.axes ?? {},
        )) {
          const decision = result.combination[axisKey as Axis];
          const actualId =
            decision !== undefined && "grammar_id" in decision
              ? (decision as { grammar_id: string }).grammar_id
              : (decision as { profile_id: string }).profile_id;
          // F3-1: support membership semantics. When `expected` is an
          // array, the engine's pick must be one of the listed
          // grammars (used for canonicals like CANONICAL-9 that list
          // "LAYOUT-10 or LAYOUT-3b"). When it's a string, exact match
          // (legacy behavior).
          if (Array.isArray(expected)) {
            expect(
              expected.includes(actualId),
              `${fixture.id}/${axisKey}: got ${actualId}, expected one of [${expected.join(", ")}]`,
            ).toBe(true);
          } else {
            expect(
              actualId,
              `${fixture.id}/${axisKey}: got ${actualId}, expected ${expected}`,
            ).toBe(expected);
          }
        }
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Broken (22 fixtures)
// ---------------------------------------------------------------------------

describe("validation suite — broken combinations", () => {
  const fixtures = loadFixturesByCategory("broken");

  for (const fixture of fixtures) {
    it(`${fixture.id}: engine detects or resolves the broken pair`, async () => {
      const result = await route(fixture.brief, buildOptions(fixture));
      // Either the engine surfaced a broken_combination_* warning,
      // OR it snapped to a canonical (which is a valid resolution).
      const hasBrokenWarning = result.open_warnings.some(
        (w) =>
          w.code === "broken_combination_detected" ||
          w.code === "broken_combination_resolved",
      );
      const snappedToCanonical =
        result.canonical_match !== null &&
        result.canonical_match_confidence >= 0.667;
      expect(
        hasBrokenWarning || snappedToCanonical,
        `${fixture.id}: expected either a broken_combination_* warning or a canonical snap; got warnings=[${result.open_warnings.map((w) => w.code).join(", ")}], canonical_match=${result.canonical_match}, conf=${result.canonical_match_confidence}`,
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Novel-but-coherent (12 fixtures)
// ---------------------------------------------------------------------------

describe("validation suite — novel-but-coherent", () => {
  const fixtures = loadFixturesByCategory("novel-but-coherent");

  for (const fixture of fixtures) {
    it(`${fixture.id}: engine signals novel rather than exact-canonical match`, async () => {
      const result = await route(fixture.brief, buildOptions(fixture));
      // Novel = NOT an exact canonical match. Either canonical_match
      // is null OR confidence < 1.0 (register-coherent but not exact).
      const isNovel =
        result.canonical_match === null ||
        result.canonical_match_confidence < 1.0;
      expect(
        isNovel,
        `${fixture.id}: expected novel routing; got canonical_match=${result.canonical_match}, conf=${result.canonical_match_confidence}`,
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Anti-vibe (10 fixtures)
// ---------------------------------------------------------------------------

describe("validation suite — anti-vibe", () => {
  const fixtures = loadFixturesByCategory("anti-vibe");

  for (const fixture of fixtures) {
    it(`${fixture.id}: engine honors must_avoid`, async () => {
      const result = await route(fixture.brief, buildOptions(fixture));
      const mustAvoid = new Set(fixture.expected.must_avoid ?? []);
      if (mustAvoid.size === 0) return; // documentation-only fixture
      const actualGrammarIds = new Set<string>();
      for (const decision of Object.values(result.combination)) {
        const id =
          "grammar_id" in decision
            ? (decision as { grammar_id: string }).grammar_id
            : (decision as { profile_id: string }).profile_id;
        actualGrammarIds.add(id);
      }
      for (const banned of mustAvoid) {
        expect(
          actualGrammarIds.has(banned),
          `${fixture.id}: must_avoid grammar ${banned} appeared in routing output`,
        ).toBe(false);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Failure-mode (6 fixtures)
// ---------------------------------------------------------------------------

describe("validation suite — failure-mode", () => {
  const fixtures = loadFixturesByCategory("failure-mode");

  for (const fixture of fixtures) {
    it(`${fixture.id}: engine surfaces conflict OR fails to produce confident routing`, async () => {
      const result = await route(fixture.brief, buildOptions(fixture));
      // Failure-mode briefs should produce one of:
      //   - a conflict-severity warning
      //   - very low canonical confidence (< 0.5)
      //   - canonical_match = null
      const hasConflict = result.open_warnings.some(
        (w) => w.severity === "conflict",
      );
      const lowConfidence = result.canonical_match_confidence < 0.5;
      const noMatch = result.canonical_match === null;
      expect(
        hasConflict || lowConfidence || noMatch,
        `${fixture.id}: expected failure indication; got canonical_match=${result.canonical_match}, conf=${result.canonical_match_confidence}, warnings=[${result.open_warnings.map((w) => w.severity).join(", ")}]`,
      ).toBe(true);
    });
  }
});

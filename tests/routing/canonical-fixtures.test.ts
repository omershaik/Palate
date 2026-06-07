// tests/routing/canonical-fixtures.test.ts
//
// Cross-validates the canonical routing fixtures against the loaded
// corpus: every fixture's expected.axes references must point to real
// grammar IDs, every canonical name must exist in the loaded
// canonical_combinations, the three-entry-path discipline (brand /
// vibes / intent) must hold per the kickoff B1–B15 adjustment.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import {
  loadFixturesByCategory,
  type RoutingFixture,
} from "./loader.js";
import type { Axis } from "../../src/types/axis.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

const canonicalFixtures: RoutingFixture[] = loadFixturesByCategory("canonical");

// Build a lookup of valid grammar ids per axis from the loaded corpus.
function buildAxisIdSets(): Map<Axis, Set<string>> {
  const out = new Map<Axis, Set<string>>();
  for (const [axis, grammars] of Object.entries(corpus.axes)) {
    out.set(axis as Axis, new Set(grammars.map((g) => g.id)));
  }
  out.set("voice", new Set(corpus.voice.profiles.map((p) => p.id)));
  return out;
}
const idsByAxis = buildAxisIdSets();

const canonicalNames = new Set(
  corpus.canonical_combinations.map((c) => c.name),
);

describe("canonical routing fixtures — corpus cross-references", () => {
  it("every fixture's expected.canonical names a real loaded canonical", () => {
    for (const f of canonicalFixtures) {
      expect(
        canonicalNames.has(f.expected.canonical!),
        `${f.id}: canonical "${f.expected.canonical}" not in loaded canonicals`,
      ).toBe(true);
    }
  });

  it("every fixture's expected.axes references real grammar ids", () => {
    for (const f of canonicalFixtures) {
      for (const [axis, value] of Object.entries(
        f.expected.axes ?? {},
      ) as Array<[Axis, string | string[]]>) {
        const ids = idsByAxis.get(axis);
        expect(ids, `${f.id}: axis ${axis} not indexed`).toBeDefined();
        // F3-1: axes value can be a single id or an array of ids
        // (membership semantics for multi-option canonicals).
        const candidates = Array.isArray(value) ? value : [value];
        for (const grammarId of candidates) {
          expect(
            ids!.has(grammarId),
            `${f.id}: ${axis}=${grammarId} not in loaded ids`,
          ).toBe(true);
        }
      }
    }
  });
});

describe("canonical routing fixtures — three-entry-path discipline", () => {
  // Group fixtures by canonical name (using filename slug; entry path
  // is the trailing -brand / -vibes / -intent).
  const byCanonical = new Map<string, Set<string>>();
  for (const f of canonicalFixtures) {
    const canonical = f.expected.canonical!;
    if (!byCanonical.has(canonical)) byCanonical.set(canonical, new Set());
    const path = pathFromId(f.id);
    byCanonical.get(canonical)!.add(path);
  }

  it("every canonical has all three entry-path fixtures (brand / vibes / intent)", () => {
    for (const canonicalName of canonicalNames) {
      const paths = byCanonical.get(canonicalName);
      expect(
        paths,
        `${canonicalName}: no fixtures found`,
      ).toBeDefined();
      expect(
        paths!,
        `${canonicalName}: missing entry paths (have: ${[...paths!].join(", ")})`,
      ).toEqual(new Set(["brand", "vibes", "intent"]));
    }
  });

  it("brand-path fixtures actually invoke a brand exemplar", () => {
    const brandFixtures = canonicalFixtures.filter(
      (f) => pathFromId(f.id) === "brand",
    );
    for (const f of brandFixtures) {
      expect(
        f.stub_signals?.brand_exemplars.length ?? 0,
        `${f.id}: brand-path fixture should populate stub_signals.brand_exemplars`,
      ).toBeGreaterThan(0);
    }
  });

  it("vibes-path fixtures actually populate vibes signals", () => {
    const vibesFixtures = canonicalFixtures.filter(
      (f) => pathFromId(f.id) === "vibes",
    );
    for (const f of vibesFixtures) {
      expect(
        f.stub_signals?.vibes.length ?? 0,
        `${f.id}: vibes-path fixture should populate stub_signals.vibes`,
      ).toBeGreaterThan(0);
    }
  });

  it("intent-path fixtures actually populate compositional_intent", () => {
    const intentFixtures = canonicalFixtures.filter(
      (f) => pathFromId(f.id) === "intent",
    );
    for (const f of intentFixtures) {
      expect(
        f.stub_signals?.compositional_intent.length ?? 0,
        `${f.id}: intent-path fixture should populate stub_signals.compositional_intent`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("canonical routing fixtures — coverage", () => {
  it("at least 45 fixtures (15 canonicals × 3 entry paths)", () => {
    expect(canonicalFixtures.length).toBeGreaterThanOrEqual(45);
  });

  it("covers all 15 canonical combinations", () => {
    const covered = new Set(
      canonicalFixtures.map((f) => f.expected.canonical),
    );
    for (const canonical of canonicalNames) {
      expect(covered, `missing fixture for ${canonical}`).toContain(canonical);
    }
  });

  it("every fixture has stub_signals populated (for stub Stage 1 mode)", () => {
    for (const f of canonicalFixtures) {
      expect(f.stub_signals, `${f.id}: stub_signals missing`).toBeDefined();
    }
  });

  it("every fixture's brief is non-trivial (>30 chars)", () => {
    for (const f of canonicalFixtures) {
      expect(
        f.brief.length,
        `${f.id}: brief too short`,
      ).toBeGreaterThan(30);
    }
  });
});

/**
 * Given a fixture id like "luxury-hospitality-brand", return "brand".
 * The trailing token after the last hyphen is the entry path.
 */
function pathFromId(id: string): string {
  const last = id.lastIndexOf("-");
  return last === -1 ? id : id.slice(last + 1);
}

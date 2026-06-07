// tests/corpus/loaders/turn4-altnames.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import {
  loadTurn4Altnames,
  mergeTurn4Altnames,
  type PreTurn4Shells,
} from "../../../src/corpus/loaders/turn4-altnames.js";
import { loadPreTurn4Grammars } from "../../../src/corpus/loaders/pre-turn4.js";
import { LoadError } from "../../../src/types/corpus.js";
import type { GrammarShell } from "../../../src/corpus/loaders/utils.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadTurn4Altnames", () => {
  const altnames = loadTurn4Altnames(SPEC_ROOT);

  it("returns 48 altname blocks across the five pre-Turn-4 axes", () => {
    // 14 layout (15 listed but LAYOUT-3, LAYOUT-4 retired by Turn 3,
    // LAYOUT-11 still has a block in Turn 4 that the merger absorbs)
    // + 6 typography + 9 color + 9 component + 9 motion = 47, plus
    // LAYOUT-11's pre-merge entry = 48.
    expect(altnames.size).toBe(48);
  });

  it("includes post-supersession ids (LAYOUT-3a, COLOR-8a, COMP-8b, etc.)", () => {
    expect(altnames.has("LAYOUT-3a")).toBe(true);
    expect(altnames.has("LAYOUT-4b")).toBe(true);
    expect(altnames.has("COLOR-8a")).toBe(true);
    expect(altnames.has("COLOR-8b")).toBe(true);
    expect(altnames.has("COMP-8a")).toBe(true);
    expect(altnames.has("COMP-8b")).toBe(true);
    expect(altnames.has("MOTION-8")).toBe(true);
    expect(altnames.has("MOTION-9")).toBe(true);
  });

  it("does NOT include retired pre-supersession ids (LAYOUT-3, LAYOUT-4, TYPE-7, COLOR-8, COMP-8)", () => {
    expect(altnames.has("LAYOUT-3")).toBe(false);
    expect(altnames.has("LAYOUT-4")).toBe(false);
    expect(altnames.has("TYPE-7")).toBe(false);
    expect(altnames.has("COLOR-8")).toBe(false);
    expect(altnames.has("COMP-8")).toBe(false);
  });

  it("includes LAYOUT-11 as a top-level entry (merger absorbs it later)", () => {
    expect(altnames.has("LAYOUT-11")).toBe(true);
    const layout11 = altnames.get("LAYOUT-11")!;
    expect(layout11.vibes.length).toBeGreaterThan(0);
  });

  it("populates all five buckets for every block", () => {
    for (const [id, bucket] of altnames) {
      expect(bucket.vibes.length, `${id} vibes`).toBeGreaterThan(0);
      expect(bucket.brand_exemplars.length, `${id} brand_exemplars`).toBeGreaterThan(0);
      expect(bucket.vernacular.length, `${id} vernacular`).toBeGreaterThan(0);
      expect(bucket.anti_vibes.length, `${id} anti_vibes`).toBeGreaterThan(0);
      expect(bucket.compositional_intent.length, `${id} compositional_intent`).toBeGreaterThan(0);
    }
  });
});

describe("mergeTurn4Altnames + loadPreTurn4Grammars", () => {
  const merged = loadPreTurn4Grammars(SPEC_ROOT);

  it("returns the canonical post-supersession axis counts", () => {
    expect(merged.layout).toHaveLength(14);
    expect(merged.typography).toHaveLength(6);
    expect(merged.color).toHaveLength(9);
    expect(merged.component).toHaveLength(9);
    expect(merged.motion).toHaveLength(9);
  });

  it("populates every bucket on every merged grammar", () => {
    const all = [
      ...merged.layout,
      ...merged.typography,
      ...merged.color,
      ...merged.component,
      ...merged.motion,
    ];
    expect(all).toHaveLength(47);
    for (const g of all) {
      expect(g.altnames.vibes.length, `${g.id} vibes`).toBeGreaterThan(0);
      expect(g.altnames.brand_exemplars.length, `${g.id} brand_exemplars`).toBeGreaterThan(0);
      expect(g.altnames.vernacular.length, `${g.id} vernacular`).toBeGreaterThan(0);
      expect(g.altnames.anti_vibes.length, `${g.id} anti_vibes`).toBeGreaterThan(0);
      expect(g.altnames.compositional_intent.length, `${g.id} compositional_intent`).toBeGreaterThan(0);
    }
  });

  it("LAYOUT-9 absorbs LAYOUT-11 (Side-Scroll) altnames", () => {
    const layout9 = merged.layout.find((g) => g.id === "LAYOUT-9");
    expect(layout9).toBeDefined();
    // Side-Scroll-specific entries from Turn 4 should appear in
    // LAYOUT-9's brand_exemplars now.
    const exemplars = layout9!.altnames.brand_exemplars.join(" | ").toLowerCase();
    expect(exemplars).toMatch(/netflix/);
    // And the original Catalog entries are still there.
    expect(exemplars).toMatch(/amazon/);
  });

  it("is deterministic across calls", () => {
    const second = loadPreTurn4Grammars(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(JSON.stringify(merged));
  });
});

describe("mergeTurn4Altnames — error aggregation", () => {
  function buildSyntheticShell(
    id: string,
    axis: "layout" | "typography" | "color" | "component" | "motion",
  ): GrammarShell {
    return {
      id,
      axis,
      name: id,
      definition: "synthetic",
      distinguishing_edge: "synthetic",
      substyles: [],
      canonical_examples: ["synthetic"],
      internal_logic: ["synthetic"],
      registers_hosts: ["synthetic"],
      registers_resists: ["synthetic"],
      failure_mode: "synthetic",
    };
  }

  it("aggregates missing-altname-block failures into one LoadError", () => {
    const shells: PreTurn4Shells = {
      layout: [buildSyntheticShell("LAYOUT-99", "layout")],
      typography: [buildSyntheticShell("TYPE-99", "typography")],
      color: [],
      component: [],
      motion: [],
    };
    const altnames = new Map();

    let caught: LoadError | undefined;
    try {
      mergeTurn4Altnames(shells, altnames);
    } catch (e) {
      if (e instanceof LoadError) caught = e;
    }
    expect(caught).toBeDefined();
    expect(caught!.failures.length).toBe(2);
    expect(caught!.failures[0]!.code).toBe("missing_altname_block");
    expect(caught!.failures[1]!.code).toBe("missing_altname_block");
    expect(caught!.failures.map((f) => f.source.grammar_id)).toEqual([
      "LAYOUT-99",
      "TYPE-99",
    ]);
  });

  it("aggregates empty-bucket failures into one LoadError", () => {
    const shells: PreTurn4Shells = {
      layout: [buildSyntheticShell("LAYOUT-99", "layout")],
      typography: [],
      color: [],
      component: [],
      motion: [],
    };
    const altnames = new Map([
      [
        "LAYOUT-99",
        {
          vibes: ["a"],
          brand_exemplars: [],
          vernacular: [],
          anti_vibes: ["x"],
          compositional_intent: [],
        },
      ],
    ]);

    let caught: LoadError | undefined;
    try {
      mergeTurn4Altnames(shells, altnames);
    } catch (e) {
      if (e instanceof LoadError) caught = e;
    }
    expect(caught).toBeDefined();
    // 3 empty buckets → 3 failures.
    expect(caught!.failures).toHaveLength(3);
    const buckets = caught!.failures.map((f) => f.source.bucket);
    expect(buckets).toEqual(["brand_exemplars", "vernacular", "compositional_intent"]);
    for (const f of caught!.failures) {
      expect(f.code).toBe("empty_altname_bucket");
      expect(f.source.grammar_id).toBe("LAYOUT-99");
    }
  });
});

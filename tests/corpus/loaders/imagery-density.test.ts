// tests/corpus/loaders/imagery-density.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadImageryAndDensityGrammars } from "../../../src/corpus/loaders/imagery-density.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadImageryAndDensityGrammars", () => {
  const { imagery, density } = loadImageryAndDensityGrammars(SPEC_ROOT);

  it("returns 9 imagery + 6 density grammars", () => {
    expect(imagery).toHaveLength(9);
    expect(density).toHaveLength(6);
    expect(imagery.map((g) => g.id)).toEqual([
      "IMG-1",
      "IMG-2",
      "IMG-3",
      "IMG-4",
      "IMG-5",
      "IMG-6",
      "IMG-7",
      "IMG-8",
      "IMG-9",
    ]);
    expect(density.map((g) => g.id)).toEqual([
      "DEN-1",
      "DEN-2",
      "DEN-3",
      "DEN-4",
      "DEN-5",
      "DEN-6",
    ]);
  });

  it("populates required structural fields on every imagery grammar", () => {
    for (const g of imagery) {
      expect(g.axis).toBe("imagery");
      expect(g.definition.length, `${g.id} definition`).toBeGreaterThan(20);
      expect(
        g.distinguishing_edge.length,
        `${g.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(g.failure_mode.length, `${g.id} failure_mode`).toBeGreaterThan(20);
      expect(g.internal_logic.length, `${g.id} internal_logic`).toBeGreaterThan(0);
      expect(g.substyles.length, `${g.id} substyles`).toBeGreaterThan(0);
    }
  });

  it("populates required structural fields on every density grammar", () => {
    for (const g of density) {
      expect(g.axis).toBe("density");
      expect(g.definition.length, `${g.id} definition`).toBeGreaterThan(20);
      expect(
        g.distinguishing_edge.length,
        `${g.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(g.failure_mode.length, `${g.id} failure_mode`).toBeGreaterThan(20);
      expect(g.internal_logic.length, `${g.id} internal_logic`).toBeGreaterThan(0);
      expect(g.substyles.length, `${g.id} substyles`).toBeGreaterThan(0);
    }
  });

  it("populates all five inline altname buckets on every imagery grammar", () => {
    for (const g of imagery) {
      expect(g.altnames.vibes.length, `${g.id} vibes`).toBeGreaterThan(0);
      expect(g.altnames.brand_exemplars.length, `${g.id} brand_exemplars`).toBeGreaterThan(0);
      expect(g.altnames.vernacular.length, `${g.id} vernacular`).toBeGreaterThan(0);
      expect(g.altnames.anti_vibes.length, `${g.id} anti_vibes`).toBeGreaterThan(0);
      expect(g.altnames.compositional_intent.length, `${g.id} compositional_intent`).toBeGreaterThan(0);
    }
  });

  it("populates all five inline altname buckets on every density grammar", () => {
    for (const g of density) {
      expect(g.altnames.vibes.length, `${g.id} vibes`).toBeGreaterThan(0);
      expect(g.altnames.brand_exemplars.length, `${g.id} brand_exemplars`).toBeGreaterThan(0);
      expect(g.altnames.vernacular.length, `${g.id} vernacular`).toBeGreaterThan(0);
      expect(g.altnames.anti_vibes.length, `${g.id} anti_vibes`).toBeGreaterThan(0);
      expect(g.altnames.compositional_intent.length, `${g.id} compositional_intent`).toBeGreaterThan(0);
    }
  });

  it("is deterministic across calls", () => {
    const second = loadImageryAndDensityGrammars(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(JSON.stringify({ imagery, density }));
  });
});

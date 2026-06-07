// tests/corpus/loaders/reading-pattern.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadReadingPatternGrammars } from "../../../src/corpus/loaders/reading-pattern.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadReadingPatternGrammars", () => {
  const grammars = loadReadingPatternGrammars(SPEC_ROOT);

  it("returns 6 reading-pattern grammars", () => {
    expect(grammars).toHaveLength(6);
    expect(grammars.map((g) => g.id)).toEqual([
      "RP-1",
      "RP-2",
      "RP-3",
      "RP-4",
      "RP-5",
      "RP-6",
    ]);
  });

  it("populates required structural fields and inline altnames", () => {
    for (const g of grammars) {
      expect(g.axis).toBe("reading_pattern");
      expect(g.definition.length, `${g.id} definition`).toBeGreaterThan(20);
      expect(
        g.distinguishing_edge.length,
        `${g.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(g.failure_mode.length, `${g.id} failure_mode`).toBeGreaterThan(20);
      expect(g.internal_logic.length, `${g.id} internal_logic`).toBeGreaterThan(0);
      expect(g.substyles.length, `${g.id} substyles`).toBeGreaterThan(0);

      expect(g.altnames.vibes.length, `${g.id} vibes`).toBeGreaterThan(0);
      expect(g.altnames.brand_exemplars.length, `${g.id} brand_exemplars`).toBeGreaterThan(0);
      expect(g.altnames.vernacular.length, `${g.id} vernacular`).toBeGreaterThan(0);
      expect(g.altnames.anti_vibes.length, `${g.id} anti_vibes`).toBeGreaterThan(0);
      expect(g.altnames.compositional_intent.length, `${g.id} compositional_intent`).toBeGreaterThan(0);
    }
  });

  it("is deterministic across calls", () => {
    const second = loadReadingPatternGrammars(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(JSON.stringify(grammars));
  });
});

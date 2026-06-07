// tests/corpus/loaders/compatibility-model.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCompatibilityModel } from "../../../src/corpus/loaders/compatibility-model.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadCompatibilityModel", () => {
  const model = loadCompatibilityModel(SPEC_ROOT);

  it("returns 22 broken combinations across five families (per Turn 8 §2)", () => {
    expect(model.broken_combinations).toHaveLength(22);
    const byFamily = {
      A: model.broken_combinations.filter((b) => b.family === "A").length,
      B: model.broken_combinations.filter((b) => b.family === "B").length,
      C: model.broken_combinations.filter((b) => b.family === "C").length,
      D: model.broken_combinations.filter((b) => b.family === "D").length,
      E: model.broken_combinations.filter((b) => b.family === "E").length,
    };
    expect(byFamily).toEqual({ A: 6, B: 6, C: 4, D: 4, E: 2 });
  });

  it("populates combination_text and why_it_breaks on every broken combination", () => {
    for (const b of model.broken_combinations) {
      expect(b.combination_text.length, `${b.id} combination_text`).toBeGreaterThan(20);
      expect(b.why_it_breaks.length, `${b.id} why_it_breaks`).toBeGreaterThan(20);
    }
  });

  it("returns 15 canonical combinations (per Turn 8 §3)", () => {
    expect(model.canonical_combinations).toHaveLength(15);
    expect(model.canonical_combinations.map((c) => c.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => `CANONICAL-${i + 1}`),
    );
  });

  it("each canonical combination names all 9 axes and has brand exemplars", () => {
    for (const c of model.canonical_combinations) {
      const axes = Object.keys(c.axis_mappings).sort();
      expect(axes, `${c.id} axes`).toEqual(
        [
          "color",
          "component",
          "density",
          "imagery",
          "layout",
          "motion",
          "reading_pattern",
          "typography",
          "voice",
        ],
      );
      expect(c.brand_exemplars.length, `${c.id} brand_exemplars`).toBeGreaterThan(0);
    }
  });

  it("CANONICAL-1 (Luxury Hospitality) has the expected layout grammar name", () => {
    const luxury = model.canonical_combinations.find(
      (c) => c.name === "Luxury Hospitality",
    );
    expect(luxury).toBeDefined();
    expect(luxury!.axis_mappings.layout?.grammar_id).toBe("Vertical-Rhythm Editorial");
    expect(luxury!.axis_mappings.voice?.grammar_id).toBe("Quiet Authority");
    expect(luxury!.brand_exemplars).toContain("Aman");
  });

  it("returns 9 reduced-motion fallbacks keyed by motion grammar id", () => {
    const ids = Object.keys(model.reduced_motion_fallbacks).sort();
    expect(ids).toEqual([
      "MOTION-1",
      "MOTION-2",
      "MOTION-3",
      "MOTION-4",
      "MOTION-5",
      "MOTION-6",
      "MOTION-7",
      "MOTION-8",
      "MOTION-9",
    ]);
  });

  it("classifies reduced-motion severities correctly", () => {
    expect(model.reduced_motion_fallbacks["MOTION-1"]?.severity).toBe("trivial");
    expect(model.reduced_motion_fallbacks["MOTION-5"]?.severity).toBe("substantial");
    expect(model.reduced_motion_fallbacks["MOTION-6"]?.severity).toBe("substantial");
    expect(model.reduced_motion_fallbacks["MOTION-3"]?.severity).toBe("partial");
  });

  it("returns the WCAG 2.2 AA accessibility commitments per Turn 8 §6.2", () => {
    expect(model.accessibility_commitments).toEqual({
      contrast_validation: "WCAG_2.2_AA",
      touch_target_minimum_px: 44,
      keyboard_navigation: "all_interactive_elements_focusable",
      high_contrast_mode_support: true,
    });
  });

  it("is deterministic across calls", () => {
    const second = loadCompatibilityModel(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(JSON.stringify(model));
  });
});

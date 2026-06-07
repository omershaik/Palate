// tests/routing/matching.test.ts

import { describe, expect, it } from "vitest";
import {
  ANTI_VIBE_WEIGHT_MULTIPLIER,
  BUCKET_WEIGHTS,
  matchesAltname,
  normalizeForMatching,
} from "../../src/routing/matching.js";

describe("normalizeForMatching", () => {
  it("lowercases", () => {
    expect(normalizeForMatching("AMAN")).toBe("aman");
  });

  it("converts hyphens to spaces", () => {
    expect(normalizeForMatching("Stillness-as-Discipline")).toBe(
      "stillness as discipline",
    );
  });

  it("strips punctuation", () => {
    expect(normalizeForMatching("'Aman' style!")).toBe("aman style");
  });

  it("collapses multi-space", () => {
    expect(normalizeForMatching("a  b  c")).toBe("a b c");
  });
});

describe("matchesAltname", () => {
  it("exact match (case-insensitive)", () => {
    expect(matchesAltname("Aman", "aman")).toBe(true);
  });

  it("substring match either direction", () => {
    expect(matchesAltname("Aman", "like Aman")).toBe(true);
    expect(matchesAltname("like Aman", "Aman")).toBe(true);
  });

  it("hyphen/space equivalence", () => {
    expect(
      matchesAltname("Stillness-as-Discipline", "stillness as discipline"),
    ).toBe(true);
  });

  it("rejects sub-3-char accidents", () => {
    expect(matchesAltname("a", "amazon")).toBe(false);
  });

  it("returns false on no overlap", () => {
    expect(matchesAltname("xyz", "abc")).toBe(false);
  });

  it("empty strings return false", () => {
    expect(matchesAltname("", "anything")).toBe(false);
    expect(matchesAltname("anything", "")).toBe(false);
  });
});

describe("BUCKET_WEIGHTS", () => {
  it("matches Turn 8 §5.2 stated weights", () => {
    expect(BUCKET_WEIGHTS.brand_exemplars).toBe(0.9);
    expect(BUCKET_WEIGHTS.vernacular).toBe(0.7);
    expect(BUCKET_WEIGHTS.anti_vibes).toBe(0.8);
    expect(BUCKET_WEIGHTS.vibes).toBe(0.6);
    expect(BUCKET_WEIGHTS.compositional_intent).toBe(0.5);
  });

  it("ANTI_VIBE_WEIGHT_MULTIPLIER is 1.5 per Turn 8 §5.2.5", () => {
    expect(ANTI_VIBE_WEIGHT_MULTIPLIER).toBe(1.5);
  });
});

// tests/corpus/loaders/voice.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import {
  loadVoiceBlock,
  parseDimensionalCoordinatesText,
} from "../../../src/corpus/loaders/voice.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadVoiceBlock", () => {
  const block = loadVoiceBlock(SPEC_ROOT);

  it("returns 6 dimensions and 9 profiles", () => {
    expect(block.dimensions).toHaveLength(6);
    expect(block.profiles).toHaveLength(9);
  });

  it("dimensions are in canonical order", () => {
    expect(block.dimensions.map((d) => d.id)).toEqual([
      "humor",
      "formality",
      "respectfulness",
      "enthusiasm",
      "rhythm",
      "vocabulary",
    ]);
  });

  it("populates dimension end-points and descriptions", () => {
    for (const d of block.dimensions) {
      expect(d.name.length, `${d.id} name`).toBeGreaterThan(0);
      expect(d.description.length, `${d.id} description`).toBeGreaterThan(20);
      expect(d.endpoints.low.length, `${d.id} endpoints.low`).toBeGreaterThan(20);
      expect(d.endpoints.high.length, `${d.id} endpoints.high`).toBeGreaterThan(20);
    }
  });

  it("profiles are in canonical order VOICE-1..VOICE-9", () => {
    expect(block.profiles.map((p) => p.id)).toEqual([
      "VOICE-1",
      "VOICE-2",
      "VOICE-3",
      "VOICE-4",
      "VOICE-5",
      "VOICE-6",
      "VOICE-7",
      "VOICE-8",
      "VOICE-9",
    ]);
  });

  it("populates required fields and altnames on every profile", () => {
    for (const p of block.profiles) {
      expect(p.axis).toBe("voice");
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.definition.length, `${p.id} definition`).toBeGreaterThan(20);
      expect(
        p.distinguishing_edge.length,
        `${p.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(p.failure_mode.length, `${p.id} failure_mode`).toBeGreaterThan(20);
      expect(p.internal_logic.length, `${p.id} internal_logic`).toBeGreaterThan(0);

      expect(p.altnames.vibes.length, `${p.id} vibes`).toBeGreaterThan(0);
      expect(p.altnames.brand_exemplars.length, `${p.id} brand_exemplars`).toBeGreaterThan(0);
      expect(p.altnames.vernacular.length, `${p.id} vernacular`).toBeGreaterThan(0);
      expect(p.altnames.anti_vibes.length, `${p.id} anti_vibes`).toBeGreaterThan(0);
      expect(p.altnames.compositional_intent.length, `${p.id} compositional_intent`).toBeGreaterThan(0);
    }
  });

  it("populates all six dimensional coordinates on every profile (0..10)", () => {
    for (const p of block.profiles) {
      const c = p.dimensional_coordinates;
      for (const dim of [
        "humor",
        "formality",
        "respectfulness",
        "enthusiasm",
        "rhythm",
        "vocabulary",
      ] as const) {
        expect(c[dim], `${p.id}.${dim}`).toBeGreaterThanOrEqual(0);
        expect(c[dim], `${p.id}.${dim}`).toBeLessThanOrEqual(10);
      }
    }
  });

  it("VOICE-1 (Quiet Authority) maps Serious/Formal/Respectful/Matter-of-Fact/Flowing/Plain", () => {
    const v1 = block.profiles.find((p) => p.id === "VOICE-1")!;
    const c = v1.dimensional_coordinates;
    // Serious → low humor
    expect(c.humor).toBeLessThanOrEqual(3);
    // Formal → high formality
    expect(c.formality).toBeGreaterThanOrEqual(7);
    // Respectful → high respectfulness
    expect(c.respectfulness).toBeGreaterThanOrEqual(7);
    // Matter-of-Fact → low enthusiasm
    expect(c.enthusiasm).toBeLessThanOrEqual(3);
    // Flowing → low rhythm
    expect(c.rhythm).toBeLessThanOrEqual(4);
    // Plain → low vocabulary
    expect(c.vocabulary).toBeLessThanOrEqual(4);
  });

  it("VOICE-8 (Irreverent Bold) maps to irreverent end of respectfulness", () => {
    const v8 = block.profiles.find((p) => p.id === "VOICE-8")!;
    expect(v8.dimensional_coordinates.respectfulness).toBeLessThanOrEqual(3);
  });

  it("VOICE-9 (Technical Precise) maps to expert end of vocabulary", () => {
    const v9 = block.profiles.find((p) => p.id === "VOICE-9")!;
    expect(v9.dimensional_coordinates.vocabulary).toBeGreaterThanOrEqual(7);
  });

  it("is deterministic across calls", () => {
    const second = loadVoiceBlock(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(JSON.stringify(block));
  });
});

describe("parseDimensionalCoordinatesText", () => {
  it("handles the canonical six-descriptor format", () => {
    const c = parseDimensionalCoordinatesText(
      "Serious, Formal, Respectful, Matter-of-Fact, Flowing, Plain.",
    );
    expect(c.humor).toBeLessThanOrEqual(3);
    expect(c.formality).toBeGreaterThanOrEqual(7);
    expect(c.respectfulness).toBeGreaterThanOrEqual(7);
    expect(c.enthusiasm).toBeLessThanOrEqual(3);
    expect(c.rhythm).toBeLessThanOrEqual(4);
    expect(c.vocabulary).toBeLessThanOrEqual(4);
  });

  it("averages 'X to Y' descriptors", () => {
    // VOICE-2: "Slightly Serious to Middle Humor"
    const c = parseDimensionalCoordinatesText(
      "Slightly Serious to Middle Humor, Slightly Formal, Respectful, Slightly Enthusiastic, Flowing, Middle Vocabulary",
    );
    // Slightly Serious (3) + Middle Humor (5) → midpoint 4
    expect(c.humor).toBe(4);
  });

  it("strips parenthetical clauses before lookup", () => {
    // VOICE-3 vocabulary: "Plain (with strategic Expert vocabulary)"
    const c = parseDimensionalCoordinatesText(
      "Light Humor, Casual, Respectful, Slightly Enthusiastic, Mixed Rhythm, Plain (with strategic Expert vocabulary)",
    );
    // Should match "Plain" → 2, NOT "Expert" → 9.
    expect(c.vocabulary).toBeLessThanOrEqual(4);
  });

  it("returns midpoint defaults for unrecognized descriptors", () => {
    const c = parseDimensionalCoordinatesText("Foo, Bar, Baz, Qux, Quux, Corge");
    expect(c.humor).toBe(5);
    expect(c.formality).toBe(5);
    expect(c.respectfulness).toBe(5);
    expect(c.enthusiasm).toBe(5);
    expect(c.rhythm).toBe(5);
    expect(c.vocabulary).toBe(5);
  });
});

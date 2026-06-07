// tests/routing/stage1-prompt.test.ts

import { describe, expect, it } from "vitest";
import {
  EXTRACTED_SIGNALS_JSON_SCHEMA,
  STAGE1_SYSTEM_PROMPT_V1,
  isValidExtractedSignals,
} from "../../src/routing/stage1/index.js";

describe("STAGE1_SYSTEM_PROMPT_V1", () => {
  it("names all eight signal categories", () => {
    const categories = [
      "brand_exemplars",
      "vibes",
      "vernacular",
      "anti_vibes",
      "compositional_intent",
      "domain",
      "functional_context",
      "audience_signals",
    ];
    for (const category of categories) {
      expect(STAGE1_SYSTEM_PROMPT_V1).toContain(category);
    }
  });

  it("instructs the model to extract verbatim phrases", () => {
    expect(STAGE1_SYSTEM_PROMPT_V1).toMatch(/verbatim/i);
  });

  it("instructs the model not to invent signals", () => {
    expect(STAGE1_SYSTEM_PROMPT_V1).toMatch(/don't invent/i);
  });
});

describe("EXTRACTED_SIGNALS_JSON_SCHEMA", () => {
  it("requires all eight signal-bucket properties", () => {
    expect(EXTRACTED_SIGNALS_JSON_SCHEMA.required).toEqual([
      "brand_exemplars",
      "vibes",
      "vernacular",
      "anti_vibes",
      "compositional_intent",
      "domain",
      "functional_context",
      "audience_signals",
    ]);
  });

  it("has additionalProperties: false (model can't invent fields)", () => {
    expect(EXTRACTED_SIGNALS_JSON_SCHEMA.additionalProperties).toBe(false);
  });

  it("every property is an array of strings", () => {
    for (const key of EXTRACTED_SIGNALS_JSON_SCHEMA.required) {
      const prop = (
        EXTRACTED_SIGNALS_JSON_SCHEMA.properties as Record<
          string,
          { type: string; items: { type: string } }
        >
      )[key];
      expect(prop?.type).toBe("array");
      expect(prop?.items.type).toBe("string");
    }
  });
});

describe("isValidExtractedSignals", () => {
  const validShape = {
    brand_exemplars: ["Aman"],
    vibes: ["luxury hotel"],
    vernacular: [],
    anti_vibes: [],
    compositional_intent: [],
    domain: [],
    functional_context: [],
    audience_signals: [],
  };

  it("accepts a fully-populated valid shape", () => {
    expect(isValidExtractedSignals(validShape)).toBe(true);
  });

  it("rejects null and arrays", () => {
    expect(isValidExtractedSignals(null)).toBe(false);
    expect(isValidExtractedSignals([])).toBe(false);
    expect(isValidExtractedSignals("string")).toBe(false);
    expect(isValidExtractedSignals(42)).toBe(false);
  });

  it("rejects shapes missing a required bucket", () => {
    const { vibes: _vibes, ...incomplete } = validShape;
    expect(isValidExtractedSignals(incomplete)).toBe(false);
  });

  it("rejects buckets with non-string entries", () => {
    expect(
      isValidExtractedSignals({ ...validShape, vibes: [42] }),
    ).toBe(false);
  });

  it("rejects buckets that aren't arrays", () => {
    expect(
      isValidExtractedSignals({ ...validShape, vibes: "string" }),
    ).toBe(false);
  });
});

// tests/routing/stage1-stub.test.ts
//
// Unit tests for the stub Stage 1.

import { describe, expect, it } from "vitest";
import {
  createStubStage1,
  StubStage1MissError,
} from "../../src/routing/stage1/stub.js";
import type { ExtractedSignals } from "../../src/routing/types.js";

const sampleSignals: ExtractedSignals = {
  brand_exemplars: ["Aman"],
  vibes: ["luxury hotel", "considered"],
  vernacular: [],
  anti_vibes: [],
  compositional_intent: ["expensive but quiet"],
  domain: ["hospitality"],
  functional_context: ["marketing page"],
  audience_signals: [],
};

describe("createStubStage1", () => {
  it("returns the registered signals for a known brief", async () => {
    const map = new Map([["Aman-style hotel", sampleSignals]]);
    const stub = createStubStage1(map);
    const result = await stub("Aman-style hotel");
    expect(result).toEqual(sampleSignals);
  });

  it("returns a defensive copy (caller mutation doesn't leak)", async () => {
    const map = new Map([["x", sampleSignals]]);
    const stub = createStubStage1(map);
    const result = await stub("x");
    result.vibes.push("MUTATED");
    const second = await stub("x");
    expect(second.vibes).not.toContain("MUTATED");
  });

  it("throws StubStage1MissError on unknown brief", async () => {
    const stub = createStubStage1(new Map());
    await expect(stub("unknown")).rejects.toBeInstanceOf(StubStage1MissError);
  });
});

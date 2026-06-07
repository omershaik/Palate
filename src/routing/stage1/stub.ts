// src/routing/stage1/stub.ts
//
// Stub Stage 1 implementation. Returns pre-canned ExtractedSignals
// keyed by brief text. Used by the validation suite to bypass the
// LLM entirely — tests run deterministically and fast (no API call,
// no network, no nondeterminism).
//
// Real LLM-backed Stage 1 lives in src/routing/stage1/extract.ts
// (Group E). The stub conforms to the same SignalExtractor interface
// (a function brief => Promise<ExtractedSignals>) so route() can
// inject either via dependency injection.
//
// Stub registry pattern: callers build a map from brief text to
// signals, then create a stub bound to that map. The fixture loader
// in tests/routing/loader.ts populates the map from each fixture's
// stub_signals field; tests inject the resulting stub.

import type {
  ExtractedSignals,
  SignalExtractor,
} from "../types.js";

export class StubStage1MissError extends Error {
  constructor(public readonly brief: string) {
    super(
      `Stub Stage 1 has no signals for brief: ${JSON.stringify(brief.slice(0, 80))}` +
        (brief.length > 80 ? "..." : ""),
    );
    this.name = "StubStage1MissError";
  }
}

/**
 * Create a stub SignalExtractor backed by an in-memory brief→signals
 * map. The map is built by the fixture loader at test setup time.
 *
 * On a brief miss the stub throws StubStage1MissError rather than
 * returning empty signals, so the test fails loudly instead of
 * routing on a no-signal input.
 */
export function createStubStage1(
  briefToSignals: ReadonlyMap<string, ExtractedSignals>,
): SignalExtractor {
  return async (brief: string): Promise<ExtractedSignals> => {
    const signals = briefToSignals.get(brief);
    if (signals === undefined) {
      throw new StubStage1MissError(brief);
    }
    // Defensive copy so callers can't mutate the canned signals.
    return cloneSignals(signals);
  };
}

function cloneSignals(s: ExtractedSignals): ExtractedSignals {
  return {
    brand_exemplars: [...s.brand_exemplars],
    vibes: [...s.vibes],
    vernacular: [...s.vernacular],
    anti_vibes: [...s.anti_vibes],
    compositional_intent: [...s.compositional_intent],
    domain: [...s.domain],
    functional_context: [...s.functional_context],
    audience_signals: [...s.audience_signals],
  };
}

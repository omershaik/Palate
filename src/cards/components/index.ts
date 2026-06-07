// src/cards/components/index.ts
//
// Phase 3 Task 3 — combined component recipe entry point. The card
// generator (src/cards/generate.ts) calls buildComponents() with the
// routed Component grammar id; this module dispatches to the per-
// grammar lookup table in grammars.ts.

export { buildComponents } from "./grammars.js";
export * from "./conventions.js";

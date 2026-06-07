// src/routing/stage1/index.ts
//
// Barrel for Stage 1.
//
// Stage 1 is signal extraction from a brief. Two implementations
// ship with v0.1:
//   - createStubStage1 (stub.ts): returns pre-canned signals from a
//     brief→signals map. Used by the validation suite for fast,
//     deterministic CI runs.
//   - createDeterministicStage1 (deterministic.ts): walks corpus
//     altnames + a small dictionary, returns ExtractedSignals.
//     Used by production routing on novel briefs.
//
// The MCP server has no LLM dependency. The consuming AI tool can
// optionally run its own LLM with the prompt + JSON schema in
// prompt.ts (Phase 3 will expose this as a palate.brief-template
// MCP resource) for higher-recall extraction; both paths converge
// on the same SignalExtractor type alias.

export { createStubStage1, StubStage1MissError } from "./stub.js";
export {
  createDeterministicStage1,
  deterministicExtract,
} from "./deterministic.js";
export {
  STAGE1_SYSTEM_PROMPT_V1,
  EXTRACTED_SIGNALS_JSON_SCHEMA,
  isValidExtractedSignals,
} from "./prompt.js";

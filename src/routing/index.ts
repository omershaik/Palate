// src/routing/index.ts
//
// Barrel export for the routing engine. Phase 2 builds out the five
// stages and the top-level route() function; Phase 3 wires them into
// the MCP server.

export type {
  ExtractedSignals,
  SignalMatch,
  AxisCandidate,
  BucketMatchOutput,
  RankedAxis,
  RankedCombination,
  CoherenceVerdict,
  ResolutionStrategy,
  AxisChange,
  ResolutionResult,
  SignalExtractor,
} from "./types.js";
export { emptyExtractedSignals } from "./types.js";

export {
  createStubStage1,
  StubStage1MissError,
  createDeterministicStage1,
  deterministicExtract,
  STAGE1_SYSTEM_PROMPT_V1,
  EXTRACTED_SIGNALS_JSON_SCHEMA,
  isValidExtractedSignals,
} from "./stage1/index.js";

export {
  matchesAltname,
  normalizeForMatching,
  BUCKET_WEIGHTS,
  ANTI_VIBE_WEIGHT_MULTIPLIER,
} from "./matching.js";
export { bucketMatch } from "./stage2-bucket.js";
export {
  rankCombination,
  isAIDefault,
  AI_DEFAULT_GRAMMAR_PER_AXIS,
} from "./stage3-confidence.js";
export {
  checkCoherence,
  REGISTER_COHERENCE_AXIS_THRESHOLD,
} from "./stage4-coherence.js";
export { resolveConflicts } from "./stage5-resolve.js";

export { route, type RouteOptions } from "./route.js";

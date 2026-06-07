// src/index.ts
//
// Public entrypoint for the Palate package. Phase 1 exports the type
// contracts and the corpus loader; Phase 2 will add the routing
// engine; Phase 3 will add the MCP server bindings.
//
// See docs/prd/v0.1.md §7 for the build phase plan.

export const PALATE_VERSION = "0.1.0-pre";

export type * from "./types/index.js";
export { ALL_AXES, LoadError } from "./types/index.js";
export { loadCorpus } from "./corpus/load-corpus.js";

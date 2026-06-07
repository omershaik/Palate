// src/corpus/parser/index.ts
//
// Barrel for the parser primitives. The per-document loaders in Group D
// import from here; nothing in src/corpus/parser/ should be imported via
// deeper paths from outside this module.

export { parseMarkdown } from "./parse.js";
export {
  buildHeadingTree,
  walkHeadingTree,
  findHeadingByText,
} from "./heading-tree.js";
export type { HeadingNode, BlockContent } from "./heading-tree.js";
export {
  AXIS_PREFIX,
  DEFAULT_LABEL_TO_FIELD,
  V01_LAYOUT_LABEL_TO_FIELD,
  GrammarBlockParseError,
  extractGrammarBlock,
} from "./grammar-block.js";
export type { ExtractGrammarBlockOptions } from "./grammar-block.js";
export {
  emptyAltnameBucket,
  extractAltnameBucket,
  isAltnameBucketComplete,
  emptyBuckets,
} from "./altname-bucket.js";

// src/corpus/parser/parse.ts
//
// Thin wrapper around the remark/unified pipeline. The Phase 1 corpus
// loader consumes the spec markdown as plain mdast — no syntax extensions,
// no frontmatter, no GFM tables. The grammar/altname/canonical content all
// lives in standard CommonMark constructs (headings, paragraphs, bullet
// lists, italics, bold), which keeps parsing predictable and the loader
// independent of any spec-side formatting drift.

import { remark } from "remark";
import type { Root } from "mdast";

/**
 * Parse a spec markdown document into an mdast Root. Pure function;
 * caller is responsible for reading the file content (so this module
 * stays free of fs concerns and is trivially testable with string
 * fixtures).
 */
export function parseMarkdown(content: string): Root {
  return remark().parse(content);
}

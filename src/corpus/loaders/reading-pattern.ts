// src/corpus/loaders/reading-pattern.ts
//
// D6 — loads the reading_pattern axis from Turn 7. The simplest
// post-Turn-4 axis loader: one file, one axis, six grammars
// (RP-1..RP-6) with inline altnames, no supersession, no
// architectural treatment overrides.

import {
  extractAltnameBucket,
  extractGrammarBlock,
  walkHeadingTree,
} from "../parser/index.js";
import type { Grammar } from "../../types/grammar.js";
import { loadHeadingTree, resolveSpecPath } from "./utils.js";

const HEADING_ID_PATTERN = /^RP-\d+\.\s+/;

export function loadReadingPatternGrammars(specRoot: string): Grammar[] {
  const filePath = resolveSpecPath(
    specRoot,
    "turns",
    "palate-grammar-survey-v0.2-turn7-reading-pattern.md",
  );
  const tree = loadHeadingTree(filePath);

  const out: Grammar[] = [];
  for (const node of walkHeadingTree(tree)) {
    if (!HEADING_ID_PATTERN.test(node.text.trim())) continue;
    const shell = extractGrammarBlock(node, { axis: "reading_pattern" });
    const altnames = extractAltnameBucket(node.contentBlocks);
    out.push({ ...shell, altnames });
  }
  return out;
}

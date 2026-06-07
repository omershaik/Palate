// src/corpus/loaders/utils.ts
//
// Shared helpers for the per-document axis loaders. The loaders compose
// these to: read a markdown file, parse it, walk its heading tree, and
// extract grammar blocks at a configurable depth.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AXIS_PREFIX,
  buildHeadingTree,
  extractGrammarBlock,
  parseMarkdown,
  walkHeadingTree,
  type ExtractGrammarBlockOptions,
  type HeadingNode,
} from "../parser/index.js";
import type { Axis } from "../../types/axis.js";
import type { Grammar } from "../../types/grammar.js";
import { emptyAltnameBucket } from "../parser/altname-bucket.js";

/**
 * GrammarShell is a Grammar without altnames. The pre-Turn-4 axis
 * loaders (D1, D2, D3) produce shells; the Turn 4 altname merger (D7)
 * fills in altnames to produce full Grammars. Post-Turn-4 loaders
 * (D4, D5, D6) populate altnames inline at extraction time.
 */
export type GrammarShell = Omit<Grammar, "altnames">;

/** Read a UTF-8 markdown file and return its mdast heading tree. */
export function loadHeadingTree(filePath: string): HeadingNode[] {
  const content = readFileSync(filePath, "utf-8");
  const root = parseMarkdown(content);
  return buildHeadingTree(root);
}

/** Resolve a path under a spec root (the directory containing turns/ + derived/). */
export function resolveSpecPath(specRoot: string, ...parts: string[]): string {
  return resolve(specRoot, ...parts);
}

/**
 * Wrap a shell with an empty altname bucket. Used by the merge step in
 * loadCorpus when a shell doesn't yet have altnames assigned (e.g.,
 * before the Turn 4 merger runs).
 */
export function shellToGrammar(shell: GrammarShell): Grammar {
  return { ...shell, altnames: emptyAltnameBucket() };
}

/**
 * Reverse map AXIS_PREFIX. Given a heading prefix like "TYPE", returns
 * the Axis. Used by Turn 3's mixed-axis parser to classify grammar
 * headings without prior knowledge of which axis a heading belongs to.
 */
export function axisFromPrefix(prefix: string): Axis | null {
  for (const [axis, p] of Object.entries(AXIS_PREFIX)) {
    if (p === prefix) return axis as Axis;
  }
  return null;
}

/** Pattern matching the leading "PREFIX-N" or "PREFIX-Na" portion of a
 *  grammar heading. Captures only the prefix (group 1). */
const PREFIX_PATTERN = /^([A-Z]+)-\d+[a-z]?\.\s+/;

/**
 * Extract every grammar heading reachable from the given top-level nodes,
 * regardless of depth. Used by Turn 3 patches (which mixes H2 and H3
 * grammar headings) and by the per-axis loaders that want to find all
 * grammar entries within a sub-tree.
 *
 * Headings whose prefix doesn't match any known axis are skipped.
 * Headings whose prefix matches but extraction fails (e.g., malformed
 * content) propagate the error — the loader should not silently swallow
 * shape mismatches, since they indicate either a spec bug or a parser
 * bug, both of which warrant attention.
 *
 * If `axisFilter` is provided, only headings classified to those axes
 * are extracted; others are silently skipped (used by the per-axis
 * loaders that want only their slice of Turn 3).
 */
export function extractAllGrammarHeadings(
  nodes: HeadingNode[],
  options: { axisFilter?: ReadonlyArray<Axis> } = {},
): GrammarShell[] {
  const result: GrammarShell[] = [];
  const allowedAxes = options.axisFilter
    ? new Set<Axis>(options.axisFilter)
    : null;

  for (const node of walkHeadingTree(nodes)) {
    const match = PREFIX_PATTERN.exec(node.text.trim());
    if (match === null) continue;
    const prefix = match[1]!;
    const axis = axisFromPrefix(prefix);
    if (axis === null) continue;
    if (allowedAxes !== null && !allowedAxes.has(axis)) continue;

    const opts: ExtractGrammarBlockOptions = { axis };
    result.push(extractGrammarBlock(node, opts));
  }

  return result;
}

/**
 * Extract grammar headings from the children of a specific parent
 * heading. Used when a doc has a top-level "AXIS N — TYPOGRAPHY GRAMMAR"
 * H1 with H2 grammar children: pass the H1 node, the H2 grammars come
 * back. The extractor descends through children with extractAllGrammarHeadings.
 */
export function extractGrammarsFromSection(
  parent: HeadingNode,
  options: ExtractGrammarBlockOptions,
): GrammarShell[] {
  const result: GrammarShell[] = [];
  for (const child of parent.children) {
    const match = PREFIX_PATTERN.exec(child.text.trim());
    // Allow bare-number headings too (v0.1 Layout case); extractGrammarBlock
    // synthesizes the prefix from options.axisPrefix when it's missing.
    if (
      match === null &&
      !/^\d+[a-z]?\.\s+/.test(child.text.trim())
    ) {
      continue;
    }
    result.push(extractGrammarBlock(child, options));
  }
  return result;
}

/**
 * Find a heading by exact-match text. Used by axis loaders to locate the
 * "AXIS N — FOO GRAMMAR" parent heading in multi-axis documents.
 */
export function findTopLevelHeading(
  nodes: HeadingNode[],
  predicate: (text: string) => boolean,
): HeadingNode | undefined {
  for (const node of nodes) {
    if (predicate(node.text)) return node;
  }
  return undefined;
}

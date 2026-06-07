// src/corpus/loaders/turn4-altnames.ts
//
// D7 — parses the Turn 4 (revised) altnames document and merges its
// altname blocks into the grammar shells produced by D1, D2, D3.
//
// Turn 4's structure: H1 per axis ("# AXIS N — X GRAMMAR ALTNAMES
// (REVISED)"), H2 grammar headings under each H1 ("## LAYOUT-1.
// Vertical-Rhythm Editorial"), and a five-item bullet list under each
// grammar heading where each item begins with "**Vibes:**" /
// "**Brand exemplars:**" / "**Vernacular labels:**" / "**Anti-vibes:**" /
// "**Compositional intent:**".
//
// Turn 4 uses POST-supersession ids (LAYOUT-3a, LAYOUT-4b, COLOR-8a,
// COMP-8b, etc.), so no translation table is needed for the post-
// Turn-3 grammars D1/D2/D3 produce. The one exception is LAYOUT-11
// (Side-Scroll), which Turn 4 still has as a top-level grammar but
// D1 demotes to a substyle of LAYOUT-9 per Turn 9 §1.1. Per the spec's
// routing intent ("Side-Scroll briefs route to Catalog for v0.1"),
// LAYOUT-11's altnames are merged INTO LAYOUT-9's altnames rather
// than dropped.
//
// Validation per the kickoff D7 adjustment: every shell from the five
// pre-Turn-4 axes must end up with all five buckets non-empty after
// merge. Failures aggregate into a single LoadError (so a contributor
// fixing the spec sees the full picture in one error message).

import {
  buildHeadingTree,
  extractAltnameBucket,
  parseMarkdown,
  walkHeadingTree,
} from "../parser/index.js";
import type { AltnameBucket, Grammar } from "../../types/grammar.js";
import { LoadError, type LoadFailure } from "../../types/corpus.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  axisFromPrefix,
  type GrammarShell,
} from "./utils.js";
import type { Axis } from "../../types/axis.js";

// ---------------------------------------------------------------------------
// Loading Turn 4 altnames into a grammar-id keyed map
// ---------------------------------------------------------------------------

const TURN4_FILENAME = "palate-grammar-survey-v0.2-turn4-revised-altnames.md";

const HEADING_ID_PATTERN = /^(?:([A-Z]+)-)(\d+[a-z]?)\.\s+/;

/**
 * Parse Turn 4 and return a map from grammar id to AltnameBucket.
 * Walks every heading, treats any heading whose text begins with a
 * known axis prefix + numeric id as a grammar block, and extracts
 * altnames from its contentBlocks.
 *
 * Headings that don't match the prefix pattern (the document's H1
 * axis-section headings, the "WHAT CHANGED" tail) are skipped.
 */
export function loadTurn4Altnames(specRoot: string): Map<string, AltnameBucket> {
  const filePath = resolve(specRoot, "turns", TURN4_FILENAME);
  const content = readFileSync(filePath, "utf-8");
  const tree = buildHeadingTree(parseMarkdown(content));

  const result = new Map<string, AltnameBucket>();
  for (const node of walkHeadingTree(tree)) {
    const match = HEADING_ID_PATTERN.exec(node.text.trim());
    if (match === null) continue;
    const prefix = match[1]!;
    const num = match[2]!;
    if (axisFromPrefix(prefix) === null) continue;

    const grammarId = `${prefix}-${num}`;
    const altnames = extractAltnameBucket(node.contentBlocks);
    result.set(grammarId, altnames);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Merging altnames into pre-Turn-4 grammar shells
// ---------------------------------------------------------------------------

/**
 * Bundle of grammar shells produced by D1, D2, D3 (Layout, Typography,
 * Color, Component, Motion). The merger consumes this shape and
 * returns the same shape with shells replaced by full Grammars.
 */
export interface PreTurn4Shells {
  layout: GrammarShell[];
  typography: GrammarShell[];
  color: GrammarShell[];
  component: GrammarShell[];
  motion: GrammarShell[];
}

/** Merged result with altnames populated on every grammar. */
export interface PreTurn4Grammars {
  layout: Grammar[];
  typography: Grammar[];
  color: Grammar[];
  component: Grammar[];
  motion: Grammar[];
}

/**
 * Merge Turn 4 altnames into the pre-Turn-4 shells. Validates that
 * every shell ends up with all five buckets populated. On any
 * validation failure, throws a LoadError aggregating every problem
 * found.
 */
export function mergeTurn4Altnames(
  shells: PreTurn4Shells,
  altnamesByGrammarId: Map<string, AltnameBucket>,
): PreTurn4Grammars {
  // Apply the LAYOUT-11 → LAYOUT-9 special case BEFORE merging into
  // shells. Side-Scroll altnames augment Catalog's altnames so vibe
  // coders saying "horizontal scroll" still route to Catalog. We
  // mutate a working copy of the map, not the caller's map.
  const workingAltnames = new Map(altnamesByGrammarId);
  const layout11 = workingAltnames.get("LAYOUT-11");
  if (layout11 !== undefined) {
    workingAltnames.delete("LAYOUT-11");
    const layout9 = workingAltnames.get("LAYOUT-9");
    if (layout9 !== undefined) {
      workingAltnames.set(
        "LAYOUT-9",
        concatBuckets(layout9, layout11),
      );
    } else {
      // No LAYOUT-9 altnames to merge into — store LAYOUT-11's
      // altnames under LAYOUT-9 directly. Unlikely in practice, but
      // defensive.
      workingAltnames.set("LAYOUT-9", layout11);
    }
  }

  const failures: LoadFailure[] = [];

  const merged: PreTurn4Grammars = {
    layout: mergeAxis(shells.layout, "layout", workingAltnames, failures),
    typography: mergeAxis(
      shells.typography,
      "typography",
      workingAltnames,
      failures,
    ),
    color: mergeAxis(shells.color, "color", workingAltnames, failures),
    component: mergeAxis(
      shells.component,
      "component",
      workingAltnames,
      failures,
    ),
    motion: mergeAxis(shells.motion, "motion", workingAltnames, failures),
  };

  if (failures.length > 0) {
    throw new LoadError(failures);
  }

  return merged;
}

/**
 * Merge altnames into one axis's shells. Each shell's id is looked up
 * in the altnames map; missing blocks and empty buckets are recorded
 * as LoadFailures. Returns full Grammars (with altnames populated)
 * when validation passes for that shell; otherwise returns a Grammar
 * with empty buckets so the caller can still produce a typed array
 * (the LoadError thrown after all axes process aborts the load
 * regardless).
 */
function mergeAxis(
  shells: GrammarShell[],
  axis: Axis,
  altnamesByGrammarId: Map<string, AltnameBucket>,
  failures: LoadFailure[],
): Grammar[] {
  const out: Grammar[] = [];
  for (const shell of shells) {
    const altnames = altnamesByGrammarId.get(shell.id);
    if (altnames === undefined) {
      failures.push({
        code: "missing_altname_block",
        source: { file: TURN4_FILENAME, grammar_id: shell.id },
        message:
          `Turn 4 altnames have no entry for grammar ${shell.id} (${shell.name}). ` +
          `Every ${axis} grammar must have an altname block.`,
      });
      out.push({
        ...shell,
        altnames: { vibes: [], brand_exemplars: [], vernacular: [], anti_vibes: [], compositional_intent: [] },
      });
      continue;
    }

    for (const bucket of EVERY_BUCKET) {
      if (altnames[bucket].length === 0) {
        failures.push({
          code: "empty_altname_bucket",
          source: { file: TURN4_FILENAME, grammar_id: shell.id, bucket },
          message:
            `Turn 4 altnames for ${shell.id} (${shell.name}) have an empty ` +
            `${bucket} bucket. Every grammar must have all five buckets non-empty.`,
        });
      }
    }

    out.push({ ...shell, altnames });
  }
  return out;
}

const EVERY_BUCKET: ReadonlyArray<keyof AltnameBucket> = [
  "vibes",
  "brand_exemplars",
  "vernacular",
  "anti_vibes",
  "compositional_intent",
];

/**
 * Concatenate two altname buckets element-wise. Used by the
 * LAYOUT-11 → LAYOUT-9 merge.
 */
function concatBuckets(a: AltnameBucket, b: AltnameBucket): AltnameBucket {
  return {
    vibes: [...a.vibes, ...b.vibes],
    brand_exemplars: [...a.brand_exemplars, ...b.brand_exemplars],
    vernacular: [...a.vernacular, ...b.vernacular],
    anti_vibes: [...a.anti_vibes, ...b.anti_vibes],
    compositional_intent: [...a.compositional_intent, ...b.compositional_intent],
  };
}

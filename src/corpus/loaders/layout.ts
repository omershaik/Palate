// src/corpus/loaders/layout.ts
//
// D1 — loads the layout axis. Layout is the most patch-heavy axis in
// v0.1; its source content lives in two files plus one synthesis-level
// override:
//
//   1. spec/turns/palate-grammar-survey-v0.1.md
//      Original layout survey. 11 grammars, bare-number headings
//      ("## 1. Vertical-Rhythm Editorial"), section labels in v0.1
//      vocabulary ("Compositional logic", "Motion vocabulary").
//
//   2. spec/turns/palate-grammar-survey-v0.2-turn3-patches.md
//      Adds LAYOUT-3a/b/c (Bento split) and LAYOUT-4a/b/c
//      (Hero-and-Stack split). Retires LAYOUT-3 and LAYOUT-4.
//
//   3. spec/turns/palate-grammar-survey-v0.2-turn9-synthesis.md (§1.1)
//      Records that LAYOUT-11 (Side-Scroll) is treated as a substyle
//      within LAYOUT-9 (Catalog) for v0.1. This is encoded here as a
//      post-load transformation rather than a fact in Turn 3, because
//      Turn 3 doesn't speak to it.
//
// Final layout count: 14 grammars (LAYOUT-1, -2, -3a, -3b, -3c, -4a,
// -4b, -4c, -5..-10), with Side-Scroll embedded as a substyle of
// LAYOUT-9.

import {
  V01_LAYOUT_LABEL_TO_FIELD,
  extractGrammarBlock,
} from "../parser/index.js";
import type { Substyle } from "../../types/grammar.js";
import {
  type GrammarShell,
  loadHeadingTree,
  resolveSpecPath,
} from "./utils.js";
import {
  TURN3_RETIRED_GRAMMAR_IDS,
  loadTurn3Patches,
} from "./turn3-patches.js";

/**
 * Load the layout axis grammars. Returns 14 GrammarShells, ordered by
 * canonical id: LAYOUT-1, LAYOUT-2, LAYOUT-3a, LAYOUT-3b, LAYOUT-3c,
 * LAYOUT-4a, LAYOUT-4b, LAYOUT-4c, LAYOUT-5..LAYOUT-10.
 */
export function loadLayoutGrammars(specRoot: string): GrammarShell[] {
  const v01Shells = loadV01LayoutShells(specRoot);
  const turn3 = loadTurn3Patches(specRoot);
  const turn3Layout = turn3.newGrammarsByAxis.get("layout") ?? [];

  // 1. Drop retired grammars from v0.1 Layout.
  const retired = TURN3_RETIRED_GRAMMAR_IDS.get("layout") ?? new Set();
  const surviving = v01Shells.filter((g) => !retired.has(g.id));

  // 2. Add Turn 3's new layout grammars.
  const merged: GrammarShell[] = [...surviving, ...turn3Layout];

  // 3. Demote LAYOUT-11 (Side-Scroll) into a substyle of LAYOUT-9
  //    (Catalog) per Turn 9 §1.1.
  const demoted = applySideScrollDemotion(merged);

  // 4. Sort by canonical id ordering.
  return sortLayoutGrammars(demoted);
}

/**
 * Parse the v0.1 Layout document. The file's H1 is "Palate Grammar
 * Survey v0.1"; grammar headings are H2 children. The v0.1 schema uses
 * "Compositional logic" + "Motion vocabulary" instead of "Internal
 * logic", so the V01_LAYOUT_LABEL_TO_FIELD map merges them into the
 * Grammar.internal_logic field.
 *
 * v0.1 Layout headings have NO axis prefix ("## 1. Vertical-Rhythm
 * Editorial"); extractGrammarBlock synthesizes the LAYOUT- prefix from
 * the configured axis.
 */
function loadV01LayoutShells(specRoot: string): GrammarShell[] {
  const filePath = resolveSpecPath(
    specRoot,
    "turns",
    "palate-grammar-survey-v0.1.md",
  );
  const tree = loadHeadingTree(filePath);

  // Walk the H1's H2 children. The doc only has one H1 ("Palate Grammar
  // Survey v0.1"), and grammar entries are its direct H2 descendants.
  const root = tree[0];
  if (root === undefined) {
    throw new Error(
      `loadV01LayoutShells: no top-level heading in ${filePath}`,
    );
  }

  const shells: GrammarShell[] = [];
  for (const h2 of root.children) {
    if (h2.depth !== 2) continue;
    // The doc has H2 sub-sections that aren't grammars (a "Schema"
    // section near the top). Skip headings that don't match the
    // grammar-heading pattern.
    if (!isGrammarHeading(h2.text)) continue;
    const shell = extractGrammarBlock(h2, {
      axis: "layout",
      labelToField: V01_LAYOUT_LABEL_TO_FIELD,
    });
    shells.push(shell);
  }
  return shells;
}

/** Heading-text pattern test for a grammar entry (PREFIX-N or bare N). */
function isGrammarHeading(text: string): boolean {
  return /^(?:[A-Z]+-)?\d+[a-z]?\.\s+/.test(text.trim());
}

/**
 * Demote LAYOUT-11 (Side-Scroll) into a substyle of LAYOUT-9 (Catalog).
 * The full LAYOUT-11 grammar is removed from the array; its name and a
 * concatenated definition (definition + distinguishing edge) become a
 * Substyle entry under LAYOUT-9.
 *
 * If LAYOUT-9 or LAYOUT-11 is missing, the function logs (via thrown
 * Error) — both should be present after the merge step. A missing
 * source-of-truth grammar is a load-time bug, not a runtime concern.
 */
function applySideScrollDemotion(shells: GrammarShell[]): GrammarShell[] {
  const layout11 = shells.find((g) => g.id === "LAYOUT-11");
  const layout9Index = shells.findIndex((g) => g.id === "LAYOUT-9");

  if (layout11 === undefined || layout9Index === -1) {
    throw new Error(
      `applySideScrollDemotion: expected LAYOUT-9 and LAYOUT-11 in input ` +
        `(found LAYOUT-9: ${layout9Index !== -1}, LAYOUT-11: ${layout11 !== undefined})`,
    );
  }

  const sideScrollSubstyle: Substyle = {
    id: "LAYOUT-9/side-scroll",
    name: "Side-Scroll / Horizontal",
    // Concat definition + distinguishing edge so the substyle carries
    // enough prose for downstream consumers to understand it. Lossy
    // (we drop registers, internal logic, failure mode) but acceptable
    // for v0.1 — Side-Scroll's full grammar definition is preserved in
    // the spec turns themselves.
    definition: [layout11.definition, layout11.distinguishing_edge]
      .filter((s) => s.length > 0)
      .join(" "),
    parent_grammar_id: "LAYOUT-9",
  };

  // Build the new LAYOUT-9 with the Side-Scroll substyle appended.
  const layout9 = shells[layout9Index]!;
  const updatedLayout9: GrammarShell = {
    ...layout9,
    substyles: [...layout9.substyles, sideScrollSubstyle],
  };

  // Return the same array minus LAYOUT-11, with LAYOUT-9 replaced.
  return shells
    .filter((g) => g.id !== "LAYOUT-11")
    .map((g) => (g.id === "LAYOUT-9" ? updatedLayout9 : g));
}

/**
 * Sort layout grammars by canonical id. Numeric component sorts
 * numerically; letter suffix (3a, 3b, 3c, 4a, 4b, 4c) sorts
 * alphabetically within the same numeric base.
 */
function sortLayoutGrammars(shells: GrammarShell[]): GrammarShell[] {
  return [...shells].sort((a, b) => compareGrammarIds(a.id, b.id));
}

const ID_SUFFIX_PATTERN = /^([A-Z]+)-(\d+)([a-z]?)$/;

function compareGrammarIds(a: string, b: string): number {
  const ma = ID_SUFFIX_PATTERN.exec(a);
  const mb = ID_SUFFIX_PATTERN.exec(b);
  if (ma === null || mb === null) return a.localeCompare(b);
  // ma[1] is the prefix; assume same axis
  const numA = parseInt(ma[2]!, 10);
  const numB = parseInt(mb[2]!, 10);
  if (numA !== numB) return numA - numB;
  return (ma[3] ?? "").localeCompare(mb[3] ?? "");
}

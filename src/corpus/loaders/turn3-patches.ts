// src/corpus/loaders/turn3-patches.ts
//
// Parses Turn 3 (palate-grammar-survey-v0.2-turn3-patches.md) once and
// returns the new grammar shells per axis, keyed by axis name. Each
// pre-Turn-4 axis loader (D1 layout, D2 typography+color, D3
// component+motion) consults this module's output to apply its
// supersession rules.
//
// The supersession map below encodes WHICH original-id grammars are
// retired by Turn 3. The mapping is small enough to hardcode in v0.1;
// every entry was confirmed against Turn 3's "Summary of changes" and
// against each axis's "PATCHES TO X GRAMMAR" section.
//
// One Turn 3 supersession is NOT in this map: Side-Scroll's demotion
// from layout grammar to substyle of Catalog. That decision is recorded
// in Turn 9 §1.1 (the synthesis), not in Turn 3 itself, so the layout
// loader applies it as a post-Turn-3 step.

import type { Axis } from "../../types/axis.js";
import {
  type GrammarShell,
  extractAllGrammarHeadings,
  loadHeadingTree,
  resolveSpecPath,
} from "./utils.js";

/**
 * Grammar ids retired by Turn 3, keyed by axis. The ids are the
 * pre-supersession ids as produced by parsing the Turn 0/Turn 1/Turn 2
 * source documents (e.g., LAYOUT-3 = Bento Modular in v0.1 Layout).
 */
export const TURN3_RETIRED_GRAMMAR_IDS: ReadonlyMap<
  Axis,
  ReadonlySet<string>
> = new Map<Axis, ReadonlySet<string>>([
  // Bento Modular (LAYOUT-3) → split into 3a/3b/3c.
  // Hero-and-Stack (LAYOUT-4) → split into 4a/4b/4c.
  ["layout", new Set(["LAYOUT-3", "LAYOUT-4"])],
  // Kinetic-Variable (TYPE-7) → migrates to Motion as a substyle.
  ["typography", new Set(["TYPE-7"])],
  // Single-Accent System (COLOR-8) → split into 8a/8b.
  ["color", new Set(["COLOR-8"])],
  // Mono-Density (COMP-8) → split into 8a/8b.
  ["component", new Set(["COMP-8"])],
  // Motion has no retirements, only additions.
  ["motion", new Set()],
  // Other axes are unaffected by Turn 3.
  ["imagery", new Set()],
  ["density", new Set()],
  ["voice", new Set()],
  ["reading_pattern", new Set()],
]);

/**
 * Substyle removals encoded by Turn 3. Map from grammar id to substyle
 * names (matched case-insensitively against Substyle.name) that should
 * be filtered out of the parent grammar's substyles array.
 *
 * Apple-Refined → migrated from Soft-Container (COMP-2) to
 * Glass / Layered (COMP-6) as the Light-Translucent substyle.
 */
export const TURN3_REMOVED_SUBSTYLES: ReadonlyMap<
  string,
  ReadonlySet<string>
> = new Map<string, ReadonlySet<string>>([
  ["COMP-2", new Set(["apple-refined"])],
]);

/** New grammars added by Turn 3, grouped by axis. Populated lazily on
 *  first call to loadTurn3Patches. */
export interface Turn3Patches {
  newGrammarsByAxis: ReadonlyMap<Axis, ReadonlyArray<GrammarShell>>;
}

/**
 * Parse Turn 3 patches from disk. The file mixes axis sections and uses
 * both H2 and H3 for new grammar definitions (Motion's additions are H2;
 * Layout/Color/Component additions are H3 under "splits into" H2
 * sections). extractAllGrammarHeadings walks every heading regardless
 * of depth and classifies by prefix, which handles both shapes.
 */
export function loadTurn3Patches(specRoot: string): Turn3Patches {
  const filePath = resolveSpecPath(
    specRoot,
    "turns",
    "palate-grammar-survey-v0.2-turn3-patches.md",
  );
  const tree = loadHeadingTree(filePath);
  const allShells = extractAllGrammarHeadings(tree);

  const byAxis: Map<Axis, GrammarShell[]> = new Map();
  for (const shell of allShells) {
    const existing = byAxis.get(shell.axis);
    if (existing === undefined) {
      byAxis.set(shell.axis, [shell]);
    } else {
      existing.push(shell);
    }
  }

  // Apply removals to substyles where Turn 3 says so. The map applies to
  // Turn 3's NEW grammars only — substyle removals on EXISTING grammars
  // (Apple-Refined removal from COMP-2) are handled by the per-axis
  // loader, since COMP-2 is parsed from Turn 2, not Turn 3.

  return { newGrammarsByAxis: byAxis };
}

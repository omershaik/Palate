// src/corpus/loaders/component-motion.ts
//
// D3 — loads component and motion from Turn 2, then applies Turn 3's
// patches:
//
//   Component (8 → 9):
//     COMP-8 (Mono-Density) retired and split into:
//       COMP-8a (Application-Density)
//       COMP-8b (Marketing-Density)
//     COMP-2 (Soft-Container) loses its Apple-Refined substyle (the
//     substyle migrates to COMP-6 Glass / Layered, but COMP-6 already
//     has Light-Translucent which is essentially the same — Turn 3
//     consolidates them; v0.1 keeps Light-Translucent and just removes
//     Apple-Refined from COMP-2).
//
//   Motion (7 → 9):
//     MOTION-8 (Atmospheric-Depth) added.
//     MOTION-9 (Loading-and-Latency) added.
//     MOTION-7 (Kinetic-Expressive) gains the Variable-Font Kinetic
//     Typography substyle (migrated from TYPE-7).

import {
  extractGrammarBlock,
  type HeadingNode,
} from "../parser/index.js";
import type { Axis } from "../../types/axis.js";
import type { Substyle } from "../../types/grammar.js";
import {
  type GrammarShell,
  findTopLevelHeading,
  loadHeadingTree,
  resolveSpecPath,
} from "./utils.js";
import {
  TURN3_REMOVED_SUBSTYLES,
  TURN3_RETIRED_GRAMMAR_IDS,
  loadTurn3Patches,
} from "./turn3-patches.js";

export interface ComponentAndMotionShells {
  component: GrammarShell[];
  motion: GrammarShell[];
}

/**
 * The Variable-Font Kinetic Typography substyle text from Turn 3:
 * "variable font axes animate in response to scroll, hover, or time.
 * Fraunces stretching its `SOFT` axis as scroll progresses. Type
 * foundry showcases."
 *
 * Hardcoded here because Turn 3 expresses the substyle migration as
 * prose with an inline list rather than as a parseable grammar block,
 * and a one-line constant beats a Turn-3-specific list parser for v0.1
 * simplicity.
 */
const VARIABLE_FONT_KINETIC_SUBSTYLE: Omit<Substyle, "parent_grammar_id"> = {
  id: "MOTION-7/variable-font-kinetic-typography",
  name: "Variable-Font Kinetic Typography",
  definition:
    "Variable font axes animate in response to scroll, hover, or time. " +
    "Fraunces stretching its SOFT axis as scroll progresses. Type foundry " +
    "showcases. (Migrated from Typography Axis 1's TYPE-7 per Turn 3.)",
};

/**
 * Load component and motion axes. Returns 9 component + 9 motion
 * grammar shells.
 */
export function loadComponentAndMotionGrammars(
  specRoot: string,
): ComponentAndMotionShells {
  const turn2 = loadTurn2Shells(specRoot);
  const turn3 = loadTurn3Patches(specRoot);

  const retiredComp = TURN3_RETIRED_GRAMMAR_IDS.get("component") ?? new Set();
  const retiredMotion = TURN3_RETIRED_GRAMMAR_IDS.get("motion") ?? new Set();

  // Capture original COMP-8 (Mono-Density) BEFORE retirement so COMP-8a
  // can inherit fields the spec author abbreviated (see
  // applyComp8aInheritance below).
  const originalComp8 = turn2.component.find((g) => g.id === "COMP-8");

  // 1. Drop retired grammars from Turn 2.
  const compSurviving = turn2.component.filter((g) => !retiredComp.has(g.id));
  const motionSurviving = turn2.motion.filter((g) => !retiredMotion.has(g.id));

  // 2. Apply substyle removals (COMP-2 loses Apple-Refined).
  const compAfterSubstyleRemoval = compSurviving.map(applySubstyleRemovals);

  // 3. Get Turn 3's new grammars and apply COMP-8a inheritance from
  //    original COMP-8 BEFORE merging.
  const turn3ComponentRaw = turn3.newGrammarsByAxis.get("component") ?? [];
  const turn3Component = turn3ComponentRaw.map((g) =>
    g.id === "COMP-8a" && originalComp8 !== undefined
      ? applyComp8aInheritance(g, originalComp8)
      : g,
  );
  const turn3Motion = turn3.newGrammarsByAxis.get("motion") ?? [];

  // 4. Add Variable-Font Kinetic Typography substyle to MOTION-7.
  const motionAfterSubstyleAdd = motionSurviving.map((g) =>
    g.id === "MOTION-7"
      ? {
          ...g,
          substyles: [
            ...g.substyles,
            {
              ...VARIABLE_FONT_KINETIC_SUBSTYLE,
              parent_grammar_id: "MOTION-7",
            },
          ],
        }
      : g,
  );

  const component = sortByGrammarId([
    ...compAfterSubstyleRemoval,
    ...turn3Component,
  ]);
  const motion = sortByGrammarId([
    ...motionAfterSubstyleAdd,
    ...turn3Motion,
  ]);

  return { component, motion };
}

// ---------------------------------------------------------------------------
// COMP-8a inheritance from original COMP-8 (Mono-Density)
// ---------------------------------------------------------------------------
//
// Turn 3's COMP-8a (Application-Density) section uses an author
// shorthand that expects the reader to inherit unspecified fields
// from the parent grammar that COMP-8a was split out of (original
// COMP-8 / Mono-Density). Two literal markers and one omission:
//
//   "**Canonical examples.** Same as original Mono-Density: <list>"
//      — the inline list IS the inherited content; the preamble is
//        prose that should be stripped.
//
//   "**Internal logic.** As original Mono-Density."
//      — the inherited content is original COMP-8's internal_logic;
//        the placeholder string is not real content.
//
//   (no "**Failure mode.**" section)
//      — inherits original COMP-8's failure_mode by omission.
//
// A scan of all spec turns for "As original" / "Same as original"
// found exactly two occurrences, both in COMP-8a above. So the
// inheritance is hardcoded for this one grammar rather than
// generalized — a one-case mechanism beats a general one for a
// single instance.
//
// The point: the parsed corpus represents what the spec MEANS, not
// just what it literally says. After this step, COMP-8a has real
// content for failure_mode, internal_logic, and canonical_examples,
// and the loader contract test stays strict (no exception lists).

function applyComp8aInheritance(
  comp8a: GrammarShell,
  originalComp8: GrammarShell,
): GrammarShell {
  return {
    ...comp8a,
    failure_mode:
      comp8a.failure_mode.length > 0
        ? comp8a.failure_mode
        : originalComp8.failure_mode,
    internal_logic: isAsOriginalPlaceholder(comp8a.internal_logic, "Mono-Density")
      ? originalComp8.internal_logic
      : comp8a.internal_logic,
    canonical_examples: stripSameAsOriginalPreamble(
      comp8a.canonical_examples,
      "Mono-Density",
    ),
  };
}

/** True when a list is the single-item placeholder "As original X". */
function isAsOriginalPlaceholder(items: string[], parentName: string): boolean {
  if (items.length !== 1) return false;
  const target = `as original ${parentName.toLowerCase()}`;
  return items[0]!.toLowerCase().trim() === target;
}

/**
 * Strip the leading "Same as original X:" preamble from the first item
 * of a list. The remaining content (after the colon) is the actual
 * inherited list — keep it; the preamble is noise.
 */
function stripSameAsOriginalPreamble(items: string[], parentName: string): string[] {
  if (items.length === 0) return items;
  const first = items[0]!;
  const prefix = `same as original ${parentName.toLowerCase()}:`;
  if (first.toLowerCase().startsWith(prefix)) {
    const stripped = first.slice(prefix.length).trim();
    return stripped.length > 0
      ? [stripped, ...items.slice(1)]
      : items.slice(1);
  }
  return items;
}

/**
 * Parse the Turn 2 source file. Same shape as Turn 1: top H1 + intro,
 * then two H1 axis blocks ("# AXIS 3 — COMPONENT GRAMMAR", "# AXIS 4 —
 * MOTION GRAMMAR"), each with H2 grammar children.
 */
function loadTurn2Shells(specRoot: string): ComponentAndMotionShells {
  const filePath = resolveSpecPath(
    specRoot,
    "turns",
    "palate-grammar-survey-v0.2-turn2-component-motion.md",
  );
  const tree = loadHeadingTree(filePath);

  // Match the "AXIS N — X GRAMMAR" pattern specifically (see
  // imagery-density.ts for the bug this prevents).
  const componentHeading = findTopLevelHeading(tree, (text) =>
    /^AXIS\s+\d+\s+—\s+COMPONENT GRAMMAR$/i.test(text),
  );
  const motionHeading = findTopLevelHeading(tree, (text) =>
    /^AXIS\s+\d+\s+—\s+MOTION GRAMMAR$/i.test(text),
  );

  if (componentHeading === undefined || motionHeading === undefined) {
    throw new Error(
      `loadTurn2Shells: missing axis section heading in ${filePath} ` +
        `(component: ${componentHeading !== undefined}, ` +
        `motion: ${motionHeading !== undefined})`,
    );
  }

  const component = extractH2Grammars(componentHeading.children, "component");
  const motion = extractH2Grammars(motionHeading.children, "motion");
  return { component, motion };
}

function extractH2Grammars(
  candidates: ReadonlyArray<HeadingNode>,
  axis: Axis,
): GrammarShell[] {
  const out: GrammarShell[] = [];
  for (const node of candidates) {
    if (node.depth !== 2) continue;
    if (!isGrammarHeading(node.text)) continue;
    out.push(extractGrammarBlock(node, { axis }));
  }
  return out;
}

function isGrammarHeading(text: string): boolean {
  return /^(?:[A-Z]+-)?\d+[a-z]?\.\s+/.test(text.trim());
}

/**
 * Apply per-grammar substyle removal rules from
 * TURN3_REMOVED_SUBSTYLES. Match is case-insensitive on substyle
 * slug-ish names; we accept any substyle whose slug starts with the
 * configured removal prefix to handle "Apple-Refined" vs "apple-refined".
 */
function applySubstyleRemovals(grammar: GrammarShell): GrammarShell {
  const removals = TURN3_REMOVED_SUBSTYLES.get(grammar.id);
  if (removals === undefined || removals.size === 0) return grammar;
  const filtered = grammar.substyles.filter((s) => {
    const slug = s.id.split("/").pop() ?? "";
    return !removals.has(slug.toLowerCase());
  });
  if (filtered.length === grammar.substyles.length) return grammar;
  return { ...grammar, substyles: filtered };
}

const ID_SUFFIX_PATTERN = /^([A-Z]+)-(\d+)([a-z]?)$/;

function sortByGrammarId(shells: GrammarShell[]): GrammarShell[] {
  return [...shells].sort((a, b) => {
    const ma = ID_SUFFIX_PATTERN.exec(a.id);
    const mb = ID_SUFFIX_PATTERN.exec(b.id);
    if (ma === null || mb === null) return a.id.localeCompare(b.id);
    const numA = parseInt(ma[2]!, 10);
    const numB = parseInt(mb[2]!, 10);
    if (numA !== numB) return numA - numB;
    return (ma[3] ?? "").localeCompare(mb[3] ?? "");
  });
}

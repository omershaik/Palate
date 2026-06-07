// src/corpus/loaders/typography-color.ts
//
// D2 — loads typography and color from Turn 1, then applies Turn 3's
// patches to both axes:
//
//   Typography (7 → 6):
//     TYPE-7 (Kinetic-Variable) retired — migrates to Motion as a
//     substyle of Kinetic-Expressive.
//
//   Color (8 → 9):
//     COLOR-8 (Single-Accent System) retired and split into:
//       COLOR-8a (Marketing Single-Accent)
//       COLOR-8b (Application Single-Accent)
//
// Turn 1's file structure: top H1 + intro, then two H1 axis blocks
// ("# AXIS 1 — TYPOGRAPHY GRAMMAR", "# AXIS 2 — COLOR GRAMMAR"), each
// with H2 grammar children.

import {
  extractGrammarBlock,
  type HeadingNode,
} from "../parser/index.js";
import type { Axis } from "../../types/axis.js";
import {
  type GrammarShell,
  findTopLevelHeading,
  loadHeadingTree,
  resolveSpecPath,
} from "./utils.js";
import {
  TURN3_RETIRED_GRAMMAR_IDS,
  loadTurn3Patches,
} from "./turn3-patches.js";

export interface TypographyAndColorShells {
  typography: GrammarShell[];
  color: GrammarShell[];
}

/**
 * Load typography and color axes. Returns 6 typography + 9 color
 * grammar shells.
 */
export function loadTypographyAndColorGrammars(
  specRoot: string,
): TypographyAndColorShells {
  const turn1 = loadTurn1Shells(specRoot);
  const turn3 = loadTurn3Patches(specRoot);

  const retiredType = TURN3_RETIRED_GRAMMAR_IDS.get("typography") ?? new Set();
  const retiredColor = TURN3_RETIRED_GRAMMAR_IDS.get("color") ?? new Set();

  const typographySurviving = turn1.typography.filter(
    (g) => !retiredType.has(g.id),
  );
  const colorSurviving = turn1.color.filter((g) => !retiredColor.has(g.id));

  const turn3Typography =
    turn3.newGrammarsByAxis.get("typography") ?? [];
  const turn3Color = turn3.newGrammarsByAxis.get("color") ?? [];

  // Typography has no Turn 3 additions (only the migration out).
  // Color gets COLOR-8a + COLOR-8b added.
  const typography = sortByGrammarId([
    ...typographySurviving,
    ...turn3Typography,
  ]);
  const color = sortByGrammarId([...colorSurviving, ...turn3Color]);

  return { typography, color };
}

/**
 * Parse the Turn 1 source file, returning shells for typography and
 * color separately. Walks each "AXIS N — X GRAMMAR" H1 and extracts
 * its H2 children as grammars.
 */
function loadTurn1Shells(specRoot: string): TypographyAndColorShells {
  const filePath = resolveSpecPath(
    specRoot,
    "turns",
    "palate-grammar-survey-v0.2-turn1-typography-color.md",
  );
  const tree = loadHeadingTree(filePath);

  // Match the "AXIS N — X GRAMMAR" pattern specifically rather than
  // any heading containing the axis name, to avoid matching the
  // document title. (See imagery-density.ts for the bug this prevents.)
  const typographyHeading = findTopLevelHeading(tree, (text) =>
    /^AXIS\s+\d+\s+—\s+TYPOGRAPHY GRAMMAR$/i.test(text),
  );
  const colorHeading = findTopLevelHeading(tree, (text) =>
    /^AXIS\s+\d+\s+—\s+COLOR GRAMMAR$/i.test(text),
  );

  if (typographyHeading === undefined || colorHeading === undefined) {
    throw new Error(
      `loadTurn1Shells: missing axis section heading in ${filePath} ` +
        `(typography: ${typographyHeading !== undefined}, ` +
        `color: ${colorHeading !== undefined})`,
    );
  }

  const typography = extractH2Grammars(typographyHeading.children, "typography");
  const color = extractH2Grammars(colorHeading.children, "color");

  return { typography, color };
}

/**
 * Extract grammar shells from H2 children of a section heading. Skips
 * non-grammar H2s (intros, schema notes) by checking the heading
 * pattern before extraction.
 */
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

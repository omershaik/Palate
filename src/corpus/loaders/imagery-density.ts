// src/corpus/loaders/imagery-density.ts
//
// D4 — loads imagery and density from Turn 5. Both axes are post-
// Turn-4 (no supersession), and Turn 5 uses the inline altname
// pattern: each grammar block has its five-bucket altname list
// directly under the grammar's content. The loader uses
// extractGrammarBlock for the structural fields and
// extractAltnameBucket on the same contentBlocks for altnames,
// returning full Grammars in one pass.
//
// Final counts: imagery 9 (IMG-1..IMG-9), density 6 (DEN-1..DEN-6).

import {
  extractAltnameBucket,
  extractGrammarBlock,
  type HeadingNode,
} from "../parser/index.js";
import type { Axis } from "../../types/axis.js";
import type { Grammar } from "../../types/grammar.js";
import {
  findTopLevelHeading,
  loadHeadingTree,
  resolveSpecPath,
} from "./utils.js";

export interface ImageryAndDensityGrammars {
  imagery: Grammar[];
  density: Grammar[];
}

/**
 * Load imagery and density axes from Turn 5. Each axis is parsed
 * independently from its H1 section.
 */
export function loadImageryAndDensityGrammars(
  specRoot: string,
): ImageryAndDensityGrammars {
  const filePath = resolveSpecPath(
    specRoot,
    "turns",
    "palate-grammar-survey-v0.2-turn5-imagery-density.md",
  );
  const tree = loadHeadingTree(filePath);

  // Match the "AXIS N — X GRAMMAR" axis-section heading specifically,
  // not the document title. Turn 5's title contains "Imagery & Density
  // Grammars" (plural) which would otherwise match a loose
  // /DENSITY GRAMMAR/i pattern. The /^AXIS \d+/ prefix is the
  // disambiguator.
  const imageryHeading = findTopLevelHeading(tree, (text) =>
    /^AXIS\s+\d+\s+—\s+IMAGERY GRAMMAR$/i.test(text),
  );
  const densityHeading = findTopLevelHeading(tree, (text) =>
    /^AXIS\s+\d+\s+—\s+DENSITY GRAMMAR$/i.test(text),
  );

  if (imageryHeading === undefined || densityHeading === undefined) {
    throw new Error(
      `loadImageryAndDensityGrammars: missing axis section heading in ${filePath} ` +
        `(imagery: ${imageryHeading !== undefined}, ` +
        `density: ${densityHeading !== undefined})`,
    );
  }

  return {
    imagery: extractAxisGrammars(imageryHeading.children, "imagery"),
    density: extractAxisGrammars(densityHeading.children, "density"),
  };
}

/**
 * Extract grammar entries from H2 children of an axis section. Each
 * H2 heading produces one Grammar with structural fields from
 * extractGrammarBlock and altnames from extractAltnameBucket walking
 * the same contentBlocks.
 */
function extractAxisGrammars(
  candidates: ReadonlyArray<HeadingNode>,
  axis: Axis,
): Grammar[] {
  const out: Grammar[] = [];
  for (const node of candidates) {
    if (node.depth !== 2) continue;
    if (!isGrammarHeading(node.text)) continue;
    const shell = extractGrammarBlock(node, { axis });
    const altnames = extractAltnameBucket(node.contentBlocks);
    out.push({ ...shell, altnames });
  }
  return out;
}

function isGrammarHeading(text: string): boolean {
  return /^(?:[A-Z]+-)?\d+[a-z]?\.\s+/.test(text.trim());
}

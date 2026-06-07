// src/corpus/loaders/pre-turn4.ts
//
// Convenience composition: loads the five pre-Turn-4 axis shells
// (D1, D2, D3) and merges Turn 4 altnames into them (D7), returning
// full Grammars for layout, typography, color, component, motion.
//
// The post-Turn-4 axes (imagery, density, voice, reading_pattern)
// have inline altnames in their source documents, so they don't go
// through this path; they're loaded by separate loaders in commit 3
// of Group D.

import { loadLayoutGrammars } from "./layout.js";
import { loadTypographyAndColorGrammars } from "./typography-color.js";
import { loadComponentAndMotionGrammars } from "./component-motion.js";
import {
  loadTurn4Altnames,
  mergeTurn4Altnames,
  type PreTurn4Grammars,
  type PreTurn4Shells,
} from "./turn4-altnames.js";

/**
 * Load every pre-Turn-4 axis as full Grammars (with altnames merged).
 * Throws LoadError if Turn 4's altname blocks fail validation.
 */
export function loadPreTurn4Grammars(specRoot: string): PreTurn4Grammars {
  const shells: PreTurn4Shells = {
    layout: loadLayoutGrammars(specRoot),
    ...loadTypographyAndColorGrammars(specRoot),
    ...loadComponentAndMotionGrammars(specRoot),
  };
  const altnamesByGrammarId = loadTurn4Altnames(specRoot);
  return mergeTurn4Altnames(shells, altnamesByGrammarId);
}

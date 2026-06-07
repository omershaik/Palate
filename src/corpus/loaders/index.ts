// src/corpus/loaders/index.ts
//
// Barrel for the per-document corpus loaders. The top-level corpus
// loader (Group E1) imports from here; per-loader internals stay
// private to their files.

export { loadLayoutGrammars } from "./layout.js";
export {
  loadTypographyAndColorGrammars,
  type TypographyAndColorShells,
} from "./typography-color.js";
export {
  loadComponentAndMotionGrammars,
  type ComponentAndMotionShells,
} from "./component-motion.js";
export {
  TURN3_RETIRED_GRAMMAR_IDS,
  TURN3_REMOVED_SUBSTYLES,
  loadTurn3Patches,
  type Turn3Patches,
} from "./turn3-patches.js";
export {
  loadTurn4Altnames,
  mergeTurn4Altnames,
  type PreTurn4Shells,
  type PreTurn4Grammars,
} from "./turn4-altnames.js";
export { loadPreTurn4Grammars } from "./pre-turn4.js";
export {
  loadImageryAndDensityGrammars,
  type ImageryAndDensityGrammars,
} from "./imagery-density.js";
export { loadVoiceBlock, parseDimensionalCoordinatesText } from "./voice.js";
export { loadReadingPatternGrammars } from "./reading-pattern.js";
export {
  loadCompatibilityModel,
  type CompatibilityModel,
} from "./compatibility-model.js";
export { loadCorpus } from "../load-corpus.js";
export {
  type GrammarShell,
  shellToGrammar,
  axisFromPrefix,
  loadHeadingTree,
  resolveSpecPath,
} from "./utils.js";

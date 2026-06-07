// src/types/index.ts
//
// Barrel export for the Palate type contracts. This is the canonical
// import surface for every consumer of Palate types.
//
// The individual files are organized by concern:
//   - axis.ts            → axis identifiers, GrammarRef, Confidence
//   - grammar.ts         → Grammar, Substyle, AltnameBucket
//   - voice.ts           → VoiceDimensions, VoiceDimensionDef, VoiceProfile
//   - compatibility.ts   → BrokenCombination, CanonicalCombination,
//                          ReducedMotionFallback, AccessibilityCommitments
//   - card.ts            → Card and its constituents (CardAxes, CardTokens,
//                          CardComponents, VoiceGuidelines, CardMetadata)
//   - routing.ts         → RoutingOutput envelope and per-axis decisions
//   - brand-fingerprint  → BrandFingerprint, BrandFingerprintsFile
//   - corpus.ts          → Corpus, LoadOptions, LoadError, LoadFailure
//
// All types are exported as `type`; runtime exports (LoadError, ALL_AXES)
// are re-exported as values.

export type {
  Axis,
  GrammarRef,
  Confidence,
} from "./axis.js";
export { ALL_AXES } from "./axis.js";

export type {
  AltnameBucket,
  Substyle,
  Grammar,
} from "./grammar.js";

export type {
  VoiceDimensions,
  VoiceDimensionDef,
  VoiceProfile,
} from "./voice.js";

export type {
  BrokenCombinationFamily,
  BrokenCombination,
  CanonicalCombination,
  ReducedMotionFallback,
  AccessibilityCommitments,
} from "./compatibility.js";

export type {
  AxisSelection,
  VoiceAxisSelection,
  CardAxes,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  RadiusTokens,
  MotionTokens,
  CardTokens,
  ComponentVariantKey,
  ComponentVariant,
  ComponentRecipe,
  CardComponents,
  VoiceGuidelines,
  CardMetadata,
  Card,
} from "./card.js";

export type {
  AxisRoutingDecision,
  VoiceRoutingDecision,
  RoutedCombination,
  AxisAlternative,
  WarningSeverity,
  RoutingWarning,
  RoutingOutput,
} from "./routing.js";

export type {
  ColorSample,
  TypographyFingerprint,
  DistributionFingerprint,
  BrandFingerprint,
  BrandFingerprintsFile,
  UnfingerprintedBrand,
} from "./brand-fingerprint.js";

export type {
  CorpusVoiceBlock,
  Corpus,
  LoadOptions,
  LoadFailure,
} from "./corpus.js";
export { LoadError } from "./corpus.js";

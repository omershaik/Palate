// src/cards/tokens/index.ts
//
// Phase 3 Task 2 — combined token-builder entry point. The card
// generator (src/cards/generate.ts) calls buildTokens() with the
// routing combination's grammar ids; each axis token file produces
// its slice of the CardTokens shape.

import type { CardTokens } from "../../types/card.js";
import type { RoutedCombination } from "../../types/routing.js";
import { buildColorTokens } from "./color.js";
import { buildTypographyTokens } from "./typography.js";
import { buildSpacingTokens } from "./spacing.js";
import { buildRadiusTokens } from "./radius.js";
import { buildMotionTokens } from "./motion.js";

/**
 * Build the full CardTokens from a routed combination. Each axis's
 * token slice comes from its dedicated builder which references
 * `conventions.ts` for slot names + defaults and per-grammar lookup
 * tables for grammar-tuned values.
 *
 * Token-axis attribution:
 *   - Color tokens come from the routed Color grammar
 *   - Typography tokens come from the routed Typography grammar
 *   - Spacing tokens come from the routed Density grammar
 *   - Radius tokens come from the routed Component grammar
 *   - Motion tokens come from the routed Motion grammar
 *
 * Other axes (layout, imagery, voice, reading_pattern) don't directly
 * drive tokens — they drive component recipes (Phase 3 Task 3),
 * voice guidelines (Task 4), and other Card sections.
 */
export function buildTokens(combination: RoutedCombination): CardTokens {
  return {
    color: buildColorTokens(combination.color.grammar_id),
    typography: buildTypographyTokens(combination.typography.grammar_id),
    spacing: buildSpacingTokens(combination.density.grammar_id),
    radius: buildRadiusTokens(combination.component.grammar_id),
    motion: buildMotionTokens(combination.motion.grammar_id),
  };
}

// Re-exports for direct per-axis access if downstream consumers need
// to call individual builders.
export { buildColorTokens } from "./color.js";
export { buildTypographyTokens } from "./typography.js";
export { buildSpacingTokens } from "./spacing.js";
export { buildRadiusTokens } from "./radius.js";
export { buildMotionTokens } from "./motion.js";
export * from "./conventions.js";

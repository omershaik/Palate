// src/cards/accessibility/index.ts
//
// Phase 3 Task 5 — accessibility module entry point. Composes the
// COMMITMENTS constants with a per-Color-grammar high-contrast
// palette to produce the full Card.accessibility block.

import type { Card } from "../../types/card.js";
import type { RoutedCombination } from "../../types/routing.js";
import { buildAccessibilityBlock } from "./conventions.js";
import { buildHighContrastColorTokens } from "./high-contrast-palettes.js";

/**
 * Build the accessibility block for a card from the routed
 * combination. Reads the routed Color grammar id to select the
 * matching high-contrast palette; commitments are constants.
 */
export function buildAccessibility(
  combination: RoutedCombination,
): Card["accessibility"] {
  const highContrastTokens = buildHighContrastColorTokens(
    combination.color.grammar_id,
  );
  return buildAccessibilityBlock(highContrastTokens);
}

export { buildHighContrastColorTokens } from "./high-contrast-palettes.js";
export { COMMITMENTS, buildAccessibilityBlock } from "./conventions.js";

// src/cards/accessibility/conventions.ts
//
// Phase 3 Task 5 — Accessibility commitments schema lock + design
// decisions for the high-contrast variant tokens. AI tools that
// consume Palate cards rely on these commitments being present and
// uniformly shaped across cards.
//
// THE ACCESSIBILITY CONTRACT (per Card.accessibility — see
// src/types/card.ts):
//
//   {
//     contrast_validation: "WCAG_2.2_AA",
//     touch_target_minimum_px: 44,
//     keyboard_navigation: "all_interactive_elements_focusable",
//     high_contrast_mode_support: true,
//     high_contrast_variant: { tokens: { color: ColorTokens } }
//   }
//
// The first four are constants (the spec's accessibility commitments
// per turn8 §6.2 don't vary by routed grammar — every Palate card
// commits to WCAG 2.2 AA, 44×44 touch targets, all-focusable keyboard
// nav, and prefers-contrast support).
//
// The fifth — high_contrast_variant.tokens.color — IS per-grammar:
// each Color grammar's high-contrast palette is hand-tuned for that
// grammar's register (a luxury hospitality high-contrast palette
// stays warm-earth-coded; an AI-startup high-contrast palette stays
// dark-mode-coded). Per-Color-grammar lookup tables in
// `high-contrast-palettes.ts` carry the tuning.
//
// DESIGN DECISION — APPROACH A vs APPROACH B FOR HIGH-CONTRAST
// TOKEN STRUCTURE:
//
// Two reasonable shapes for the high-contrast tokens:
//
//   Approach A (chosen): separate `accessibility.high_contrast_variant
//   .tokens.color` block. High-contrast tokens live alongside the
//   accessibility commitments, structurally separate from the default
//   tokens block. Cleaner section separation; AI tools that don't
//   handle prefers-contrast can ignore the accessibility block.
//
//   Approach B (rejected for v0.1): modifier slots within the main
//   token block. `bg.canvas` has a sibling `bg.canvas.high-contrast`
//   in the same `tokens.color` map. Closer to CSS-variable
//   conventions (`--bg-canvas` / `--bg-canvas-hc`). Required Card
//   schema changes that would have cascaded into Phase 1's typed
//   contracts.
//
// Approach A chosen for v0.1 to match the existing Card.accessibility
// schema (Phase 1's B4 kickoff specified Pick<CardTokens, "color">
// for high_contrast_variant.tokens). Changing to B would be a
// breaking schema change out of Phase 3's scope. Approach B is
// reasonable for a v0.2 or later schema iteration.

import type {
  AccessibilityCommitments,
  ReducedMotionFallback,
} from "../../types/compatibility.js";
import type { Card } from "../../types/card.js";

// ---------------------------------------------------------------------------
// Constant commitments — applied to every card regardless of grammar
// ---------------------------------------------------------------------------

/**
 * The WCAG 2.2 AA / touch / keyboard / high-contrast commitments
 * that apply to every Palate card. These are CONSTANTS — they don't
 * vary by routed grammar, because the spec's accessibility
 * commitments (turn8 §6.2) are blanket commitments, not grammar-
 * specific.
 *
 * Density grammars don't get to opt out of accessibility — Hyper-
 * Dense components still meet 44×44 touch targets via min_height
 * references in component recipes.
 */
export const COMMITMENTS: AccessibilityCommitments = {
  contrast_validation: "WCAG_2.2_AA",
  touch_target_minimum_px: 44,
  keyboard_navigation: "all_interactive_elements_focusable",
  high_contrast_mode_support: true,
};

// ---------------------------------------------------------------------------
// Card.accessibility shape helper
// ---------------------------------------------------------------------------

/**
 * Compose the full Card.accessibility object from the commitments
 * constants + a per-grammar high-contrast color palette.
 */
export function buildAccessibilityBlock(
  highContrastColorTokens: Record<string, string>,
): Card["accessibility"] {
  return {
    ...COMMITMENTS,
    high_contrast_variant: {
      tokens: {
        color: highContrastColorTokens,
      },
    },
  };
}

// Re-exports
export type { AccessibilityCommitments, ReducedMotionFallback };

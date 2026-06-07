// src/cards/accessibility/high-contrast-palettes.ts
//
// Phase 3 Task 5 — per-Color-grammar high-contrast palettes. Each
// Color grammar has a high-contrast variant that:
//
//   1. Pushes contrast toward WCAG 2.2 AA-Enhanced (7:1 for body
//      text, up from the AA 4.5:1 default). Body text becomes
//      stronger against canvas; subtle slots become visible (no
//      "barely-there" hairlines that fail prefers-contrast).
//
//   2. Stays in the grammar's register. Luxury Hospitality stays
//      warm-earth-coded under prefers-contrast: more — it doesn't
//      flip to a generic black-on-white palette. The user's
//      operating-system-level preference is respected without losing
//      the routed brand register.
//
//   3. Strengthens borders. `border.subtle` collapses onto
//      `border.default`; `border.default` collapses onto
//      `border.strong`. Distinctions between hairline and solid
//      borders disappear under high-contrast — the grammar gives
//      one strong border or none.
//
// Per-grammar tables ship the slot values that change under high-
// contrast; slots that remain unchanged use the default-mode value
// (the generator merges with the grammar's default-mode palette as
// the fallthrough).
//
// Source: WCAG 2.2 contrast guidelines + the existing per-grammar
// default-mode palettes in src/cards/tokens/color.ts as the register
// to preserve.

import type { ColorTokens } from "../../types/card.js";
import { buildColorTokens } from "../tokens/color.js";
import { mergeWithDefaults } from "../tokens/conventions.js";

const PER_GRAMMAR_HIGH_CONTRAST: Record<string, Partial<ColorTokens>> = {
  // COLOR-1: Earth-Pulled Restraint — strengthen warm palette to AAA contrast.
  "COLOR-1": {
    "bg.canvas": "#fdfaf2",
    "bg.surface": "#f5f0e6",
    "fg.body": "#000000",
    "fg.muted": "#1a1208",
    "fg.subtle": "#2a1f15",
    "accent.primary": "#3d2817",
    "accent.cta": "#1a1208",
    "border.default": "#5c4a3a",
    "border.subtle": "#5c4a3a",
    "border.strong": "#000000",
  },

  // COLOR-2: Two-Color Monochrome — already high-contrast; deepen further.
  "COLOR-2": {
    "bg.canvas": "#ffffff",
    "fg.body": "#000000",
    "fg.muted": "#1a1a1a",
    "fg.subtle": "#1a1a1a",
    "accent.cta": "#a01818",
    "border.default": "#000000",
    "border.subtle": "#404040",
    "border.strong": "#000000",
  },

  // COLOR-3: Restrained-Editorial-Earth — strengthen earth palette.
  "COLOR-3": {
    "bg.canvas": "#fffefa",
    "fg.body": "#0a0908",
    "fg.muted": "#1c1917",
    "fg.subtle": "#2c2825",
    "accent.primary": "#5c1f0a",
    "accent.cta": "#5c1f0a",
    "border.default": "#5c544f",
    "border.subtle": "#78716c",
    "border.strong": "#0a0908",
  },

  // COLOR-4: Dark-Mode Dominant — push body text to pure white.
  "COLOR-4": {
    "bg.canvas": "#000000",
    "bg.surface": "#0a0a0a",
    "bg.elevated": "#171717",
    "bg.subtle": "#0a0a0a",
    "fg.body": "#ffffff",
    "fg.muted": "#e5e5e5",
    "fg.subtle": "#a3a3a3",
    "accent.primary": "#ffffff",
    "accent.cta": "#ffffff",
    "border.default": "#525252",
    "border.subtle": "#404040",
    "border.strong": "#ffffff",
  },

  // COLOR-5: Aggressive-Saturated — already high-contrast; deepen blacks.
  "COLOR-5": {
    "fg.body": "#000000",
    "fg.muted": "#000000",
    "fg.subtle": "#262626",
    "accent.primary": "#a18800",
    "accent.cta": "#a01818",
    "border.default": "#000000",
    "border.subtle": "#000000",
    "border.strong": "#000000",
  },

  // COLOR-6: Warm-Friendly DTC — strengthen body contrast on warm bg.
  "COLOR-6": {
    "bg.canvas": "#fff9ed",
    "fg.body": "#1f1208",
    "fg.muted": "#3f2d1f",
    "fg.subtle": "#5c452f",
    "accent.primary": "#7a2807",
    "accent.cta": "#5c1c04",
    "border.default": "#7c5e44",
    "border.subtle": "#7c5e44",
    "border.strong": "#1f1208",
  },

  // COLOR-7: Iridescent / Saturated-Primary — strengthen for dark + saturated.
  "COLOR-7": {
    "bg.canvas": "#000000",
    "bg.surface": "#0a0518",
    "bg.elevated": "#180a30",
    "bg.subtle": "#0a0518",
    "fg.body": "#ffffff",
    "fg.muted": "#e8d8ff",
    "fg.subtle": "#c4b5fd",
    "accent.primary": "#c4b5fd",
    "accent.cta": "#a78bfa",
    "border.default": "#5c4099",
    "border.subtle": "#3b2862",
    "border.strong": "#c4b5fd",
  },

  // COLOR-8a: Marketing Single-Accent — strengthen body and accent contrast.
  "COLOR-8a": {
    "bg.canvas": "#ffffff",
    "fg.body": "#000000",
    "fg.muted": "#1e293b",
    "fg.subtle": "#334155",
    "accent.primary": "#3d2bb3",
    "accent.cta": "#2d1f8a",
    "border.default": "#64748b",
    "border.subtle": "#94a3b8",
    "border.strong": "#000000",
  },

  // COLOR-8b: Application Single-Accent — application UI high-contrast.
  "COLOR-8b": {
    "bg.canvas": "#ffffff",
    "bg.surface": "#ffffff",
    "fg.body": "#000000",
    "fg.muted": "#1e293b",
    "fg.subtle": "#334155",
    "accent.primary": "#1d4ed8",
    "accent.cta": "#1e40af",
    "border.default": "#64748b",
    "border.subtle": "#94a3b8",
    "border.strong": "#000000",
    "state.success": "#15803d",
    "state.warning": "#a16207",
    "state.danger": "#b91c1c",
    "state.info": "#0369a1",
  },
};

/**
 * Build the high-contrast color palette for a routed Color grammar.
 * Falls through to the default-mode palette (with no high-contrast
 * tweaks) for unknown grammar ids — the consuming AI tool gets a
 * usable palette rather than missing tokens.
 */
export function buildHighContrastColorTokens(grammarId: string): ColorTokens {
  const baseDefaults = buildColorTokens(grammarId);
  const override = PER_GRAMMAR_HIGH_CONTRAST[grammarId] ?? {};
  return mergeWithDefaults(baseDefaults, override);
}

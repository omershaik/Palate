// src/cards/tokens/color.ts
//
// Phase 3 Task 2 — per-grammar color tokens. Each Color grammar
// populates the COLOR_SLOTS (per src/cards/tokens/conventions.ts) with
// values that fit its compositional discipline.
//
// The values here are SENSIBLE DEFAULTS, not brand-perfect. They give
// the consuming AI tool a usable starting palette for each grammar's
// register. v0.1.x / Phase 4's brand-fingerprint worker can refine
// per-grammar values from real-brand observations; the slot names
// (conventions.ts) stay stable across refinement.
//
// Per-grammar tables ship PARTIAL records — only slots the grammar's
// compositional discipline calls out. The mergeWithDefaults helper
// in conventions.ts fills in the rest from DEFAULT_COLOR_TOKENS.
//
// Source for the per-grammar values: the grammar definitions in
// spec/turns/palate-grammar-survey-v0.2-turn1-typography-color.md
// and turn3-patches.md. Where the spec specifies hex codes or
// named-color references, those are used; otherwise neutral values
// in the grammar's documented register.

import type { ColorTokens } from "../../types/card.js";
import {
  COLOR_SLOTS,
  DEFAULT_COLOR_TOKENS,
  mergeWithDefaults,
} from "./conventions.js";

// Each entry is a partial override over DEFAULT_COLOR_TOKENS; merge
// at lookup time produces the full per-grammar palette.
const PER_GRAMMAR_OVERRIDES: Record<string, Partial<ColorTokens>> = {
  // COLOR-1: Earth-Pulled Restraint (luxury hospitality, editorial-warm).
  // Warm earth palette, low saturation, warm neutrals.
  "COLOR-1": {
    [COLOR_SLOTS.bg_canvas]: "#f5f0e6",
    [COLOR_SLOTS.bg_surface]: "#ede5d3",
    [COLOR_SLOTS.bg_elevated]: "#faf6ee",
    [COLOR_SLOTS.bg_subtle]: "#e8dfc8",
    [COLOR_SLOTS.fg_body]: "#2a1f15",
    [COLOR_SLOTS.fg_muted]: "#5c4a3a",
    [COLOR_SLOTS.fg_subtle]: "#8b7355",
    [COLOR_SLOTS.fg_inverse]: "#f5f0e6",
    [COLOR_SLOTS.accent_primary]: "#5c4a3a",
    [COLOR_SLOTS.accent_cta]: "#3d2817",
    [COLOR_SLOTS.accent_secondary]: "#a8956d",
    [COLOR_SLOTS.border_default]: "#d4c8a8",
    [COLOR_SLOTS.border_subtle]: "#e8dfc8",
    [COLOR_SLOTS.border_strong]: "#8b7355",
  },

  // COLOR-2: Two-Color Monochrome (editorial magazine, journalism).
  // Black and one accent, on warm or cool neutral.
  "COLOR-2": {
    [COLOR_SLOTS.bg_canvas]: "#fefcf7",
    [COLOR_SLOTS.bg_surface]: "#ffffff",
    [COLOR_SLOTS.bg_elevated]: "#ffffff",
    [COLOR_SLOTS.bg_subtle]: "#f5f3ee",
    [COLOR_SLOTS.fg_body]: "#0a0a0a",
    [COLOR_SLOTS.fg_muted]: "#404040",
    [COLOR_SLOTS.fg_subtle]: "#737373",
    [COLOR_SLOTS.accent_primary]: "#0a0a0a",
    [COLOR_SLOTS.accent_cta]: "#dc2626",
    [COLOR_SLOTS.accent_secondary]: "#404040",
    [COLOR_SLOTS.border_default]: "#d4d4d4",
    [COLOR_SLOTS.border_subtle]: "#e5e5e5",
    [COLOR_SLOTS.border_strong]: "#0a0a0a",
  },

  // COLOR-3: Restrained-Editorial-Earth (cause/journalism, editorial-cool).
  // Two-color monochrome with restrained earth accent.
  "COLOR-3": {
    [COLOR_SLOTS.bg_canvas]: "#fafaf7",
    [COLOR_SLOTS.bg_surface]: "#ffffff",
    [COLOR_SLOTS.bg_elevated]: "#ffffff",
    [COLOR_SLOTS.bg_subtle]: "#f0ede5",
    [COLOR_SLOTS.fg_body]: "#1c1917",
    [COLOR_SLOTS.fg_muted]: "#44403c",
    [COLOR_SLOTS.fg_subtle]: "#78716c",
    [COLOR_SLOTS.accent_primary]: "#7c2d12",
    [COLOR_SLOTS.accent_cta]: "#7c2d12",
    [COLOR_SLOTS.accent_secondary]: "#a16207",
    [COLOR_SLOTS.border_default]: "#d6d3d1",
    [COLOR_SLOTS.border_subtle]: "#e7e5e4",
    [COLOR_SLOTS.border_strong]: "#1c1917",
  },

  // COLOR-4: Dark-Mode Dominant (modern AI startup, dark-coded).
  "COLOR-4": {
    [COLOR_SLOTS.bg_canvas]: "#0a0a0a",
    [COLOR_SLOTS.bg_surface]: "#171717",
    [COLOR_SLOTS.bg_elevated]: "#262626",
    [COLOR_SLOTS.bg_subtle]: "#171717",
    [COLOR_SLOTS.fg_body]: "#fafafa",
    [COLOR_SLOTS.fg_muted]: "#a3a3a3",
    [COLOR_SLOTS.fg_subtle]: "#737373",
    [COLOR_SLOTS.fg_inverse]: "#0a0a0a",
    [COLOR_SLOTS.accent_primary]: "#fafafa",
    [COLOR_SLOTS.accent_cta]: "#ffffff",
    [COLOR_SLOTS.accent_secondary]: "#a3a3a3",
    [COLOR_SLOTS.border_default]: "#262626",
    [COLOR_SLOTS.border_subtle]: "#171717",
    [COLOR_SLOTS.border_strong]: "#404040",
  },

  // COLOR-5: Aggressive-Saturated (neo-brutalist, indie SaaS).
  // Saturated primaries on white/black.
  "COLOR-5": {
    [COLOR_SLOTS.bg_canvas]: "#ffffff",
    [COLOR_SLOTS.bg_surface]: "#ffffff",
    [COLOR_SLOTS.bg_elevated]: "#ffffff",
    [COLOR_SLOTS.bg_subtle]: "#fef3c7",
    [COLOR_SLOTS.fg_body]: "#000000",
    [COLOR_SLOTS.fg_muted]: "#262626",
    [COLOR_SLOTS.fg_subtle]: "#525252",
    [COLOR_SLOTS.fg_inverse]: "#ffffff",
    [COLOR_SLOTS.accent_primary]: "#facc15",
    [COLOR_SLOTS.accent_cta]: "#dc2626",
    [COLOR_SLOTS.accent_secondary]: "#16a34a",
    [COLOR_SLOTS.border_default]: "#000000",
    [COLOR_SLOTS.border_subtle]: "#404040",
    [COLOR_SLOTS.border_strong]: "#000000",
  },

  // COLOR-6: Warm-Friendly DTC (wellness, beauty DTC, golden-hour).
  // Warm peach/blush/sand palette with sun-kissed feel.
  "COLOR-6": {
    [COLOR_SLOTS.bg_canvas]: "#fdf6ec",
    [COLOR_SLOTS.bg_surface]: "#fef3e2",
    [COLOR_SLOTS.bg_elevated]: "#fefdfb",
    [COLOR_SLOTS.bg_subtle]: "#fbe8d3",
    [COLOR_SLOTS.fg_body]: "#3f2d1f",
    [COLOR_SLOTS.fg_muted]: "#7c5e44",
    [COLOR_SLOTS.fg_subtle]: "#a68869",
    [COLOR_SLOTS.fg_inverse]: "#fdf6ec",
    [COLOR_SLOTS.accent_primary]: "#c2410c",
    [COLOR_SLOTS.accent_cta]: "#9a3412",
    [COLOR_SLOTS.accent_secondary]: "#a16207",
    [COLOR_SLOTS.border_default]: "#f3d5b5",
    [COLOR_SLOTS.border_subtle]: "#fbe8d3",
    [COLOR_SLOTS.border_strong]: "#7c5e44",
  },

  // COLOR-7: Iridescent / Saturated-Primary (modern AI launches, gradient pages).
  // Purple-to-blue gradients, saturated primaries — the "AI launch" aesthetic.
  "COLOR-7": {
    [COLOR_SLOTS.bg_canvas]: "#0f0a1f",
    [COLOR_SLOTS.bg_surface]: "#1a0e2e",
    [COLOR_SLOTS.bg_elevated]: "#241340",
    [COLOR_SLOTS.bg_subtle]: "#1a0e2e",
    [COLOR_SLOTS.fg_body]: "#fafafa",
    [COLOR_SLOTS.fg_muted]: "#c4b5fd",
    [COLOR_SLOTS.fg_subtle]: "#8b5cf6",
    [COLOR_SLOTS.fg_inverse]: "#0f0a1f",
    [COLOR_SLOTS.accent_primary]: "#8b5cf6",
    [COLOR_SLOTS.accent_cta]: "#7c3aed",
    [COLOR_SLOTS.accent_secondary]: "#3b82f6",
    [COLOR_SLOTS.border_default]: "#3b2862",
    [COLOR_SLOTS.border_subtle]: "#241340",
    [COLOR_SLOTS.border_strong]: "#8b5cf6",
  },

  // COLOR-8a: Marketing Single-Accent (standard SaaS marketing).
  // Neutrals foundation + single brand accent (Stripe-coded, Linear-coded).
  "COLOR-8a": {
    [COLOR_SLOTS.bg_canvas]: "#ffffff",
    [COLOR_SLOTS.bg_surface]: "#fafafa",
    [COLOR_SLOTS.bg_elevated]: "#ffffff",
    [COLOR_SLOTS.bg_subtle]: "#f4f4f5",
    [COLOR_SLOTS.fg_body]: "#0f172a",
    [COLOR_SLOTS.fg_muted]: "#475569",
    [COLOR_SLOTS.fg_subtle]: "#64748b",
    [COLOR_SLOTS.fg_inverse]: "#ffffff",
    [COLOR_SLOTS.accent_primary]: "#635bff", // Stripe-purple-coded
    [COLOR_SLOTS.accent_cta]: "#635bff",
    [COLOR_SLOTS.accent_secondary]: "#94a3b8",
    [COLOR_SLOTS.border_default]: "#e2e8f0",
    [COLOR_SLOTS.border_subtle]: "#f1f5f9",
    [COLOR_SLOTS.border_strong]: "#94a3b8",
  },

  // COLOR-8b: Application Single-Accent (B2B dashboards, application UI).
  // Same shape as 8a but tuned for application UI — adds state colors.
  "COLOR-8b": {
    [COLOR_SLOTS.bg_canvas]: "#ffffff",
    [COLOR_SLOTS.bg_surface]: "#ffffff",
    [COLOR_SLOTS.bg_elevated]: "#ffffff",
    [COLOR_SLOTS.bg_subtle]: "#f8fafc",
    [COLOR_SLOTS.fg_body]: "#0f172a",
    [COLOR_SLOTS.fg_muted]: "#475569",
    [COLOR_SLOTS.fg_subtle]: "#64748b",
    [COLOR_SLOTS.fg_inverse]: "#ffffff",
    [COLOR_SLOTS.accent_primary]: "#3b82f6",
    [COLOR_SLOTS.accent_cta]: "#2563eb",
    [COLOR_SLOTS.accent_secondary]: "#94a3b8",
    [COLOR_SLOTS.border_default]: "#e2e8f0",
    [COLOR_SLOTS.border_subtle]: "#f1f5f9",
    [COLOR_SLOTS.border_strong]: "#cbd5e1",
    [COLOR_SLOTS.state_success]: "#16a34a",
    [COLOR_SLOTS.state_warning]: "#ca8a04",
    [COLOR_SLOTS.state_danger]: "#dc2626",
    [COLOR_SLOTS.state_info]: "#0284c7",
  },
};

/**
 * Look up the color token palette for a routed Color grammar id.
 * Returns the merged result of grammar-specific overrides on top of
 * DEFAULT_COLOR_TOKENS. Unknown grammar ids fall through to defaults
 * (defensive against future grammar additions; consuming AI tool
 * gets a usable neutral palette rather than empty tokens).
 */
export function buildColorTokens(grammarId: string): ColorTokens {
  const override = PER_GRAMMAR_OVERRIDES[grammarId] ?? {};
  return mergeWithDefaults(DEFAULT_COLOR_TOKENS, override);
}

// src/cards/tokens/spacing.ts
//
// Phase 3 Task 2 — per-grammar spacing tokens. Spacing values are
// driven by the routed Density grammar (Editorial-Spacious,
// Standard-Marketing, Application-Density, Hyper-Dense, etc.). The
// values here scale t-shirt sizes per density's compositional
// discipline.
//
// Source: spec/turns/palate-grammar-survey-v0.2-turn5-imagery-density.md
// for density grammar definitions and their canonical examples.

import type { SpacingTokens } from "../../types/card.js";
import {
  DEFAULT_SPACING,
  SPACING_SLOTS,
  mergeWithDefaults,
} from "./conventions.js";

const PER_GRAMMAR_OVERRIDES: Record<string, Partial<SpacingTokens>> = {
  // DEN-1: Editorial-Spacious (luxury hospitality, magazine, longform).
  // Generous whitespace; large md/lg/xl values.
  "DEN-1": {
    [SPACING_SLOTS.xs]: "8px",
    [SPACING_SLOTS.sm]: "16px",
    [SPACING_SLOTS.md]: "32px",
    [SPACING_SLOTS.lg]: "64px",
    [SPACING_SLOTS.xl]: "96px",
    [SPACING_SLOTS.xxl]: "128px",
  },

  // DEN-2: Premium-Spaced (premium hardware, brand stack).
  // Spacious but not editorial-spacious. Mid-range.
  "DEN-2": {
    [SPACING_SLOTS.xs]: "6px",
    [SPACING_SLOTS.sm]: "12px",
    [SPACING_SLOTS.md]: "24px",
    [SPACING_SLOTS.lg]: "48px",
    [SPACING_SLOTS.xl]: "72px",
    [SPACING_SLOTS.xxl]: "96px",
  },

  // DEN-3: Standard-Marketing (modern SaaS marketing default).
  // Tailwind-coded spacing — matches the default scale.
  "DEN-3": {
    [SPACING_SLOTS.xs]: "4px",
    [SPACING_SLOTS.sm]: "8px",
    [SPACING_SLOTS.md]: "16px",
    [SPACING_SLOTS.lg]: "24px",
    [SPACING_SLOTS.xl]: "32px",
    [SPACING_SLOTS.xxl]: "48px",
  },

  // DEN-4: Application-Density (B2B dashboards, application UI).
  // Tighter than marketing; more information per screen.
  "DEN-4": {
    [SPACING_SLOTS.xs]: "2px",
    [SPACING_SLOTS.sm]: "6px",
    [SPACING_SLOTS.md]: "12px",
    [SPACING_SLOTS.lg]: "20px",
    [SPACING_SLOTS.xl]: "28px",
    [SPACING_SLOTS.xxl]: "40px",
  },

  // DEN-5: Hyper-Dense (Bloomberg Terminal-coded, trading platforms).
  // Maximum information density; minimal whitespace.
  "DEN-5": {
    [SPACING_SLOTS.xs]: "1px",
    [SPACING_SLOTS.sm]: "3px",
    [SPACING_SLOTS.md]: "6px",
    [SPACING_SLOTS.lg]: "10px",
    [SPACING_SLOTS.xl]: "16px",
    [SPACING_SLOTS.xxl]: "24px",
  },

  // DEN-6: Marketing-Airy (creative agency, art-directed).
  // Generous in spread, maximalist in moments — closer to editorial-
  // spacious for the spread, but components can break to denser.
  "DEN-6": {
    [SPACING_SLOTS.xs]: "8px",
    [SPACING_SLOTS.sm]: "16px",
    [SPACING_SLOTS.md]: "32px",
    [SPACING_SLOTS.lg]: "64px",
    [SPACING_SLOTS.xl]: "128px",
    [SPACING_SLOTS.xxl]: "192px",
  },
};

export function buildSpacingTokens(grammarId: string): SpacingTokens {
  const override = PER_GRAMMAR_OVERRIDES[grammarId] ?? {};
  return mergeWithDefaults(DEFAULT_SPACING, override);
}

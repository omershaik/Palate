// src/cards/tokens/typography.ts
//
// Phase 3 Task 2 — per-grammar typography tokens. Each Typography
// grammar populates font_family + scale + line_heights + (optional)
// letter_spacing.
//
// font_family carries actual family-name CSS strings (with system-font
// fallbacks); scale/line_heights/letter_spacing use TYPOGRAPHY_SLOTS
// keys per the convention.
//
// Per the kickoff B4 / PRD §4.7: token values are sensible defaults
// per grammar's compositional discipline. v0.1.x or Phase 4's worker
// can refine; the slot names stay stable.
//
// Source: spec/turns/palate-grammar-survey-v0.2-turn1-typography-color.md
// for type pairing decisions, plus brand-fingerprint typography_fingerprint
// data for canonical brands' actual fonts.

import type { TypographyTokens } from "../../types/card.js";
import {
  DEFAULT_TYPOGRAPHY_FAMILIES,
  DEFAULT_TYPOGRAPHY_LINE_HEIGHTS,
  DEFAULT_TYPOGRAPHY_SCALE,
  TYPOGRAPHY_SLOTS,
  mergeWithDefaults,
} from "./conventions.js";

interface TypographyOverride {
  font_family?: {
    display?: string;
    body?: string;
    mono?: string;
  };
  scale?: Partial<Record<string, string>>;
  line_heights?: Partial<Record<string, string | number>>;
  letter_spacing?: Record<string, string>;
}

const SYSTEM_SERIF = "Georgia, 'Times New Roman', serif";
const SYSTEM_SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SYSTEM_MONO = "ui-monospace, 'SF Mono', Menlo, Monaco, monospace";

const PER_GRAMMAR_OVERRIDES: Record<string, TypographyOverride> = {
  // TYPE-1: Two-Hand System (display serif + sans body — editorial / luxury).
  "TYPE-1": {
    font_family: {
      display: `'Tiempos Headline', 'Tiempos', ${SYSTEM_SERIF}`,
      body: `'Inter', ${SYSTEM_SANS}`,
    },
    scale: {
      [TYPOGRAPHY_SLOTS.heading_display]: "4rem",
      [TYPOGRAPHY_SLOTS.heading_section]: "2.25rem",
    },
    line_heights: {
      [TYPOGRAPHY_SLOTS.heading_display]: 1.05,
    },
    letter_spacing: {
      [TYPOGRAPHY_SLOTS.heading_display]: "-0.02em",
    },
  },

  // TYPE-2: Single-Family Discipline (one type family used at every level).
  // Stripe Press-coded: Tiempos throughout; Söhne is the modern variant.
  "TYPE-2": {
    font_family: {
      display: `'Söhne', 'Inter', ${SYSTEM_SANS}`,
      body: `'Söhne', 'Inter', ${SYSTEM_SANS}`,
    },
    scale: {
      [TYPOGRAPHY_SLOTS.heading_display]: "3.5rem",
      [TYPOGRAPHY_SLOTS.heading_section]: "2rem",
    },
    line_heights: {
      [TYPOGRAPHY_SLOTS.heading_display]: 1.1,
    },
  },

  // TYPE-3: Editorial Print Vocabulary (serif headlines, generous tracking).
  "TYPE-3": {
    font_family: {
      display: `'Tiempos Headline', 'Playfair Display', ${SYSTEM_SERIF}`,
      body: `'Tiempos', 'Source Serif Pro', ${SYSTEM_SERIF}`,
    },
    scale: {
      [TYPOGRAPHY_SLOTS.heading_display]: "4.5rem",
      [TYPOGRAPHY_SLOTS.heading_section]: "2.5rem",
    },
    line_heights: {
      [TYPOGRAPHY_SLOTS.heading_display]: 1.05,
      [TYPOGRAPHY_SLOTS.body_default]: 1.6,
    },
    letter_spacing: {
      [TYPOGRAPHY_SLOTS.heading_display]: "-0.01em",
      [TYPOGRAPHY_SLOTS.heading_section]: "-0.01em",
    },
  },

  // TYPE-4: Maximalist-Expressive (display-driven, art-directed).
  "TYPE-4": {
    font_family: {
      display: `'Recoleta', 'Boucherie', ${SYSTEM_SERIF}`,
      body: `'Inter', ${SYSTEM_SANS}`,
    },
    scale: {
      [TYPOGRAPHY_SLOTS.heading_display]: "6rem",
      [TYPOGRAPHY_SLOTS.heading_section]: "3rem",
    },
    line_heights: {
      [TYPOGRAPHY_SLOTS.heading_display]: 0.95,
    },
    letter_spacing: {
      [TYPOGRAPHY_SLOTS.heading_display]: "-0.03em",
    },
  },

  // TYPE-5: Geometric-Modernist (Inter / SF / Söhne — the AI default).
  "TYPE-5": {
    font_family: {
      display: `'Inter', 'SF Pro', ${SYSTEM_SANS}`,
      body: `'Inter', 'SF Pro', ${SYSTEM_SANS}`,
    },
    scale: {
      [TYPOGRAPHY_SLOTS.heading_display]: "3rem",
      [TYPOGRAPHY_SLOTS.heading_section]: "1.875rem",
    },
    line_heights: {
      [TYPOGRAPHY_SLOTS.heading_display]: 1.1,
    },
    letter_spacing: {
      [TYPOGRAPHY_SLOTS.heading_display]: "-0.02em",
    },
  },

  // TYPE-6: Mono-Discipline (mono everywhere — developer-coded).
  "TYPE-6": {
    font_family: {
      display: `'Berkeley Mono', 'JetBrains Mono', ${SYSTEM_MONO}`,
      body: `'Berkeley Mono', 'JetBrains Mono', ${SYSTEM_MONO}`,
      mono: `'Berkeley Mono', 'JetBrains Mono', ${SYSTEM_MONO}`,
    },
    scale: {
      [TYPOGRAPHY_SLOTS.heading_display]: "2.5rem",
      [TYPOGRAPHY_SLOTS.heading_section]: "1.5rem",
    },
    line_heights: {
      [TYPOGRAPHY_SLOTS.heading_display]: 1.2,
    },
    letter_spacing: {
      [TYPOGRAPHY_SLOTS.body_default]: "0",
    },
  },
};

export function buildTypographyTokens(grammarId: string): TypographyTokens {
  const override = PER_GRAMMAR_OVERRIDES[grammarId] ?? {};

  // Family resolution. Optional `mono` only set when grammar specifies it.
  const families: TypographyTokens["font_family"] = {
    display: override.font_family?.display ?? DEFAULT_TYPOGRAPHY_FAMILIES.display,
    body: override.font_family?.body ?? DEFAULT_TYPOGRAPHY_FAMILIES.body,
  };
  if (override.font_family?.mono !== undefined) {
    families.mono = override.font_family.mono;
  }

  const scale = mergeWithDefaults(
    DEFAULT_TYPOGRAPHY_SCALE,
    override.scale ?? {},
  );
  const line_heights = mergeWithDefaults(
    DEFAULT_TYPOGRAPHY_LINE_HEIGHTS,
    override.line_heights ?? {},
  );

  // Build the result honoring exactOptionalPropertyTypes — only include
  // letter_spacing if the grammar specifies it.
  const result: TypographyTokens = {
    font_family: families,
    scale,
    line_heights,
  };
  if (
    override.letter_spacing !== undefined &&
    Object.keys(override.letter_spacing).length > 0
  ) {
    result.letter_spacing = override.letter_spacing;
  }
  return result;
}

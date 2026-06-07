// src/cards/tokens/radius.ts
//
// Phase 3 Task 2 — per-grammar radius tokens. Border-radius values are
// driven by the routed Component grammar. Hard-Bordered grammars use
// 0 across the scale; Soft-Container uses moderate rounding;
// Glass / Layered uses larger rounding.
//
// Source: spec/turns/palate-grammar-survey-v0.2-turn2-component-motion.md
// for component grammar definitions; spec/turns/palate-grammar-survey-
// v0.2-turn3-patches.md for the COMP-2 / COMP-3 / COMP-5 splits.

import type { RadiusTokens } from "../../types/card.js";
import {
  DEFAULT_RADIUS,
  RADIUS_SLOTS,
  mergeWithDefaults,
} from "./conventions.js";

const PER_GRAMMAR_OVERRIDES: Record<string, Partial<RadiusTokens>> = {
  // COMP-1: Typographic-Discreet (no buttons, just links).
  // Minimal rounding — links don't need radius beyond text underlines.
  "COMP-1": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "0",
    [RADIUS_SLOTS.md]: "0",
    [RADIUS_SLOTS.lg]: "0",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-2: Soft-Container System (Tailwind-coded SaaS, the AI default).
  // Moderate rounding — rounded-md / rounded-lg dominant.
  "COMP-2": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "4px",
    [RADIUS_SLOTS.md]: "8px",
    [RADIUS_SLOTS.lg]: "12px",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-3: Hard-Bordered (Neo-Brutalist).
  // Zero rounding everywhere — sharp edges are the discipline.
  "COMP-3": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "0",
    [RADIUS_SLOTS.md]: "0",
    [RADIUS_SLOTS.lg]: "0",
    [RADIUS_SLOTS.full]: "0",
  },

  // COMP-4: Pill-and-Cushion (DTC, friendly consumer).
  // Generous rounding — pills and cushioned cards.
  "COMP-4": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "8px",
    [RADIUS_SLOTS.md]: "16px",
    [RADIUS_SLOTS.lg]: "24px",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-5: Sharp-Geometric (editorial, magazine).
  // Minimal rounding — sharp geometric containers.
  "COMP-5": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "0",
    [RADIUS_SLOTS.md]: "2px",
    [RADIUS_SLOTS.lg]: "4px",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-6: Premium-Refined (premium hardware — Apple-coded refinement).
  // Subtle rounding; precise corner curves.
  "COMP-6": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "6px",
    [RADIUS_SLOTS.md]: "10px",
    [RADIUS_SLOTS.lg]: "18px",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-7: Glass / Layered (Atmospheric-Depth components).
  // Generous rounding paired with translucency.
  "COMP-7": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "8px",
    [RADIUS_SLOTS.md]: "16px",
    [RADIUS_SLOTS.lg]: "24px",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-8: Maximalist-Decorative (creative agency, awwwards-tier).
  // Variable rounding — components can break the system; expressive.
  "COMP-8": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "4px",
    [RADIUS_SLOTS.md]: "16px",
    [RADIUS_SLOTS.lg]: "32px",
    [RADIUS_SLOTS.full]: "9999px",
  },

  // COMP-9: Application-Refined (B2B dashboards, application UI).
  // Tight rounding — application UI doesn't need large radius.
  "COMP-9": {
    [RADIUS_SLOTS.none]: "0",
    [RADIUS_SLOTS.sm]: "3px",
    [RADIUS_SLOTS.md]: "6px",
    [RADIUS_SLOTS.lg]: "8px",
    [RADIUS_SLOTS.full]: "9999px",
  },
};

export function buildRadiusTokens(grammarId: string): RadiusTokens {
  const override = PER_GRAMMAR_OVERRIDES[grammarId] ?? {};
  return mergeWithDefaults(DEFAULT_RADIUS, override);
}

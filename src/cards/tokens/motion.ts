// src/cards/tokens/motion.ts
//
// Phase 3 Task 2 — per-grammar motion tokens. Duration and easing
// values are driven by the routed Motion grammar.
//
// Stillness-as-Discipline uses near-instant durations (no actual
// motion); Functional-Snappy uses short fast durations with standard
// ease; Restrained-Atmospheric uses medium-to-slow durations with
// decelerate ease for fade-ins; Kinetic-Expressive uses variable
// durations with accelerate ease for high-energy transitions.
//
// Source: spec/turns/palate-grammar-survey-v0.2-turn2-component-motion.md
// for motion grammar definitions; turn3-patches.md for the Atmospheric-
// Depth and Loading-and-Latency additions.

import type { MotionTokens } from "../../types/card.js";
import {
  DEFAULT_MOTION_DURATION,
  DEFAULT_MOTION_EASE,
  MOTION_DURATION_SLOTS,
  MOTION_EASE_SLOTS,
  mergeWithDefaults,
} from "./conventions.js";

interface MotionOverride {
  duration?: Partial<Record<string, string>>;
  easing?: Partial<Record<string, string>>;
}

const PER_GRAMMAR_OVERRIDES: Record<string, MotionOverride> = {
  // MOTION-1: Stillness as Discipline (luxury hospitality).
  // Effectively no motion — durations near-instant; standard ease.
  "MOTION-1": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "100ms",
      [MOTION_DURATION_SLOTS.medium]: "150ms",
      [MOTION_DURATION_SLOTS.slow]: "200ms",
    },
  },

  // MOTION-2: Restrained-Atmospheric (editorial, magazine, hospitality-coded).
  // Slow fades; decelerate ease for editorial quality.
  "MOTION-2": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "200ms",
      [MOTION_DURATION_SLOTS.medium]: "350ms",
      [MOTION_DURATION_SLOTS.slow]: "600ms",
    },
    easing: {
      [MOTION_EASE_SLOTS.standard]: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      [MOTION_EASE_SLOTS.decelerate]: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },

  // MOTION-3: Functional-Snappy (modern SaaS, the AI default).
  // Short fast durations; standard ease — Material/iOS-coded.
  "MOTION-3": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "150ms",
      [MOTION_DURATION_SLOTS.medium]: "250ms",
      [MOTION_DURATION_SLOTS.slow]: "400ms",
    },
  },

  // MOTION-4: Punchy-Discrete (Neo-Brutalist).
  // State changes are discrete (no smoothing); accelerate easing.
  "MOTION-4": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "80ms",
      [MOTION_DURATION_SLOTS.medium]: "120ms",
      [MOTION_DURATION_SLOTS.slow]: "180ms",
    },
    easing: {
      [MOTION_EASE_SLOTS.standard]: "step-end",
      [MOTION_EASE_SLOTS.accelerate]: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },

  // MOTION-5: Scroll-Driven Cinematic (modern AI launches, premium hardware).
  // Longer durations for cinematic reveals; decelerate ease.
  "MOTION-5": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "300ms",
      [MOTION_DURATION_SLOTS.medium]: "600ms",
      [MOTION_DURATION_SLOTS.slow]: "1200ms",
    },
    easing: {
      [MOTION_EASE_SLOTS.standard]: "cubic-bezier(0.16, 1, 0.3, 1)",
      [MOTION_EASE_SLOTS.decelerate]: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },

  // MOTION-6: Scrollytelling Narrative (editorial longform with scroll).
  // Variable; tied to scroll position rather than time-based.
  "MOTION-6": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "200ms",
      [MOTION_DURATION_SLOTS.medium]: "400ms",
      [MOTION_DURATION_SLOTS.slow]: "800ms",
    },
  },

  // MOTION-7: Kinetic-Expressive (creative agency, awwwards-tier).
  // High-energy; varied durations and easing curves.
  "MOTION-7": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "180ms",
      [MOTION_DURATION_SLOTS.medium]: "320ms",
      [MOTION_DURATION_SLOTS.slow]: "650ms",
    },
    easing: {
      [MOTION_EASE_SLOTS.standard]: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      [MOTION_EASE_SLOTS.accelerate]: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
    },
  },

  // MOTION-8: Atmospheric-Depth (Glass / Layered components).
  // Mid-duration with parallax-coded ease.
  "MOTION-8": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "200ms",
      [MOTION_DURATION_SLOTS.medium]: "400ms",
      [MOTION_DURATION_SLOTS.slow]: "700ms",
    },
    easing: {
      [MOTION_EASE_SLOTS.standard]: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    },
  },

  // MOTION-9: Loading-and-Latency (skeleton states, optimistic UI).
  // Used for loading states; durations match skeleton-shimmer rhythms.
  "MOTION-9": {
    duration: {
      [MOTION_DURATION_SLOTS.instant]: "0ms",
      [MOTION_DURATION_SLOTS.fast]: "150ms",
      [MOTION_DURATION_SLOTS.medium]: "1500ms", // shimmer cycle
      [MOTION_DURATION_SLOTS.slow]: "2500ms", // skeleton dwell
    },
  },
};

export function buildMotionTokens(grammarId: string): MotionTokens {
  const override = PER_GRAMMAR_OVERRIDES[grammarId] ?? {};
  return {
    duration: mergeWithDefaults(DEFAULT_MOTION_DURATION, override.duration ?? {}),
    easing: mergeWithDefaults(DEFAULT_MOTION_EASE, override.easing ?? {}),
  };
}

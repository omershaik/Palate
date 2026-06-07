// src/cards/components/grammars.ts
//
// Phase 3 Task 3 — per-Component-grammar recipe overrides. Each entry
// captures how the grammar's compositional discipline departs from the
// generic defaults defined in conventions.ts. Where the grammar
// matches the default discipline, the override is empty {} and the
// merged result IS the default.
//
// Source: spec/turns/palate-grammar-survey-v0.2-turn2-component-motion.md
// for the original 6 component grammars; turn3-patches.md for the
// COMP-2/COMP-3 splits and COMP-7 Glass / Layered addition.
//
// Variant collapse policy: when a grammar genuinely doesn't
// differentiate a variant (Typographic-Discreet's primary == tertiary
// because the grammar IS text-link), use markCollapsed() to flag the
// redundancy explicitly. Don't pad the variant set with synthetic
// differentiation that misrepresents the grammar.

import type {
  CardComponents,
  ComponentRecipe,
  ComponentVariantKey,
} from "../../types/card.js";
import {
  DEFAULT_BUTTON_VARIANTS,
  DEFAULT_CARD_VARIANTS,
  DEFAULT_INPUT_VARIANTS,
  DEFAULT_MODAL_VARIANTS,
  DEFAULT_NAV_VARIANTS,
  buildFallbackRecipe,
  buildRecipe,
  buildVariant,
  markCollapsed,
} from "./conventions.js";

interface GrammarRecipes {
  button: ComponentRecipe;
  card: ComponentRecipe;
  input: ComponentRecipe;
  nav: ComponentRecipe;
  modal: ComponentRecipe;
}

// ---------------------------------------------------------------------------
// COMP-1: Typographic-Discreet (no buttons, just links)
// ---------------------------------------------------------------------------
//
// Defining discipline: components are TEXT, not shapes. No buttons,
// no boxes — just typography with weight/underline/border-bottom for
// affordance. Aman / Cheval Blanc / Soho House quiet pages.
//
// Variant collapse: primary, secondary, tertiary all converge on
// text-link styling. The grammar genuinely doesn't differentiate —
// every "button" is text.

const COMP_1_BUTTON_TERTIARY = buildVariant({
  bg: "transparent",
  fg: "accent.primary",
  border: "transparent",
  border_width: "0",
  radius: "none",
  padding_x: "xs",
  padding_y: "xs",
  font_size: "body.default",
  font_weight: "400",
  // Phase 3 Task 5: even text-as-affordance needs the 44×44 touch
  // target for keyboard / pointer / touch accessibility. The visual
  // styling stays text-coded; the hit area floors at 44px.
  min_height: "touch-min",
  "bg.hover": "transparent",
}, [
  "No button shapes — text-as-affordance with underline on hover.",
  "Border-bottom 1px on hover for inline interactive text.",
  "Hit area floors at 44×44 (touch-min) even though visual styling is text-coded.",
]);

const COMP_1: GrammarRecipes = {
  button: {
    variants: {
      primary: markCollapsed(
        COMP_1_BUTTON_TERTIARY,
        "tertiary",
        "Typographic-Discreet has no filled buttons; primary action is text-coded.",
      ),
      secondary: markCollapsed(
        COMP_1_BUTTON_TERTIARY,
        "tertiary",
        "Typographic-Discreet doesn't differentiate secondary from tertiary; both are text.",
      ),
      tertiary: COMP_1_BUTTON_TERTIARY,
    },
  },
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { border: "transparent", border_width: "0", shadow: "none" },
    secondary: { border: "transparent", border_width: "0", shadow: "none" },
    tertiary: { border: "transparent", border_width: "0", shadow: "none" },
  }, {
    primary: ["No container chrome — content separates by typography and whitespace, not borders."],
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { border: "transparent", border_width: "0", "border.focus": "fg.body", radius: "none" },
    secondary: {},
    tertiary: {},
  }, {
    primary: ["Inputs use border-bottom underline only (no boxed border)."],
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { border: "transparent" },
    secondary: { border: "transparent" },
    tertiary: { border: "transparent" },
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { border: "transparent", border_width: "0", shadow: "none" },
    secondary: {},
    tertiary: {},
  }, {
    primary: ["Modal uses generous whitespace and typography, not chrome."],
  }),
};

// ---------------------------------------------------------------------------
// COMP-2: Soft-Container System (Tailwind/shadcn-coded SaaS — the AI default)
// ---------------------------------------------------------------------------
//
// Defining discipline: rounded containers, subtle shadows, the modern
// SaaS UI vocabulary. Stripe / Linear marketing / typical Webflow
// templates. Defaults are tuned for this grammar — Component-specific
// overrides are minimal.

const COMP_2: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: {},
    secondary: {},
    tertiary: {},
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { shadow: "md" },
    secondary: { shadow: "sm" },
    tertiary: { shadow: "none" },
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: {},
    secondary: {},
    tertiary: {},
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: {},
    secondary: {},
    tertiary: {},
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: {},
    secondary: {},
    tertiary: {},
  }),
};

// ---------------------------------------------------------------------------
// COMP-3: Hard-Bordered (Neo-Brutalist)
// ---------------------------------------------------------------------------
//
// Defining discipline: 2px hard borders, zero rounding, no shadows
// (or hard shadow brutalist substyle for offset shadows). High
// contrast, deliberately raw.

const COMP_3: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: {
      border: "border.strong",
      border_width: "2px",
      radius: "none",
      shadow: "none",
      "bg.hover": "accent.primary",
    },
    secondary: {
      border: "border.strong",
      border_width: "2px",
      radius: "none",
      shadow: "none",
    },
    tertiary: {
      border: "border.strong",
      border_width: "2px",
      radius: "none",
      shadow: "none",
    },
  }, {
    primary: ["Hard 2px border on every button — no rounded corners, no soft shadows."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { border: "border.strong", border_width: "2px", radius: "none", shadow: "none" },
    secondary: { border: "border.strong", border_width: "2px", radius: "none", shadow: "none" },
    tertiary: { border: "border.strong", border_width: "2px", radius: "none", shadow: "none" },
  }, {
    primary: ["Hard-Bordered cards use 2px borders and zero radius — sharp geometric containers."],
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { border: "border.strong", border_width: "2px", radius: "none" },
    secondary: { border: "border.strong", border_width: "2px", radius: "none" },
    tertiary: {},
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { border: "border.strong" },
    secondary: { border: "transparent" },
    tertiary: { border: "transparent" },
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { border: "border.strong", border_width: "2px", radius: "none", shadow: "none" },
    secondary: { border: "border.strong", border_width: "2px", radius: "none" },
    tertiary: {},
  }),
};

// ---------------------------------------------------------------------------
// COMP-4: Pill-and-Cushion (DTC / wellness / friendly consumer)
// ---------------------------------------------------------------------------
//
// Defining discipline: pill-radius buttons, cushioned padding, soft
// rounded everywhere. Glossier / Mejuri / wellness DTC. The friendly-
// consumer grammar.

const COMP_4: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: { radius: "full", padding_x: "xl", padding_y: "md" },
    secondary: { radius: "full", padding_x: "xl", padding_y: "md" },
    tertiary: { radius: "full", padding_x: "lg", padding_y: "sm" },
  }, {
    primary: ["Pill-shaped buttons with cushioned padding — friendly tactile feel."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { radius: "lg", shadow: "sm" },
    secondary: { radius: "lg", shadow: "none" },
    tertiary: { radius: "lg", shadow: "none" },
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { radius: "full", padding_x: "lg" },
    secondary: { radius: "full", padding_x: "lg" },
    tertiary: { radius: "full", padding_x: "md" },
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { gap: "xl" },
    secondary: {},
    tertiary: {},
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { radius: "lg" },
    secondary: { radius: "lg" },
    tertiary: { radius: "lg" },
  }),
};

// ---------------------------------------------------------------------------
// COMP-5: Sharp-Geometric (editorial magazine)
// ---------------------------------------------------------------------------
//
// Defining discipline: sharp edges, minimal rounding, high-contrast
// typography-driven UI. Editorial magazines — Apartamento, Cereal,
// NYT. Unobtrusive component chrome; the page is type-driven.

const COMP_5: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: { radius: "none", border_width: "1px" },
    secondary: { radius: "none", border_width: "1px" },
    tertiary: {
      bg: "transparent",
      fg: "fg.body",
      border: "transparent",
      radius: "none",
      "bg.hover": "transparent",
    },
  }, {
    primary: ["Sharp rectangles — no rounded corners. The type carries the visual weight."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { radius: "none", border: "border.default", border_width: "1px", shadow: "none" },
    secondary: { radius: "none", border: "border.subtle", border_width: "1px", shadow: "none" },
    tertiary: { radius: "none", border: "transparent", border_width: "0", shadow: "none" },
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { radius: "none" },
    secondary: { radius: "none" },
    tertiary: { radius: "none" },
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: {},
    secondary: {},
    tertiary: {},
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { radius: "none" },
    secondary: { radius: "none" },
    tertiary: { radius: "none" },
  }),
};

// ---------------------------------------------------------------------------
// COMP-6: Premium-Refined (Apple-coded refinement, premium hardware)
// ---------------------------------------------------------------------------
//
// Defining discipline: subtle borders, precise corner radius, refined
// hover states. Apple / Bang & Olufsen / premium consumer hardware
// brands. Restraint over expression.

const COMP_6: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: { radius: "lg", border: "transparent", padding_x: "xl", padding_y: "md", "bg.hover": "fg.body" },
    secondary: { radius: "lg", border: "border.default", padding_x: "xl", padding_y: "md" },
    tertiary: { radius: "lg" },
  }, {
    primary: ["Refined large-radius buttons with smooth hover transitions — Apple HIG-coded."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { radius: "lg", shadow: "sm", border: "transparent", border_width: "0" },
    secondary: { radius: "lg", shadow: "none", border: "border.subtle" },
    tertiary: { radius: "lg", shadow: "none" },
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { radius: "md" },
    secondary: { radius: "md" },
    tertiary: {},
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { padding_y: "sm" },
    secondary: {},
    tertiary: {},
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { radius: "lg" },
    secondary: { radius: "lg" },
    tertiary: { radius: "lg" },
  }),
};

// ---------------------------------------------------------------------------
// COMP-7: Glass / Layered (Atmospheric-Depth — translucent surfaces)
// ---------------------------------------------------------------------------
//
// Defining discipline: backdrop-filter blur, translucent surfaces,
// layered depth. Apple-coded glass effects, modern AI launch pages
// with frosted-glass nav bars. Light-Translucent or Dark-Translucent
// substyles.

const COMP_7: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: { radius: "lg" },
    secondary: { radius: "lg", bg: "bg.subtle" },
    tertiary: { radius: "lg" },
  }, {
    primary: ["Use backdrop-filter: blur(12px) on bg for glass effect when over content layers."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { radius: "lg", border: "border.subtle", shadow: "lg" },
    secondary: { radius: "lg", border: "border.subtle" },
    tertiary: { radius: "lg" },
  }, {
    primary: ["Translucent bg + backdrop-filter blur for layered depth feel."],
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { radius: "lg", bg: "bg.subtle" },
    secondary: { radius: "lg" },
    tertiary: {},
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { bg: "bg.surface" },
    secondary: {},
    tertiary: {},
  }, {
    primary: ["Sticky nav uses backdrop-filter: blur() over scrolled content."],
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { radius: "lg", backdrop_blur: "12px", backdrop_bg: "rgba(0, 0, 0, 0.3)" },
    secondary: { radius: "lg", backdrop_blur: "8px" },
    tertiary: { radius: "lg" },
  }),
};

// ---------------------------------------------------------------------------
// COMP-8: Maximalist-Decorative (creative agency, awwwards-tier)
// ---------------------------------------------------------------------------
//
// Defining discipline: expressive components, decorative borders,
// variable rounding, willingness to break system rules for
// expression. Locomotive / KOTA / awwwards site of the day winners.

const COMP_8: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: { radius: "lg", border_width: "2px" },
    secondary: { radius: "lg", border_width: "2px" },
    tertiary: { radius: "md" },
  }, {
    primary: ["Decorative button styles — variants may use distinct shapes (pill, sharp, rounded)."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { radius: "lg", shadow: "lg" },
    secondary: { radius: "md" },
    tertiary: { radius: "lg" },
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { radius: "md", border_width: "2px" },
    secondary: { radius: "lg" },
    tertiary: {},
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { gap: "xl" },
    secondary: {},
    tertiary: {},
  }, {
    primary: ["Nav can break the system — typography moves, hover effects, expressive animations."],
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { radius: "lg" },
    secondary: { radius: "md" },
    tertiary: {},
  }),
};

// ---------------------------------------------------------------------------
// COMP-9: Application-Refined (B2B dashboards, application UI)
// ---------------------------------------------------------------------------
//
// Defining discipline: tight padding, application-UI density, refined
// state semantics (status colors, loading states, optimistic UI).
// Linear / Stripe Dashboard / GitHub / modern B2B applications.

const COMP_9: GrammarRecipes = {
  button: buildRecipe(DEFAULT_BUTTON_VARIANTS, {
    primary: { radius: "sm", padding_x: "md", padding_y: "xs", font_size: "body.small" },
    secondary: { radius: "sm", padding_x: "md", padding_y: "xs", font_size: "body.small" },
    tertiary: { radius: "sm", padding_x: "sm", padding_y: "xs", font_size: "body.small" },
  }, {
    primary: ["Application-UI buttons — tight padding, small radius, application-density font sizing."],
  }),
  card: buildRecipe(DEFAULT_CARD_VARIANTS, {
    primary: { radius: "sm", padding: "md", shadow: "sm" },
    secondary: { radius: "sm", padding: "sm", shadow: "none" },
    tertiary: { radius: "sm", padding: "sm" },
  }),
  input: buildRecipe(DEFAULT_INPUT_VARIANTS, {
    primary: { radius: "sm", padding_x: "sm", padding_y: "xs", font_size: "body.small" },
    secondary: { radius: "sm", padding_x: "sm", padding_y: "xs", font_size: "body.small" },
    tertiary: {},
  }),
  nav: buildRecipe(DEFAULT_NAV_VARIANTS, {
    primary: { padding_x: "md", padding_y: "sm", gap: "md", font_size: "body.small" },
    secondary: { gap: "xs" },
    tertiary: {},
  }),
  modal: buildRecipe(DEFAULT_MODAL_VARIANTS, {
    primary: { radius: "sm" },
    secondary: { radius: "sm" },
    tertiary: { radius: "sm" },
  }),
};

// ---------------------------------------------------------------------------
// Lookup table
// ---------------------------------------------------------------------------

const PER_GRAMMAR: Record<string, GrammarRecipes> = {
  "COMP-1": COMP_1,
  "COMP-2": COMP_2,
  "COMP-3": COMP_3,
  "COMP-4": COMP_4,
  "COMP-5": COMP_5,
  "COMP-6": COMP_6,
  "COMP-7": COMP_7,
  "COMP-8": COMP_8,
  "COMP-9": COMP_9,
};

/**
 * Build the full CardComponents block from a routed Component grammar
 * id. Falls through to default recipes (with a flag note) for unknown
 * grammar ids.
 */
export function buildComponents(grammarId: string): CardComponents {
  const recipes = PER_GRAMMAR[grammarId];
  if (recipes !== undefined) {
    return {
      button: recipes.button,
      card: recipes.card,
      input: recipes.input,
      nav: recipes.nav,
      modal: recipes.modal,
    };
  }
  return {
    button: buildFallbackRecipe(DEFAULT_BUTTON_VARIANTS, grammarId),
    card: buildFallbackRecipe(DEFAULT_CARD_VARIANTS, grammarId),
    input: buildFallbackRecipe(DEFAULT_INPUT_VARIANTS, grammarId),
    nav: buildFallbackRecipe(DEFAULT_NAV_VARIANTS, grammarId),
    modal: buildFallbackRecipe(DEFAULT_MODAL_VARIANTS, grammarId),
  };
}

// Suppress unused-import warnings for items kept for symmetric API.
void buildVariant;
void ({} as ComponentVariantKey);

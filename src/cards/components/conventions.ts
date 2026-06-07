// src/cards/components/conventions.ts
//
// Phase 3 Task 3 — Component recipe conventions. Locks the recipe
// shape across all 9 Component grammars before per-grammar population.
// Without a shared shape, different grammars would produce different
// recipe surfaces and consuming AI tools would have to handle the
// shape variance themselves.
//
// THE RECIPE CONTRACT:
//
//   1. token_refs values point into Card.tokens via slot names
//      (e.g., "accent.primary", "fg.inverse", "md", "lg") — NOT
//      hex codes. The card builder enforces this discipline so token
//      coherence is structural.
//
//   2. token_refs keys follow a standard vocabulary per component
//      (button: bg/fg/border/radius/padding_x/padding_y/...). State
//      variants are encoded as `<key>.<state>` (e.g., "bg.hover",
//      "border.focus"). The full vocabulary is in COMPONENT_TOKEN_REFS
//      below.
//
//   3. Variants are differentiated by VARIANT_RULES (primary vs
//      secondary vs tertiary). Default rules: primary=filled-accent,
//      secondary=outlined-accent, tertiary=text-link. Per-grammar
//      overrides depart from defaults where the grammar's
//      compositional discipline calls for it.
//
//   4. When a grammar genuinely doesn't differentiate a variant from
//      another (e.g., Typographic-Discreet's primary == secondary ==
//      tertiary), use markCollapsed() to mark the redundancy
//      explicitly. Consuming AI tools then know the variant collapse
//      is intentional, not an oversight.
//
//   5. Optional fields (notes, focus_ring, disabled_state) follow
//      exactOptionalPropertyTypes discipline — set conditionally,
//      never as `undefined`.

import type {
  ComponentRecipe,
  ComponentVariant,
  ComponentVariantKey,
} from "../../types/card.js";

// ---------------------------------------------------------------------------
// Standard token_refs keys per component type
// ---------------------------------------------------------------------------

/**
 * Canonical token_refs keys for each component. Per-grammar tables
 * fill these keys with slot-name values (`accent.primary`, `md`, etc.).
 * State variants are encoded as `<key>.<state>` keys (e.g., `bg.hover`).
 *
 * Components that share keys (button + input share `bg/fg/border/...`)
 * intentionally use the same key vocabulary so AI tools can apply
 * generic styling logic across components.
 */
export const COMPONENT_TOKEN_REFS = {
  button: [
    "bg",
    "fg",
    "border",
    "border_width", // CSS string like "1px" or "2px" — direct value, not a slot
    "radius",
    "padding_x",
    "padding_y",
    "font_size",
    "font_weight",
    "shadow", // optional; only when grammar specifies elevation
    // States — populate selectively per grammar
    "bg.hover",
    "bg.active",
    "bg.disabled",
    "fg.disabled",
    "border.hover",
    "border.focus",
  ],
  card: [
    "bg",
    "fg",
    "border",
    "border_width",
    "radius",
    "padding",
    "shadow",
    // States — typically just hover
    "bg.hover",
    "shadow.hover",
  ],
  input: [
    "bg",
    "fg",
    "fg_placeholder",
    "border",
    "border_width",
    "radius",
    "padding_x",
    "padding_y",
    "font_size",
    // States
    "bg.disabled",
    "fg.disabled",
    "border.focus",
    "border.error",
  ],
  nav: [
    "bg",
    "fg",
    "border",
    "padding_x",
    "padding_y",
    "gap", // gap between nav items
    "font_size",
    // States — for active item indication
    "fg.active",
    "bg.active",
    "border.active",
  ],
  modal: [
    "bg",
    "fg",
    "border",
    "border_width",
    "radius",
    "padding",
    "shadow",
    "backdrop_bg", // overlay color behind the modal
    "backdrop_blur", // CSS backdrop-filter value
  ],
} as const;

// ---------------------------------------------------------------------------
// Default variant rules — what differentiates primary / secondary / tertiary
// ---------------------------------------------------------------------------

/**
 * Default token_refs per variant for the generic Component case.
 * Per-grammar tables override these per-grammar as needed; grammars
 * that match the default discipline can extend without re-specifying
 * every key.
 *
 * Convention:
 *   primary   — filled-accent: brand color background, inverse text.
 *   secondary — outlined-accent: surface background, accent text + border.
 *   tertiary  — text-link: transparent, accent text, no border.
 *
 * Hard-Bordered, Typographic-Discreet, and Maximalist grammars depart
 * from this convention; their per-grammar tables specify the variant
 * differentiation rules.
 */
export const DEFAULT_BUTTON_VARIANTS: Record<
  ComponentVariantKey,
  Record<string, string>
> = {
  primary: {
    bg: "accent.primary",
    fg: "fg.inverse",
    border: "accent.primary",
    border_width: "1px",
    radius: "md",
    padding_x: "lg",
    padding_y: "sm",
    font_size: "body.default",
    font_weight: "500",
    // Phase 3 Task 5: WCAG 2.2 AA touch target floor (44×44px).
    // Padding-derived height for several grammars (esp. Application-
    // Refined, Soft-Container) lands below 44px on default fonts;
    // min_height enforces the floor regardless of grammar density.
    min_height: "touch-min",
    "bg.hover": "accent.cta",
    "bg.disabled": "fg.subtle",
    "fg.disabled": "fg.inverse",
  },
  secondary: {
    bg: "bg.surface",
    fg: "accent.primary",
    border: "accent.primary",
    border_width: "1px",
    radius: "md",
    padding_x: "lg",
    padding_y: "sm",
    font_size: "body.default",
    font_weight: "500",
    min_height: "touch-min",
    "bg.hover": "bg.subtle",
    "bg.disabled": "bg.subtle",
    "fg.disabled": "fg.subtle",
  },
  tertiary: {
    bg: "transparent",
    fg: "accent.primary",
    border: "transparent",
    border_width: "0",
    radius: "md",
    padding_x: "md",
    padding_y: "sm",
    font_size: "body.default",
    font_weight: "500",
    min_height: "touch-min",
    "bg.hover": "bg.subtle",
    "fg.disabled": "fg.subtle",
  },
};

/**
 * Default Card variants. Card variant semantics (per the schema's
 * "primary/secondary/tertiary action" model adapted to non-button
 * components):
 *   primary   — featured / emphasized card
 *   secondary — standard card (the most common shape)
 *   tertiary  — subtle / inset card (e.g., callouts, helper boxes)
 *
 * Many grammars don't differentiate cards across variants beyond
 * subtle visual weight; the per-grammar tables collapse where the
 * grammar genuinely treats all three the same.
 */
export const DEFAULT_CARD_VARIANTS: Record<
  ComponentVariantKey,
  Record<string, string>
> = {
  primary: {
    bg: "bg.elevated",
    fg: "fg.body",
    border: "accent.primary",
    border_width: "1px",
    radius: "lg",
    padding: "lg",
    shadow: "md",
    "bg.hover": "bg.elevated",
    "shadow.hover": "lg",
  },
  secondary: {
    bg: "bg.surface",
    fg: "fg.body",
    border: "border.default",
    border_width: "1px",
    radius: "md",
    padding: "md",
    shadow: "none",
    "bg.hover": "bg.surface",
  },
  tertiary: {
    bg: "bg.subtle",
    fg: "fg.muted",
    border: "transparent",
    border_width: "0",
    radius: "md",
    padding: "md",
    shadow: "none",
  },
};

/**
 * Default Input variants. Input variant semantics:
 *   primary   — standard input (the most common shape)
 *   secondary — inset / filled input (subtle bg, no border)
 *   tertiary  — ghost / borderless input (often for inline editing)
 */
export const DEFAULT_INPUT_VARIANTS: Record<
  ComponentVariantKey,
  Record<string, string>
> = {
  primary: {
    bg: "bg.canvas",
    fg: "fg.body",
    fg_placeholder: "fg.subtle",
    border: "border.default",
    border_width: "1px",
    radius: "md",
    padding_x: "md",
    padding_y: "sm",
    font_size: "body.default",
    // Phase 3 Task 5: touch-target floor.
    min_height: "touch-min",
    "border.focus": "accent.primary",
    "border.error": "state.danger",
    "bg.disabled": "bg.subtle",
    "fg.disabled": "fg.subtle",
  },
  secondary: {
    bg: "bg.subtle",
    fg: "fg.body",
    fg_placeholder: "fg.subtle",
    border: "transparent",
    border_width: "0",
    radius: "md",
    padding_x: "md",
    padding_y: "sm",
    font_size: "body.default",
    min_height: "touch-min",
    "border.focus": "accent.primary",
    "border.error": "state.danger",
    "bg.disabled": "bg.subtle",
    "fg.disabled": "fg.subtle",
  },
  tertiary: {
    // Inline-edit / ghost input — typically inside dense surfaces
    // where the parent component (table cell, label-replace) carries
    // the touch target. min_height NOT enforced on this variant; AI
    // tool ensures the parent meets 44×44.
    bg: "transparent",
    fg: "fg.body",
    fg_placeholder: "fg.subtle",
    border: "transparent",
    border_width: "0",
    radius: "none",
    padding_x: "xs",
    padding_y: "xs",
    font_size: "body.default",
    "border.focus": "accent.primary",
    "border.error": "state.danger",
  },
};

/**
 * Default Nav variants. Nav variant semantics:
 *   primary   — top-level navigation (header / main nav)
 *   secondary — section navigation (sidebar, in-page nav)
 *   tertiary  — utility navigation (footer, breadcrumbs)
 */
export const DEFAULT_NAV_VARIANTS: Record<
  ComponentVariantKey,
  Record<string, string>
> = {
  primary: {
    bg: "bg.canvas",
    fg: "fg.body",
    border: "border.default",
    padding_x: "lg",
    padding_y: "md",
    gap: "lg",
    font_size: "body.default",
    // Phase 3 Task 5: nav items are interactive — touch-target floor
    // applies. Per-item minimum (item_min_height) rather than the
    // whole nav bar; the consuming AI tool maps this onto the
    // <a>/<button> children.
    item_min_height: "touch-min",
    "fg.active": "accent.primary",
    "bg.active": "bg.subtle",
    "border.active": "accent.primary",
  },
  secondary: {
    bg: "bg.surface",
    fg: "fg.muted",
    border: "transparent",
    padding_x: "md",
    padding_y: "sm",
    gap: "sm",
    font_size: "body.small",
    item_min_height: "touch-min",
    "fg.active": "accent.primary",
    "bg.active": "bg.subtle",
    "border.active": "accent.primary",
  },
  tertiary: {
    bg: "transparent",
    fg: "fg.subtle",
    border: "transparent",
    padding_x: "sm",
    padding_y: "xs",
    gap: "md",
    font_size: "body.small",
    item_min_height: "touch-min",
    "fg.active": "fg.body",
    "bg.active": "transparent",
    "border.active": "transparent",
  },
};

/**
 * Default Modal variants. Modal variant semantics:
 *   primary   — standard center-screen modal
 *   secondary — alert / confirmation modal (smaller, focused)
 *   tertiary  — drawer / side modal (slide-in from edge)
 *
 * Many grammars don't differentiate modal variants beyond the
 * primary case; per-grammar tables can collapse via markCollapsed().
 */
export const DEFAULT_MODAL_VARIANTS: Record<
  ComponentVariantKey,
  Record<string, string>
> = {
  primary: {
    bg: "bg.elevated",
    fg: "fg.body",
    border: "border.default",
    border_width: "1px",
    radius: "lg",
    padding: "xl",
    shadow: "lg",
    backdrop_bg: "rgba(0, 0, 0, 0.5)",
    backdrop_blur: "0",
  },
  secondary: {
    bg: "bg.elevated",
    fg: "fg.body",
    border: "border.default",
    border_width: "1px",
    radius: "md",
    padding: "lg",
    shadow: "md",
    backdrop_bg: "rgba(0, 0, 0, 0.4)",
    backdrop_blur: "0",
  },
  tertiary: {
    bg: "bg.elevated",
    fg: "fg.body",
    border: "border.default",
    border_width: "1px",
    radius: "none",
    padding: "lg",
    shadow: "lg",
    backdrop_bg: "rgba(0, 0, 0, 0.3)",
    backdrop_blur: "0",
  },
};

// ---------------------------------------------------------------------------
// Recipe-construction helpers
// ---------------------------------------------------------------------------

/**
 * Build a ComponentVariant from a partial token_refs record. Optional
 * notes are honored conditionally per exactOptionalPropertyTypes.
 */
export function buildVariant(
  token_refs: Record<string, string>,
  notes?: string[],
): ComponentVariant {
  const variant: ComponentVariant = { token_refs };
  if (notes !== undefined && notes.length > 0) {
    variant.notes = notes;
  }
  return variant;
}

/**
 * Build a ComponentRecipe from per-variant overrides. Variants not
 * specified in `overrides` use the supplied defaults; this is how
 * the per-grammar table for Button starts from DEFAULT_BUTTON_VARIANTS
 * and applies grammar-specific overrides only where the grammar's
 * compositional discipline departs from the default.
 */
export function buildRecipe(
  defaults: Record<ComponentVariantKey, Record<string, string>>,
  overrides: Partial<Record<ComponentVariantKey, Partial<Record<string, string>>>>,
  notesByVariant?: Partial<Record<ComponentVariantKey, string[]>>,
): ComponentRecipe {
  const variants: Record<ComponentVariantKey, ComponentVariant> = {
    primary: buildVariant(
      mergeTokenRefs(defaults.primary, overrides.primary ?? {}),
      notesByVariant?.primary,
    ),
    secondary: buildVariant(
      mergeTokenRefs(defaults.secondary, overrides.secondary ?? {}),
      notesByVariant?.secondary,
    ),
    tertiary: buildVariant(
      mergeTokenRefs(defaults.tertiary, overrides.tertiary ?? {}),
      notesByVariant?.tertiary,
    ),
  };
  return { variants };
}

function mergeTokenRefs(
  base: Record<string, string>,
  override: Partial<Record<string, string>>,
): Record<string, string> {
  const result: Record<string, string> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Mark a variant as INTENTIONALLY collapsed onto another (e.g.,
 * Typographic-Discreet's primary == tertiary because the grammar
 * doesn't differentiate). Returns a variant with the same token_refs
 * as the source plus a note explaining the collapse.
 *
 * Use this when the grammar genuinely doesn't differentiate the
 * variant; consuming AI tools see the redundancy as deliberate, not
 * accidental.
 */
export function markCollapsed(
  source: ComponentVariant,
  collapsedFrom: ComponentVariantKey,
  reason: string,
): ComponentVariant {
  return {
    token_refs: { ...source.token_refs },
    notes: [
      `Variant collapsed onto ${collapsedFrom} — ${reason}`,
      ...(source.notes ?? []),
    ],
  };
}

/**
 * Defensive fall-through builder when a Component grammar id isn't in
 * the per-grammar lookup table. Produces a usable recipe with the
 * default variant rules and a note flagging the fall-through.
 */
export function buildFallbackRecipe(
  defaults: Record<ComponentVariantKey, Record<string, string>>,
  grammarId: string,
): ComponentRecipe {
  return buildRecipe(defaults, {}, {
    primary: [
      `Component grammar ${grammarId} has no per-grammar recipe override; using default variant rules.`,
    ],
  });
}

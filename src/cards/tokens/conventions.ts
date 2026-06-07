// src/cards/tokens/conventions.ts
//
// Phase 3 Task 2 — Token vocabulary conventions for Palate cards.
//
// All per-axis token files (color.ts, typography.ts, spacing.ts,
// radius.ts, motion.ts) reference the semantic slot names defined here.
// Consuming AI tools (Cursor, Lovable, v0, Claude Code, Bolt) can rely
// on this vocabulary being stable across cards and across grammar
// pairings — the grammar dictates the VALUES, the convention dictates
// the SLOT NAMES.
//
// Design decision: short semantic names matching the modern CSS-
// variable / Tailwind ecosystem (Radix, shadcn/ui, Tailwind config)
// rather than verbose `color.background.default`-style names. Per the
// Phase 3 Task 2 review: AI tools generate against this convention;
// invented Palate-specific naming would force consumers to learn a
// translation layer with no benefit. The Card schema's "card builder
// owns the convention" clause (per the kickoff B4 / PRD §4.7) is
// intentional; ecosystem alignment is the right exercise of ownership.
//
// The convention is the durable contract — once shipped in v0.1.0,
// changes here are breaking changes for consuming AI tools' generated
// CSS. Any v0.2 additions extend the slot set without renaming
// existing slots.

// ---------------------------------------------------------------------------
// Color slots
// ---------------------------------------------------------------------------

/**
 * Semantic color slots. Every Color grammar populates these slots with
 * grammar-appropriate hex values. Some slots (state.*) are
 * conditionally populated — populate only when the grammar's
 * compositional discipline calls for status colors. Many grammars
 * (Typographic-Discreet, Editorial-Print) don't include state colors
 * at all.
 */
export const COLOR_SLOTS = {
  // Backgrounds — page → card → modal layering.
  bg_canvas: "bg.canvas", // page background
  bg_surface: "bg.surface", // cards, panels
  bg_elevated: "bg.elevated", // modals, popovers, tooltips
  bg_subtle: "bg.subtle", // inputs, secondary surfaces

  // Foregrounds — text and icon layers.
  fg_body: "fg.body", // body copy default
  fg_muted: "fg.muted", // secondary text
  fg_subtle: "fg.subtle", // tertiary text, helper text
  fg_inverse: "fg.inverse", // text on accent / dark surfaces

  // Accents — brand color and call-to-action.
  accent_primary: "accent.primary", // brand color, primary action
  accent_cta: "accent.cta", // call-to-action; may equal primary or distinct
  accent_secondary: "accent.secondary", // secondary action / supporting accent

  // Borders — surface separation.
  border_default: "border.default", // standard borders
  border_subtle: "border.subtle", // hairline / barely visible
  border_strong: "border.strong", // strong / Hard-Bordered grammars

  // States — conditionally populated. Populate only when grammar
  // requires (most marketing grammars don't have status colors;
  // application UI grammars do).
  state_success: "state.success",
  state_warning: "state.warning",
  state_danger: "state.danger",
  state_info: "state.info",
} as const;

// ---------------------------------------------------------------------------
// Typography slots — keys for tokens.typography.scale and line_heights
// ---------------------------------------------------------------------------

/**
 * Typography scale slots. Keys for `tokens.typography.scale`,
 * `line_heights`, and `letter_spacing` (when populated).
 *
 * Note on naming: the Card schema separates `font_family.{display,
 * body, mono?}` (which carry FAMILIES) from `scale.*` (which carries
 * SIZES). These slots are for the scale/line-height/letter-spacing
 * dictionaries — they describe sizes per role, not families.
 */
export const TYPOGRAPHY_SLOTS = {
  heading_display: "heading.display", // hero / display-size headings
  heading_section: "heading.section", // section headings, h2-equivalent
  heading_card: "heading.card", // card / panel headings, h3-equivalent
  body_default: "body.default", // body copy
  body_small: "body.small", // captions, helper text
  mono: "mono", // monospace / code (size only; family is font_family.mono)
} as const;

// ---------------------------------------------------------------------------
// Spacing slots — for tokens.spacing
// ---------------------------------------------------------------------------

/**
 * Spacing scale. T-shirt sizing matches Tailwind / shadcn/ui
 * conventions. Density grammars populate values that fit their
 * compositional discipline (Editorial-Spacious uses larger md/lg
 * than Hyper-Dense, etc.).
 */
export const SPACING_SLOTS = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  xxl: "2xl", // CSS-variable-safe; slot name preserves "2xl" string value
  /**
   * Phase 3 Task 5 — accessibility commitment slot. WCAG 2.2 AA
   * requires interactive elements to render with at least 44×44 CSS
   * pixels of touch-target area. Component recipes for buttons,
   * inputs, and nav items reference `space.touch-min` as a min-height
   * floor; the value is constant (44px) across all Density grammars
   * (Hyper-Dense doesn't get to opt out of accessibility), so this
   * slot's value is fixed in DEFAULT_SPACING below and per-grammar
   * spacing tables don't override it.
   */
  touch_min: "touch-min",
} as const;

// ---------------------------------------------------------------------------
// Radius slots — for tokens.radius
// ---------------------------------------------------------------------------

/**
 * Border-radius scale. Component grammars populate values that fit
 * their compositional discipline (Hard-Bordered uses 0 across the
 * scale; Soft-Container uses moderate rounding; Glass / Layered uses
 * larger rounding).
 */
export const RADIUS_SLOTS = {
  none: "none",
  sm: "sm",
  md: "md",
  lg: "lg",
  full: "full", // pill / circle
} as const;

// ---------------------------------------------------------------------------
// Motion slots — for tokens.motion
// ---------------------------------------------------------------------------

/**
 * Motion duration scale (for tokens.motion.duration). Motion grammars
 * populate values that fit their compositional discipline (Stillness
 * uses near-instant durations; Functional-Snappy uses fast; Restrained-
 * Atmospheric uses medium-to-slow).
 */
export const MOTION_DURATION_SLOTS = {
  instant: "instant",
  fast: "fast",
  medium: "medium",
  slow: "slow",
} as const;

/**
 * Motion easing functions (for tokens.motion.easing). Most grammars
 * use a `standard` easing; some (Punchy-Discrete, Kinetic-Expressive)
 * specify distinct decelerate/accelerate curves.
 */
export const MOTION_EASE_SLOTS = {
  standard: "standard",
  decelerate: "decelerate",
  accelerate: "accelerate",
} as const;

// ---------------------------------------------------------------------------
// Defaults — used as fall-through when a grammar doesn't populate a slot
// ---------------------------------------------------------------------------

/**
 * Per-axis default values used by token-builder fall-through paths
 * (when a grammar doesn't have a per-grammar override). These defaults
 * are sensible neutral values that produce a usable card even when a
 * specific grammar's lookup table doesn't ship in v0.1.0.
 *
 * Phase 4 brand-fingerprint refinement OR v0.1.x patches can replace
 * defaults with grammar-tuned values; the convention slot names stay
 * stable.
 */
export const DEFAULT_COLOR_TOKENS: Record<string, string> = {
  [COLOR_SLOTS.bg_canvas]: "#ffffff",
  [COLOR_SLOTS.bg_surface]: "#fafafa",
  [COLOR_SLOTS.bg_elevated]: "#ffffff",
  [COLOR_SLOTS.bg_subtle]: "#f4f4f5",
  [COLOR_SLOTS.fg_body]: "#18181b",
  [COLOR_SLOTS.fg_muted]: "#52525b",
  [COLOR_SLOTS.fg_subtle]: "#71717a",
  [COLOR_SLOTS.fg_inverse]: "#ffffff",
  [COLOR_SLOTS.accent_primary]: "#18181b",
  [COLOR_SLOTS.accent_cta]: "#18181b",
  [COLOR_SLOTS.accent_secondary]: "#71717a",
  [COLOR_SLOTS.border_default]: "#e4e4e7",
  [COLOR_SLOTS.border_subtle]: "#f4f4f5",
  [COLOR_SLOTS.border_strong]: "#a1a1aa",
};

export const DEFAULT_TYPOGRAPHY_FAMILIES = {
  display: "system-ui, -apple-system, sans-serif",
  body: "system-ui, -apple-system, sans-serif",
} as const;

export const DEFAULT_TYPOGRAPHY_SCALE: Record<string, string> = {
  [TYPOGRAPHY_SLOTS.heading_display]: "3rem",
  [TYPOGRAPHY_SLOTS.heading_section]: "1.875rem",
  [TYPOGRAPHY_SLOTS.heading_card]: "1.25rem",
  [TYPOGRAPHY_SLOTS.body_default]: "1rem",
  [TYPOGRAPHY_SLOTS.body_small]: "0.875rem",
  [TYPOGRAPHY_SLOTS.mono]: "0.875rem",
};

export const DEFAULT_TYPOGRAPHY_LINE_HEIGHTS: Record<string, string | number> = {
  [TYPOGRAPHY_SLOTS.heading_display]: 1.1,
  [TYPOGRAPHY_SLOTS.heading_section]: 1.2,
  [TYPOGRAPHY_SLOTS.heading_card]: 1.3,
  [TYPOGRAPHY_SLOTS.body_default]: 1.5,
  [TYPOGRAPHY_SLOTS.body_small]: 1.5,
  [TYPOGRAPHY_SLOTS.mono]: 1.6,
};

export const DEFAULT_SPACING: Record<string, string> = {
  [SPACING_SLOTS.xs]: "4px",
  [SPACING_SLOTS.sm]: "8px",
  [SPACING_SLOTS.md]: "16px",
  [SPACING_SLOTS.lg]: "24px",
  [SPACING_SLOTS.xl]: "32px",
  [SPACING_SLOTS.xxl]: "48px",
  // WCAG 2.2 AA — fixed across all Density grammars.
  [SPACING_SLOTS.touch_min]: "44px",
};

export const DEFAULT_RADIUS: Record<string, string> = {
  [RADIUS_SLOTS.none]: "0",
  [RADIUS_SLOTS.sm]: "4px",
  [RADIUS_SLOTS.md]: "8px",
  [RADIUS_SLOTS.lg]: "12px",
  [RADIUS_SLOTS.full]: "9999px",
};

export const DEFAULT_MOTION_DURATION: Record<string, string> = {
  [MOTION_DURATION_SLOTS.instant]: "0ms",
  [MOTION_DURATION_SLOTS.fast]: "150ms",
  [MOTION_DURATION_SLOTS.medium]: "250ms",
  [MOTION_DURATION_SLOTS.slow]: "400ms",
};

export const DEFAULT_MOTION_EASE: Record<string, string> = {
  [MOTION_EASE_SLOTS.standard]: "cubic-bezier(0.4, 0, 0.2, 1)",
  [MOTION_EASE_SLOTS.decelerate]: "cubic-bezier(0, 0, 0.2, 1)",
  [MOTION_EASE_SLOTS.accelerate]: "cubic-bezier(0.4, 0, 1, 1)",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Merge a per-grammar token override over the axis defaults.
 * Per-grammar tables ship partial records (only slots the grammar
 * specifies); the merge fills in remaining slots from defaults so
 * the consuming AI tool always sees a complete vocabulary.
 *
 * The override-on-top semantics matter: per-grammar values take
 * precedence; defaults are the fall-through.
 */
export function mergeWithDefaults<T extends Record<string, unknown>>(
  defaults: T,
  override: Partial<T>,
): T {
  return { ...defaults, ...override };
}

// src/cards/anti-patterns/index.ts
//
// Phase 3 Task 4 — anti-pattern transformation. Converts each routed
// grammar's anti_vibes (user-facing rejection vocabulary) into card-
// level anti_patterns (AI-tool-facing build directives), then adds
// canonical-level directives where the matched canonical has well-
// attested category-wide anti-patterns.
//
// Anti-vibe: "no purple-to-blue gradients" (what users say to route
// AWAY from a grammar).
// Anti-pattern: "Avoid purple-to-blue gradient backgrounds; use
// single-accent palettes on neutral surfaces instead." (what AI tools
// follow when GENERATING).
//
// Different shapes; transformation matters. Direct extraction without
// transformation produces awkwardly-phrased anti_patterns that read
// as user-rejection vocabulary rather than build guidance.
//
// Per the task review:
//   - Per-grammar transformations: programmatic, scoped to keep entries
//     short and well-attested
//   - Canonical-level additions: small (3-5 per canonical), well-
//     attested from design literature
//   - Cap output to ~20 entries per card to avoid overwhelming the
//     consuming AI tool with redundant directives
//
// AUTHORING CONVENTION FOR CANONICAL-LEVEL ANTI-PATTERN STRINGS:
// Anti-pattern strings end in `.` or `!`. Quoted phrases mid-sentence
// are fine, but the entry's TERMINAL character must be punctuation
// (period or exclamation), not a quote mark. Tests assert this so
// automated checks remain stable. Future contributors adding
// canonical-level entries: phrase quotes inside the sentence (e.g.,
// "like 'Book now' framing") and end with a period — not "...like
// 'Book now!'" with the close-quote after the exclamation.

import type { Axis } from "../../types/axis.js";
import { ALL_AXES } from "../../types/axis.js";
import type { Corpus } from "../../types/corpus.js";
import type { RoutedCombination } from "../../types/routing.js";
import type { Grammar } from "../../types/grammar.js";

/** Cap on total anti_patterns per card to keep the consuming AI tool focused. */
const MAX_ANTI_PATTERNS_PER_CARD = 20;

/**
 * Per-grammar anti-pattern caps. Most grammars need ~1-2 anti_vibes
 * surfaced as anti_patterns; the most-discriminating ones rather than
 * every anti_vibe in the bucket.
 */
const PER_GRAMMAR_ANTI_PATTERN_CAP = 2;

/**
 * Build the anti_patterns list for a card from the routed combination
 * and (optional) matched canonical. Combines per-grammar transformed
 * anti-patterns with canonical-level directives, deduplicates, and
 * caps the total.
 */
export function buildAntiPatterns(
  combination: RoutedCombination,
  canonicalMatch: string | null,
  corpus: Corpus,
): string[] {
  const collected: string[] = [];

  // Per-grammar transformations from each routed axis's grammar.
  for (const axis of ALL_AXES) {
    if (axis === "voice") {
      // Voice anti-patterns live in voice_guidelines.do_not_use,
      // not anti_patterns. Skip here to avoid duplication.
      continue;
    }
    const grammarId =
      combination[axis as Exclude<Axis, "voice">]?.grammar_id;
    if (grammarId === undefined) continue;
    const grammar = corpus.axes[axis as Exclude<Axis, "voice">].find(
      (g) => g.id === grammarId,
    );
    if (grammar === undefined) continue;
    const transformed = transformAntiVibes(grammar, axis as Exclude<Axis, "voice">);
    collected.push(...transformed.slice(0, PER_GRAMMAR_ANTI_PATTERN_CAP));
  }

  // Canonical-level additions.
  if (canonicalMatch !== null) {
    const canonicalDirectives = CANONICAL_ANTI_PATTERNS[canonicalMatch] ?? [];
    collected.push(...canonicalDirectives);
  }

  // Dedupe and cap.
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of collected) {
    if (!seen.has(entry)) {
      seen.add(entry);
      result.push(entry);
      if (result.length >= MAX_ANTI_PATTERNS_PER_CARD) break;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Per-grammar transformation
// ---------------------------------------------------------------------------

/**
 * Transform a grammar's anti_vibes (rejection vocabulary) into anti-
 * patterns (build directives). The transformation is a small set of
 * pattern rewrites:
 *
 *   "no X"          → "Avoid X."
 *   "not X"         → "Avoid the X pattern."
 *   "no X everywhere" → "Avoid X across every surface; use the routed grammar's specific style."
 *
 * For some grammars the anti_vibes are ALREADY directive-shaped (e.g.,
 * "rounded-2xl on everything is the AI default — use this grammar
 * deliberately"); those pass through with light edits.
 *
 * The function is conservative: it produces transformations only for
 * anti_vibes that match recognizable patterns; novel or grammar-
 * specific anti_vibes that don't match get included verbatim with an
 * "Avoid: " prefix as the safe fallback.
 */
function transformAntiVibes(
  grammar: Grammar,
  axis: Exclude<Axis, "voice">,
): string[] {
  const out: string[] = [];
  for (const phrase of grammar.altnames.anti_vibes) {
    const directive = transformPhrase(phrase, grammar, axis);
    if (directive !== null) out.push(directive);
  }
  return out;
}

function transformPhrase(
  phrase: string,
  grammar: Grammar,
  axis: Exclude<Axis, "voice">,
): string | null {
  const trimmed = phrase.trim();
  if (trimmed.length === 0) return null;

  // Already directive-shaped (contains a verb instruction or longer prose).
  // Pass through as-is when it reads as a directive.
  if (
    trimmed.length > 60 ||
    /\b(use|avoid|prefer|drop|skip)\b/i.test(trimmed)
  ) {
    return capitalizeFirst(trimmed.replace(/[.!]+$/, "")) + ".";
  }

  // "no X everywhere" — common pattern across axes
  const everywhereMatch = trimmed.match(/^no (.+) everywhere$/i);
  if (everywhereMatch !== null) {
    return `Avoid ${everywhereMatch[1]} across every ${axis === "color" ? "surface" : axis === "typography" ? "level" : "element"}; the routed ${axis} grammar varies it deliberately.`;
  }

  // "no X" — generic
  const noMatch = trimmed.match(/^no (.+)$/i);
  if (noMatch !== null) {
    return `Avoid ${noMatch[1]}.`;
  }

  // "not X" — generic
  const notMatch = trimmed.match(/^not (.+)$/i);
  if (notMatch !== null) {
    return `Avoid the ${notMatch[1]} pattern; route to the ${grammar.name} discipline instead.`;
  }

  // Fallback: prefix with "Avoid: " so the directive shape is preserved
  // even when we can't parse the rejection pattern.
  return `Avoid: ${trimmed}.`;
}

function capitalizeFirst(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Canonical-level anti-pattern additions
// ---------------------------------------------------------------------------

/**
 * Per-canonical anti-pattern directives. Small lists (3-5 per
 * canonical), well-attested from design literature. Source attestation
 * for these is the same standard as Phase 2.1's altname methodology:
 * 925studios's AI-slop catalog, NN/G writing-for-the-web series,
 * specific design critiques in published sources.
 *
 * Not every canonical needs an entry — only canonicals with
 * established AI-default failure modes that go beyond what per-grammar
 * anti_vibes already capture.
 */
const CANONICAL_ANTI_PATTERNS: Record<string, string[]> = {
  "Standard SaaS Marketing": [
    "Avoid the centered-hero / three-column-features / testimonial-row / pricing-cards default layout — vary the rhythm or commit to it deliberately.",
    "Avoid generic SaaS hero copy: 'Build the future of [vertical]', 'all-in-one platform', 'scale without limits'.",
    "Avoid stock photography of diverse smiling people in front of laptops; use product screenshots, illustration, or skip imagery.",
  ],

  "Modern AI Startup": [
    "Avoid the purple-to-blue gradient hero with abstract 3D blob — it's the AI-launch-page tell when not deliberately deployed.",
    "Avoid generic AI marketing language: 'unlock the power of AI', 'AI-powered platform', 'agentic workflows'.",
    "Avoid mismatching dark-mode marketing with light-mode application UI without explanation.",
  ],

  "Luxury Hospitality": [
    "Avoid promotional language entirely; luxury voice sells by NOT selling.",
    "Avoid stock 'business class travel' photography; use specific, sense-of-place imagery commissioned or curated for the brand.",
    "Avoid CTAs that read as conversion funnels; use restrained 'Enquire' or 'Plan your stay' rather than urgent 'Book now' framing.",
  ],

  "Editorial Magazine": [
    "Avoid magazine-grid layouts that crop images for visual rhythm without honoring the underlying content; the grid serves the editorial, not the other way around.",
    "Avoid SEO-optimized headline structures ('The Ultimate Guide to X'); editorial headlines work because they reward reading.",
    "Avoid sidebar promotional units that interrupt long-form reading — magazine grammars value the reading experience.",
  ],

  "Editorial Long-Form (Substack / Stripe Press)": [
    "Avoid breaking the column with promotional inserts mid-article; long-form reading is the discipline.",
    "Avoid auto-play video or audio that interrupts the reading experience.",
    "Avoid 'recommended for you' algorithmic recirculation modules that pull readers out of the piece.",
  ],

  "Premium Editorial-Brand Hybrid (Soho House Tier)": [
    "Avoid SaaS-coded conversion patterns (CTA-stacked heroes, feature grids); the brand register doesn't sell the product, it conveys membership.",
    "Avoid stock photography; this register requires commissioned editorial imagery.",
    "Avoid pricing prominence on the brand site — that's a separate surface (the application), not the editorial brand site.",
  ],

  "Premium Consumer Hardware": [
    "Avoid centered-everything layouts on product detail pages; premium hardware uses asymmetric brand-stack with image dominance.",
    "Avoid generic product photography; lighting, framing, and color treatment matter as much as the product itself.",
    "Avoid spec-sheet density on the marketing surface; specs belong below the fold or on a separate page.",
  ],

  "Wellness / Beauty DTC": [
    "Avoid clinical or pharmaceutical visual language; the register is wellness, not medicine.",
    "Avoid before/after testimonial structures; they read as weight-loss-ad-coded.",
    "Avoid male-coded SaaS visual language (dark themes, technical screenshots) — DTC wellness has its own visual register.",
  ],

  "Application UI (Modern B2B Dashboard)": [
    "Avoid marketing-coded styling in application surfaces (large radius, generous padding, hero copy in modals).",
    "Avoid emoji in UI labels and error messages.",
    "Avoid 'please' in error messages — application UI is matter-of-fact, not apologetic.",
    "Avoid loading skeletons that don't match the actual loaded content's shape (causes layout shift).",
  ],

  "Developer Tool Marketing": [
    "Avoid abstracting away the technical mechanism; developer marketing readers want the mechanism, not the metaphor.",
    "Avoid 'developers love X' framing — show the API, the latency, the docs.",
    "Avoid corporate sales language ('schedule a demo'); developer-tool marketing converts via free tier and self-serve docs.",
  ],

  "E-Commerce Catalog": [
    "Avoid product detail pages without sufficient images, sizing, or shipping information; e-commerce browsers need decision-completing detail.",
    "Avoid hiding price behind a CTA click; price prominence is a category convention.",
    "Avoid auto-play product videos with sound; user-controlled playback is the ecommerce norm.",
  ],

  "Neo-Brutalist Indie SaaS": [
    "Avoid soft shadows, rounded radius, or glass-morph effects — the grammar is deliberately raw.",
    "Avoid corporate marketing language; the visual brutalism implies attitude in copy too.",
    "Avoid pretending to be a startup the brand isn't; Neo-Brutalist works when it's an honest signal of indie-ness.",
  ],

  "Awwwards-Tier Creative Agency": [
    "Avoid corporate-template homepage structures; agency sites earn trust through demonstrating their craft.",
    "Avoid testimonials from generic enterprise clients; case studies with specific work matter more.",
    "Avoid the 'About / Services / Contact' nav structure when the work is the offering.",
  ],

  "Cause / Journalism / Mission-Driven": [
    "Avoid promotional framing of mission work; cause / journalism voice reports rather than sells.",
    "Avoid stock 'inspirational' imagery; commissioned documentary or photojournalism imagery matters here.",
    "Avoid donate-button prominence in editorial coverage; mixed editorial / fundraising surfaces should separate concerns visibly.",
  ],

  "Plain Document (Paul Graham Tier)": [
    "Avoid any visual chrome that doesn't serve reading; this grammar is about removing decoration deliberately.",
    "Avoid sidebars, related-articles modules, sticky elements; they distract from the only thing that matters here — the text.",
    "Avoid web-fonts that don't measurably improve reading; system fonts are often the right call.",
  ],
};

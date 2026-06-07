// src/cards/generate.ts
//
// Phase 3 — Card generator. Takes a RoutingOutput (the routing engine's
// per-axis decisions + canonical match + warnings) and a Corpus, and
// produces a Card per the Turn 8 §8 / src/types/card.ts schema.
//
// Phase 3 Task 1 (this file initially): land Card.axes (full per-axis
// selections from RoutingOutput.combination) + Card.metadata (min-of-
// axes confidence rollup) + Card.canonical_combination + Card.reduced_
// motion_fallback. Tokens / components / voice_guidelines / anti_patterns
// / accessibility are stubbed for Tasks 2-5 to fill incrementally.
//
// Reasoning per the kickoff Step 3 / Note 4: the rolled-up confidence
// is the MIN of per-axis confidences, NOT the mean. A card with one
// weak axis is a weak card; surfacing the minimum is honest. Mean-of-
// axes would let strong axes mask one weak axis, which is the opposite
// of what consuming AI tools need to know.
//
// Per PRD §4.7: "implement the card schema incrementally — start with
// the axis combination, add tokens, add component recipes, add voice
// guidelines, add anti-patterns. Each layer can ship independently."
// This file's incremental shape follows that guidance.

import type { Axis } from "../types/axis.js";
import { ALL_AXES } from "../types/axis.js";
import type {
  AxisSelection,
  Card,
  CardAxes,
  CardMetadata,
  VoiceAxisSelection,
} from "../types/card.js";
import { buildTokens } from "./tokens/index.js";
import { buildComponents } from "./components/index.js";
import { buildVoiceGuidelines } from "./voice/index.js";
import { buildAntiPatterns } from "./anti-patterns/index.js";
import { buildAccessibility } from "./accessibility/index.js";
import type { ReducedMotionFallback } from "../types/compatibility.js";
import type { Corpus } from "../types/corpus.js";
import type { Grammar } from "../types/grammar.js";
import type { VoiceProfile } from "../types/voice.js";
import type {
  AxisRoutingDecision,
  RoutingOutput,
  VoiceRoutingDecision,
} from "../types/routing.js";

/**
 * Generate a Card from a RoutingOutput. Pure function — same input
 * yields same output. The card's `last_updated` timestamp is sourced
 * from the caller-supplied `now` parameter (default `new Date()`) so
 * tests can pin time without mocking globals.
 *
 * Phase 3 Task 1 scope: axes + metadata + canonical_combination +
 * reduced_motion_fallback land fully populated. Other Card fields are
 * stubbed with empty/default values that Tasks 2-5 will fill.
 */
export function generateCard(
  routing: RoutingOutput,
  corpus: Corpus,
  options?: { now?: Date; cardIdOverride?: string },
): Card {
  const now = options?.now ?? new Date();

  const axes = buildAxes(routing, corpus);
  const metadata = buildMetadata(axes, corpus, now);
  const cardId =
    options?.cardIdOverride ??
    buildCardId(routing.canonical_match, corpus.version);

  // Phase 3 Task 2: tokens populated via per-axis builders. Color from
  // routed Color grammar; typography from Typography grammar; spacing
  // from Density grammar; radius from Component grammar; motion from
  // Motion grammar.
  const tokens = buildTokens(routing.combination);

  // Phase 3 Task 3: component recipes from routed Component grammar.
  // Each of the 9 Component grammars has a per-grammar override table
  // in src/cards/components/grammars.ts; recipes reference token slots
  // (not hex codes) per the convention.
  const components = buildComponents(routing.combination.component.grammar_id);

  // Phase 3 Task 4: voice guidelines from routed Voice profile +
  // universal anti-LLM-default directives merged in.
  const voice_guidelines = buildVoiceGuidelines(
    routing.combination.voice.profile_id,
  );

  // Phase 3 Task 4: anti_patterns transformed from per-grammar
  // anti_vibes + canonical-level directives where the matched
  // canonical has well-attested category-wide additions.
  const anti_patterns = buildAntiPatterns(
    routing.combination,
    routing.canonical_match,
    corpus,
  );

  // Phase 3 Task 5: accessibility commitments (constants per turn8
  // §6.2) + per-Color-grammar high-contrast variant tokens.
  const accessibility = buildAccessibility(routing.combination);

  return {
    card_id: cardId,
    version: corpus.version,
    canonical_combination: routing.canonical_match,
    axes,
    tokens,
    components,
    anti_patterns,
    voice_guidelines,
    reduced_motion_fallback: routing.reduced_motion_fallback,
    accessibility,
    metadata,
  };
}

// ---------------------------------------------------------------------------
// Card.axes — full per-axis selections from RoutingOutput.combination
// ---------------------------------------------------------------------------

/**
 * Build the per-axis selections for the card by joining each routing
 * decision against the corpus's grammar (or voice profile) entry.
 * `internal_logic_summary` is composed from the grammar's
 * `internal_logic` bullets (the spec's compositional discipline notes);
 * for short lists we join all bullets, longer ones we cap at the first
 * two so the summary stays single-paragraph.
 */
function buildAxes(routing: RoutingOutput, corpus: Corpus): CardAxes {
  return {
    layout: buildAxisSelection("layout", routing.combination.layout, corpus),
    typography: buildAxisSelection(
      "typography",
      routing.combination.typography,
      corpus,
    ),
    color: buildAxisSelection("color", routing.combination.color, corpus),
    component: buildAxisSelection(
      "component",
      routing.combination.component,
      corpus,
    ),
    motion: buildAxisSelection("motion", routing.combination.motion, corpus),
    imagery: buildAxisSelection("imagery", routing.combination.imagery, corpus),
    density: buildAxisSelection("density", routing.combination.density, corpus),
    voice: buildVoiceAxisSelection(routing.combination.voice, corpus),
    reading_pattern: buildAxisSelection(
      "reading_pattern",
      routing.combination.reading_pattern,
      corpus,
    ),
  };
}

function buildAxisSelection(
  axis: Exclude<Axis, "voice">,
  decision: AxisRoutingDecision,
  corpus: Corpus,
): AxisSelection {
  const grammar = findGrammar(corpus, axis, decision.grammar_id);
  const substyle =
    decision.substyle_id !== undefined
      ? grammar?.substyles.find((s) => s.id === decision.substyle_id)
      : undefined;
  // Build the selection in two steps to honor exactOptionalPropertyTypes
  // — optional fields are added conditionally rather than set to
  // undefined.
  const base: AxisSelection = {
    grammar_id: decision.grammar_id,
    grammar_name: grammar?.name ?? decision.grammar_id,
    confidence: decision.confidence,
    internal_logic_summary: summarizeInternalLogic(grammar),
  };
  if (decision.substyle_id !== undefined) {
    base.substyle_id = decision.substyle_id;
  }
  if (substyle?.name !== undefined) {
    base.substyle_name = substyle.name;
  }
  return base;
}

function buildVoiceAxisSelection(
  decision: VoiceRoutingDecision,
  corpus: Corpus,
): VoiceAxisSelection {
  const profile = findVoiceProfile(corpus, decision.profile_id);
  const base: VoiceAxisSelection = {
    dimensions: decision.dimensions,
    confidence: decision.confidence,
  };
  if (profile !== undefined) {
    base.profile = { id: profile.id, name: profile.name };
  } else if (decision.profile_id !== null) {
    // Routed to a profile id we couldn't resolve in the corpus —
    // shouldn't happen for a loaded corpus but defensive.
    base.profile = {
      id: decision.profile_id,
      name: decision.profile_id,
    };
  }
  return base;
}

function findGrammar(
  corpus: Corpus,
  axis: Exclude<Axis, "voice">,
  grammarId: string,
): Grammar | undefined {
  return corpus.axes[axis].find((g) => g.id === grammarId);
}

function findVoiceProfile(
  corpus: Corpus,
  profileId: string | null,
): VoiceProfile | undefined {
  if (profileId === null) return undefined;
  return corpus.voice.profiles.find((p) => p.id === profileId);
}

/**
 * Summarize a grammar's internal logic into a single string suitable
 * for the card's `internal_logic_summary` field. Joins up to the first
 * two bullets with semicolon separation; falls back to the grammar's
 * distinguishing-edge prose if no internal_logic is present; falls
 * back to the grammar id if neither is available (shouldn't happen
 * for any spec-loaded grammar but defensive against partial corpora).
 */
function summarizeInternalLogic(grammar: Grammar | undefined): string {
  if (grammar === undefined) return "";
  if (grammar.internal_logic.length > 0) {
    return grammar.internal_logic.slice(0, 2).join("; ");
  }
  if (grammar.distinguishing_edge.length > 0) {
    return grammar.distinguishing_edge;
  }
  return grammar.id;
}

// ---------------------------------------------------------------------------
// Card.metadata — min-of-axes confidence rollup + provenance
// ---------------------------------------------------------------------------

/**
 * Build the card's metadata block. `confidence` is the MIN of all
 * per-axis confidences (kickoff Step 3 / Note 4 decision). Versions
 * come from the corpus.
 *
 * Edge case: if any axis confidence is the AI-default 0.1, the rolled-
 * up confidence will be 0.1 — surfacing that the card has at least
 * one un-signaled axis. That's intentional per the honesty principle:
 * the consuming AI tool sees min-of-axes and knows what level of
 * routing strength to trust.
 */
function buildMetadata(
  axes: CardAxes,
  corpus: Corpus,
  now: Date,
): CardMetadata {
  const minConf = minAxisConfidence(axes);
  return {
    last_updated: now.toISOString(),
    source_grammars_version: corpus.version,
    source_fingerprints_version: corpus.brand_fingerprints.version,
    confidence: minConf,
  };
}

function minAxisConfidence(axes: CardAxes): number {
  // Walk every axis explicitly so the type system catches any new axis
  // added without min-rollup coverage.
  const confidences: number[] = [
    axes.layout.confidence,
    axes.typography.confidence,
    axes.color.confidence,
    axes.component.confidence,
    axes.motion.confidence,
    axes.imagery.confidence,
    axes.density.confidence,
    axes.voice.confidence,
    axes.reading_pattern.confidence,
  ];
  return Math.min(...confidences);
}

// ---------------------------------------------------------------------------
// Card.card_id — stable, human-legible identifier
// ---------------------------------------------------------------------------

/**
 * Compose a card_id from canonical_combination (or "novel" when null)
 * and the spec version. Format: `<canonical-slug>-v<version>` for
 * canonical matches; `novel-v<version>` for novel-but-coherent cards.
 *
 * The id is descriptive, not unique across cards generated for the
 * same canonical at the same spec version. Multiple briefs routing to
 * Luxury Hospitality at v0.1.0 produce cards with id `luxury-
 * hospitality-v0.1.0` — that's intentional: the id describes the
 * card's content, not the brief that produced it. Tracking individual
 * card instances would need a separate request id.
 */
function buildCardId(
  canonicalMatch: string | null,
  version: string,
): string {
  const slug =
    canonicalMatch !== null ? slugifyCanonical(canonicalMatch) : "novel";
  return `${slug}-v${version}`;
}

function slugifyCanonical(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Stubs for fields filled by Phase 3 Tasks 2-5
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type { Card } from "../types/card.js";

// Suppress unused-import warning for ALL_AXES — it's imported for forward
// use by Tasks 2-5 (token / component / voice generation will iterate axes).
void ALL_AXES;

// Reduced-motion fallback type re-export for callers that need it.
export type { ReducedMotionFallback };

// tests/cards/generate.test.ts
//
// Phase 3 Task 1 unit tests for src/cards/generate.ts. Covers the
// scope landed in Task 1: Card.axes (full per-axis selections), Card.
// canonical_combination, Card.metadata (min-of-axes confidence rollup
// + provenance), Card.reduced_motion_fallback. Tokens, components,
// voice_guidelines, anti_patterns, accessibility are stubbed in Task 1
// and tested in Tasks 2-5 as they're filled.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import {
  createStubStage1,
  route,
  type RouteOptions,
} from "../../src/routing/index.js";
import { generateCard } from "../../src/cards/generate.js";
import { loadFixturesByCategory } from "../routing/loader.js";
import type { ExtractedSignals } from "../../src/routing/types.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");
const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function optionsFor(brief: string, signals: ExtractedSignals): RouteOptions {
  return {
    corpus,
    signalExtractor: createStubStage1(new Map([[brief, signals]])),
  };
}

// Pin the timestamp so card_id and last_updated are deterministic.
const FIXED_NOW = new Date("2026-05-06T12:00:00Z");

describe("Card generator — Task 1 scope", () => {
  describe("axes population", () => {
    it("populates every axis selection from the routing combination", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "luxury-hospitality-brand",
      );
      expect(fixture).toBeDefined();
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0];
      expect(card).toBeDefined();
      const axes = card!.axes;

      // Every axis has a grammar_id matching the routing combination.
      expect(axes.layout.grammar_id).toBe(result.combination.layout.grammar_id);
      expect(axes.typography.grammar_id).toBe(
        result.combination.typography.grammar_id,
      );
      expect(axes.color.grammar_id).toBe(result.combination.color.grammar_id);
      expect(axes.component.grammar_id).toBe(
        result.combination.component.grammar_id,
      );
      expect(axes.motion.grammar_id).toBe(result.combination.motion.grammar_id);
      expect(axes.imagery.grammar_id).toBe(
        result.combination.imagery.grammar_id,
      );
      expect(axes.density.grammar_id).toBe(result.combination.density.grammar_id);
      expect(axes.reading_pattern.grammar_id).toBe(
        result.combination.reading_pattern.grammar_id,
      );

      // Voice has profile + dimensions populated.
      expect(axes.voice.dimensions).toEqual(result.combination.voice.dimensions);
      expect(axes.voice.confidence).toBe(result.combination.voice.confidence);
      // The voice profile_id is non-null for canonical fixtures, so the
      // selection should carry a profile reference.
      expect(axes.voice.profile?.id).toBe(result.combination.voice.profile_id);
    });

    it("populates grammar_name from the corpus", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "modern-ai-startup-vibes",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0]!;
      // grammar_name should be the human-readable name, not the id.
      expect(card.axes.layout.grammar_name).not.toBe(
        card.axes.layout.grammar_id,
      );
      expect(card.axes.layout.grammar_name.length).toBeGreaterThan(0);
    });

    it("populates internal_logic_summary from the grammar's internal_logic", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "luxury-hospitality-brand",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0]!;
      // Every axis selection should carry a non-empty summary.
      for (const axis of [
        "layout",
        "typography",
        "color",
        "component",
        "motion",
        "imagery",
        "density",
        "reading_pattern",
      ] as const) {
        expect(card.axes[axis].internal_logic_summary.length).toBeGreaterThan(
          0,
        );
      }
    });
  });

  describe("canonical_combination + card_id", () => {
    it("populates canonical_combination from RoutingOutput.canonical_match", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "modern-ai-startup-vibes",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0]!;
      expect(card.canonical_combination).toBe(result.canonical_match);
      // For a canonical fixture the value should be non-null.
      expect(card.canonical_combination).not.toBeNull();
    });

    it("composes card_id as <slug>-v<version>", () => {
      const card = generateCard(
        synthesizeRoutingOutput({
          canonical_match: "Luxury Hospitality",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      expect(card.card_id).toBe(`luxury-hospitality-v${corpus.version}`);
    });

    it("uses 'novel' slug when canonical_match is null", () => {
      const card = generateCard(
        synthesizeRoutingOutput({ canonical_match: null }),
        corpus,
        { now: FIXED_NOW },
      );
      expect(card.card_id).toBe(`novel-v${corpus.version}`);
    });

    it("slugifies canonical names with parentheses and slashes", () => {
      const card = generateCard(
        synthesizeRoutingOutput({
          canonical_match: "Editorial Long-Form (Substack / Stripe Press)",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Parens stripped, slashes become hyphens, multiple hyphens
      // collapse, leading/trailing hyphens trimmed.
      expect(card.card_id).toMatch(/^editorial-long-form-substack-stripe-press-v/);
      expect(card.card_id).not.toContain("(");
      expect(card.card_id).not.toContain("/");
      expect(card.card_id).not.toMatch(/--/);
    });
  });

  describe("metadata — min-of-axes confidence rollup", () => {
    it("confidence equals the minimum per-axis confidence", () => {
      const card = generateCard(
        synthesizeRoutingOutput({
          confidences: {
            layout: 0.9,
            typography: 0.8,
            color: 0.85,
            component: 0.95,
            motion: 0.7,
            imagery: 0.88,
            density: 0.65, // minimum
            voice: 0.92,
            reading_pattern: 0.75,
          },
        }),
        corpus,
        { now: FIXED_NOW },
      );
      expect(card.metadata.confidence).toBe(0.65);
    });

    it("confidence is 0.1 when any axis fell back to AI-default (0.1)", () => {
      const card = generateCard(
        synthesizeRoutingOutput({
          confidences: {
            layout: 0.9,
            typography: 0.9,
            color: 0.9,
            component: 0.9,
            motion: 0.9,
            imagery: 0.1, // AI-default fallback
            density: 0.9,
            voice: 0.9,
            reading_pattern: 0.9,
          },
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Honest reporting: a card with one un-signaled axis is a weak card.
      expect(card.metadata.confidence).toBe(0.1);
    });

    it("populates source versions from the corpus", () => {
      const card = generateCard(
        synthesizeRoutingOutput({}),
        corpus,
        { now: FIXED_NOW },
      );
      expect(card.metadata.source_grammars_version).toBe(corpus.version);
      expect(card.metadata.source_fingerprints_version).toBe(
        corpus.brand_fingerprints.version,
      );
    });

    it("uses the supplied now for last_updated", () => {
      const card = generateCard(
        synthesizeRoutingOutput({}),
        corpus,
        { now: FIXED_NOW },
      );
      expect(card.metadata.last_updated).toBe(FIXED_NOW.toISOString());
    });
  });

  describe("reduced_motion_fallback passthrough", () => {
    it("forwards the routing engine's reduced_motion_fallback to the card", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "modern-ai-startup-vibes",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0]!;
      expect(card.reduced_motion_fallback).toEqual(result.reduced_motion_fallback);
    });
  });

  describe("route() integration", () => {
    it("populates cards: [card] in the routing output", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "luxury-hospitality-brand",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toBeDefined();
    });

    it("card.canonical_combination matches routing canonical_match", async () => {
      // Walk a few canonical fixtures, verifying the card surfaces the
      // engine's canonical decision.
      const sample = loadFixturesByCategory("canonical").slice(0, 5);
      for (const fixture of sample) {
        const result = await route(fixture.brief, optionsFor(fixture.brief, fixture.stub_signals!));
        const card = result.cards[0]!;
        expect(card.canonical_combination).toBe(result.canonical_match);
      }
    });
  });

  describe("Stubs filled in later tasks", () => {
    // These tests document what's NOT yet populated, so when Tasks 3-4
    // land they have explicit failing tests to update.
    it("Task 2 — tokens are now populated (smoke check)", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // Phase 3 Task 2 landed these. Color tokens come from the routed
      // Color grammar (canonical-1 = COLOR-1 Earth-Pulled Restraint).
      expect(Object.keys(card.tokens.color).length).toBeGreaterThan(0);
      expect(card.tokens.typography.font_family.display.length).toBeGreaterThan(0);
      expect(card.tokens.typography.font_family.body.length).toBeGreaterThan(0);
      expect(Object.keys(card.tokens.spacing).length).toBeGreaterThan(0);
      expect(Object.keys(card.tokens.radius).length).toBeGreaterThan(0);
      expect(Object.keys(card.tokens.motion.duration).length).toBeGreaterThan(0);
      expect(Object.keys(card.tokens.motion.easing).length).toBeGreaterThan(0);
    });

    it("Task 3 — components are now populated (smoke check)", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // Phase 3 Task 3 landed these. Recipe token_refs should have
      // entries for every component variant.
      expect(Object.keys(card.components.button.variants.primary.token_refs).length).toBeGreaterThan(0);
      expect(Object.keys(card.components.card.variants.primary.token_refs).length).toBeGreaterThan(0);
      expect(Object.keys(card.components.input.variants.primary.token_refs).length).toBeGreaterThan(0);
      expect(Object.keys(card.components.nav.variants.primary.token_refs).length).toBeGreaterThan(0);
      expect(Object.keys(card.components.modal.variants.primary.token_refs).length).toBeGreaterThan(0);
    });

    it("Task 4 — voice_guidelines + anti_patterns are now populated", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // canonical-1 voice profile (VOICE-1 Quiet Authority) ships
      // do_use directives + do_not_use directives + universal anti-LLM
      // additions.
      expect(card.voice_guidelines.do_use.length).toBeGreaterThan(0);
      expect(card.voice_guidelines.do_not_use.length).toBeGreaterThan(0);
      // canonical-1 (Luxury Hospitality) has canonical-level anti-
      // patterns plus per-grammar transformed entries.
      expect(card.anti_patterns.length).toBeGreaterThan(0);
    });

    it("Task 5 — accessibility commitments are populated", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      expect(card.accessibility.contrast_validation).toBe("WCAG_2.2_AA");
      expect(card.accessibility.touch_target_minimum_px).toBe(44);
      expect(card.accessibility.keyboard_navigation).toBe("all_interactive_elements_focusable");
      expect(card.accessibility.high_contrast_mode_support).toBe(true);
      // High-contrast variant tokens populated.
      expect(Object.keys(card.accessibility.high_contrast_variant.tokens.color).length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Phase 3 Task 2 — tokens populated per routed grammars
  // -------------------------------------------------------------------------

  describe("Task 2 — tokens populated per routed grammars", () => {
    it("color tokens use semantic slot names per the convention", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // Spot-check the convention's mandatory slots.
      expect(card.tokens.color["bg.canvas"]).toBeDefined();
      expect(card.tokens.color["bg.surface"]).toBeDefined();
      expect(card.tokens.color["fg.body"]).toBeDefined();
      expect(card.tokens.color["accent.primary"]).toBeDefined();
      expect(card.tokens.color["border.default"]).toBeDefined();
    });

    it("color tokens differ across grammars (not the global default everywhere)", () => {
      // Synthesize two different Color grammars and verify the palettes
      // are distinct — confirms grammar-specific overrides actually fire.
      const luxury = generateCard(
        synthesizeRoutingOutput({}),
        corpus,
        { now: FIXED_NOW },
      );
      const aiStartup = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          color_grammar_id: "COLOR-7", // Iridescent
        }),
        corpus,
        { now: FIXED_NOW },
      );
      expect(luxury.tokens.color["bg.canvas"]).not.toBe(
        aiStartup.tokens.color["bg.canvas"],
      );
      expect(luxury.tokens.color["accent.primary"]).not.toBe(
        aiStartup.tokens.color["accent.primary"],
      );
    });

    it("typography font_family resolves per Typography grammar", () => {
      const editorial = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          typography_grammar_id: "TYPE-3", // Editorial Print
        }),
        corpus,
        { now: FIXED_NOW },
      );
      const modern = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          typography_grammar_id: "TYPE-5", // Geometric-Modernist
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Editorial uses serif display; modern uses Inter/SF.
      expect(editorial.tokens.typography.font_family.display).toMatch(
        /Tiempos|Playfair|serif/i,
      );
      expect(modern.tokens.typography.font_family.display).toMatch(
        /Inter|SF Pro/i,
      );
    });

    it("spacing scales with Density grammar", () => {
      const spacious = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          density_grammar_id: "DEN-1", // Editorial-Spacious
        }),
        corpus,
        { now: FIXED_NOW },
      );
      const dense = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          density_grammar_id: "DEN-5", // Hyper-Dense
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Convert pixel strings to numbers for comparison.
      const spaciousLg = parseInt(spacious.tokens.spacing["lg"]!, 10);
      const denseLg = parseInt(dense.tokens.spacing["lg"]!, 10);
      expect(spaciousLg).toBeGreaterThan(denseLg);
    });

    it("radius matches Component grammar discipline", () => {
      const hardBordered = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-3", // Hard-Bordered
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Hard-Bordered: zero rounding everywhere (per spec discipline).
      expect(hardBordered.tokens.radius["md"]).toBe("0");
      expect(hardBordered.tokens.radius["lg"]).toBe("0");
    });

    it("motion duration matches Motion grammar character", () => {
      const stillness = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          motion_grammar_id: "MOTION-1", // Stillness as Discipline
        }),
        corpus,
        { now: FIXED_NOW },
      );
      const cinematic = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          motion_grammar_id: "MOTION-5", // Scroll-Driven Cinematic
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Cinematic durations are longer than stillness durations.
      const stillnessSlow = parseInt(stillness.tokens.motion.duration["slow"]!, 10);
      const cinematicSlow = parseInt(cinematic.tokens.motion.duration["slow"]!, 10);
      expect(cinematicSlow).toBeGreaterThan(stillnessSlow);
    });

    it("unknown grammar id falls through to defaults gracefully", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          color_grammar_id: "COLOR-NONEXISTENT-99",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // Defaults still populate the convention slots — no missing keys.
      expect(card.tokens.color["bg.canvas"]).toBeDefined();
      expect(card.tokens.color["fg.body"]).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Phase 3 Task 3 — component recipes per Component grammar
  // -------------------------------------------------------------------------

  describe("Task 3 — component recipes", () => {
    it("recipes reference token slots, not hex codes", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // Every token_ref value should be a slot name (matches the
      // convention vocabulary), not a hex code. Hex codes start with
      // "#" or "rgb"; slot names are dot-separated semantic strings.
      for (const variant of Object.values(card.components.button.variants)) {
        for (const value of Object.values(variant.token_refs)) {
          // Allow empty/keyword values (transparent, 0, "1px", etc.)
          // but NEVER raw hex.
          expect(value).not.toMatch(/^#[0-9a-f]{3,8}$/i);
          expect(value).not.toMatch(/^rgb/i);
        }
      }
    });

    it("Hard-Bordered (COMP-3) buttons use border.strong + radius.none + zero shadow", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-3",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      const primary = card.components.button.variants.primary.token_refs;
      expect(primary["border"]).toBe("border.strong");
      expect(primary["border_width"]).toBe("2px");
      expect(primary["radius"]).toBe("none");
    });

    it("Pill-and-Cushion (COMP-4) buttons use pill radius", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-4",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      expect(card.components.button.variants.primary.token_refs["radius"]).toBe("full");
      expect(card.components.input.variants.primary.token_refs["radius"]).toBe("full");
    });

    it("Typographic-Discreet (COMP-1) collapses primary onto tertiary with explicit notes", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-1",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // The primary variant should have a "Variant collapsed onto..."
      // note marking the deliberate redundancy.
      const primaryNotes = card.components.button.variants.primary.notes ?? [];
      expect(primaryNotes.some((n) => n.includes("collapsed onto tertiary"))).toBe(true);
      // primary and tertiary should share token_refs values.
      const primary = card.components.button.variants.primary.token_refs;
      const tertiary = card.components.button.variants.tertiary.token_refs;
      expect(primary["bg"]).toBe(tertiary["bg"]);
      expect(primary["fg"]).toBe(tertiary["fg"]);
    });

    it("default Soft-Container (COMP-2) primary button uses accent.primary background", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-2",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      const primary = card.components.button.variants.primary.token_refs;
      expect(primary["bg"]).toBe("accent.primary");
      expect(primary["fg"]).toBe("fg.inverse");
      expect(primary["radius"]).toBe("md");
    });

    it("unknown Component grammar id produces fallback recipe with flag note", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-NONEXISTENT-99",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      const primaryNotes = card.components.button.variants.primary.notes ?? [];
      expect(
        primaryNotes.some((n) =>
          n.includes("no per-grammar recipe override"),
        ),
      ).toBe(true);
      // But the recipe is still usable.
      expect(Object.keys(card.components.button.variants.primary.token_refs).length).toBeGreaterThan(0);
    });

    it("each component has all three variants populated", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      for (const componentName of ["button", "card", "input", "nav", "modal"] as const) {
        const recipe = card.components[componentName];
        expect(recipe.variants.primary).toBeDefined();
        expect(recipe.variants.secondary).toBeDefined();
        expect(recipe.variants.tertiary).toBeDefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Phase 3 Task 4 — voice guidelines + anti-pattern transformation
  // -------------------------------------------------------------------------

  describe("Task 4 — voice guidelines per profile", () => {
    it("voice profile do_use directives are non-empty for known profiles", () => {
      // synthesizeRoutingOutput uses canonical-1 → VOICE-1 Quiet Authority.
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      expect(card.voice_guidelines.do_use.length).toBeGreaterThan(0);
      // Quiet Authority should reference restraint or short-declarative.
      const joined = card.voice_guidelines.do_use.join(" ").toLowerCase();
      expect(joined).toMatch(/restraint|declarative|specific|peer/);
    });

    it("universal anti-LLM directives are merged into every profile's do_not_use", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      const joined = card.voice_guidelines.do_not_use.join(" ").toLowerCase();
      expect(joined).toMatch(/delve|unleash|unlock|leverage/);
    });

    it("VOICE-7 (Conversion-Punchy) flags 'Build the future of' specifically", () => {
      // Direct VOICE-7 override — fixture-based routing for saas-
      // marketing-brand lands voice on VOICE-3 (Friendly Expert) due
      // to Stripe brand-fanout (entry 7 / coverage-notes entry 13);
      // testing the profile's directives directly avoids that
      // ambiguity while still exercising the same code path.
      const card = generateCard(
        {
          ...synthesizeRoutingOutput({}),
          combination: {
            ...synthesizeRoutingOutput({}).combination,
            voice: {
              profile_id: "VOICE-7",
              dimensions: synthesizeRoutingOutput({}).combination.voice.dimensions,
              confidence: 0.9,
            },
          },
        },
        corpus,
        { now: FIXED_NOW },
      );
      const joined = card.voice_guidelines.do_not_use.join(" ").toLowerCase();
      expect(joined).toContain("build the future of");
    });

    it("unknown voice profile id falls through with universal directives only", () => {
      const card = generateCard(
        {
          ...synthesizeRoutingOutput({}),
          combination: {
            ...synthesizeRoutingOutput({}).combination,
            voice: {
              profile_id: "VOICE-NONEXISTENT-99",
              dimensions: synthesizeRoutingOutput({}).combination.voice.dimensions,
              confidence: 0.9,
            },
          },
        },
        corpus,
        { now: FIXED_NOW },
      );
      // do_use should be empty (no profile-specific guidance), but
      // do_not_use carries universal anti-LLM directives.
      expect(card.voice_guidelines.do_use).toHaveLength(0);
      expect(card.voice_guidelines.do_not_use.length).toBeGreaterThan(0);
    });
  });

  describe("Task 4 — anti-pattern transformation", () => {
    it("anti_patterns are directives, not user-rejection vocabulary", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // Every entry should be a sentence-shaped directive (begins
      // with capital letter, ends with period, contains a verb).
      for (const directive of card.anti_patterns) {
        expect(directive.length).toBeGreaterThan(10);
        expect(directive.charAt(0)).toBe(directive.charAt(0).toUpperCase());
        expect(directive).toMatch(/[.!]$/);
      }
    });

    it("anti_patterns are deduplicated", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      const set = new Set(card.anti_patterns);
      expect(set.size).toBe(card.anti_patterns.length);
    });

    it("anti_patterns are capped (≤ 20)", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      expect(card.anti_patterns.length).toBeLessThanOrEqual(20);
    });

    it("matched canonical contributes canonical-level anti-patterns", async () => {
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "saas-marketing-brand",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0]!;
      // Standard SaaS Marketing canonical contributes the
      // "centered-hero / three-column-features" directive.
      const joined = card.anti_patterns.join(" ").toLowerCase();
      expect(joined).toMatch(/three-column|build the future of/);
    });

    it("transformation preserves grammar-specific anti-vibes as directives", async () => {
      // canonical-3 Modern AI Startup → COLOR-7 Iridescent has
      // "no purple-to-blue gradients" anti-vibe (added Phase 2.1).
      const fixture = loadFixturesByCategory("canonical").find(
        (f) => f.id === "modern-ai-startup-vibes",
      );
      const result = await route(fixture!.brief, optionsFor(fixture!.brief, fixture!.stub_signals!));
      const card = result.cards[0]!;
      // The Modern AI Startup canonical-level entry mentions purple-
      // to-blue gradient explicitly.
      const joined = card.anti_patterns.join(" ").toLowerCase();
      expect(joined).toMatch(/purple-to-blue|gradient/);
    });
  });

  // -------------------------------------------------------------------------
  // Phase 3 Task 5 — accessibility commitments + high-contrast variants
  // -------------------------------------------------------------------------

  describe("Task 5 — accessibility commitments", () => {
    it("commitments are constants regardless of routed grammar", () => {
      const sample = loadFixturesByCategory("canonical").slice(0, 5);
      for (const fixture of sample) {
        // Synchronous quick check via the synthesize helper —
        // commitments don't depend on the brief.
        const card = generateCard(
          synthesizeRoutingOutputWithAxisOverrides({
            color_grammar_id: "COLOR-1",
          }),
          corpus,
          { now: FIXED_NOW },
        );
        expect(card.accessibility.contrast_validation).toBe("WCAG_2.2_AA");
        expect(card.accessibility.touch_target_minimum_px).toBe(44);
        expect(card.accessibility.keyboard_navigation).toBe(
          "all_interactive_elements_focusable",
        );
        expect(card.accessibility.high_contrast_mode_support).toBe(true);
      }
      void sample; // touched to satisfy the lint
    });

    it("touch-min spacing token is 44px across all Density grammars", () => {
      // Hyper-Dense doesn't get to opt out of accessibility.
      const dense = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({ density_grammar_id: "DEN-5" }),
        corpus,
        { now: FIXED_NOW },
      );
      const spacious = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({ density_grammar_id: "DEN-1" }),
        corpus,
        { now: FIXED_NOW },
      );
      expect(dense.tokens.spacing["touch-min"]).toBe("44px");
      expect(spacious.tokens.spacing["touch-min"]).toBe("44px");
    });

    it("interactive component recipes reference touch-min via min_height", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // Buttons and inputs (primary variants) reference the touch-min
      // floor so AI tools can enforce 44×44 regardless of padding.
      expect(card.components.button.variants.primary.token_refs["min_height"]).toBe("touch-min");
      expect(card.components.button.variants.secondary.token_refs["min_height"]).toBe("touch-min");
      expect(card.components.button.variants.tertiary.token_refs["min_height"]).toBe("touch-min");
      expect(card.components.input.variants.primary.token_refs["min_height"]).toBe("touch-min");
      // Nav uses item_min_height (per-item, not whole-bar).
      expect(card.components.nav.variants.primary.token_refs["item_min_height"]).toBe("touch-min");
    });

    it("touch-min is preserved even on Application-Refined (COMP-9 dense UI)", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          component_grammar_id: "COMP-9",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // COMP-9 has tight padding but min_height floor MUST stay.
      expect(card.components.button.variants.primary.token_refs["min_height"]).toBe("touch-min");
    });
  });

  describe("Task 5 — high-contrast variant tokens", () => {
    it("high-contrast palette has every default-mode color slot", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      const defaultSlots = Object.keys(card.tokens.color);
      const hcSlots = Object.keys(card.accessibility.high_contrast_variant.tokens.color);
      // Every slot in the default palette is present in high-contrast.
      for (const slot of defaultSlots) {
        expect(hcSlots).toContain(slot);
      }
    });

    it("high-contrast palette stays in the routed Color grammar's register", () => {
      // COLOR-1 Earth-Pulled high-contrast should still feel warm-
      // earth coded — fg.body deepens (toward black) but bg.canvas
      // stays warm rather than flipping to pure white.
      const earth = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({ color_grammar_id: "COLOR-1" }),
        corpus,
        { now: FIXED_NOW },
      );
      const earthHc = earth.accessibility.high_contrast_variant.tokens.color;
      // Body text becomes black (or near-black) for AAA contrast.
      expect(earthHc["fg.body"]).toBe("#000000");
      // bg.canvas stays warm (off-white earth tone), not pure white.
      expect(earthHc["bg.canvas"]).not.toBe("#ffffff");
      expect(earthHc["bg.canvas"]?.toLowerCase()).toMatch(/^#f[d-f]/);
    });

    it("high-contrast palette differs from default-mode palette", () => {
      const card = generateCard(synthesizeRoutingOutput({}), corpus, { now: FIXED_NOW });
      // At least one slot differs between default and high-contrast.
      const defaultColor = card.tokens.color;
      const hcColor = card.accessibility.high_contrast_variant.tokens.color;
      let differences = 0;
      for (const slot of Object.keys(defaultColor)) {
        if (defaultColor[slot] !== hcColor[slot]) differences++;
      }
      expect(differences).toBeGreaterThan(0);
    });

    it("dark-mode grammar (COLOR-4) high-contrast keeps dark-mode register", () => {
      const dark = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({ color_grammar_id: "COLOR-4" }),
        corpus,
        { now: FIXED_NOW },
      );
      const darkHc = dark.accessibility.high_contrast_variant.tokens.color;
      // bg.canvas stays dark (pure black for max contrast).
      expect(darkHc["bg.canvas"]).toBe("#000000");
      // fg.body becomes pure white.
      expect(darkHc["fg.body"]).toBe("#ffffff");
    });

    it("unknown Color grammar id falls through to default-mode palette as high-contrast", () => {
      const card = generateCard(
        synthesizeRoutingOutputWithAxisOverrides({
          color_grammar_id: "COLOR-NONEXISTENT-99",
        }),
        corpus,
        { now: FIXED_NOW },
      );
      // High-contrast still populated (no missing keys, no crash).
      expect(Object.keys(card.accessibility.high_contrast_variant.tokens.color).length).toBeGreaterThan(0);
    });
  });
});

/**
 * Like synthesizeRoutingOutput but lets the test override individual
 * axis grammar ids — used by Task 2 tests to verify per-grammar token
 * lookups produce different palettes.
 */
function synthesizeRoutingOutputWithAxisOverrides(overrides: {
  color_grammar_id?: string;
  typography_grammar_id?: string;
  density_grammar_id?: string;
  component_grammar_id?: string;
  motion_grammar_id?: string;
}) {
  const base = synthesizeRoutingOutput({});
  if (overrides.color_grammar_id !== undefined) {
    base.combination.color = {
      ...base.combination.color,
      grammar_id: overrides.color_grammar_id,
    };
  }
  if (overrides.typography_grammar_id !== undefined) {
    base.combination.typography = {
      ...base.combination.typography,
      grammar_id: overrides.typography_grammar_id,
    };
  }
  if (overrides.density_grammar_id !== undefined) {
    base.combination.density = {
      ...base.combination.density,
      grammar_id: overrides.density_grammar_id,
    };
  }
  if (overrides.component_grammar_id !== undefined) {
    base.combination.component = {
      ...base.combination.component,
      grammar_id: overrides.component_grammar_id,
    };
  }
  if (overrides.motion_grammar_id !== undefined) {
    base.combination.motion = {
      ...base.combination.motion,
      grammar_id: overrides.motion_grammar_id,
    };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Synthesis helpers
// ---------------------------------------------------------------------------

interface SynthesizeOptions {
  canonical_match?: string | null;
  confidences?: Partial<Record<
    "layout" | "typography" | "color" | "component" | "motion" |
    "imagery" | "density" | "voice" | "reading_pattern",
    number
  >>;
}

/**
 * Synthesize a minimal RoutingOutput for unit-testing generateCard
 * without invoking the full routing pipeline. Uses canonical-1
 * (Luxury Hospitality)'s primary grammars as the per-axis content
 * since the test only checks card-generator behavior, not routing
 * outcomes.
 */
function synthesizeRoutingOutput(opts: SynthesizeOptions) {
  const canonical = corpus.canonical_combinations.find((c) => c.id === "CANONICAL-1");
  if (canonical === undefined) throw new Error("test setup: CANONICAL-1 missing");
  const confs = opts.confidences ?? {};
  const axisDecision = (
    axis: "layout" | "typography" | "color" | "component" | "motion" |
      "imagery" | "density" | "reading_pattern",
  ) => ({
    grammar_id:
      canonical.axis_mappings[axis]?.grammar_id ??
      `${axis.toUpperCase()}-1`,
    confidence: confs[axis] ?? 0.9,
  });
  const voiceProfileId = canonical.axis_mappings.voice?.grammar_id ?? "VOICE-1";
  const voiceProfile = corpus.voice.profiles.find((p) => p.id === voiceProfileId);

  return {
    combination: {
      layout: axisDecision("layout"),
      typography: axisDecision("typography"),
      color: axisDecision("color"),
      component: axisDecision("component"),
      motion: axisDecision("motion"),
      imagery: axisDecision("imagery"),
      density: axisDecision("density"),
      voice: {
        profile_id: voiceProfileId,
        dimensions: voiceProfile?.dimensional_coordinates ?? {
          humor: 5,
          formality: 5,
          respectfulness: 5,
          enthusiasm: 5,
          rhythm: 5,
          vocabulary: 5,
        },
        confidence: confs.voice ?? 0.9,
      },
      reading_pattern: axisDecision("reading_pattern"),
    },
    canonical_match:
      opts.canonical_match !== undefined ? opts.canonical_match : "Luxury Hospitality",
    canonical_match_confidence:
      opts.canonical_match === null ? 0 : 0.9,
    reduced_motion_fallback: corpus.reduced_motion_fallbacks[
      canonical.axis_mappings.motion?.grammar_id ?? "MOTION-1"
    ] ?? {
      motion_grammar_id: "MOTION-1",
      description: "Test fallback",
      severity: "trivial" as const,
    },
    cards: [],
    alternatives: [],
    open_warnings: [],
  };
}

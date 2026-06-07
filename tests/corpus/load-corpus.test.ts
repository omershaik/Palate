// tests/corpus/load-corpus.test.ts
//
// Group F — corpus-level integration tests for loadCorpus(). The
// per-loader tests in tests/corpus/loaders/ cover each input
// document; this file covers the assembled Corpus contract.
//
// Numbered F1..F8 to match the kickoff Phase 1 task list.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import type { Axis, GrammarRef } from "../../src/types/axis.js";
import type { Grammar } from "../../src/types/grammar.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "spec");

// ---------------------------------------------------------------------------
// Documented allowlists for known-empty fields
// ---------------------------------------------------------------------------
//
// Grammars whose source documents don't define substyles. Both groups
// are intentional spec choices, not parser bugs:
//
//   - v0.1 Layout grammars (LAYOUT-1, 2, 5, 6, 7, 8, 10): the original
//     Layout survey schema (Turn 0) didn't include a Substyles section.
//     Substyles were introduced in Turn 1 (Typography) onward. The
//     Turn 3 patches add substyles to the new split grammars (3a/b/c,
//     4a/b/c) and LAYOUT-9 picks up one via Side-Scroll demotion;
//     the remaining 7 stay substyle-less. Worth amending the spec to
//     fill these in for v0.1.x or v0.2.
//
//   - All voice profiles (VOICE-1..9): Turn 6's voice schema is
//     hybrid (six dimensions + nine profiles). Profiles are entry
//     points in the dimensional space rather than grammars with
//     substyle decompositions. The schema doesn't include a Substyles
//     section per Turn 6's "Why this representation" design notes.
//
// All other grammars must have at least one substyle.
const KNOWN_EMPTY_SUBSTYLES_LAYOUT: ReadonlySet<string> = new Set([
  "LAYOUT-1",
  "LAYOUT-2",
  "LAYOUT-5",
  "LAYOUT-6",
  "LAYOUT-7",
  "LAYOUT-8",
  "LAYOUT-10",
]);

// ---------------------------------------------------------------------------
// Shared corpus instance for the test file
// ---------------------------------------------------------------------------

const corpus = loadCorpus({ specRoot: SPEC_ROOT });

function everyGrammarInVisualAxes(): Array<{ axis: Axis; g: Grammar }> {
  const out: Array<{ axis: Axis; g: Grammar }> = [];
  for (const [axis, grammars] of Object.entries(corpus.axes)) {
    for (const g of grammars) {
      out.push({ axis: axis as Axis, g });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// F1 — axis counts
// ---------------------------------------------------------------------------

describe("F1: axis counts", () => {
  it("layout = 14", () => expect(corpus.axes.layout).toHaveLength(14));
  it("typography = 6", () => expect(corpus.axes.typography).toHaveLength(6));
  it("color = 9", () => expect(corpus.axes.color).toHaveLength(9));
  it("component = 9", () => expect(corpus.axes.component).toHaveLength(9));
  it("motion = 9", () => expect(corpus.axes.motion).toHaveLength(9));
  it("imagery = 9", () => expect(corpus.axes.imagery).toHaveLength(9));
  it("density = 6", () => expect(corpus.axes.density).toHaveLength(6));
  it("reading_pattern = 6", () => expect(corpus.axes.reading_pattern).toHaveLength(6));
  it("voice profiles = 9", () => expect(corpus.voice.profiles).toHaveLength(9));
  it("voice dimensions = 6", () => expect(corpus.voice.dimensions).toHaveLength(6));

  it("total grammar count = 77 (per Turn 9 §1)", () => {
    const visualCount = Object.values(corpus.axes).reduce(
      (acc, arr) => acc + arr.length,
      0,
    );
    const total = visualCount + corpus.voice.profiles.length;
    expect(total).toBe(77);
  });
});

// ---------------------------------------------------------------------------
// F2 — required structural fields populated, with documented allowlists
// ---------------------------------------------------------------------------

describe("F2: required structural fields", () => {
  it("every visual-axis grammar has all required fields populated", () => {
    for (const { axis, g } of everyGrammarInVisualAxes()) {
      expect(g.id, `${axis}/${g.id} id`).toMatch(/^[A-Z]+-\d+[a-z]?$/);
      expect(g.axis, `${axis}/${g.id} axis`).toBe(axis);
      expect(g.name.length, `${axis}/${g.id} name`).toBeGreaterThan(0);
      expect(g.definition.length, `${axis}/${g.id} definition`).toBeGreaterThan(20);
      expect(
        g.distinguishing_edge.length,
        `${axis}/${g.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(
        g.failure_mode.length,
        `${axis}/${g.id} failure_mode`,
      ).toBeGreaterThan(20);
      expect(
        g.internal_logic.length,
        `${axis}/${g.id} internal_logic`,
      ).toBeGreaterThan(0);
      expect(
        g.canonical_examples.length,
        `${axis}/${g.id} canonical_examples`,
      ).toBeGreaterThan(0);
      expect(
        g.registers_hosts.length,
        `${axis}/${g.id} registers_hosts`,
      ).toBeGreaterThan(0);
      expect(
        g.registers_resists.length,
        `${axis}/${g.id} registers_resists`,
      ).toBeGreaterThan(0);
    }
  });

  it("every visual-axis grammar has substyles populated (with allowlist for v0.1 Layout)", () => {
    for (const { axis, g } of everyGrammarInVisualAxes()) {
      const exempt =
        axis === "layout" && KNOWN_EMPTY_SUBSTYLES_LAYOUT.has(g.id);
      if (exempt) {
        expect(g.substyles, `${g.id} substyles (allowlisted empty)`).toEqual([]);
      } else {
        expect(g.substyles.length, `${g.id} substyles`).toBeGreaterThan(0);
      }
    }
  });

  it("every voice profile has all required fields populated", () => {
    for (const p of corpus.voice.profiles) {
      expect(p.id).toMatch(/^VOICE-\d+$/);
      expect(p.axis).toBe("voice");
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.definition.length, `${p.id} definition`).toBeGreaterThan(20);
      expect(
        p.distinguishing_edge.length,
        `${p.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(p.failure_mode.length, `${p.id} failure_mode`).toBeGreaterThan(20);
      expect(p.internal_logic.length, `${p.id} internal_logic`).toBeGreaterThan(0);
      expect(p.canonical_examples.length, `${p.id} canonical_examples`).toBeGreaterThan(0);
      // Substyles intentionally empty for voice profiles per Turn 6's
      // hybrid schema (dimensions + profiles, no substyle decomposition).
      expect(p.substyles).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// F3 — five altname buckets per grammar
// ---------------------------------------------------------------------------

describe("F3: altname buckets", () => {
  it("every visual-axis grammar has all five altname buckets non-empty", () => {
    for (const { g } of everyGrammarInVisualAxes()) {
      expect(g.altnames.vibes.length, `${g.id} vibes`).toBeGreaterThan(0);
      expect(g.altnames.brand_exemplars.length, `${g.id} brand_exemplars`).toBeGreaterThan(0);
      expect(g.altnames.vernacular.length, `${g.id} vernacular`).toBeGreaterThan(0);
      expect(g.altnames.anti_vibes.length, `${g.id} anti_vibes`).toBeGreaterThan(0);
      expect(g.altnames.compositional_intent.length, `${g.id} compositional_intent`).toBeGreaterThan(0);
    }
  });

  it("every voice profile has all five altname buckets non-empty", () => {
    for (const p of corpus.voice.profiles) {
      expect(p.altnames.vibes.length, `${p.id} vibes`).toBeGreaterThan(0);
      expect(p.altnames.brand_exemplars.length, `${p.id} brand_exemplars`).toBeGreaterThan(0);
      expect(p.altnames.vernacular.length, `${p.id} vernacular`).toBeGreaterThan(0);
      expect(p.altnames.anti_vibes.length, `${p.id} anti_vibes`).toBeGreaterThan(0);
      expect(p.altnames.compositional_intent.length, `${p.id} compositional_intent`).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// F4 — compatibility content
// ---------------------------------------------------------------------------

describe("F4: compatibility content", () => {
  it("22 broken combinations across families A/B/C/D/E (6/6/4/4/2)", () => {
    expect(corpus.broken_combinations).toHaveLength(22);
    const counts = {
      A: corpus.broken_combinations.filter((b) => b.family === "A").length,
      B: corpus.broken_combinations.filter((b) => b.family === "B").length,
      C: corpus.broken_combinations.filter((b) => b.family === "C").length,
      D: corpus.broken_combinations.filter((b) => b.family === "D").length,
      E: corpus.broken_combinations.filter((b) => b.family === "E").length,
    };
    expect(counts).toEqual({ A: 6, B: 6, C: 4, D: 4, E: 2 });
  });

  it("15 canonical combinations with stable CANONICAL-N ids", () => {
    expect(corpus.canonical_combinations).toHaveLength(15);
    expect(corpus.canonical_combinations.map((c) => c.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => `CANONICAL-${i + 1}`),
    );
  });

  it("9 reduced-motion fallbacks keyed by MOTION-N", () => {
    const ids = Object.keys(corpus.reduced_motion_fallbacks).sort();
    expect(ids).toEqual([
      "MOTION-1",
      "MOTION-2",
      "MOTION-3",
      "MOTION-4",
      "MOTION-5",
      "MOTION-6",
      "MOTION-7",
      "MOTION-8",
      "MOTION-9",
    ]);
  });

  it("WCAG 2.2 AA accessibility commitments hardcoded per Turn 8 §6.2", () => {
    expect(corpus.accessibility_commitments).toEqual({
      contrast_validation: "WCAG_2.2_AA",
      touch_target_minimum_px: 44,
      keyboard_navigation: "all_interactive_elements_focusable",
      high_contrast_mode_support: true,
    });
  });
});

// ---------------------------------------------------------------------------
// F5 — brand fingerprints
// ---------------------------------------------------------------------------

describe("F5: brand fingerprints", () => {
  const ids = Object.keys(corpus.brand_fingerprints.fingerprints);

  it("loads 15 brand fingerprints", () => {
    expect(ids).toHaveLength(15);
  });

  it("includes the kickoff-named brands", () => {
    const expected = [
      "aman",
      "stripe",
      "linear",
      "apple",
      "mailchimp",
      "glossier",
      "apartamento",
      "gumroad",
      "notion",
      "github",
      "vercel",
      "cheval-blanc",
      "soho-house",
      "nyt",
      "ipcc",
    ];
    for (const id of expected) {
      expect(ids, `missing brand ${id}`).toContain(id);
    }
  });

  it("every fingerprint has structurally complete shape", () => {
    for (const [id, fp] of Object.entries(
      corpus.brand_fingerprints.fingerprints,
    )) {
      expect(fp.fingerprint_id, `${id} fingerprint_id`).toBe(id);
      expect(fp.brand_name.length, `${id} brand_name`).toBeGreaterThan(0);
      expect(fp.source_url, `${id} source_url`).toMatch(/^https?:\/\//);
      expect(fp.color_tokens.length, `${id} color_tokens`).toBeGreaterThanOrEqual(3);
      expect(fp.typography_fingerprint.display_family.length).toBeGreaterThan(0);
      expect(fp.typography_fingerprint.body_family.length).toBeGreaterThan(0);
      expect(fp.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}/);
      // Voice coordinates are six numeric fields on [0, 10].
      const vc = fp.voice_coordinates;
      for (const dim of [
        "humor",
        "formality",
        "respectfulness",
        "enthusiasm",
        "rhythm",
        "vocabulary",
      ] as const) {
        expect(vc[dim], `${id}.${dim}`).toBeGreaterThanOrEqual(0);
        expect(vc[dim], `${id}.${dim}`).toBeLessThanOrEqual(10);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// F6 — voice block shape
// ---------------------------------------------------------------------------

describe("F6: voice block", () => {
  it("voice has 6 dimensions in canonical order", () => {
    expect(corpus.voice.dimensions.map((d) => d.id)).toEqual([
      "humor",
      "formality",
      "respectfulness",
      "enthusiasm",
      "rhythm",
      "vocabulary",
    ]);
  });

  it("every voice profile has dimensional_coordinates with all six fields on [0, 10]", () => {
    for (const p of corpus.voice.profiles) {
      const c = p.dimensional_coordinates;
      for (const dim of [
        "humor",
        "formality",
        "respectfulness",
        "enthusiasm",
        "rhythm",
        "vocabulary",
      ] as const) {
        expect(c[dim], `${p.id}.${dim}`).toBeGreaterThanOrEqual(0);
        expect(c[dim], `${p.id}.${dim}`).toBeLessThanOrEqual(10);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// F7 — cross-reference integrity
// ---------------------------------------------------------------------------

describe("F7: cross-reference integrity", () => {
  function buildAllIds(): Map<Axis, Set<string>> {
    const out = new Map<Axis, Set<string>>();
    for (const [axis, grammars] of Object.entries(corpus.axes)) {
      out.set(axis as Axis, new Set(grammars.map((g) => g.id)));
    }
    out.set("voice", new Set(corpus.voice.profiles.map((p) => p.id)));
    return out;
  }
  const idsByAxis = buildAllIds();

  /**
   * The known-unresolvable allowlist mirrors the loader's own
   * KNOWN_UNRESOLVABLE — these names are in the spec but don't
   * correspond to v0.1 grammars (Mission-Earnest, Task-driven, etc.).
   * F7 doesn't fail on them; the grammar_id remains the spec name.
   */
  function isAllowedUnresolved(ref: GrammarRef): boolean {
    const norm = ref.grammar_id.toLowerCase().replace(/-/g, " ").trim();
    const allowlist: Partial<Record<Axis, ReadonlyArray<string>>> = {
      layout: ["centered everything"],
      density: ["heavy text"],
      imagery: ["none"],
      reading_pattern: ["task driven"],
      voice: ["mission earnest"],
    };
    return (allowlist[ref.axis] ?? []).includes(norm);
  }

  it("every canonical's resolved GrammarRef.grammar_id matches a real grammar id (or is allowlisted)", () => {
    for (const c of corpus.canonical_combinations) {
      for (const [axis, ref] of Object.entries(c.axis_mappings) as Array<
        [Axis, GrammarRef | undefined]
      >) {
        if (ref === undefined) continue;
        if (isAllowedUnresolved(ref)) continue;
        const ids = idsByAxis.get(axis);
        expect(ids, `axis ${axis} not indexed`).toBeDefined();
        expect(
          ids!.has(ref.grammar_id),
          `${c.id} (${c.name}) ${axis} ref "${ref.grammar_id}" not in loaded grammar ids`,
        ).toBe(true);
      }
    }
  });

  it("every broken-combination's resolved GrammarRef.grammar_id matches a real grammar id (or is allowlisted)", () => {
    for (const b of corpus.broken_combinations) {
      for (const ref of b.conflicting_grammars) {
        if (isAllowedUnresolved(ref)) continue;
        const ids = idsByAxis.get(ref.axis);
        expect(ids, `axis ${ref.axis} not indexed`).toBeDefined();
        expect(
          ids!.has(ref.grammar_id),
          `${b.id} (${b.combination_text}) ref "${ref.grammar_id}" not in loaded ${ref.axis} ids`,
        ).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// F8 — determinism
// ---------------------------------------------------------------------------

describe("F8: determinism", () => {
  it("two consecutive loadCorpus calls produce identical output", () => {
    const second = loadCorpus({ specRoot: SPEC_ROOT });
    expect(JSON.stringify(second)).toBe(JSON.stringify(corpus));
  });
});

// ---------------------------------------------------------------------------
// F3-3 — broken-combination parser-gap recovery
// ---------------------------------------------------------------------------

describe("F3-3: broken-combination unresolved-clause recovery", () => {
  it("BROKEN-A-4 (Stock Photography + Vertical-Rhythm Editorial layout) resolves to ≥2 conflicting grammars", () => {
    const broken = corpus.broken_combinations.find((b) => b.id === "BROKEN-A-4");
    expect(broken, "BROKEN-A-4 should be loaded").toBeDefined();
    expect(
      broken!.conflicting_grammars.length,
      `BROKEN-A-4 conflicting_grammars: ${JSON.stringify(broken!.conflicting_grammars)}`,
    ).toBeGreaterThanOrEqual(2);
    // Stock Photography is an imagery grammar (IMG-7); should be in
    // the recovered refs alongside the parsed LAYOUT-1 reference.
    const axes = broken!.conflicting_grammars.map((r) => r.axis);
    expect(axes).toContain("imagery");
    expect(axes).toContain("layout");
  });

  it("BROKEN-E-2 (F-Pattern + Z-Pattern in same page section) resolves both reading-pattern refs", () => {
    const broken = corpus.broken_combinations.find((b) => b.id === "BROKEN-E-2");
    expect(broken, "BROKEN-E-2 should be loaded").toBeDefined();
    // Both F-Pattern and Z-Pattern should resolve to RP-1 and RP-2
    // via post-process recovery (neither has a trailing axis word).
    const ids = broken!.conflicting_grammars.map((r) => r.grammar_id).sort();
    expect(ids).toContain("RP-1");
    expect(ids).toContain("RP-2");
  });

  it("descriptive-prose clauses (e.g., 'skimming audience') stay unrecovered without a LoadError", () => {
    // BROKEN-E-1 is "Gutenberg reading + skimming audience" — only
    // the reading-pattern ref resolves; "skimming audience" is
    // descriptive prose, not a v0.1 grammar. Recovery silently drops
    // it; the load completes without raising.
    const broken = corpus.broken_combinations.find((b) => b.id === "BROKEN-E-1");
    expect(broken).toBeDefined();
    expect(broken!.conflicting_grammars.length).toBe(1);
  });
});

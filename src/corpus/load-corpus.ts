// src/corpus/load-corpus.ts
//
// Group E1 — top-level corpus loader. Composes every per-document
// loader from src/corpus/loaders/, resolves cross-references in the
// compatibility model from spec-side names to stable grammar ids,
// validates the assembled structure, and returns a fully-typed
// Corpus.
//
// Composition order matters:
//   1. Pre-Turn-4 shells (D1, D2, D3 — layout, typography, color,
//      component, motion grammars without altnames).
//   2. Turn 4 altname merger (D7) → full Grammars for those axes.
//      LoadError if any altname block is missing or any bucket empty.
//   3. Post-Turn-4 axes (D4 imagery+density, D5 voice, D6 reading-
//      pattern) — full Grammars from inline altnames in one pass.
//   4. Compatibility model (D8) — broken combinations, canonicals,
//      reduced-motion fallbacks. GrammarRefs in here use spec names.
//   5. Brand fingerprints from spec/derived/brand-fingerprints.json.
//   6. Cross-reference resolution: walk every GrammarRef in the
//      compatibility model, replace name-based grammar_ids with stable
//      ids by looking up the loaded grammars. Unresolvable refs are
//      preserved with their original name; the LoadOptions
//      validateCrossReferences flag governs whether unresolved refs
//      become a LoadError or a soft warning.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Axis, GrammarRef } from "../types/axis.js";
import type { Grammar } from "../types/grammar.js";
import type {
  BrokenCombination,
  CanonicalCombination,
} from "../types/compatibility.js";
import type {
  BrandFingerprintsFile,
} from "../types/brand-fingerprint.js";
import {
  LoadError,
  type Corpus,
  type LoadFailure,
  type LoadOptions,
} from "../types/corpus.js";
import { loadPreTurn4Grammars } from "./loaders/pre-turn4.js";
import { loadImageryAndDensityGrammars } from "./loaders/imagery-density.js";
import { loadVoiceBlock } from "./loaders/voice.js";
import { loadReadingPatternGrammars } from "./loaders/reading-pattern.js";
import { loadCompatibilityModel } from "./loaders/compatibility-model.js";

const PALATE_VERSION = "0.1.0-pre";

/**
 * Load the entire Palate corpus from a spec root directory.
 *
 * @param options.specRoot Absolute or project-relative path to the
 *   `spec/` directory containing `turns/` and `derived/`.
 * @param options.validateCrossReferences When true (default),
 *   unresolvable GrammarRefs in the compatibility model produce a
 *   LoadError. When false, they're left as name-keyed refs and
 *   the load proceeds (used by isolated tests).
 */
export function loadCorpus(options: LoadOptions): Corpus {
  const specRoot = options.specRoot;
  const validate = options.validateCrossReferences ?? true;

  // 1–2: pre-Turn-4 grammars (layout, typography, color, component,
  // motion) with altnames merged from Turn 4.
  const preTurn4 = loadPreTurn4Grammars(specRoot);

  // 3: post-Turn-4 axes.
  const { imagery, density } = loadImageryAndDensityGrammars(specRoot);
  const voice = loadVoiceBlock(specRoot);
  const reading_pattern = loadReadingPatternGrammars(specRoot);

  // 4: compatibility model with name-keyed GrammarRefs.
  const rawCompat = loadCompatibilityModel(specRoot);

  // 5: brand fingerprints from spec/derived/brand-fingerprints.json.
  const brand_fingerprints = loadBrandFingerprints(specRoot);

  // 6: build a name-to-id lookup over every loaded grammar (including
  // voice profiles), then resolve cross-references in the
  // compatibility model.
  const nameToRef = buildNameToRefIndex({
    layout: preTurn4.layout,
    typography: preTurn4.typography,
    color: preTurn4.color,
    component: preTurn4.component,
    motion: preTurn4.motion,
    imagery,
    density,
    reading_pattern,
    voiceProfiles: voice.profiles.map((p) => ({ id: p.id, name: p.name })),
  });

  const failures: LoadFailure[] = [];
  const broken_combinations = rawCompat.broken_combinations.map((b) =>
    resolveBrokenCombinationRefs(b, nameToRef, failures, validate),
  );
  const canonical_combinations = rawCompat.canonical_combinations.map((c) =>
    resolveCanonicalCombinationRefs(c, nameToRef, failures, validate),
  );

  if (validate && failures.length > 0) {
    throw new LoadError(failures);
  }

  return {
    version: PALATE_VERSION,
    axes: {
      layout: preTurn4.layout,
      typography: preTurn4.typography,
      color: preTurn4.color,
      component: preTurn4.component,
      motion: preTurn4.motion,
      imagery,
      density,
      reading_pattern,
    },
    voice,
    canonical_combinations,
    broken_combinations,
    reduced_motion_fallbacks: rawCompat.reduced_motion_fallbacks,
    accessibility_commitments: rawCompat.accessibility_commitments,
    brand_fingerprints,
  };
}

// ---------------------------------------------------------------------------
// Brand fingerprints
// ---------------------------------------------------------------------------

function loadBrandFingerprints(specRoot: string): BrandFingerprintsFile {
  const filePath = resolve(specRoot, "derived", "brand-fingerprints.json");
  const content = readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(content) as BrandFingerprintsFile;
  // Minimal shape validation — Phase 4's worker is the real validator
  // for this file's content; the loader just confirms it parses and
  // has the expected top-level structure.
  if (typeof parsed.version !== "string") {
    throw new Error(`brand-fingerprints.json: missing or invalid version`);
  }
  if (typeof parsed.fingerprints !== "object" || parsed.fingerprints === null) {
    throw new Error(`brand-fingerprints.json: missing fingerprints record`);
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Name-to-ref index for cross-reference resolution
// ---------------------------------------------------------------------------

/**
 * Names that the spec uses but that don't correspond to a v0.1 grammar.
 * Each is documented in Turn 8 itself as a known limitation:
 *
 *   - "Mission-Earnest" voice — Turn 8 §9 Voice-2 resolution defers
 *     this profile to v0.2; CANONICAL-14 references it knowingly with
 *     fallback "closest existing is Quiet Authority".
 *   - "Task-driven" reading_pattern — Turn 8 §3 Note on canonical 9
 *     flags that application-UI reading is task-driven rather than
 *     scan-driven; not a grammar in v0.1.
 *   - "None" imagery (CANONICAL-15) — explicit absence, "no imagery
 *     is itself a choice".
 *   - "centered-everything" layout / "heavy text" density — used in
 *     broken-combination examples as descriptive concepts, not grammar
 *     references.
 *
 * The loader leaves these unresolved without raising a LoadError. The
 * raw combination_text / axis_mappings entry preserves the spec
 * phrasing for Phase 2 routing fallback.
 */
// Allowlist entries are stored AFTER normalizeName (lowercase, hyphens
// → spaces, multi-space collapsed) so the comparison in
// isKnownUnresolvable below is symmetric with how grammar names are
// normalized everywhere else in the resolver.
//
// F3-1 expanded the list to cover descriptive references the canonical
// list uses for axis options that aren't v0.1 grammars. Per the spec
// these are intentional informational signals — "no imagery is itself
// a choice", "browser default" typography, etc. — not grammar gaps.
const KNOWN_UNRESOLVABLE: ReadonlyMap<Axis, ReadonlySet<string>> = new Map<
  Axis,
  ReadonlySet<string>
>([
  ["layout", new Set(["centered everything"])],
  // "browser default" — Plain Document canonical's typography option.
  ["typography", new Set(["browser default"])],
  // "restrained earth" — Cause/Journalism canonical's color option;
  // descriptive shorthand for the Earth-Pulled Restraint family but
  // not a direct grammar reference (the canonical also lists
  // Two-Color Monochrome which IS a grammar).
  ["color", new Set(["restrained earth"])],
  ["density", new Set(["heavy text"])],
  // imagery descriptive entries: "screenshot-led", "screenshots",
  // "data visualization", "no imagery", and "rare" all appear in the
  // canonical list as descriptive options or qualifiers, not grammars.
  ["imagery", new Set([
    "none",
    "no imagery",
    "rare",
    "screenshots",
    "screenshot led",
    "data visualization",
  ])],
  ["reading_pattern", new Set(["task driven"])],
  ["voice", new Set(["mission earnest"])],
]);

/**
 * Build a lookup index keyed by lowercased grammar name. Each axis
 * has its own sub-map so the same name in different axes (rare but
 * possible) doesn't collide. Substyle ids aren't indexed at this
 * level; substyle resolution is Phase 2 work.
 *
 * Three indexing strategies per grammar to handle the spec's
 * inconsistent reference styles in Turn 8:
 *   1. Full normalized name (covers exact references).
 *   2. Parenthetical-stripped form (covers references that drop the
 *      parens — "Application-Density" without the "(Mono-Density
 *      Application)" tail).
 *   3. Inner-parenthetical content (covers Turn 8's pre-Turn-3
 *      "Mono-Density (Application)" phrasing matching COMP-8a's
 *      post-Turn-3 "Application-Density (Mono-Density Application)").
 */
function buildNameToRefIndex(input: {
  layout: Grammar[];
  typography: Grammar[];
  color: Grammar[];
  component: Grammar[];
  motion: Grammar[];
  imagery: Grammar[];
  density: Grammar[];
  reading_pattern: Grammar[];
  voiceProfiles: { id: string; name: string }[];
}): Map<Axis, Map<string, string>> {
  const index = new Map<Axis, Map<string, string>>();
  const addAxis = (axis: Axis, items: { id: string; name: string }[]) => {
    const inner = new Map<string, string>();
    for (const item of items) {
      inner.set(normalizeName(item.name), item.id);
      const stripped = stripParenthetical(item.name);
      if (stripped !== item.name) {
        inner.set(normalizeName(stripped), item.id);
      }
      // Index inner parenthetical content too (for "Mono-Density
      // Application" matching COMP-8a).
      const innerParenMatch = item.name.match(/\(([^)]+)\)/);
      if (innerParenMatch !== null) {
        inner.set(normalizeName(innerParenMatch[1]!), item.id);
      }
    }
    index.set(axis, inner);
  };
  addAxis("layout", input.layout);
  addAxis("typography", input.typography);
  addAxis("color", input.color);
  addAxis("component", input.component);
  addAxis("motion", input.motion);
  addAxis("imagery", input.imagery);
  addAxis("density", input.density);
  addAxis("reading_pattern", input.reading_pattern);
  addAxis("voice", input.voiceProfiles);
  return index;
}

/**
 * Normalize a grammar name for matching: lowercase, hyphens converted
 * to spaces, multiple spaces collapsed, leading/trailing whitespace
 * stripped. Handles "Stillness-as-Discipline" matching "Stillness as
 * Discipline" without requiring two index entries per grammar.
 */
function normalizeName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripParenthetical(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

/**
 * Strip a trailing " with X" annotation from a name. Turn 8 sometimes
 * references a grammar with an extension annotation
 * ("Two-Hand System with Editorial Print moves") that should resolve
 * to the bare grammar name.
 */
function stripWithAnnotation(name: string): string {
  return name.replace(/\s+with\s+.+$/i, "").trim();
}

/**
 * Take just the first comma-separated segment of a name. Turn 8
 * occasionally lists multiple imagery types in one slot
 * ("Iconography , screenshots, data visualization"); the first
 * segment is the actual grammar.
 */
function firstCommaSegment(name: string): string {
  const idx = name.indexOf(",");
  return idx === -1 ? name : name.slice(0, idx).trim();
}

/**
 * Look up a name-keyed GrammarRef in the index. Returns the resolved
 * stable id, or null if unresolvable.
 *
 * Tries progressively-relaxed forms of the input until something
 * matches: exact, parenthetical-stripped, with-annotation-stripped,
 * first-comma-segment, then substring matching as a last resort.
 */
function resolveName(
  axis: Axis,
  rawName: string,
  index: Map<Axis, Map<string, string>>,
): string | null {
  const inner = index.get(axis);
  if (inner === undefined) return null;

  const candidates = [
    rawName,
    stripParenthetical(rawName),
    stripWithAnnotation(rawName),
    stripWithAnnotation(stripParenthetical(rawName)),
    firstCommaSegment(rawName),
    firstCommaSegment(stripParenthetical(rawName)),
  ];

  for (const candidate of candidates) {
    const direct = inner.get(normalizeName(candidate));
    if (direct !== undefined) return direct;
  }

  // Substring match across all index entries as a last resort. e.g.,
  // "Spotted" matching "Spotted / Bypassing" (RP-5) or "3D Render"
  // matching "3D Render / CGI" (IMG-5).
  for (const candidate of candidates) {
    const norm = normalizeName(candidate);
    if (norm.length < 3) continue; // too generic
    for (const [name, id] of inner) {
      if (name.includes(norm) || norm.includes(name)) return id;
    }
  }

  return null;
}

function isKnownUnresolvable(axis: Axis, rawName: string): boolean {
  const set = KNOWN_UNRESOLVABLE.get(axis);
  if (set === undefined) return false;
  return set.has(normalizeName(rawName));
}

// ---------------------------------------------------------------------------
// Cross-reference resolution
// ---------------------------------------------------------------------------

function resolveBrokenCombinationRefs(
  b: BrokenCombination,
  index: Map<Axis, Map<string, string>>,
  failures: LoadFailure[],
  validate: boolean,
): BrokenCombination {
  const resolvedRefs = b.conflicting_grammars.map((ref) => {
    const resolved = resolveName(ref.axis, ref.grammar_id, index);
    if (resolved === null) {
      if (validate && !isKnownUnresolvable(ref.axis, ref.grammar_id)) {
        failures.push({
          code: "unresolved_grammar_ref",
          source: { grammar_id: ref.grammar_id, file: "turn-8" },
          message:
            `Broken combination ${b.id}: could not resolve ` +
            `${ref.axis} reference "${ref.grammar_id}" to a loaded grammar.`,
        });
      }
      return ref;
    }
    return { ...ref, grammar_id: resolved };
  });

  // F3-3: post-process unresolved clauses. The compat-model parser
  // drops clauses that don't have a trailing axis word — bare grammar
  // names like "Stock Photography" or "F-Pattern" or "Z-Pattern in
  // same page section". Try to resolve each by matching against
  // grammar names across ALL axes; the first matching axis wins.
  // This recovers refs that would otherwise leave a broken combo
  // with < 2 conflicting_grammars, hidden from the ≥2-ref Stage 4
  // detector.
  if (b.unresolved_clauses !== undefined) {
    for (const clause of b.unresolved_clauses) {
      const recovered = recoverUnresolvedClause(clause, index);
      if (recovered !== null) {
        resolvedRefs.push(recovered);
      }
      // Silent drop on miss — descriptive prose like "skimming
      // audience" or "uninformative headings" doesn't map to any
      // v0.1 grammar and is intentional informational content.
    }
  }

  return {
    ...b,
    conflicting_grammars: resolvedRefs,
  };
}

/**
 * F3-3: try to resolve a parser-dropped clause to a GrammarRef by
 * scanning every axis's name index. Returns the first axis whose
 * index maps the clause to a stable id. Strips trailing descriptive
 * tails ("Z-Pattern in same page section" → "Z-Pattern") before
 * matching. Returns null if no axis resolves the clause.
 */
function recoverUnresolvedClause(
  rawClause: string,
  index: Map<Axis, Map<string, string>>,
): GrammarRef | null {
  // Strip trailing descriptive prose ("F-Pattern" survives;
  // "Z-Pattern in same page section" reduces to "Z-Pattern"). The
  // heuristic: keep the first 1–3 words that look grammar-name-y
  // (Title-Case or Hyphenated-Title), drop the rest.
  const candidates = [
    rawClause,
    stripDescriptiveTail(rawClause),
    firstHyphenatedWord(rawClause),
  ];
  for (const axis of [
    "imagery",
    "reading_pattern",
    "voice",
    "layout",
    "typography",
    "color",
    "component",
    "motion",
    "density",
  ] as const) {
    for (const c of candidates) {
      const resolved = resolveName(axis, c, index);
      if (resolved !== null) {
        return { axis, grammar_id: resolved };
      }
    }
  }
  return null;
}

/**
 * Strip a trailing descriptive clause from a candidate name. Heuristic:
 * if the input has more than 4 words, return just the first 2 (most
 * grammar names are 1–2 words). Conservative — keeps short inputs as-is.
 */
function stripDescriptiveTail(text: string): string {
  const words = text.split(/\s+/);
  if (words.length <= 2) return text;
  return words.slice(0, 2).join(" ");
}

/**
 * Return the first hyphenated word in the input, or the first word if
 * there are no hyphens. Useful for "F-Pattern in same page section" →
 * "F-Pattern".
 */
function firstHyphenatedWord(text: string): string {
  const match = text.match(/^[A-Za-z0-9-]+/);
  return match !== null ? match[0]! : text;
}

function resolveCanonicalCombinationRefs(
  c: CanonicalCombination,
  index: Map<Axis, Map<string, string>>,
  failures: LoadFailure[],
  validate: boolean,
): CanonicalCombination {
  const resolved: CanonicalCombination["axis_mappings"] = {};
  for (const [axis, ref] of Object.entries(c.axis_mappings) as Array<
    [Axis, CanonicalCombination["axis_mappings"][Axis]]
  >) {
    if (ref === undefined) continue;
    const resolvedId = resolveName(axis, ref.grammar_id, index);
    if (resolvedId === null) {
      if (validate && !isKnownUnresolvable(axis, ref.grammar_id)) {
        failures.push({
          code: "unresolved_grammar_ref",
          source: { grammar_id: ref.grammar_id, file: "turn-8" },
          message:
            `Canonical ${c.id} (${c.name}): could not resolve ` +
            `${axis} reference "${ref.grammar_id}" to a loaded grammar.`,
        });
      }
      resolved[axis] = ref;
    } else {
      resolved[axis] = { ...ref, grammar_id: resolvedId };
    }
  }

  // Resolve axis_alternatives the same way. Unresolvable refs in an
  // alternatives list are dropped silently (the primary in
  // axis_mappings already failed validation above if it was the
  // unresolvable one); only refs that resolve cleanly stay in the
  // alternatives list. A canonical with only one resolvable option
  // collapses to a single-element list which is still meaningful
  // for membership matching.
  let resolvedAlternatives:
    | Partial<Record<Axis, GrammarRefArray>>
    | undefined;
  if (c.axis_alternatives !== undefined) {
    resolvedAlternatives = {};
    for (const [axis, refs] of Object.entries(c.axis_alternatives) as Array<
      [Axis, NonNullable<CanonicalCombination["axis_alternatives"]>[Axis]]
    >) {
      if (refs === undefined) continue;
      const out: GrammarRefArray = [];
      for (const ref of refs) {
        const resolvedId = resolveName(axis, ref.grammar_id, index);
        if (resolvedId === null) {
          if (validate && !isKnownUnresolvable(axis, ref.grammar_id)) {
            failures.push({
              code: "unresolved_grammar_ref",
              source: { grammar_id: ref.grammar_id, file: "turn-8" },
              message:
                `Canonical ${c.id} (${c.name}): could not resolve ` +
                `${axis} alternative "${ref.grammar_id}" to a loaded grammar.`,
            });
          }
          // Preserve the unresolved ref so downstream code retains the
          // spec phrasing for diagnostics.
          out.push(ref);
        } else {
          out.push({ ...ref, grammar_id: resolvedId });
        }
      }
      if (out.length > 0) {
        resolvedAlternatives[axis] = out;
      }
    }
  }

  const result: CanonicalCombination = {
    ...c,
    axis_mappings: resolved,
  };
  if (resolvedAlternatives !== undefined && Object.keys(resolvedAlternatives).length > 0) {
    result.axis_alternatives = resolvedAlternatives;
  }
  return result;
}

// Local alias used in resolveCanonicalCombinationRefs only.
type GrammarRefArray = NonNullable<
  NonNullable<CanonicalCombination["axis_alternatives"]>[Axis]
>;

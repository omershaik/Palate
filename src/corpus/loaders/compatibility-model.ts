// src/corpus/loaders/compatibility-model.ts
//
// D8 — loads Turn 8's compatibility model: 22 broken combinations
// (across five families), 15 canonical combinations (each a multi-axis
// pairing), and the reduced-motion fallback table for every motion
// grammar.
//
// Turn 8's structure:
//
//   # 2. HARD RULES — BROKEN COMBINATIONS
//     ## Family A — Register Mismatches
//     | Combination | Why it breaks |
//     |---|---|
//     | <combo> | <reason> |
//     ## Family B ... (etc, 5 families)
//
//   # 3. CANONICAL COHERENT COMBINATIONS
//     ## 1. Luxury Hospitality
//     - **Layout:** Vertical-Rhythm Editorial
//     - **Typography:** Two-Hand System
//     - ...
//     - **Brand exemplars:** Aman, Cheval Blanc, ...
//     ## 2. Editorial Magazine ... (15 canonicals total)
//
//   # 6. ACCESSIBILITY LAYER ...
//     ## 6.1 Reduced-Motion fallbacks per motion grammar
//     | Motion Grammar | Reduced-Motion Fallback |
//     | <name> | <description> |
//
// Per the kickoff D8 design: GrammarRefs in this output use grammar
// NAMES as their grammar_id (not the stable LAYOUT-1 / TYPE-3 / etc.
// ids). The top-level corpus loader (Group E1) is responsible for
// resolving names to ids using the loaded grammars from D1–D7 and
// D4–D6. This keeps D8 independent of the other loaders.

import {
  buildHeadingTree,
  parseMarkdown,
  walkHeadingTree,
} from "../parser/index.js";
import { toString as mdastToString } from "mdast-util-to-string";
import type {
  AccessibilityCommitments,
  BrokenCombination,
  BrokenCombinationFamily,
  CanonicalCombination,
  ReducedMotionFallback,
} from "../../types/compatibility.js";
import type { Axis, GrammarRef } from "../../types/axis.js";
import type { BlockContent, HeadingNode } from "../parser/heading-tree.js";
import { readFileSync } from "node:fs";
import { resolveSpecPath } from "./utils.js";

const TURN8_FILENAME = "palate-grammar-survey-v0.2-turn8-compatibility-model.md";

export interface CompatibilityModel {
  broken_combinations: BrokenCombination[];
  canonical_combinations: CanonicalCombination[];
  reduced_motion_fallbacks: Record<string, ReducedMotionFallback>;
  accessibility_commitments: AccessibilityCommitments;
}

/** Load the full compatibility model from Turn 8. */
export function loadCompatibilityModel(specRoot: string): CompatibilityModel {
  const filePath = resolveSpecPath(specRoot, "turns", TURN8_FILENAME);
  const content = readFileSync(filePath, "utf-8");
  const tree = buildHeadingTree(parseMarkdown(content));

  return {
    broken_combinations: extractBrokenCombinations(tree),
    canonical_combinations: extractCanonicalCombinations(tree),
    reduced_motion_fallbacks: extractReducedMotionFallbacks(tree),
    accessibility_commitments: ACCESSIBILITY_COMMITMENTS,
  };
}

// ---------------------------------------------------------------------------
// Broken combinations
// ---------------------------------------------------------------------------

const FAMILY_HEADING_PATTERN =
  /^Family\s+([A-E])\s+—\s+(.+)$/;

function extractBrokenCombinations(tree: HeadingNode[]): BrokenCombination[] {
  const out: BrokenCombination[] = [];
  for (const node of walkHeadingTree(tree)) {
    if (node.depth !== 2) continue;
    const match = FAMILY_HEADING_PATTERN.exec(node.text.trim());
    if (match === null) continue;
    const family = match[1] as BrokenCombinationFamily;

    for (const row of extractTableRows(node.contentBlocks)) {
      if (row.length < 2) continue;
      const combinationText = row[0]!.trim();
      const why = row[1]!.trim();
      // Skip the header row and separator artifacts.
      if (
        /^combination$/i.test(combinationText) ||
        /^-+$/.test(combinationText)
      ) {
        continue;
      }
      const { refs, unresolved } = parseCombinationText(combinationText);
      const entry: BrokenCombination = {
        id: `BROKEN-${family}-${out.filter((b) => b.family === family).length + 1}`,
        family,
        combination_text: combinationText,
        conflicting_grammars: refs,
        why_it_breaks: why,
      };
      if (unresolved.length > 0) entry.unresolved_clauses = unresolved;
      out.push(entry);
    }
  }
  return out;
}

/**
 * Best-effort parser for a broken-combination text into GrammarRefs.
 * The spec uses several reference styles: "Vertical-Rhythm Editorial
 * layout", "Pill-and-Cushion components", "AI-Generated Imagery", etc.
 * Splitting on " + " yields candidate clauses; each clause's trailing
 * axis word identifies the axis, and the rest is the grammar name.
 *
 * F3-3: clauses without an axis word ("Stock Photography",
 * "F-Pattern", "Z-Pattern in same page section") are emitted in
 * `unresolved` so load-corpus can post-process them against the
 * loaded grammars and recover the GrammarRef. Previously these
 * were silently dropped, leaving the broken combination with a
 * single ref — which Stage 4 then skipped via the ≥2-conflicting
 * guard.
 */
function parseCombinationText(text: string): {
  refs: GrammarRef[];
  unresolved: string[];
} {
  const clauses = text.split(/\s+\+\s+/).map((s) => s.trim());
  const refs: GrammarRef[] = [];
  const unresolved: string[] = [];
  for (const clause of clauses) {
    const ref = parseSingleClause(clause);
    if (ref !== null) {
      refs.push(ref);
    } else if (clause.length > 0) {
      unresolved.push(clause);
    }
  }
  return { refs, unresolved };
}

const AXIS_WORD_TO_AXIS: ReadonlyMap<string, Axis> = new Map([
  ["layout", "layout"],
  ["typography", "typography"],
  ["color", "color"],
  ["component", "component"],
  ["components", "component"],
  ["motion", "motion"],
  ["imagery", "imagery"],
  ["density", "density"],
  ["voice", "voice"],
  ["reading", "reading_pattern"], // "F-Pattern reading"
]);

function parseSingleClause(clause: string): GrammarRef | null {
  if (clause.length === 0) return null;
  // Try matching trailing axis word, e.g., "Vertical-Rhythm Editorial layout".
  const trailingMatch = /^(.+?)\s+(layout|typography|color|components?|motion|imagery|density|voice|reading)$/i.exec(
    clause,
  );
  if (trailingMatch !== null) {
    const grammarName = trailingMatch[1]!.trim();
    const axisWord = trailingMatch[2]!.toLowerCase();
    const axis = AXIS_WORD_TO_AXIS.get(axisWord);
    if (axis !== undefined) {
      return { axis, grammar_id: grammarName };
    }
  }
  // Some clauses include "voice" as a leading qualifier
  // ("Quiet Authority voice"); handled by the trailing match above.
  // Some clauses are just grammar names with no axis word
  // ("AI-Generated Imagery", "Stock Photography"). For these we infer
  // the imagery axis when the clause matches imagery-axis vocabulary.
  // For Phase 1, we drop unresolvable clauses; the combination_text
  // preserves the full context.
  return null;
}

// ---------------------------------------------------------------------------
// Canonical combinations
// ---------------------------------------------------------------------------

const CANONICAL_HEADING_PATTERN = /^(\d+)\.\s+(.+)$/;

const LABEL_TO_AXIS: ReadonlyMap<string, Axis> = new Map([
  ["layout", "layout"],
  ["typography", "typography"],
  ["color", "color"],
  ["component", "component"],
  ["motion", "motion"],
  ["imagery", "imagery"],
  ["density", "density"],
  ["voice", "voice"],
  ["reading-pattern", "reading_pattern"],
]);

function extractCanonicalCombinations(tree: HeadingNode[]): CanonicalCombination[] {
  const out: CanonicalCombination[] = [];
  // Find the H1 "# 3. CANONICAL COHERENT COMBINATIONS" section, then walk
  // its H2 children (numbered "## N. Name").
  const canonicalsRoot = findHeading(
    tree,
    (text) => /CANONICAL COHERENT COMBINATIONS/i.test(text),
    1,
  );
  if (canonicalsRoot === undefined) return out;

  for (const node of canonicalsRoot.children) {
    if (node.depth !== 2) continue;
    const match = CANONICAL_HEADING_PATTERN.exec(node.text.trim());
    if (match === null) continue;
    const num = match[1]!;
    const name = match[2]!.trim();

    const { axis_mappings, axis_alternatives, brand_exemplars } =
      parseCanonicalContent(node.contentBlocks);
    const entry: CanonicalCombination = {
      id: `CANONICAL-${num}`,
      name,
      axis_mappings,
      brand_exemplars,
    };
    // Only attach axis_alternatives when at least one axis has
    // multiple options — keeps the runtime shape clean for the
    // common single-option case.
    if (Object.keys(axis_alternatives).length > 0) {
      entry.axis_alternatives = axis_alternatives;
    }
    out.push(entry);
  }
  return out;
}

function parseCanonicalContent(blocks: BlockContent[]): {
  axis_mappings: Partial<Record<Axis, GrammarRef>>;
  axis_alternatives: Partial<Record<Axis, GrammarRef[]>>;
  brand_exemplars: string[];
} {
  const axis_mappings: Partial<Record<Axis, GrammarRef>> = {};
  const axis_alternatives: Partial<Record<Axis, GrammarRef[]>> = {};
  const brand_exemplars: string[] = [];

  for (const block of blocks) {
    if (block.type !== "list") continue;
    for (const item of block.children) {
      const para = item.children.find((c) => c.type === "paragraph");
      if (para === undefined || para.type !== "paragraph") continue;
      const first = para.children[0];
      if (first?.type !== "strong") continue;
      const labelRaw = mdastToString(first).trim();
      if (!labelRaw.endsWith(":")) continue;
      const label = labelRaw.slice(0, -1).trim().toLowerCase();
      const remainder = para.children.slice(1) as Array<
        (typeof para.children)[number]
      >;
      const text = mdastToString({
        type: "paragraph",
        children: remainder as never,
      }).trim();

      if (label === "brand exemplars") {
        // Comma-separated list of brand names.
        for (const part of text.split(/,\s+/)) {
          const cleaned = part.trim().replace(/\.$/, "");
          if (cleaned.length > 0) brand_exemplars.push(cleaned);
        }
        continue;
      }

      const axis = LABEL_TO_AXIS.get(label);
      if (axis === undefined) continue;

      // Parse the canonical's per-axis grammar reference. Patterns:
      //   "Grammar Name"
      //   "Grammar Name (substyle annotation)"
      //   "Grammar A or Grammar B"
      //   "Grammar A (substyle X or substyle Y)"  ← parens contain "or"
      //   "Grammar with extension annotation"
      //   "Grammar A, Grammar B, or Grammar C"   ← Oxford-comma list
      //
      // Strip parens FIRST so an "or" inside parens doesn't trip the
      // top-level split. Then split on " or " always; ALSO split on
      // commas iff the text contains an Oxford-comma indicator
      // (", or "). The Oxford-detect heuristic distinguishes real
      // multi-option lists like "A, B, or C" from descriptive prose
      // like "Variable, often Marketing-Airy in spread but Hyper-Dense
      // in moments" (canonical 13 density) where the comma carries no
      // list semantics. Without this heuristic, descriptive prose gets
      // chopped into nonsense fragments that fail name resolution.
      const noParens = text.replace(/\s*\([^)]*\)\s*/g, " ").trim();
      const hasOxfordOr = /,\s*or\s+/i.test(noParens);
      const splitPattern = hasOxfordOr
        ? /\s+or\s+|\s*,\s*/i
        : /\s+or\s+/i;
      // Only layout uses '+' for section-level grammar composition.
      // Other axes use it for cross-axis annotations, e.g. a reading
      // pattern followed by a layout's scrolling behavior.
      const optionsText = axis === "layout"
        ? noParens.replace(/\s+\+\s+/g, " or ")
        : noParens;
      const optionTexts = optionsText
        .split(splitPattern)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const grammarNames: string[] = [];
      for (const opt of optionTexts) {
        // Defensive: strip a leading "or " in case the split left one
        // (Oxford comma + " or " can interact such that an option
        // retains an "or " prefix on edge inputs).
        const noOrPrefix = opt.replace(/^or\s+/i, "").trim();
        const noAnnotation = noOrPrefix.replace(/\s+with\s+.+$/i, "").trim();
        // A composite layout can name a secondary grammar for sections.
        // Keep both references; "sections" describes their use, not the name.
        const cleaned = noAnnotation
          .replace(/\s+sections\.?$/i, "")
          .replace(/\.$/, "")
          .trim();
        if (cleaned.length === 0) continue;
        grammarNames.push(cleaned);
      }

      if (grammarNames.length === 0) continue;

      // Primary: first option (preserves the legacy axis_mappings
      // shape for any consumer that treats the canonical as
      // single-option).
      axis_mappings[axis] = { axis, grammar_id: grammarNames[0]! };

      // Alternatives: only set when there's more than one option, so
      // single-option axes don't carry redundant data.
      if (grammarNames.length > 1) {
        axis_alternatives[axis] = grammarNames.map((name) => ({
          axis,
          grammar_id: name,
        }));
      }
    }
  }
  return { axis_mappings, axis_alternatives, brand_exemplars };
}

// ---------------------------------------------------------------------------
// Reduced-motion fallback table
// ---------------------------------------------------------------------------

function extractReducedMotionFallbacks(
  tree: HeadingNode[],
): Record<string, ReducedMotionFallback> {
  const out: Record<string, ReducedMotionFallback> = {};
  const heading = findHeading(
    tree,
    (text) => /Reduced-Motion fallbacks per motion grammar/i.test(text),
    2,
  );
  if (heading === undefined) return out;

  for (const row of extractTableRows(heading.contentBlocks)) {
    if (row.length < 2) continue;
    const grammarName = row[0]!.trim();
    const description = row[1]!.trim();
    if (
      /^motion grammar$/i.test(grammarName) ||
      /^-+$/.test(grammarName) ||
      grammarName.length === 0
    ) {
      continue;
    }

    const motion_grammar_id = motionNameToId(grammarName);
    out[motion_grammar_id] = {
      motion_grammar_id,
      description,
      severity: classifyReducedMotionSeverity(grammarName, description),
    };
  }
  return out;
}

/**
 * Map a motion grammar's spec name to its stable id. The mapping is
 * derived from Turn 2 + Turn 3's MOTION-N numbering. Hardcoded because
 * the reduced-motion table uses display names ("Stillness as
 * Discipline") rather than ids.
 */
const MOTION_NAME_TO_ID: ReadonlyMap<string, string> = new Map([
  ["Stillness as Discipline", "MOTION-1"],
  ["Restrained-Atmospheric", "MOTION-2"],
  ["Functional-Snappy", "MOTION-3"],
  ["Punchy-Discrete", "MOTION-4"],
  ["Scroll-Driven Cinematic", "MOTION-5"],
  ["Scrollytelling Narrative", "MOTION-6"],
  ["Kinetic-Expressive", "MOTION-7"],
  ["Atmospheric-Depth", "MOTION-8"],
  ["Loading-and-Latency", "MOTION-9"],
]);

function motionNameToId(name: string): string {
  return MOTION_NAME_TO_ID.get(name) ?? name;
}

/**
 * Heuristic classification of a reduced-motion fallback's severity.
 * Trivial = the grammar already lacks motion. Substantial = the
 * fallback significantly changes page behavior (separate page,
 * disabled cinema). Partial = everything else.
 */
function classifyReducedMotionSeverity(
  grammarName: string,
  description: string,
): ReducedMotionFallback["severity"] {
  if (/no fallback needed/i.test(description)) return "trivial";
  if (
    /substantial fallback/i.test(description) ||
    /separate page/i.test(description) ||
    /dedicated reduced-motion version/i.test(description)
  ) {
    return "substantial";
  }
  return "partial";
}

// ---------------------------------------------------------------------------
// Accessibility commitments — from §6.2, hardcoded as constants
// ---------------------------------------------------------------------------

const ACCESSIBILITY_COMMITMENTS: AccessibilityCommitments = {
  contrast_validation: "WCAG_2.2_AA",
  touch_target_minimum_px: 44,
  keyboard_navigation: "all_interactive_elements_focusable",
  high_contrast_mode_support: true,
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Walk a HeadingNode's contentBlocks and yield one row at a time from
 * any markdown table it contains. Each row is an array of cell
 * strings. Header rows (the first row of the table) are included; the
 * caller filters them out by content if needed.
 *
 * mdast doesn't render tables natively (CommonMark doesn't have
 * tables); the spec uses GFM-style pipe tables which remark-parse
 * preserves as raw text in paragraph nodes when the GFM extension is
 * absent. This parser walks paragraph nodes whose text contains
 * pipe-delimited rows.
 */
function* extractTableRows(blocks: BlockContent[]): Iterable<string[]> {
  for (const block of blocks) {
    if (block.type !== "paragraph") continue;
    const text = mdastToString(block);
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
      // Strip leading and trailing pipes, then split on internal pipes.
      const inner = trimmed.slice(1, -1);
      const cells = inner.split("|").map((c) => c.trim());
      yield cells;
    }
  }
}

/**
 * Walk the tree (BFS by depth, then DFS) and find the first heading
 * matching the predicate at the specified depth. Used to find named
 * H1 sections ("# 2. HARD RULES") and named H2 subsections ("## 6.1
 * Reduced-Motion fallbacks").
 */
function findHeading(
  tree: HeadingNode[],
  predicate: (text: string) => boolean,
  depth: number,
): HeadingNode | undefined {
  for (const node of walkHeadingTree(tree)) {
    if (node.depth === depth && predicate(node.text)) return node;
  }
  return undefined;
}

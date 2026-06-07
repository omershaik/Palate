// src/corpus/loaders/voice.ts
//
// D5 — loads the voice axis from Turn 6. Voice is hybrid (Turn 6's
// architectural choice): six continuous dimensions provide a precise
// coordinate system, nine named profiles provide common entry points
// in that space. Both ship in v0.1.
//
// Turn 6's structure:
//
//   # Palate Grammar Survey v0.2 — Turn 6: Voice Grammar
//   # THE SIX VOICE DIMENSIONS
//     ## Dimension 1 — Humor (Funny ↔ Serious)
//     ... (six dimensions)
//   # THE NINE NAMED VOICE PROFILES
//     ## VOICE-1. Quiet Authority
//     ... (nine profiles)
//   # AI-SLOP VOICE ANTI-PATTERNS (CROSS-CUTTING)
//   # How voice interacts with the other axes
//   # Open questions for v0.2
//
// Each profile's "**Dimensional coordinates (approximate):**" line
// uses qualitative descriptors (Serious, Slightly Formal, Mixed
// Rhythm, etc.) rather than numeric scores. The loader maps those
// descriptors to 0–10 numeric scores via a fixed lookup table built
// from Turn 6's dimension-end-point definitions. Where the spec gives
// a "between A and B" descriptor (VOICE-2 has "Slightly Serious to
// Middle Humor"), the loader picks the midpoint of the two anchors.
// All mappings are approximate — Turn 6 itself flags this.

import {
  extractAltnameBucket,
  extractGrammarBlock,
  parseMarkdown,
  buildHeadingTree,
} from "../parser/index.js";
import { toString as mdastToString } from "mdast-util-to-string";
import type {
  VoiceDimensionDef,
  VoiceDimensions,
  VoiceProfile,
} from "../../types/voice.js";
import type { CorpusVoiceBlock } from "../../types/corpus.js";
import type { BlockContent, HeadingNode } from "../parser/heading-tree.js";
import { readFileSync } from "node:fs";
import { resolveSpecPath } from "./utils.js";
import { findTopLevelHeading } from "./utils.js";

const TURN6_FILENAME = "palate-grammar-survey-v0.2-turn6-voice.md";

// ---------------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------------

/**
 * Load the voice axis from Turn 6. Returns a CorpusVoiceBlock with
 * dimensions and profiles populated.
 */
export function loadVoiceBlock(specRoot: string): CorpusVoiceBlock {
  const filePath = resolveSpecPath(specRoot, "turns", TURN6_FILENAME);
  const content = readFileSync(filePath, "utf-8");
  const tree = buildHeadingTree(parseMarkdown(content));

  const dimensionsHeading = findTopLevelHeading(tree, (text) =>
    /SIX VOICE DIMENSIONS/i.test(text),
  );
  const profilesHeading = findTopLevelHeading(tree, (text) =>
    /NAMED VOICE PROFILES/i.test(text),
  );
  if (dimensionsHeading === undefined || profilesHeading === undefined) {
    throw new Error(
      `loadVoiceBlock: missing section heading in ${filePath} ` +
        `(dimensions: ${dimensionsHeading !== undefined}, ` +
        `profiles: ${profilesHeading !== undefined})`,
    );
  }

  const dimensions = extractDimensions(dimensionsHeading.children);
  const profiles = extractProfiles(profilesHeading.children);
  return { dimensions, profiles };
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

/**
 * Heading-pattern for a dimension entry: "## Dimension N — Name (Funny ↔ Serious)".
 * Captures the dimension number, name, and the bipolar end-point pair.
 */
const DIMENSION_HEADING_PATTERN =
  /^Dimension (\d+) — ([\w]+(?:\s+\w+)*?)\s+\(([^↔)]+)↔([^)]+)\)/;

const DIMENSION_ID_BY_NUMBER: Record<number, keyof VoiceDimensions> = {
  1: "humor",
  2: "formality",
  3: "respectfulness",
  4: "enthusiasm",
  5: "rhythm",
  6: "vocabulary",
};

function extractDimensions(
  candidates: ReadonlyArray<HeadingNode>,
): VoiceDimensionDef[] {
  const out: VoiceDimensionDef[] = [];
  for (const node of candidates) {
    if (node.depth !== 2) continue;
    const match = DIMENSION_HEADING_PATTERN.exec(node.text.trim());
    if (match === null) continue;

    const num = parseInt(match[1]!, 10);
    const name = match[2]!.trim();
    const lowEndLabel = match[4]!.trim(); // "Serious" half
    const highEndLabel = match[3]!.trim(); // "Funny" half

    const id = DIMENSION_ID_BY_NUMBER[num];
    if (id === undefined) {
      throw new Error(`Unexpected voice dimension number ${num} (${name})`);
    }

    const sections = collectSections(node.contentBlocks);
    const description = sections.find(
      (s) => s.label === null || s.label === undefined,
    )?.text ?? "";
    const lowEnd = sections.find((s) => s.label === `${lowEndLabel} end`.toLowerCase())?.text ?? "";
    const highEnd = sections.find((s) => s.label === `${highEndLabel} end`.toLowerCase())?.text ?? "";
    const middle = sections.find((s) => s.label === "middle")?.text;
    const workingEffect = sections.find((s) => s.label === "working effect")?.text;

    out.push({
      id,
      name,
      description,
      endpoints: middle === undefined
        ? { low: lowEnd, high: highEnd }
        : { low: lowEnd, high: highEnd, middle },
      ...(workingEffect !== undefined ? { working_effect: workingEffect } : {}),
    });
  }
  return out;
}

interface LabeledSection {
  label: string | null;
  text: string;
}

/**
 * Walk a HeadingNode's contentBlocks and group by bold-prefix labels.
 * Bullet list items with bold-colon labels (used for the dimension
 * end-points "**Funny end:**", "**Serious end:**", "**Middle:**") are
 * also captured. The first paragraph without a bold label is treated
 * as the dimension's prose description (label === null).
 */
function collectSections(blocks: BlockContent[]): LabeledSection[] {
  const out: LabeledSection[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      const first = block.children[0];
      if (first?.type === "strong") {
        const labelText = mdastToString(first).trim();
        const trimmed = labelText.endsWith(":")
          ? labelText.slice(0, -1)
          : labelText.endsWith(".")
            ? labelText.slice(0, -1)
            : labelText;
        const remainder = block.children.slice(1) as Array<
          (typeof block.children)[number]
        >;
        const text = mdastToString({
          type: "paragraph",
          children: remainder as never,
        }).trim();
        out.push({ label: trimmed.toLowerCase(), text });
      } else {
        out.push({ label: null, text: mdastToString(block).trim() });
      }
    } else if (block.type === "list") {
      for (const item of block.children) {
        const para = item.children.find((c) => c.type === "paragraph");
        if (para === undefined || para.type !== "paragraph") continue;
        const first = para.children[0];
        if (first?.type !== "strong") continue;
        const labelText = mdastToString(first).trim();
        const trimmed = labelText.endsWith(":")
          ? labelText.slice(0, -1)
          : labelText;
        const remainder = para.children.slice(1) as Array<
          (typeof para.children)[number]
        >;
        const text = mdastToString({
          type: "paragraph",
          children: remainder as never,
        }).trim();
        out.push({ label: trimmed.toLowerCase(), text });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

const PROFILE_HEADING_PATTERN = /^VOICE-\d+\.\s+/;

function extractProfiles(
  candidates: ReadonlyArray<HeadingNode>,
): VoiceProfile[] {
  const out: VoiceProfile[] = [];
  for (const node of candidates) {
    if (node.depth !== 2) continue;
    if (!PROFILE_HEADING_PATTERN.test(node.text.trim())) continue;

    const shell = extractGrammarBlock(node, { axis: "voice" });
    const altnames = extractAltnameBucket(node.contentBlocks);
    const dimensional_coordinates = parseDimensionalCoordinates(node);

    out.push({
      id: shell.id,
      axis: "voice",
      name: shell.name,
      definition: shell.definition,
      distinguishing_edge: shell.distinguishing_edge,
      substyles: shell.substyles,
      canonical_examples: shell.canonical_examples,
      internal_logic: shell.internal_logic,
      failure_mode: shell.failure_mode,
      dimensional_coordinates,
      altnames,
    });
  }
  return out;
}

/**
 * Find the "**Dimensional coordinates (approximate):** A, B, C, D, E, F."
 * paragraph in a profile's content and parse the six descriptors into
 * numeric VoiceDimensions.
 */
function parseDimensionalCoordinates(node: HeadingNode): VoiceDimensions {
  for (const block of node.contentBlocks) {
    if (block.type !== "paragraph") continue;
    const first = block.children[0];
    if (first?.type !== "strong") continue;
    const label = mdastToString(first).trim().toLowerCase();
    if (!label.startsWith("dimensional coordinates")) continue;

    const remainder = block.children.slice(1) as Array<
      (typeof block.children)[number]
    >;
    const text = mdastToString({
      type: "paragraph",
      children: remainder as never,
    }).trim();
    return parseDimensionalCoordinatesText(text);
  }
  // No coordinates found — return the neutral midpoint vector. This
  // is a safe default but indicates a spec inconsistency that should
  // be surfaced; v0.1 doesn't have any such profile.
  return { humor: 5, formality: 5, respectfulness: 5, enthusiasm: 5, rhythm: 5, vocabulary: 5 };
}

/**
 * Parse the comma-separated descriptor text into a VoiceDimensions
 * record. Spec format: "Serious, Formal, Respectful, Matter-of-Fact,
 * Flowing, Plain." (six descriptors in dimension order). The trailing
 * period is stripped; descriptors are looked up in DESCRIPTOR_TO_SCORE
 * per dimension. Unknown descriptors map to 5 (neutral midpoint).
 *
 * For "between A and B" descriptors ("Slightly Serious to Middle
 * Humor"), the loader takes the midpoint of the two anchors.
 *
 * Special-case: a parenthetical clause inside a descriptor ("Plain
 * (with strategic Expert vocabulary)") is treated as the primary
 * descriptor only; the parenthetical is stripped before lookup.
 */
export function parseDimensionalCoordinatesText(text: string): VoiceDimensions {
  const cleaned = text.replace(/\.$/, "").trim();
  const parts = splitTopLevel(cleaned).map((s) => s.trim());

  const dims: Array<keyof VoiceDimensions> = [
    "humor",
    "formality",
    "respectfulness",
    "enthusiasm",
    "rhythm",
    "vocabulary",
  ];

  const out: VoiceDimensions = {
    humor: 5,
    formality: 5,
    respectfulness: 5,
    enthusiasm: 5,
    rhythm: 5,
    vocabulary: 5,
  };

  for (let i = 0; i < dims.length; i++) {
    const part = parts[i];
    if (part === undefined) continue;
    out[dims[i]!] = scoreDescriptor(stripParenthetical(part), dims[i]!);
  }
  return out;
}

/**
 * Split a string on commas but respect parenthetical clauses (commas
 * inside parens stay intact). The voice descriptors don't currently
 * use top-level commas inside parentheses, but defensiveness here
 * costs nothing.
 */
function splitTopLevel(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      out.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.length > 0) out.push(buf);
  return out;
}

function stripParenthetical(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

/** Score a single descriptor against a target dimension. */
function scoreDescriptor(
  raw: string,
  dimension: keyof VoiceDimensions,
): number {
  const lower = raw.toLowerCase().trim();

  // "X to Y" → average of X and Y scores in the same dimension.
  const rangeMatch = /^(.+?)\s+to\s+(.+)$/.exec(lower);
  if (rangeMatch !== null) {
    const a = scoreDescriptor(rangeMatch[1]!, dimension);
    const b = scoreDescriptor(rangeMatch[2]!, dimension);
    return Math.round((a + b) / 2);
  }

  const table = DESCRIPTOR_TO_SCORE[dimension];
  for (const [key, score] of table) {
    if (lower === key || lower.includes(key)) return score;
  }
  return 5; // neutral midpoint for unrecognized descriptors
}

/**
 * Per-dimension descriptor → score table. Built from Turn 6's
 * dimension definitions and the descriptors used in the nine
 * profiles. Scores are integers on the 0–10 scale.
 *
 * Ordered most-specific → most-general so an "includes" lookup picks
 * the right entry (e.g., "slightly enthusiastic" matches before
 * "enthusiastic").
 */
const DESCRIPTOR_TO_SCORE: Record<
  keyof VoiceDimensions,
  ReadonlyArray<readonly [string, number]>
> = {
  // 0 = serious, 10 = funny
  humor: [
    ["light humor", 6],
    ["middle humor", 5],
    ["slightly serious", 3],
    ["serious", 1],
    ["funny", 9],
  ],
  // 0 = casual, 10 = formal
  formality: [
    ["middle formality", 5],
    ["slightly formal", 7],
    ["formal", 9],
    ["slightly casual", 4],
    ["casual", 2],
  ],
  // 0 = irreverent, 10 = respectful
  respectfulness: [
    ["respectful", 9],
    ["irreverent", 1],
  ],
  // 0 = matter-of-fact, 10 = enthusiastic
  enthusiasm: [
    ["slightly enthusiastic", 6],
    ["enthusiastic", 9],
    ["matter-of-fact", 1],
  ],
  // 0 = flowing, 10 = punchy
  rhythm: [
    ["mixed rhythm", 5],
    ["punchy", 9],
    ["flowing", 2],
  ],
  // 0 = plain, 10 = expert
  vocabulary: [
    ["middle vocabulary", 5],
    ["expert", 9],
    ["plain", 2],
  ],
};

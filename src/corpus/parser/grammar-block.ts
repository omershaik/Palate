// src/corpus/parser/grammar-block.ts
//
// Extracts a single Grammar (without altnames) from a HeadingNode that
// represents a grammar in the spec. Substyles are extracted from the
// "**Substyles.**" section's bullet list. Per-axis variations in section
// labels are handled via the `labelToField` option, which the per-document
// loaders in Group D supply when the defaults don't fit.
//
// Why this primitive doesn't extract altnames: altnames live in two
// places in the spec — inline within each grammar block (post-Turn-4
// docs) and in a separate altnames file (pre-Turn-4 docs). Mixing the
// altname extraction into this primitive would couple the two cases;
// the altname-bucket extractor (src/corpus/parser/altname-bucket.ts) is
// purpose-built for both.
//
// Why a per-document id-prefix table exists: the spec was written across
// separate conversation turns and the heading prefix conventions
// diverged.
//
//   Document                          | Heading prefix style
//   ----------------------------------|-----------------------------
//   v0.1 Layout (turn 0)              | bare numbers ("## 1. ...")
//   Turn 1 Typography + Color         | "TYPE-N", "COLOR-N"
//   Turn 2 Component + Motion         | "COMP-N", "MOTION-N"
//   Turn 3 patches                    | "LAYOUT-Na", "COMP-N", ...
//   Turn 5 Imagery + Density          | "IMG-N", "DENSITY-N"
//   Turn 6 Voice                      | "VOICE-N"
//   Turn 7 Reading-Pattern            | "RP-N"
//
// AXIS_PREFIX is the canonical prefix the loader synthesizes when the
// heading omits one. If a heading carries a prefix that doesn't match
// the configured axisPrefix, that's a load-time error (likely a typo
// or misclassified file).

import { toString as mdastToString } from "mdast-util-to-string";
import type { Paragraph, PhrasingContent } from "mdast";
import type { Axis } from "../../types/axis.js";
import type { Grammar, Substyle } from "../../types/grammar.js";
import type { BlockContent, HeadingNode } from "./heading-tree.js";

/**
 * Canonical prefix per axis. Used to synthesize grammar ids when the
 * spec heading omits one (v0.1 Layout case) and to validate the prefix
 * when it's present.
 */
export const AXIS_PREFIX: Record<Axis, string> = {
  layout: "LAYOUT",
  typography: "TYPE",
  color: "COLOR",
  component: "COMP",
  motion: "MOTION",
  imagery: "IMG",
  density: "DEN",
  voice: "VOICE",
  reading_pattern: "RP",
};

/**
 * Grammar fields the section extractor knows how to populate. Substyles
 * are NOT in this set — they're parsed from the "Substyles" section's
 * list separately. `altnames` is excluded by design (see file header).
 */
type ExtractableField =
  | "definition"
  | "distinguishing_edge"
  | "canonical_examples"
  | "internal_logic"
  | "registers_hosts"
  | "registers_resists"
  | "failure_mode";

/**
 * The default label-to-field map covering Turn 1, 2, 5, 6, 7 documents
 * and the post-supersession Turn 3 patches. Keys are lowercased and
 * have the trailing period stripped.
 */
export const DEFAULT_LABEL_TO_FIELD: ReadonlyMap<string, ExtractableField> =
  new Map<string, ExtractableField>([
    ["definition", "definition"],
    ["distinguishing edge", "distinguishing_edge"],
    ["canonical examples", "canonical_examples"],
    ["internal logic", "internal_logic"],
    ["registers it hosts", "registers_hosts"],
    ["registers it resists", "registers_resists"],
    ["failure mode", "failure_mode"],
  ]);

/**
 * Override map for v0.1 Layout. The original survey used "Compositional
 * logic" + "Motion vocabulary" instead of "Internal logic"; the loader
 * merges both into the Grammar.internal_logic field.
 */
export const V01_LAYOUT_LABEL_TO_FIELD: ReadonlyMap<string, ExtractableField> =
  new Map<string, ExtractableField>([
    ["definition", "definition"],
    ["distinguishing edge", "distinguishing_edge"],
    ["canonical examples", "canonical_examples"],
    ["compositional logic", "internal_logic"],
    ["motion vocabulary", "internal_logic"],
    ["registers it hosts", "registers_hosts"],
    ["registers it resists", "registers_resists"],
    ["failure mode", "failure_mode"],
  ]);

/**
 * Fields that are inherently list-shaped (multiple discrete entries):
 * canonical_examples, internal_logic, registers_hosts, registers_resists.
 * The other extractable fields are prose paragraphs.
 */
const LIST_FIELDS: ReadonlySet<ExtractableField> = new Set<ExtractableField>([
  "canonical_examples",
  "internal_logic",
  "registers_hosts",
  "registers_resists",
]);

export interface ExtractGrammarBlockOptions {
  axis: Axis;
  /**
   * Override the AXIS_PREFIX value. Useful for axes that share canonical
   * prefixes across multiple files (none in v0.1, but kept for forward
   * compatibility).
   */
  axisPrefix?: string;
  /**
   * Override the section label-to-field map. Defaults to
   * DEFAULT_LABEL_TO_FIELD; the v0.1 Layout loader passes
   * V01_LAYOUT_LABEL_TO_FIELD.
   */
  labelToField?: ReadonlyMap<string, ExtractableField>;
}

export class GrammarBlockParseError extends Error {
  constructor(
    message: string,
    public readonly heading: string,
  ) {
    super(`Grammar block parse error in heading "${heading}": ${message}`);
    this.name = "GrammarBlockParseError";
  }
}

/**
 * Heading-text pattern. Captures optional prefix, numeric-with-letter id,
 * and grammar name. Examples:
 *
 *   "TYPE-1. Two-Hand System (Serif Display + Sans Body)"
 *     → prefix=TYPE, num=1, name="Two-Hand System (Serif Display + Sans Body)"
 *
 *   "1. Vertical-Rhythm Editorial"
 *     → prefix=undefined, num=1, name="Vertical-Rhythm Editorial"
 *
 *   "LAYOUT-3a. Marketing-Bento"
 *     → prefix=LAYOUT, num=3a, name="Marketing-Bento"
 */
const HEADING_PATTERN = /^(?:([A-Z]+)-)?(\d+[a-z]?)\.\s+(.+)$/;

interface ParsedHeading {
  prefix: string | undefined;
  num: string;
  name: string;
}

function parseHeadingText(text: string): ParsedHeading | null {
  const match = HEADING_PATTERN.exec(text.trim());
  if (match === null) return null;
  return {
    prefix: match[1],
    num: match[2]!,
    name: match[3]!.trim(),
  };
}

/**
 * Extract the bold-dot label at the start of a paragraph. Returns the
 * lowercased label without the trailing period, or null if the paragraph
 * doesn't start with a `<strong>` whose text ends in ".".
 *
 * Strips parenthetical annotations from the label, since the spec
 * occasionally adds them (e.g., RP-5's "**Registers it hosts
 * (intentional).**" — the annotation distinguishes intentional Spotted
 * from failure-mode Spotted, but the structural label is still
 * "registers it hosts").
 */
function extractSectionLabel(block: BlockContent): string | null {
  if (block.type !== "paragraph") return null;
  const first = block.children[0];
  if (first?.type !== "strong") return null;
  const text = mdastToString(first).trim();
  if (!text.endsWith(".")) return null;
  const withoutPeriod = text.slice(0, -1).trim();
  const withoutAnnotation = withoutPeriod
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .trim();
  return withoutAnnotation.toLowerCase();
}

/**
 * Strip the leading strong-label child from a paragraph and return the
 * remaining inline text. Used by inline-prose section interpretation.
 */
function paragraphTextAfterLabel(block: BlockContent): string {
  if (block.type !== "paragraph") return "";
  const remaining = block.children.slice(1) as PhrasingContent[];
  const para: Paragraph = { type: "paragraph", children: remaining };
  return mdastToString(para).trim();
}

/**
 * Render a list (bullet or ordered) as one string per item. Each item's
 * children may include nested lists or paragraphs; we flatten with
 * mdast-util-to-string and trim.
 */
function renderListItems(blocks: BlockContent[]): string[] {
  for (const block of blocks) {
    if (block.type === "list") {
      return block.children
        .map((item) => mdastToString(item).trim())
        .filter((s) => s.length > 0);
    }
  }
  return [];
}

/**
 * Split an inline comma-separated list into trimmed entries. Strips a
 * trailing period from the last entry.
 */
function splitInlineCommaList(text: string): string[] {
  if (text.length === 0) return [];
  const trimmed = text.replace(/\.$/, "").trim();
  return trimmed
    .split(/,\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Extract substyles from the "Substyles" section blocks. Each list item
 * starts with `<strong>Name.</strong>` followed by definition prose.
 */
function extractSubstyles(
  grammarId: string,
  sectionBlocks: BlockContent[],
): Substyle[] {
  const substyles: Substyle[] = [];
  for (const block of sectionBlocks) {
    if (block.type !== "list") continue;
    for (const item of block.children) {
      // List item children: usually a paragraph with strong+text.
      const para = item.children.find((c) => c.type === "paragraph");
      if (para === undefined || para.type !== "paragraph") continue;
      const first = para.children[0];
      if (first?.type !== "strong") continue;
      const nameWithDot = mdastToString(first).trim();
      if (!nameWithDot.endsWith(".")) continue;
      const name = nameWithDot.slice(0, -1).trim();
      const remainder: PhrasingContent[] = para.children.slice(1) as PhrasingContent[];
      const definition = mdastToString({ type: "paragraph", children: remainder }).trim();
      substyles.push({
        id: `${grammarId}/${slugify(name)}`,
        name,
        definition,
        parent_grammar_id: grammarId,
      });
    }
  }
  return substyles;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract a Grammar (without altnames) from a HeadingNode.
 *
 * Throws GrammarBlockParseError if the heading text doesn't match the
 * expected pattern, or if the heading carries a prefix that conflicts
 * with the axisPrefix.
 */
export function extractGrammarBlock(
  node: HeadingNode,
  options: ExtractGrammarBlockOptions,
): Omit<Grammar, "altnames"> {
  const axisPrefix = options.axisPrefix ?? AXIS_PREFIX[options.axis];
  const labelToField = options.labelToField ?? DEFAULT_LABEL_TO_FIELD;

  const parsed = parseHeadingText(node.text);
  if (parsed === null) {
    throw new GrammarBlockParseError(
      "heading does not match expected pattern (e.g., 'TYPE-1. Name')",
      node.text,
    );
  }
  if (parsed.prefix !== undefined && parsed.prefix !== axisPrefix) {
    throw new GrammarBlockParseError(
      `prefix '${parsed.prefix}' does not match axis prefix '${axisPrefix}' for axis '${options.axis}'`,
      node.text,
    );
  }
  const grammarId = `${axisPrefix}-${parsed.num}`;

  // Walk content blocks and group by section label. Substyles are
  // captured separately because the Grammar.substyles field has a
  // different shape than other sections.
  const sectionBlocks: Map<string, BlockContent[]> = new Map();
  let currentLabel: string | null = null;
  let currentBlocks: BlockContent[] = [];

  const flush = () => {
    if (currentLabel === null) return;
    const existing = sectionBlocks.get(currentLabel) ?? [];
    existing.push(...currentBlocks);
    sectionBlocks.set(currentLabel, existing);
    currentBlocks = [];
  };

  for (const block of node.contentBlocks) {
    const label = extractSectionLabel(block);
    if (label !== null) {
      flush();
      currentLabel = label;
      currentBlocks = [block];
    } else if (currentLabel !== null) {
      currentBlocks.push(block);
    }
    // else: orphan content before any section, ignored.
  }
  flush();

  // Translate sections into Grammar fields.
  const fields: Partial<Record<ExtractableField, string | string[]>> = {};
  for (const [label, blocks] of sectionBlocks.entries()) {
    if (label === "substyles") continue; // handled below
    const field = labelToField.get(label);
    if (field === undefined) continue; // unknown section label, ignored
    const interpretation = interpretSection(field, blocks);
    fields[field] = mergeField(fields[field], interpretation);
  }

  // Substyles section.
  const substylesBlocks = sectionBlocks.get("substyles") ?? [];
  const substyles = extractSubstyles(grammarId, substylesBlocks);

  // Build the Grammar (without altnames) and fill defaults for any
  // section the document didn't include. Empty defaults are intentional
  // — Group F2 will assert non-empty for required fields, surfacing any
  // genuinely missing section as a real error rather than papering over.
  return {
    id: grammarId,
    axis: options.axis,
    name: parsed.name,
    definition: stringField(fields.definition),
    distinguishing_edge: stringField(fields.distinguishing_edge),
    substyles,
    canonical_examples: arrayField(fields.canonical_examples),
    internal_logic: arrayField(fields.internal_logic),
    registers_hosts: arrayField(fields.registers_hosts),
    registers_resists: arrayField(fields.registers_resists),
    failure_mode: stringField(fields.failure_mode),
  };
}

/**
 * Interpret one section's blocks into either a string (prose fields) or
 * a string[] (list fields). Mixed shapes within a section are merged
 * conservatively — paragraph after a strong label collapses to the
 * inline-text-after-label, and a following list collapses to its items.
 */
function interpretSection(
  field: ExtractableField,
  blocks: BlockContent[],
): string | string[] {
  if (blocks.length === 0) return LIST_FIELDS.has(field) ? [] : "";

  if (LIST_FIELDS.has(field)) {
    // Prefer list-from-bullets if a list is present.
    const listItems = renderListItems(blocks);
    if (listItems.length > 0) return listItems;
    // Otherwise treat the first paragraph's after-label text as a
    // comma-separated inline list (canonical_examples + registers
    // sections often use this shape).
    const firstPara = blocks[0];
    if (firstPara !== undefined) {
      return splitInlineCommaList(paragraphTextAfterLabel(firstPara));
    }
    return [];
  }

  // Prose fields: take after-label text from the first paragraph,
  // append any subsequent paragraph plain-text in order. Lists
  // appearing inside prose fields are rendered as joined text (rare
  // but possible).
  const parts: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    if (i === 0 && block.type === "paragraph") {
      const after = paragraphTextAfterLabel(block);
      if (after.length > 0) parts.push(after);
    } else if (block.type === "paragraph") {
      parts.push(mdastToString(block).trim());
    } else if (block.type === "list") {
      parts.push(renderListItems([block]).join("; "));
    }
  }
  return parts.join(" ").trim();
}

/**
 * Merge two field values from sections that share the same target field
 * (e.g., v0.1 Layout's Compositional logic + Motion vocabulary both →
 * internal_logic). Strings concatenate with a separator; arrays append.
 */
function mergeField(
  existing: string | string[] | undefined,
  incoming: string | string[],
): string | string[] {
  if (existing === undefined) return incoming;
  if (Array.isArray(existing) && Array.isArray(incoming)) {
    return [...existing, ...incoming];
  }
  if (typeof existing === "string" && typeof incoming === "string") {
    return existing.length > 0 ? `${existing}\n\n${incoming}` : incoming;
  }
  // Type mismatch shouldn't happen in practice (LIST_FIELDS partitions
  // the field set), but be defensive: coerce to array.
  return [
    ...(Array.isArray(existing) ? existing : [existing]),
    ...(Array.isArray(incoming) ? incoming : [incoming]),
  ];
}

function stringField(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  if (Array.isArray(v)) return v.join(" ").trim();
  return v;
}

function arrayField(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  if (Array.isArray(v)) return v;
  return splitInlineCommaList(v);
}

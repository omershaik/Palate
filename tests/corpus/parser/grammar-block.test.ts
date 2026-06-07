// tests/corpus/parser/grammar-block.test.ts
//
// Unit tests for extractGrammarBlock against synthetic fixtures that
// match each shape the spec uses. Real spec content gets exercised by
// the loader contract tests in Group F.

import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../../../src/corpus/parser/parse.js";
import { buildHeadingTree } from "../../../src/corpus/parser/heading-tree.js";
import {
  AXIS_PREFIX,
  DEFAULT_LABEL_TO_FIELD,
  GrammarBlockParseError,
  V01_LAYOUT_LABEL_TO_FIELD,
  extractGrammarBlock,
} from "../../../src/corpus/parser/grammar-block.js";

function firstHeadingNode(md: string) {
  const tree = buildHeadingTree(parseMarkdown(md));
  return tree[0]!;
}

describe("extractGrammarBlock — Turn 1+ standard schema", () => {
  it("extracts every field for a typical post-Turn-4 grammar", () => {
    const md = [
      "## TYPE-1. Two-Hand System (Serif Display + Sans Body)",
      "",
      "**Definition.** A high-contrast pairing where a serif handles display and a sans handles body.",
      "",
      "**Distinguishing edge.** Versus Single-Family Discipline — Two-Hand uses two type families.",
      "",
      "**Substyles.**",
      "- **Editorial Two-Hand.** Transitional serif paired with humanist sans.",
      "- **Classical Two-Hand.** Old-style serif paired with grotesque sans.",
      "",
      "**Canonical examples.** Aman, Soho House, NYT Style, Hermès editorial.",
      "",
      "**Internal logic.**",
      "- Serif and sans must be from different classifications.",
      "- Display scale is dramatic; body sizes are comfortable for reading.",
      "",
      "**Registers it hosts.** Luxury hospitality, editorial publishing, fashion, heritage brands.",
      "",
      "**Registers it resists.** Tech products, dashboards, neo-brutalist contexts.",
      "",
      "**Failure mode.** AI defaults to Cormorant + Inter, which reads as wedding-industrial.",
      "",
    ].join("\n");

    const heading = firstHeadingNode(md);
    const grammar = extractGrammarBlock(heading, { axis: "typography" });

    expect(grammar.id).toBe("TYPE-1");
    expect(grammar.axis).toBe("typography");
    expect(grammar.name).toBe("Two-Hand System (Serif Display + Sans Body)");

    expect(grammar.definition).toMatch(/A high-contrast pairing/);
    expect(grammar.distinguishing_edge).toMatch(/Versus Single-Family Discipline/);

    expect(grammar.substyles).toHaveLength(2);
    expect(grammar.substyles[0]!.id).toBe("TYPE-1/editorial-two-hand");
    expect(grammar.substyles[0]!.name).toBe("Editorial Two-Hand");
    expect(grammar.substyles[0]!.parent_grammar_id).toBe("TYPE-1");
    expect(grammar.substyles[0]!.definition).toMatch(/Transitional serif paired with humanist sans/);
    expect(grammar.substyles[1]!.name).toBe("Classical Two-Hand");

    expect(grammar.canonical_examples).toEqual([
      "Aman",
      "Soho House",
      "NYT Style",
      "Hermès editorial",
    ]);

    expect(grammar.internal_logic).toHaveLength(2);
    expect(grammar.internal_logic[0]).toMatch(/different classifications/);
    expect(grammar.internal_logic[1]).toMatch(/Display scale is dramatic/);

    expect(grammar.registers_hosts).toEqual([
      "Luxury hospitality",
      "editorial publishing",
      "fashion",
      "heritage brands",
    ]);
    expect(grammar.registers_resists).toEqual([
      "Tech products",
      "dashboards",
      "neo-brutalist contexts",
    ]);
    expect(grammar.failure_mode).toMatch(/Cormorant \+ Inter/);
  });

  it("handles a grammar with no Substyles section", () => {
    const md = [
      "## RP-1. F-Pattern (Text-Heavy Scanning)",
      "",
      "**Definition.** F-shaped reading pattern documented by NN/G.",
      "",
      "**Distinguishing edge.** Versus Layer-cake — F-pattern users read more body text.",
      "",
      "**Canonical examples.** Most blog posts, Medium articles, Wikipedia.",
      "",
      "**Internal logic.**",
      "- The top-left is the highest-attention zone.",
      "",
      "**Registers it hosts.** Blog posts, articles, documentation.",
      "",
      "**Registers it resists.** Application UIs, marketing pages with heavy visuals.",
      "",
      "**Failure mode.** Centered text fights F-pattern entirely.",
      "",
    ].join("\n");

    const heading = firstHeadingNode(md);
    const grammar = extractGrammarBlock(heading, { axis: "reading_pattern" });

    expect(grammar.id).toBe("RP-1");
    expect(grammar.substyles).toEqual([]);
    expect(grammar.canonical_examples).toContain("Most blog posts");
  });
});

describe("extractGrammarBlock — heading parsing", () => {
  it("synthesizes id from bare-number heading using axisPrefix", () => {
    const md = [
      "## 1. Vertical-Rhythm Editorial",
      "",
      "**Definition.** Single-column scroll alternating with full-bleed imagery.",
      "",
    ].join("\n");
    const heading = firstHeadingNode(md);
    const grammar = extractGrammarBlock(heading, { axis: "layout" });
    expect(grammar.id).toBe("LAYOUT-1");
    expect(grammar.name).toBe("Vertical-Rhythm Editorial");
  });

  it("preserves letter-suffixed numbers (e.g., 3a)", () => {
    const md = [
      "### LAYOUT-3a. Marketing-Bento",
      "",
      "**Definition.** Tiled grid of mixed-size cells with marketing claims.",
      "",
    ].join("\n");
    const heading = firstHeadingNode(md);
    const grammar = extractGrammarBlock(heading, { axis: "layout" });
    expect(grammar.id).toBe("LAYOUT-3a");
  });

  it("throws when heading prefix doesn't match axisPrefix", () => {
    const md = [
      "## TYPE-1. Wrong File",
      "",
      "**Definition.** Mismatched prefix.",
      "",
    ].join("\n");
    const heading = firstHeadingNode(md);
    expect(() =>
      extractGrammarBlock(heading, { axis: "layout" }),
    ).toThrow(GrammarBlockParseError);
  });

  it("throws on heading text that doesn't match the pattern", () => {
    const md = ["## Not a grammar heading", ""].join("\n");
    const heading = firstHeadingNode(md);
    expect(() =>
      extractGrammarBlock(heading, { axis: "layout" }),
    ).toThrow(GrammarBlockParseError);
  });

  it("uses the axisPrefix override when provided", () => {
    const md = [
      "## CUSTOM-7. Hypothetical Grammar",
      "",
      "**Definition.** Synthesized.",
      "",
    ].join("\n");
    const heading = firstHeadingNode(md);
    const grammar = extractGrammarBlock(heading, {
      axis: "layout",
      axisPrefix: "CUSTOM",
    });
    expect(grammar.id).toBe("CUSTOM-7");
  });
});

describe("extractGrammarBlock — v0.1 Layout label map", () => {
  it("merges Compositional logic + Motion vocabulary into internal_logic", () => {
    const md = [
      "## 1. Vertical-Rhythm Editorial",
      "",
      "**Definition.** Single-column scroll with full-bleed image breaks.",
      "",
      "**Compositional logic.**",
      "- Single reading column 32–40rem max-width.",
      "- Outer margin 8–12% of viewport on desktop.",
      "",
      "**Motion vocabulary.** Almost none. Slight fade-in on scroll, possible parallax on hero.",
      "",
      "**Failure mode.** AI imitates by producing two-column hero.",
      "",
    ].join("\n");

    const heading = firstHeadingNode(md);
    const grammar = extractGrammarBlock(heading, {
      axis: "layout",
      labelToField: V01_LAYOUT_LABEL_TO_FIELD,
    });

    // Compositional logic was a list (2 items); Motion vocabulary was a
    // prose paragraph that gets split as an inline comma-list since
    // internal_logic is a LIST_FIELDS field. Result: 4 entries — the
    // two compositional bullets followed by the comma-split motion
    // vocabulary. v0.1 Layout deliberately preserves motion content
    // here (it carries real grammar info — "Slight fade-in on scroll",
    // "parallax on hero" — that the routing engine and card builder
    // can consume verbatim).
    expect(grammar.internal_logic).toHaveLength(4);
    expect(grammar.internal_logic[0]).toMatch(/Single reading column/);
    expect(grammar.internal_logic[1]).toMatch(/Outer margin/);
    expect(grammar.internal_logic[2]).toMatch(/Almost none/);
    expect(grammar.internal_logic[3]).toMatch(/parallax on hero/);
    expect(grammar.failure_mode).toMatch(/AI imitates by producing two-column hero/);
  });
});

describe("constants", () => {
  it("AXIS_PREFIX has exactly one entry per axis", () => {
    const axes = Object.keys(AXIS_PREFIX);
    expect(axes).toHaveLength(9);
    expect(new Set(Object.values(AXIS_PREFIX)).size).toBe(9);
  });

  it("DEFAULT_LABEL_TO_FIELD covers every extractable field", () => {
    const targetFields = new Set(DEFAULT_LABEL_TO_FIELD.values());
    expect(targetFields).toEqual(
      new Set([
        "definition",
        "distinguishing_edge",
        "canonical_examples",
        "internal_logic",
        "registers_hosts",
        "registers_resists",
        "failure_mode",
      ]),
    );
  });
});

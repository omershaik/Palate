// tests/corpus/parser/parse.test.ts
//
// Smoke tests for the parser scaffold. Confirms the remark wrapper
// returns an mdast Root with expected child shapes; the heavy lifting
// happens in heading-tree, grammar-block, and altname-bucket — this
// only verifies the foundation is alive.

import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../../../src/corpus/parser/parse.js";

describe("parseMarkdown", () => {
  it("returns a Root node for empty input", () => {
    const tree = parseMarkdown("");
    expect(tree.type).toBe("root");
    expect(Array.isArray(tree.children)).toBe(true);
    expect(tree.children).toHaveLength(0);
  });

  it("parses a simple heading + paragraph", () => {
    const tree = parseMarkdown("## TYPE-1. Two-Hand System\n\nDefinition prose.\n");
    expect(tree.type).toBe("root");
    expect(tree.children).toHaveLength(2);

    const [heading, paragraph] = tree.children;
    expect(heading?.type).toBe("heading");
    expect(paragraph?.type).toBe("paragraph");

    if (heading?.type === "heading") {
      expect(heading.depth).toBe(2);
      expect(heading.children).toHaveLength(1);
      expect(heading.children[0]?.type).toBe("text");
      if (heading.children[0]?.type === "text") {
        expect(heading.children[0].value).toBe("TYPE-1. Two-Hand System");
      }
    }
  });

  it("preserves bullet-list structure used by altname blocks", () => {
    const md = [
      "- **Vibes:** *premium* — *sleek*",
      "- **Brand exemplars:** *like Stripe*",
      "",
    ].join("\n");
    const tree = parseMarkdown(md);
    const [list] = tree.children;
    expect(list?.type).toBe("list");
    if (list?.type === "list") {
      expect(list.children).toHaveLength(2);
      expect(list.children[0]?.type).toBe("listItem");
    }
  });
});

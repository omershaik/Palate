// tests/corpus/parser/heading-tree.test.ts

import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../../../src/corpus/parser/parse.js";
import {
  buildHeadingTree,
  findHeadingByText,
  walkHeadingTree,
} from "../../../src/corpus/parser/heading-tree.js";

describe("buildHeadingTree", () => {
  it("returns an empty array for content with no headings", () => {
    const tree = buildHeadingTree(parseMarkdown("Just a paragraph.\n"));
    expect(tree).toEqual([]);
  });

  it("returns top-level H1 with nested H2 children", () => {
    const md = [
      "# Top Title",
      "",
      "Intro paragraph.",
      "",
      "## Subsection A",
      "",
      "Body of A.",
      "",
      "## Subsection B",
      "",
      "Body of B.",
      "",
    ].join("\n");

    const tree = buildHeadingTree(parseMarkdown(md));
    expect(tree).toHaveLength(1);

    const h1 = tree[0]!;
    expect(h1.depth).toBe(1);
    expect(h1.text).toBe("Top Title");
    expect(h1.contentBlocks).toHaveLength(1);
    expect(h1.contentBlocks[0]?.type).toBe("paragraph");
    expect(h1.children).toHaveLength(2);

    expect(h1.children[0]!.text).toBe("Subsection A");
    expect(h1.children[0]!.depth).toBe(2);
    expect(h1.children[0]!.contentBlocks).toHaveLength(1);

    expect(h1.children[1]!.text).toBe("Subsection B");
    expect(h1.children[1]!.depth).toBe(2);
  });

  it("nests deeper headings under the right ancestor", () => {
    const md = [
      "## TYPE-1. Two-Hand System",
      "",
      "Definition prose.",
      "",
      "### Substyle: Editorial Two-Hand",
      "",
      "Substyle prose.",
      "",
      "### Substyle: Classical Two-Hand",
      "",
      "Substyle prose.",
      "",
      "## TYPE-2. Single-Family Discipline",
      "",
      "Definition prose.",
      "",
    ].join("\n");

    const tree = buildHeadingTree(parseMarkdown(md));
    expect(tree).toHaveLength(2);

    const t1 = tree[0]!;
    expect(t1.text).toBe("TYPE-1. Two-Hand System");
    expect(t1.children).toHaveLength(2);
    expect(t1.children[0]!.text).toBe("Substyle: Editorial Two-Hand");
    expect(t1.children[1]!.text).toBe("Substyle: Classical Two-Hand");

    const t2 = tree[1]!;
    expect(t2.text).toBe("TYPE-2. Single-Family Discipline");
    expect(t2.children).toHaveLength(0);
  });

  it("attaches list and blockquote nodes to the surrounding heading", () => {
    const md = [
      "## LAYOUT-1. Vertical-Rhythm Editorial",
      "",
      "**Compositional logic.**",
      "",
      "- Single reading column",
      "- Outer margin generous",
      "",
      "> Stillness is the message.",
      "",
    ].join("\n");

    const tree = buildHeadingTree(parseMarkdown(md));
    const h2 = tree[0]!;
    const blockTypes = h2.contentBlocks.map((b) => b.type);
    expect(blockTypes).toContain("paragraph");
    expect(blockTypes).toContain("list");
    expect(blockTypes).toContain("blockquote");
  });

  it("drops content before the first heading", () => {
    const md = ["Floating prose.", "", "## Real heading", "Body.", ""].join("\n");
    const tree = buildHeadingTree(parseMarkdown(md));
    expect(tree).toHaveLength(1);
    expect(tree[0]!.text).toBe("Real heading");
  });
});

describe("walkHeadingTree", () => {
  it("yields headings in depth-first document order", () => {
    const md = [
      "# Doc",
      "## A",
      "### A.1",
      "### A.2",
      "## B",
      "### B.1",
    ].join("\n\n");
    const tree = buildHeadingTree(parseMarkdown(md));
    const names = Array.from(walkHeadingTree(tree)).map((n) => n.text);
    expect(names).toEqual(["Doc", "A", "A.1", "A.2", "B", "B.1"]);
  });
});

describe("findHeadingByText", () => {
  it("returns the first descendant matching the predicate", () => {
    const md = [
      "## TYPE-1. Two-Hand System",
      "",
      "**Internal logic.**",
      "",
      "## TYPE-2. Single-Family Discipline",
      "",
    ].join("\n");
    const tree = buildHeadingTree(parseMarkdown(md));
    const node = findHeadingByText(tree, (t) => t.startsWith("TYPE-2."));
    expect(node).toBeDefined();
    expect(node!.text).toBe("TYPE-2. Single-Family Discipline");
  });

  it("returns undefined when nothing matches", () => {
    const tree = buildHeadingTree(parseMarkdown("# Only One"));
    const node = findHeadingByText(tree, (t) => t === "Missing");
    expect(node).toBeUndefined();
  });
});

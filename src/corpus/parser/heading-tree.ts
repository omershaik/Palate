// src/corpus/parser/heading-tree.ts
//
// Builds a nested heading tree from an mdast Root. Each node carries its
// depth, its plain-text title, the list of mdast block nodes that fall
// under it (between this heading and the next sibling/parent heading),
// and any nested heading children at deeper depths.
//
// This is the structural index every downstream extractor (grammar
// blocks, altname buckets, canonical combinations, broken-combinations
// table) walks — none of them re-parse markdown; they all consume
// HeadingNodes.
//
// Algorithm: linear pass over root.children with a stack indexed by
// heading depth. Non-heading content attaches to the topmost open
// heading on the stack. Headings deeper than the current top become
// children of it; headings at the same or shallower depth pop the stack
// first.

import { toString as mdastToString } from "mdast-util-to-string";
import type { Heading, Root, RootContent } from "mdast";

/**
 * mdast block-content shape we actually keep on a HeadingNode. Heading
 * nodes themselves are NOT in contentBlocks (they're the children of
 * other headings). Everything else passes through verbatim so downstream
 * extractors can re-walk paragraphs, lists, blockquotes, etc.
 */
export type BlockContent = Exclude<RootContent, Heading>;

/**
 * One node in the heading tree.
 *
 * - depth: 1..6, mirroring mdast's heading.depth.
 * - text: heading title, plain-text (mdast-util-to-string strips
 *   formatting marks like emphasis/strong but preserves the literal
 *   characters of inline code, e.g. `LAYOUT-1. Vertical-Rhythm Editorial`
 *   becomes "LAYOUT-1. Vertical-Rhythm Editorial").
 * - children: nested HeadingNodes at strictly greater depth.
 * - contentBlocks: mdast block nodes between this heading and the next
 *   heading at the same or shallower depth.
 */
export interface HeadingNode {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  children: HeadingNode[];
  contentBlocks: BlockContent[];
}

/**
 * Build a heading tree from a parsed mdast Root.
 *
 * Returns the top-level heading nodes — typically the H1 of a document
 * (and any subsequent same-depth siblings), with deeper headings nested
 * as children. Content nodes appearing before any heading are dropped
 * (no spec document has them in v0.1).
 */
export function buildHeadingTree(root: Root): HeadingNode[] {
  const top: HeadingNode[] = [];
  // Stack of currently-open headings, indexed by their position depth in
  // the stack (NOT mdast depth). The top of the stack is the heading
  // that currently receives non-heading content.
  const stack: HeadingNode[] = [];

  for (const node of root.children) {
    if (node.type === "heading") {
      const heading = node satisfies Heading;
      const newNode: HeadingNode = {
        depth: heading.depth,
        text: mdastToString(heading).trim(),
        children: [],
        contentBlocks: [],
      };

      // Pop any open heading whose depth is >= newNode.depth — those
      // are no longer ancestors of subsequent content.
      while (stack.length > 0) {
        const last = stack[stack.length - 1];
        if (last !== undefined && last.depth < newNode.depth) {
          break;
        }
        stack.pop();
      }

      if (stack.length === 0) {
        top.push(newNode);
      } else {
        const parent = stack[stack.length - 1];
        if (parent !== undefined) {
          parent.children.push(newNode);
        }
      }
      stack.push(newNode);
    } else {
      // Non-heading block. Attach to the topmost open heading. Drop if
      // there isn't one (content before the first heading).
      const open = stack.length > 0 ? stack[stack.length - 1] : undefined;
      if (open !== undefined) {
        open.contentBlocks.push(node);
      }
    }
  }

  return top;
}

/**
 * Depth-first walk of a heading tree, yielding every HeadingNode in
 * document order. Useful for downstream extractors that need to
 * iterate every heading regardless of nesting.
 */
export function* walkHeadingTree(
  nodes: HeadingNode[],
): IterableIterator<HeadingNode> {
  for (const node of nodes) {
    yield node;
    yield* walkHeadingTree(node.children);
  }
}

/**
 * Find the first descendant heading whose text matches a predicate.
 * Used by extractors looking for a specific subsection (e.g., the
 * "Internal logic" block under a grammar heading).
 */
export function findHeadingByText(
  nodes: HeadingNode[],
  predicate: (text: string) => boolean,
): HeadingNode | undefined {
  for (const node of walkHeadingTree(nodes)) {
    if (predicate(node.text)) {
      return node;
    }
  }
  return undefined;
}

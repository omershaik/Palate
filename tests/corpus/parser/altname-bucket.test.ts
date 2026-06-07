// tests/corpus/parser/altname-bucket.test.ts

import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../../../src/corpus/parser/parse.js";
import { buildHeadingTree } from "../../../src/corpus/parser/heading-tree.js";
import {
  emptyAltnameBucket,
  emptyBuckets,
  extractAltnameBucket,
  isAltnameBucketComplete,
} from "../../../src/corpus/parser/altname-bucket.js";

function blocksFor(md: string) {
  const tree = buildHeadingTree(parseMarkdown(md));
  return tree[0]?.contentBlocks ?? [];
}

describe("extractAltnameBucket", () => {
  it("extracts all five buckets from a typical altname list", () => {
    const md = [
      "## LAYOUT-1. Vertical-Rhythm Editorial",
      "",
      "- **Vibes:** *premium* — *quiet luxury* — *expensive-feeling*",
      "- **Brand exemplars:** *like Aman* — *like Hermès* — *like Cheval Blanc*",
      "- **Vernacular labels:** *editorial layout* — *long-form layout* — *single-column scroll*",
      "- **Anti-vibes:** *not SaaS-y* — *no Inter everywhere* — *no purple-to-blue gradients*",
      "- **Compositional intent:** *I want it to feel expensive but not loud* — *unhurried*",
      "",
    ].join("\n");

    const bucket = extractAltnameBucket(blocksFor(md));

    expect(bucket.vibes).toEqual([
      "premium",
      "quiet luxury",
      "expensive-feeling",
    ]);
    expect(bucket.brand_exemplars).toEqual([
      "like Aman",
      "like Hermès",
      "like Cheval Blanc",
    ]);
    expect(bucket.vernacular).toEqual([
      "editorial layout",
      "long-form layout",
      "single-column scroll",
    ]);
    expect(bucket.anti_vibes).toEqual([
      "not SaaS-y",
      "no Inter everywhere",
      "no purple-to-blue gradients",
    ]);
    expect(bucket.compositional_intent).toEqual([
      "I want it to feel expensive but not loud",
      "unhurried",
    ]);
  });

  it("returns an empty bucket when no altname list is present", () => {
    const md = [
      "## TYPE-1. Two-Hand System",
      "",
      "**Definition.** Just prose, no altnames.",
      "",
    ].join("\n");
    const bucket = extractAltnameBucket(blocksFor(md));
    expect(bucket).toEqual(emptyAltnameBucket());
  });

  it("returns an empty bucket when the list contains only substyle items (period, not colon)", () => {
    // Substyle list items use bold-name-with-period. The altname extractor
    // should NOT pick them up as altnames.
    const md = [
      "## TYPE-1. Two-Hand System",
      "",
      "**Substyles.**",
      "- **Editorial Two-Hand.** Transitional serif paired with humanist sans.",
      "- **Classical Two-Hand.** Old-style serif paired with grotesque sans.",
      "",
    ].join("\n");
    const bucket = extractAltnameBucket(blocksFor(md));
    expect(bucket).toEqual(emptyAltnameBucket());
  });

  it("ignores list items with unrecognized labels", () => {
    const md = [
      "## LAYOUT-1. Test",
      "",
      "- **Vibes:** *premium*",
      "- **Bogus label:** *should be ignored*",
      "- **Brand exemplars:** *like Aman*",
      "",
    ].join("\n");
    const bucket = extractAltnameBucket(blocksFor(md));
    expect(bucket.vibes).toEqual(["premium"]);
    expect(bucket.brand_exemplars).toEqual(["like Aman"]);
    // Other buckets remain empty
    expect(bucket.vernacular).toEqual([]);
  });

  it("handles a grammar block with both substyles and altnames in the same content", () => {
    const md = [
      "## IMG-1. Editorial Photography",
      "",
      "**Definition.** Composed photography that does editorial work.",
      "",
      "**Substyles.**",
      "- **Travel and Place Editorial.** Photography of locations.",
      "- **Fashion Editorial.** Composed photography of people in clothing.",
      "",
      "**Failure mode.** AI conflates editorial with stock that looks editorial.",
      "",
      "- **Vibes:** *editorial* — *art-directed*",
      "- **Brand exemplars:** *like Aman* — *like Apartamento*",
      "- **Vernacular labels:** *editorial photography* — *full-bleed photography*",
      "- **Anti-vibes:** *no stock photos* — *not Unsplash-tier*",
      "- **Compositional intent:** *I want photography that does real work*",
      "",
    ].join("\n");

    const bucket = extractAltnameBucket(blocksFor(md));
    expect(bucket.vibes).toEqual(["editorial", "art-directed"]);
    expect(bucket.brand_exemplars).toContain("like Aman");
    expect(bucket.compositional_intent).toContain(
      "I want photography that does real work",
    );
  });
});

describe("isAltnameBucketComplete and emptyBuckets", () => {
  it("considers an empty bucket incomplete and reports all buckets empty", () => {
    const bucket = emptyAltnameBucket();
    expect(isAltnameBucketComplete(bucket)).toBe(false);
    expect(emptyBuckets(bucket)).toEqual([
      "vibes",
      "brand_exemplars",
      "vernacular",
      "anti_vibes",
      "compositional_intent",
    ]);
  });

  it("considers a fully-populated bucket complete", () => {
    const bucket = emptyAltnameBucket();
    bucket.vibes.push("premium");
    bucket.brand_exemplars.push("like Aman");
    bucket.vernacular.push("editorial layout");
    bucket.anti_vibes.push("not SaaS-y");
    bucket.compositional_intent.push("I want it quiet");
    expect(isAltnameBucketComplete(bucket)).toBe(true);
    expect(emptyBuckets(bucket)).toEqual([]);
  });

  it("reports only the empty buckets when partially populated", () => {
    const bucket = emptyAltnameBucket();
    bucket.vibes.push("premium");
    bucket.brand_exemplars.push("like Aman");
    expect(isAltnameBucketComplete(bucket)).toBe(false);
    expect(emptyBuckets(bucket)).toEqual([
      "vernacular",
      "anti_vibes",
      "compositional_intent",
    ]);
  });
});

// tests/corpus/loaders/layout.test.ts
//
// Tests for the v0.1 Layout loader against the real spec content. These
// are integration-style tests — they read spec/turns/ on disk — but they
// belong with the loader unit tests because the loader's contract is
// "produce 14 layout grammars with the supersession applied," which only
// makes sense against the real input.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadLayoutGrammars } from "../../../src/corpus/loaders/layout.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadLayoutGrammars", () => {
  const shells = loadLayoutGrammars(SPEC_ROOT);
  const ids = shells.map((s) => s.id);
  const byId = new Map(shells.map((s) => [s.id, s] as const));

  it("returns exactly 14 layout grammars", () => {
    expect(shells).toHaveLength(14);
  });

  it("includes the canonical post-supersession ids in order", () => {
    expect(ids).toEqual([
      "LAYOUT-1",
      "LAYOUT-2",
      "LAYOUT-3a",
      "LAYOUT-3b",
      "LAYOUT-3c",
      "LAYOUT-4a",
      "LAYOUT-4b",
      "LAYOUT-4c",
      "LAYOUT-5",
      "LAYOUT-6",
      "LAYOUT-7",
      "LAYOUT-8",
      "LAYOUT-9",
      "LAYOUT-10",
    ]);
  });

  it("has retired LAYOUT-3 (Bento Modular) and LAYOUT-4 (Hero-and-Stack)", () => {
    expect(ids).not.toContain("LAYOUT-3");
    expect(ids).not.toContain("LAYOUT-4");
  });

  it("does not include LAYOUT-11 as a top-level grammar (Side-Scroll demoted)", () => {
    expect(ids).not.toContain("LAYOUT-11");
  });

  it("includes Turn 3's split grammars with their published names", () => {
    expect(byId.get("LAYOUT-3a")?.name).toBe("Marketing-Bento");
    expect(byId.get("LAYOUT-3b")?.name).toBe("Dashboard-Bento");
    expect(byId.get("LAYOUT-3c")?.name).toBe("Editorial-Bento");
    expect(byId.get("LAYOUT-4a")?.name).toBe("Conversion-Stack");
    expect(byId.get("LAYOUT-4b")?.name).toBe("Brand-Stack");
    expect(byId.get("LAYOUT-4c")?.name).toBe("Long-Form Stack");
  });

  it("attaches Side-Scroll as a substyle of LAYOUT-9 (Catalog)", () => {
    const layout9 = byId.get("LAYOUT-9");
    expect(layout9).toBeDefined();
    const sideScroll = layout9!.substyles.find(
      (s) => s.name === "Side-Scroll / Horizontal",
    );
    expect(sideScroll).toBeDefined();
    expect(sideScroll!.parent_grammar_id).toBe("LAYOUT-9");
    // The substyle definition concatenates the original LAYOUT-11
    // definition + distinguishing edge; both should be non-trivial.
    expect(sideScroll!.definition.length).toBeGreaterThan(100);
  });

  it("populates required structural fields on every grammar", () => {
    for (const shell of shells) {
      expect(shell.axis, `${shell.id} axis`).toBe("layout");
      expect(shell.name.length, `${shell.id} name`).toBeGreaterThan(0);
      expect(shell.definition.length, `${shell.id} definition`).toBeGreaterThan(20);
      expect(
        shell.distinguishing_edge.length,
        `${shell.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(
        shell.internal_logic.length,
        `${shell.id} internal_logic`,
      ).toBeGreaterThan(0);
      expect(
        shell.registers_hosts.length,
        `${shell.id} registers_hosts`,
      ).toBeGreaterThan(0);
      expect(
        shell.registers_resists.length,
        `${shell.id} registers_resists`,
      ).toBeGreaterThan(0);
      expect(shell.failure_mode.length, `${shell.id} failure_mode`).toBeGreaterThan(20);
    }
  });

  it("Turn 3 split grammars carry their substyles (3 per split grammar)", () => {
    for (const id of [
      "LAYOUT-3a",
      "LAYOUT-3b",
      "LAYOUT-3c",
      "LAYOUT-4a",
      "LAYOUT-4b",
      "LAYOUT-4c",
    ]) {
      const grammar = byId.get(id);
      expect(grammar, `${id} present`).toBeDefined();
      expect(grammar!.substyles.length, `${id} substyles`).toBeGreaterThanOrEqual(3);
    }
  });

  it("v0.1 grammars carry no substyles (the v0.1 doc didn't define them)", () => {
    // Exception: LAYOUT-9 has Side-Scroll demoted in. Otherwise the
    // pre-Turn-4 grammars come through with substyles=[].
    for (const id of ["LAYOUT-1", "LAYOUT-2", "LAYOUT-5", "LAYOUT-6", "LAYOUT-7", "LAYOUT-8", "LAYOUT-10"]) {
      const grammar = byId.get(id);
      expect(grammar!.substyles, `${id} substyles`).toEqual([]);
    }
    expect(byId.get("LAYOUT-9")!.substyles).toHaveLength(1);
  });

  it("is deterministic across calls", () => {
    const second = loadLayoutGrammars(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(JSON.stringify(shells));
  });
});

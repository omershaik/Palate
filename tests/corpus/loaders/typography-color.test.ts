// tests/corpus/loaders/typography-color.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadTypographyAndColorGrammars } from "../../../src/corpus/loaders/typography-color.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadTypographyAndColorGrammars", () => {
  const { typography, color } = loadTypographyAndColorGrammars(SPEC_ROOT);
  const typeIds = typography.map((s) => s.id);
  const colorIds = color.map((s) => s.id);
  const colorById = new Map(color.map((s) => [s.id, s] as const));

  it("returns 6 typography grammars (TYPE-7 retired)", () => {
    expect(typography).toHaveLength(6);
    expect(typeIds).toEqual([
      "TYPE-1",
      "TYPE-2",
      "TYPE-3",
      "TYPE-4",
      "TYPE-5",
      "TYPE-6",
    ]);
    expect(typeIds).not.toContain("TYPE-7");
  });

  it("returns 9 color grammars with COLOR-8 split into 8a + 8b", () => {
    expect(color).toHaveLength(9);
    expect(colorIds).toEqual([
      "COLOR-1",
      "COLOR-2",
      "COLOR-3",
      "COLOR-4",
      "COLOR-5",
      "COLOR-6",
      "COLOR-7",
      "COLOR-8a",
      "COLOR-8b",
    ]);
    expect(colorIds).not.toContain("COLOR-8");
  });

  it("COLOR-8a is Marketing Single-Accent and COLOR-8b is Application Single-Accent", () => {
    expect(colorById.get("COLOR-8a")?.name).toBe("Marketing Single-Accent");
    expect(colorById.get("COLOR-8b")?.name).toBe("Application Single-Accent");
  });

  it("populates required fields on every typography grammar", () => {
    for (const shell of typography) {
      expect(shell.axis).toBe("typography");
      expect(shell.definition.length).toBeGreaterThan(20);
      expect(shell.distinguishing_edge.length).toBeGreaterThan(20);
      expect(shell.failure_mode.length).toBeGreaterThan(20);
      expect(shell.internal_logic.length).toBeGreaterThan(0);
      expect(shell.substyles.length).toBeGreaterThan(0);
    }
  });

  it("populates required fields on every color grammar", () => {
    for (const shell of color) {
      expect(shell.axis).toBe("color");
      expect(shell.definition.length).toBeGreaterThan(20);
      expect(shell.distinguishing_edge.length).toBeGreaterThan(20);
      expect(shell.failure_mode.length).toBeGreaterThan(20);
      expect(shell.internal_logic.length).toBeGreaterThan(0);
      expect(shell.substyles.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic across calls", () => {
    const second = loadTypographyAndColorGrammars(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(
      JSON.stringify({ typography, color }),
    );
  });
});

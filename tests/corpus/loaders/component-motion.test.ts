// tests/corpus/loaders/component-motion.test.ts

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadComponentAndMotionGrammars } from "../../../src/corpus/loaders/component-motion.js";

const SPEC_ROOT = resolve(__dirname, "..", "..", "..", "spec");

describe("loadComponentAndMotionGrammars", () => {
  const { component, motion } = loadComponentAndMotionGrammars(SPEC_ROOT);
  const compIds = component.map((s) => s.id);
  const motionIds = motion.map((s) => s.id);
  const compById = new Map(component.map((s) => [s.id, s] as const));
  const motionById = new Map(motion.map((s) => [s.id, s] as const));

  it("returns 9 component grammars with COMP-8 split into 8a + 8b", () => {
    expect(component).toHaveLength(9);
    expect(compIds).toEqual([
      "COMP-1",
      "COMP-2",
      "COMP-3",
      "COMP-4",
      "COMP-5",
      "COMP-6",
      "COMP-7",
      "COMP-8a",
      "COMP-8b",
    ]);
    expect(compIds).not.toContain("COMP-8");
  });

  it("returns 9 motion grammars with MOTION-8 + MOTION-9 added", () => {
    expect(motion).toHaveLength(9);
    expect(motionIds).toEqual([
      "MOTION-1",
      "MOTION-2",
      "MOTION-3",
      "MOTION-4",
      "MOTION-5",
      "MOTION-6",
      "MOTION-7",
      "MOTION-8",
      "MOTION-9",
    ]);
  });

  it("removes Apple-Refined substyle from COMP-2 (Soft-Container)", () => {
    const comp2 = compById.get("COMP-2");
    expect(comp2).toBeDefined();
    const names = comp2!.substyles.map((s) => s.name.toLowerCase());
    expect(names).not.toContain("apple-refined");
    // The other substyles survive.
    expect(names).toContain("material-coded");
    expect(names).toContain("tailwind-default");
  });

  it("adds Variable-Font Kinetic Typography substyle to MOTION-7", () => {
    const motion7 = motionById.get("MOTION-7");
    expect(motion7).toBeDefined();
    const found = motion7!.substyles.find(
      (s) => s.name === "Variable-Font Kinetic Typography",
    );
    expect(found).toBeDefined();
    expect(found!.parent_grammar_id).toBe("MOTION-7");
    expect(found!.definition.length).toBeGreaterThan(50);
  });

  it("MOTION-8 (Atmospheric-Depth) and MOTION-9 (Loading-and-Latency) are present", () => {
    expect(motionById.get("MOTION-8")?.name).toMatch(/Atmospheric-Depth/);
    expect(motionById.get("MOTION-9")?.name).toMatch(/Loading-and-Latency/);
  });

  it("populates required fields on every component grammar", () => {
    // No exception list. COMP-8a's inheritance from original COMP-8
    // (Mono-Density) is applied by applyComp8aInheritance in the
    // loader, so all required fields come through populated even
    // though Turn 3 abbreviated them.
    for (const shell of component) {
      expect(shell.axis).toBe("component");
      expect(shell.definition.length, `${shell.id} definition`).toBeGreaterThan(20);
      expect(
        shell.distinguishing_edge.length,
        `${shell.id} distinguishing_edge`,
      ).toBeGreaterThan(20);
      expect(shell.failure_mode.length, `${shell.id} failure_mode`).toBeGreaterThan(20);
      expect(shell.internal_logic.length, `${shell.id} internal_logic`).toBeGreaterThan(0);
      expect(shell.substyles.length, `${shell.id} substyles`).toBeGreaterThan(0);
    }
  });

  it("COMP-8a inherits failure_mode from original COMP-8 (Mono-Density)", () => {
    const comp8a = compById.get("COMP-8a");
    expect(comp8a).toBeDefined();
    // Original COMP-8 in Turn 2 had a failure mode about AI applying
    // dense application styling to the wrong context — that's what
    // COMP-8a inherits.
    expect(comp8a!.failure_mode.length).toBeGreaterThan(20);
    // The literal "As original Mono-Density." placeholder must NOT
    // survive into internal_logic.
    const internalLogicJoined = comp8a!.internal_logic.join(" | ").toLowerCase();
    expect(internalLogicJoined).not.toContain("as original mono-density");
    // Canonical examples preamble stripped.
    const examplesJoined = comp8a!.canonical_examples.join(" | ").toLowerCase();
    expect(examplesJoined).not.toContain("same as original mono-density:");
    // The actual inherited examples (Linear in-app, Stripe Dashboard, etc.)
    // are present.
    expect(examplesJoined).toMatch(/linear/);
  });

  it("populates required fields on every motion grammar", () => {
    for (const shell of motion) {
      expect(shell.axis).toBe("motion");
      expect(shell.definition.length).toBeGreaterThan(20);
      expect(shell.distinguishing_edge.length).toBeGreaterThan(20);
      expect(shell.failure_mode.length).toBeGreaterThan(20);
      expect(shell.internal_logic.length).toBeGreaterThan(0);
      expect(shell.substyles.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic across calls", () => {
    const second = loadComponentAndMotionGrammars(SPEC_ROOT);
    expect(JSON.stringify(second)).toBe(
      JSON.stringify({ component, motion }),
    );
  });
});

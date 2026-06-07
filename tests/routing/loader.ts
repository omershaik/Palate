// tests/routing/loader.ts
//
// Routing-fixture loader and shape validator. Phase 2 fixtures live in
// tests/routing/fixtures/{canonical,broken,novel-but-coherent,anti-vibe,
// failure-mode}/*.json. Each fixture conforms to RoutingFixture; the
// loader validates shape at load time and exposes the fixture set to
// the routing tests.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Axis } from "../../src/types/axis.js";
import type { ExtractedSignals } from "../../src/routing/types.js";
import type { WarningSeverity } from "../../src/types/routing.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = resolve(HERE, "fixtures");

export type FixtureCategory =
  | "canonical"
  | "broken"
  | "novel-but-coherent"
  | "anti-vibe"
  | "failure-mode";

export const FIXTURE_CATEGORIES: ReadonlyArray<FixtureCategory> = [
  "canonical",
  "broken",
  "novel-but-coherent",
  "anti-vibe",
  "failure-mode",
];

/**
 * One routing-test fixture. Schema:
 *
 *   id        — stable identifier; matches the filename (without .json).
 *   category  — which test category the fixture belongs to.
 *   brief     — the natural-language brief passed to route().
 *   expected  — what the routing engine should produce.
 *   stub_signals — for stub Stage 1 mode: pre-extracted signals so
 *                  the test runs without an LLM call.
 *
 * `expected` fields:
 *   canonical             — canonical name if this brief should match
 *                           one (e.g., "Luxury Hospitality"). null/
 *                           omitted for novel-but-coherent and
 *                           failure-mode briefs.
 *   axes                  — partial map of axis → grammar_id that the
 *                           routing engine must produce. Partial
 *                           because some fixtures don't pin every axis.
 *   min_confidence        — floor on the canonical_match_confidence
 *                           (or per-axis confidence — see usage below).
 *   must_avoid            — grammar IDs the engine MUST NOT return on
 *                           any axis. Used by anti-vibe fixtures: if
 *                           the engine routes to one of these, the
 *                           test fails. Negative-space assertion.
 *   must_include          — grammar IDs that MUST appear on their
 *                           respective axis. Stronger than `axes`
 *                           because it's not anchored to a specific
 *                           axis (for cross-axis constraints).
 *   expected_warnings     — warnings the engine should surface
 *                           (severity + code). Used by broken-combo
 *                           and failure-mode fixtures.
 *   is_novel              — true for novel-but-coherent fixtures.
 *                           Engine should set canonical_match=null
 *                           and canonical_match_confidence < 1.0.
 *   should_fail           — true for failure-mode fixtures. Engine
 *                           should return open_warnings of severity
 *                           "conflict" rather than guessing.
 */
export interface RoutingFixture {
  id: string;
  category: FixtureCategory;
  brief: string;
  expected: {
    canonical?: string | null;
    /**
     * Per-axis assertion. A string asserts an exact grammar_id match;
     * a string[] asserts the engine's pick is a member of the array
     * (membership semantics — used when a canonical accepts multiple
     * options on the axis, e.g., "Color: Three-Color Discipline OR
     * Earth-Pulled Restraint"). Single-string fixtures continue to
     * work unchanged.
     */
    axes?: Partial<Record<Axis, string | string[]>>;
    min_confidence?: number;
    must_avoid?: string[];
    must_include?: string[];
    expected_warnings?: Array<{
      severity: WarningSeverity;
      code: string;
    }>;
    is_novel?: boolean;
    should_fail?: boolean;
  };
  stub_signals?: ExtractedSignals;
}

export class FixtureValidationError extends Error {
  constructor(public readonly path: string, message: string) {
    super(`Fixture ${path}: ${message}`);
    this.name = "FixtureValidationError";
  }
}

/**
 * Load every fixture under tests/routing/fixtures/. Returns a flat
 * list across all categories. Each fixture's category is set from the
 * subdirectory it lives under; mismatches between the directory and
 * the fixture's `category` field raise a validation error.
 */
export function loadAllFixtures(): RoutingFixture[] {
  const out: RoutingFixture[] = [];
  for (const category of FIXTURE_CATEGORIES) {
    out.push(...loadFixturesByCategory(category));
  }
  return out;
}

export function loadFixturesByCategory(
  category: FixtureCategory,
): RoutingFixture[] {
  const dir = join(FIXTURES_ROOT, category);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    // Directory doesn't exist yet (Phase 2 Group A scaffolding only
    // creates the directories with .gitkeep). Empty is OK.
    return [];
  }
  const fixtures: RoutingFixture[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (!entry.endsWith(".json")) continue;
    if (!statSync(fullPath).isFile()) continue;
    fixtures.push(loadFixtureFile(fullPath, category));
  }
  return fixtures;
}

export function loadFixtureFile(
  path: string,
  expectedCategory: FixtureCategory,
): RoutingFixture {
  const raw = readFileSync(path, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new FixtureValidationError(
      path,
      `not valid JSON: ${(e as Error).message}`,
    );
  }
  return validateFixture(parsed, path, expectedCategory);
}

/**
 * Hand-coded shape validator. Throws FixtureValidationError on any
 * shape mismatch. Avoids a runtime schema dep (zod, etc.) in favor
 * of explicit checks the contributor can read.
 */
export function validateFixture(
  data: unknown,
  path: string,
  expectedCategory: FixtureCategory,
): RoutingFixture {
  const fixtureName = basename(path, ".json");
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new FixtureValidationError(path, "must be a JSON object");
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj["id"] !== "string" || (obj["id"] as string).length === 0) {
    throw new FixtureValidationError(path, "missing or invalid `id`");
  }
  if (obj["id"] !== fixtureName) {
    throw new FixtureValidationError(
      path,
      `id "${obj["id"] as string}" must match the filename "${fixtureName}"`,
    );
  }
  if (obj["category"] !== expectedCategory) {
    throw new FixtureValidationError(
      path,
      `category "${String(obj["category"])}" must be "${expectedCategory}" ` +
        `(matching the directory it lives in)`,
    );
  }
  if (
    typeof obj["brief"] !== "string" ||
    (obj["brief"] as string).trim().length === 0
  ) {
    throw new FixtureValidationError(path, "missing or empty `brief`");
  }
  if (
    typeof obj["expected"] !== "object" ||
    obj["expected"] === null ||
    Array.isArray(obj["expected"])
  ) {
    throw new FixtureValidationError(path, "missing or invalid `expected`");
  }

  validateExpected(
    obj["expected"] as Record<string, unknown>,
    path,
    expectedCategory,
  );

  if (obj["stub_signals"] !== undefined) {
    validateStubSignals(obj["stub_signals"], path);
  }

  return obj as unknown as RoutingFixture;
}

function validateExpected(
  expected: Record<string, unknown>,
  path: string,
  category: FixtureCategory,
): void {
  if (
    expected["canonical"] !== undefined &&
    expected["canonical"] !== null &&
    typeof expected["canonical"] !== "string"
  ) {
    throw new FixtureValidationError(
      path,
      "`expected.canonical` must be a string or null",
    );
  }
  if (expected["axes"] !== undefined) {
    if (
      typeof expected["axes"] !== "object" ||
      expected["axes"] === null ||
      Array.isArray(expected["axes"])
    ) {
      throw new FixtureValidationError(
        path,
        "`expected.axes` must be an object",
      );
    }
    for (const [axisKey, value] of Object.entries(
      expected["axes"] as Record<string, unknown>,
    )) {
      if (!isValidAxisKey(axisKey)) {
        throw new FixtureValidationError(
          path,
          `\`expected.axes.${axisKey}\` is not a known axis`,
        );
      }
      // F3-1: accept either a single grammar id string OR an array of
      // grammar id strings (membership assertion for canonicals with
      // multiple options on this axis). Backward-compatible — existing
      // single-string fixtures still validate.
      if (typeof value === "string") {
        // valid
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          throw new FixtureValidationError(
            path,
            `\`expected.axes.${axisKey}\` array must be non-empty`,
          );
        }
        for (const item of value) {
          if (typeof item !== "string") {
            throw new FixtureValidationError(
              path,
              `\`expected.axes.${axisKey}\` array must contain only grammar id strings`,
            );
          }
        }
      } else {
        throw new FixtureValidationError(
          path,
          `\`expected.axes.${axisKey}\` must be a grammar id string or non-empty array of grammar ids`,
        );
      }
    }
  }
  if (expected["min_confidence"] !== undefined) {
    const c = expected["min_confidence"];
    if (typeof c !== "number" || c < 0 || c > 1) {
      throw new FixtureValidationError(
        path,
        "`expected.min_confidence` must be a number in [0, 1]",
      );
    }
  }
  for (const arrayField of ["must_avoid", "must_include"] as const) {
    if (expected[arrayField] !== undefined) {
      if (!Array.isArray(expected[arrayField])) {
        throw new FixtureValidationError(
          path,
          `\`expected.${arrayField}\` must be an array of grammar ids`,
        );
      }
      for (const item of expected[arrayField] as unknown[]) {
        if (typeof item !== "string") {
          throw new FixtureValidationError(
            path,
            `\`expected.${arrayField}\` must contain only strings`,
          );
        }
      }
    }
  }
  if (expected["expected_warnings"] !== undefined) {
    if (!Array.isArray(expected["expected_warnings"])) {
      throw new FixtureValidationError(
        path,
        "`expected.expected_warnings` must be an array",
      );
    }
    for (const w of expected["expected_warnings"] as Array<unknown>) {
      if (typeof w !== "object" || w === null) {
        throw new FixtureValidationError(
          path,
          "`expected.expected_warnings[]` items must be objects",
        );
      }
      const warning = w as Record<string, unknown>;
      if (
        warning["severity"] !== "info" &&
        warning["severity"] !== "warning" &&
        warning["severity"] !== "conflict"
      ) {
        throw new FixtureValidationError(
          path,
          `\`expected.expected_warnings[].severity\` must be info|warning|conflict`,
        );
      }
      if (typeof warning["code"] !== "string") {
        throw new FixtureValidationError(
          path,
          `\`expected.expected_warnings[].code\` must be a string`,
        );
      }
    }
  }
  for (const boolField of ["is_novel", "should_fail"] as const) {
    if (expected[boolField] !== undefined && typeof expected[boolField] !== "boolean") {
      throw new FixtureValidationError(
        path,
        `\`expected.${boolField}\` must be a boolean`,
      );
    }
  }

  // Cross-field consistency:
  if (category === "canonical" && expected["canonical"] === undefined) {
    throw new FixtureValidationError(
      path,
      "canonical-category fixtures must specify `expected.canonical`",
    );
  }
  if (category === "novel-but-coherent" && expected["is_novel"] !== true) {
    throw new FixtureValidationError(
      path,
      "novel-but-coherent fixtures must have `expected.is_novel: true`",
    );
  }
  if (category === "failure-mode" && expected["should_fail"] !== true) {
    throw new FixtureValidationError(
      path,
      "failure-mode fixtures must have `expected.should_fail: true`",
    );
  }
}

function validateStubSignals(data: unknown, path: string): void {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new FixtureValidationError(path, "`stub_signals` must be an object");
  }
  const required: ReadonlyArray<keyof ExtractedSignals> = [
    "brand_exemplars",
    "vibes",
    "vernacular",
    "anti_vibes",
    "compositional_intent",
    "domain",
    "functional_context",
    "audience_signals",
  ];
  const obj = data as Record<string, unknown>;
  for (const key of required) {
    if (!(key in obj)) {
      throw new FixtureValidationError(
        path,
        `\`stub_signals.${key}\` is required (use [] for empty)`,
      );
    }
    if (!Array.isArray(obj[key])) {
      throw new FixtureValidationError(
        path,
        `\`stub_signals.${key}\` must be an array of strings`,
      );
    }
    for (const item of obj[key] as unknown[]) {
      if (typeof item !== "string") {
        throw new FixtureValidationError(
          path,
          `\`stub_signals.${key}\` must contain only strings`,
        );
      }
    }
  }
}

const VALID_AXIS_KEYS: ReadonlySet<string> = new Set([
  "layout",
  "typography",
  "color",
  "component",
  "motion",
  "imagery",
  "density",
  "voice",
  "reading_pattern",
]);

function isValidAxisKey(key: string): key is Axis {
  return VALID_AXIS_KEYS.has(key);
}

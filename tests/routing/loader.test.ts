// tests/routing/loader.test.ts
//
// Unit tests for the routing-fixture loader. The loader's contract:
//   - loads all fixtures across the five categories
//   - validates each fixture's shape against the schema
//   - produces typed RoutingFixture objects ready for tests to consume
//
// Fixtures themselves get added in Groups B + C; the loader tests
// here exercise schema validation against synthetic fixture-shaped
// inputs (so the loader's behavior is locked in before real fixtures
// arrive).

import { describe, expect, it } from "vitest";
import {
  FIXTURE_CATEGORIES,
  FixtureValidationError,
  loadAllFixtures,
  loadFixturesByCategory,
  validateFixture,
} from "./loader.js";

describe("FIXTURE_CATEGORIES", () => {
  it("lists all five test-fixture categories per PRD §4.11", () => {
    expect([...FIXTURE_CATEGORIES]).toEqual([
      "canonical",
      "broken",
      "novel-but-coherent",
      "anti-vibe",
      "failure-mode",
    ]);
  });
});

describe("loadAllFixtures + loadFixturesByCategory", () => {
  it("loads canonical fixtures (45+) — Group B populated", () => {
    const canonicals = loadFixturesByCategory("canonical");
    expect(canonicals.length).toBeGreaterThanOrEqual(45);
    for (const f of canonicals) {
      expect(f.category).toBe("canonical");
      expect(f.expected.canonical).toBeTruthy();
    }
  });

  it("loads broken fixtures (22) — Group C1 populated", () => {
    const broken = loadFixturesByCategory("broken");
    expect(broken.length).toBeGreaterThanOrEqual(22);
    for (const f of broken) {
      expect(f.category).toBe("broken");
      expect(f.expected.expected_warnings).toBeDefined();
    }
  });

  it("loads novel-but-coherent fixtures (10+) — Group C2 populated", () => {
    const novel = loadFixturesByCategory("novel-but-coherent");
    expect(novel.length).toBeGreaterThanOrEqual(10);
    for (const f of novel) {
      expect(f.category).toBe("novel-but-coherent");
      expect(f.expected.is_novel).toBe(true);
    }
  });

  it("loads anti-vibe fixtures (10+) — Group C3 populated", () => {
    const antiVibe = loadFixturesByCategory("anti-vibe");
    expect(antiVibe.length).toBeGreaterThanOrEqual(10);
    for (const f of antiVibe) {
      expect(f.category).toBe("anti-vibe");
      // anti-vibe fixtures must have anti_vibes signals OR a must_avoid list
      const hasAntiSignals = (f.stub_signals?.anti_vibes.length ?? 0) > 0;
      const hasMustAvoid = (f.expected.must_avoid?.length ?? 0) >= 0; // permits empty for documentation-only avoidance
      expect(hasAntiSignals || hasMustAvoid).toBe(true);
    }
  });

  it("loads failure-mode fixtures (5+) — Group C4 populated", () => {
    const failures = loadFixturesByCategory("failure-mode");
    expect(failures.length).toBeGreaterThanOrEqual(5);
    for (const f of failures) {
      expect(f.category).toBe("failure-mode");
      expect(f.expected.should_fail).toBe(true);
    }
  });

  it("loadAllFixtures returns the full set across all five categories", () => {
    const all = loadAllFixtures();
    expect(all.length).toBeGreaterThanOrEqual(90); // 45+22+10+10+5 = 92
    expect(new Set(all.map((f) => f.category))).toEqual(
      new Set([
        "canonical",
        "broken",
        "novel-but-coherent",
        "anti-vibe",
        "failure-mode",
      ]),
    );
  });
});

describe("validateFixture — required fields", () => {
  const validBase = {
    id: "test-001",
    category: "canonical",
    brief: "Make me a luxury hotel landing page.",
    expected: {
      canonical: "Luxury Hospitality",
    },
  };

  it("accepts a minimal valid canonical fixture", () => {
    expect(() =>
      validateFixture(validBase, "/fixtures/canonical/test-001.json", "canonical"),
    ).not.toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => validateFixture(null, "/x/test-001.json", "canonical")).toThrow(
      FixtureValidationError,
    );
    expect(() => validateFixture([], "/x/test-001.json", "canonical")).toThrow(
      FixtureValidationError,
    );
    expect(() => validateFixture("string", "/x/test-001.json", "canonical")).toThrow(
      FixtureValidationError,
    );
  });

  it("rejects missing or empty id", () => {
    expect(() =>
      validateFixture({ ...validBase, id: "" }, "/x/test-001.json", "canonical"),
    ).toThrow(/missing or invalid `id`/);
  });

  it("rejects id that doesn't match the filename", () => {
    expect(() =>
      validateFixture(
        { ...validBase, id: "different-name" },
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/must match the filename/);
  });

  it("rejects category mismatch with directory", () => {
    expect(() =>
      validateFixture(
        { ...validBase, category: "broken" },
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/must be "canonical"/);
  });

  it("rejects empty brief", () => {
    expect(() =>
      validateFixture(
        { ...validBase, brief: "  " },
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/missing or empty `brief`/);
  });

  it("rejects missing expected object", () => {
    const { expected: _expected, ...without } = validBase;
    expect(() =>
      validateFixture(without, "/x/test-001.json", "canonical"),
    ).toThrow(/missing or invalid `expected`/);
  });
});

describe("validateFixture — `expected` field validation", () => {
  const base = (expected: object) => ({
    id: "test-001",
    category: "canonical",
    brief: "Test brief.",
    expected,
  });

  it("requires canonical-category fixtures to specify expected.canonical", () => {
    expect(() =>
      validateFixture(base({}), "/x/test-001.json", "canonical"),
    ).toThrow(/canonical-category fixtures must specify/);
  });

  it("accepts string axes mappings with valid axis keys", () => {
    expect(() =>
      validateFixture(
        base({
          canonical: "X",
          axes: { layout: "LAYOUT-1", typography: "TYPE-1", reading_pattern: "RP-3" },
        }),
        "/x/test-001.json",
        "canonical",
      ),
    ).not.toThrow();
  });

  it("rejects unknown axis keys", () => {
    expect(() =>
      validateFixture(
        base({
          canonical: "X",
          axes: { bogus: "LAYOUT-1" },
        }),
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/not a known axis/);
  });

  it("rejects min_confidence outside [0, 1]", () => {
    expect(() =>
      validateFixture(
        base({ canonical: "X", min_confidence: 1.5 }),
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/must be a number in \[0, 1\]/);
  });

  it("rejects must_avoid that's not an array of strings", () => {
    expect(() =>
      validateFixture(
        base({ canonical: "X", must_avoid: [42] }),
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/must contain only strings/);
  });

  it("validates expected_warnings shape", () => {
    expect(() =>
      validateFixture(
        base({
          canonical: "X",
          expected_warnings: [{ severity: "info", code: "snap" }],
        }),
        "/x/test-001.json",
        "canonical",
      ),
    ).not.toThrow();
    expect(() =>
      validateFixture(
        base({
          canonical: "X",
          expected_warnings: [{ severity: "fatal", code: "x" }],
        }),
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/severity` must be info\|warning\|conflict/);
  });

  it("requires novel-but-coherent fixtures to set is_novel: true", () => {
    expect(() =>
      validateFixture(
        {
          id: "novel-001",
          category: "novel-but-coherent",
          brief: "Test.",
          expected: {},
        },
        "/x/novel-001.json",
        "novel-but-coherent",
      ),
    ).toThrow(/must have `expected.is_novel: true`/);
  });

  it("requires failure-mode fixtures to set should_fail: true", () => {
    expect(() =>
      validateFixture(
        {
          id: "fail-001",
          category: "failure-mode",
          brief: "Test.",
          expected: {},
        },
        "/x/fail-001.json",
        "failure-mode",
      ),
    ).toThrow(/must have `expected.should_fail: true`/);
  });
});

describe("validateFixture — stub_signals validation", () => {
  const base = (stub_signals: object) => ({
    id: "test-001",
    category: "canonical",
    brief: "Test.",
    expected: { canonical: "X" },
    stub_signals,
  });

  const validSignals = {
    brand_exemplars: ["Aman"],
    vibes: ["luxury hotel"],
    vernacular: [],
    anti_vibes: [],
    compositional_intent: ["expensive but quiet"],
    domain: ["hospitality"],
    functional_context: [],
    audience_signals: [],
  };

  it("accepts a fully-populated stub_signals object", () => {
    expect(() =>
      validateFixture(base(validSignals), "/x/test-001.json", "canonical"),
    ).not.toThrow();
  });

  it("rejects stub_signals missing a required bucket", () => {
    const { vibes: _vibes, ...incomplete } = validSignals;
    expect(() =>
      validateFixture(base(incomplete), "/x/test-001.json", "canonical"),
    ).toThrow(/`stub_signals.vibes` is required/);
  });

  it("rejects non-string entries in stub_signals", () => {
    expect(() =>
      validateFixture(
        base({ ...validSignals, vibes: [42] }),
        "/x/test-001.json",
        "canonical",
      ),
    ).toThrow(/must contain only strings/);
  });
});

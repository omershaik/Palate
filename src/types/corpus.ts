// src/types/corpus.ts
//
// The top-level shape returned by the corpus loader (Phase 1 Group E1).
// The runtime in-memory representation of the entire spec corpus, ready
// for the routing engine and card builder to consume.
//
// Per the kickoff Step 2 / Option A decision: spec/turns/ holds the
// canonical turn-organized files; the loader produces the axis-keyed
// view below in memory. No on-disk per-axis files in v0.1.

import type { Axis } from "./axis.js";
import type { Grammar } from "./grammar.js";
import type {
  VoiceDimensionDef,
  VoiceProfile,
} from "./voice.js";
import type {
  AccessibilityCommitments,
  BrokenCombination,
  CanonicalCombination,
  ReducedMotionFallback,
} from "./compatibility.js";
import type { BrandFingerprintsFile } from "./brand-fingerprint.js";

/**
 * The voice axis block. Voice is hybrid (Turn 6) — both the six
 * continuous dimensions and the nine named profiles ship together.
 */
export interface CorpusVoiceBlock {
  dimensions: VoiceDimensionDef[];
  profiles: VoiceProfile[];
}

/**
 * The complete in-memory corpus. The top-level handle the routing
 * engine receives.
 *
 * `axes` is keyed by Axis name; each entry holds the grammars for that
 * axis. Voice is excluded from `axes` because it has its own block
 * shape — accessing voice grammars goes through `voice.profiles`, not
 * through `axes.voice` (which doesn't exist).
 *
 * `reduced_motion_fallbacks` is keyed by motion grammar id; every
 * motion grammar must have an entry (loader validates this).
 */
export interface Corpus {
  /** Spec version this corpus represents (semver). */
  version: string;
  /** Per-axis grammars, keyed by axis name. Voice is excluded
   *  (it lives in `voice` below as a hybrid block). */
  axes: Omit<Record<Axis, Grammar[]>, "voice">;
  voice: CorpusVoiceBlock;
  canonical_combinations: CanonicalCombination[];
  broken_combinations: BrokenCombination[];
  reduced_motion_fallbacks: Record<string, ReducedMotionFallback>;
  accessibility_commitments: AccessibilityCommitments;
  brand_fingerprints: BrandFingerprintsFile;
}

/**
 * Options for the loader's public entrypoint. `specRoot` defaults to
 * `spec/` resolved against the project root; explicit paths support
 * tests that load fixtures.
 */
export interface LoadOptions {
  /** Absolute or project-relative path to the spec root containing
   *  `turns/` and `derived/`. */
  specRoot: string;
  /**
   * Whether to validate cross-references (every GrammarRef in canonical
   * and broken combinations resolves to a loaded grammar). Default true;
   * tests may disable for unit-isolation purposes.
   */
  validateCrossReferences?: boolean;
}

/**
 * Per-grammar load failure surfaced by the Group D7 altname merger
 * (and other validators). Aggregated into a LoadError rather than
 * thrown one-by-one so a contributor fixing the spec sees the full
 * picture in one error message.
 */
export interface LoadFailure {
  /** Stable failure code (e.g., "missing_altname_bucket",
   *  "unresolved_grammar_ref", "duplicate_grammar_id"). */
  code: string;
  /** Where the failure originated — file path + grammar id when known. */
  source: {
    file?: string;
    grammar_id?: string;
    bucket?: string;
  };
  /** Human-readable explanation. */
  message: string;
}

/**
 * The typed error the loader throws when validation fails. Aggregates
 * multiple failures so contributors see all problems at once
 * (kickoff D7 adjustment).
 */
export class LoadError extends Error {
  public readonly failures: ReadonlyArray<LoadFailure>;

  constructor(failures: ReadonlyArray<LoadFailure>) {
    const summary =
      failures.length === 1
        ? `Corpus load failed: ${failures[0]?.message ?? "unknown error"}`
        : `Corpus load failed with ${failures.length} errors:\n` +
          failures.map((f, i) => `  ${i + 1}. [${f.code}] ${f.message}`).join("\n");
    super(summary);
    this.name = "LoadError";
    this.failures = failures;
  }
}

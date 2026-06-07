// src/routing/stage2-bucket.ts
//
// Stage 2 — Bucket Match per Turn 8 §5.1.2. For each axis, score
// every grammar against the extracted signals using altname matching
// across the five buckets (brand_exemplars, vernacular, anti_vibes,
// vibes, compositional_intent). Returns ranked AxisCandidate[] per
// axis.
//
// Stage 2's contract:
//   - Pure function: same input → same output, no side effects.
//   - No LLM calls. Stage 1 already produced the signals; Stage 2
//     just matches them against altnames.
//   - Anti-vibes ELIMINATE the matched grammar (don't just reduce
//     its score). A grammar whose anti_vibes bucket matches any
//     anti-vibe signal is excluded from candidates entirely. This
//     mirrors the must_avoid semantics in the anti-vibe fixture
//     category: vibe coders saying "no Inter everywhere" expect
//     the engine to NOT route to TYPE-5 (Geometric-Modernist),
//     not to route to it at slightly lower confidence.
//   - Cap aggregated score at [0, 1].

import type { Axis } from "../types/axis.js";
import { ALL_AXES } from "../types/axis.js";
import type { Grammar } from "../types/grammar.js";
import type { Corpus } from "../types/corpus.js";
import type { VoiceProfile } from "../types/voice.js";
import type {
  AxisCandidate,
  BucketMatchOutput,
  EliminatedGrammars,
  ExtractedSignals,
  SignalMatch,
} from "./types.js";
import {
  ANTI_VIBE_WEIGHT_MULTIPLIER,
  BUCKET_WEIGHTS,
  matchesAltname,
} from "./matching.js";

/**
 * Stage 2 entrypoint. Returns ranked candidate grammars per axis.
 * Candidates with confidence === 0 are omitted; candidates eliminated
 * by anti-vibe matches are also omitted.
 */
export function bucketMatch(
  signals: ExtractedSignals,
  corpus: Corpus,
): BucketMatchOutput {
  return {
    layout: matchAxis("layout", corpus.axes.layout, signals),
    typography: matchAxis("typography", corpus.axes.typography, signals),
    color: matchAxis("color", corpus.axes.color, signals),
    component: matchAxis("component", corpus.axes.component, signals),
    motion: matchAxis("motion", corpus.axes.motion, signals),
    imagery: matchAxis("imagery", corpus.axes.imagery, signals),
    density: matchAxis("density", corpus.axes.density, signals),
    voice: matchVoice(corpus.voice.profiles, signals),
    reading_pattern: matchAxis(
      "reading_pattern",
      corpus.axes.reading_pattern,
      signals,
    ),
  };
}

/**
 * Score every grammar on a non-voice axis. Returns candidates sorted
 * by confidence descending. Grammars that score 0 (no positive
 * matches) or are eliminated by anti-vibe matches are omitted.
 */
function matchAxis(
  axis: Axis,
  grammars: Grammar[],
  signals: ExtractedSignals,
): AxisCandidate[] {
  const candidates: AxisCandidate[] = [];
  for (const grammar of grammars) {
    const result = scoreGrammar(grammar, signals, axis);
    if (result === null) continue;
    candidates.push(result);
  }
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates;
}

function matchVoice(
  profiles: VoiceProfile[],
  signals: ExtractedSignals,
): AxisCandidate[] {
  const candidates: AxisCandidate[] = [];
  for (const profile of profiles) {
    const result = scoreGrammar(profile, signals, "voice");
    if (result === null) continue;
    candidates.push(result);
  }
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates;
}

/**
 * Score a single grammar against the signals. Returns null when:
 *   - The grammar's anti_vibes bucket matches any anti-vibe signal
 *     (eliminated).
 *   - No positive signals match (confidence would be 0).
 *
 * Otherwise returns an AxisCandidate with cumulative confidence on
 * [0, 1] and SignalMatch evidence for every contributing match.
 */
function scoreGrammar(
  grammar: Pick<Grammar, "id" | "altnames"> | Pick<VoiceProfile, "id" | "altnames">,
  signals: ExtractedSignals,
  axis: Axis,
): AxisCandidate | null {
  const evidence: SignalMatch[] = [];

  // Anti-vibe elimination check first. If any anti-vibe signal
  // matches this grammar's anti_vibes bucket, the grammar is
  // eliminated regardless of other matches.
  if (isEliminatedByAntiVibes(grammar.altnames.anti_vibes, signals.anti_vibes)) {
    // Record the match for transparency, but return null to
    // signal elimination.
    return null;
  }

  // Brand exemplars (highest weight).
  collectMatches(
    signals.brand_exemplars,
    grammar.altnames.brand_exemplars,
    "brand_exemplars",
    BUCKET_WEIGHTS.brand_exemplars,
    false,
    evidence,
  );
  // Vernacular.
  collectMatches(
    signals.vernacular,
    grammar.altnames.vernacular,
    "vernacular",
    BUCKET_WEIGHTS.vernacular,
    false,
    evidence,
  );
  // Vibes.
  collectMatches(
    signals.vibes,
    grammar.altnames.vibes,
    "vibes",
    BUCKET_WEIGHTS.vibes,
    false,
    evidence,
  );
  // Compositional intent.
  collectMatches(
    signals.compositional_intent,
    grammar.altnames.compositional_intent,
    "compositional_intent",
    BUCKET_WEIGHTS.compositional_intent,
    false,
    evidence,
  );

  if (evidence.length === 0) return null;

  const confidence = aggregateConfidence(evidence);
  if (confidence === 0) return null;

  return {
    axis,
    grammar_id: grammar.id,
    confidence,
    evidence,
  };
}

/**
 * Walk the cartesian product of a signal list × an altname list and
 * record every match as a SignalMatch. The bucket-specific weight is
 * applied to every match; aggregation happens later.
 */
function collectMatches(
  signalList: string[],
  altnameList: string[],
  bucket: SignalMatch["bucket"],
  weight: number,
  inverted: boolean,
  out: SignalMatch[],
): void {
  for (const signal of signalList) {
    for (const altname of altnameList) {
      if (matchesAltname(signal, altname)) {
        const effectiveWeight = inverted
          ? weight * ANTI_VIBE_WEIGHT_MULTIPLIER
          : weight;
        out.push({
          signal_text: signal,
          bucket,
          matched_text: altname,
          weight: effectiveWeight,
          inverted,
        });
      }
    }
  }
}

/**
 * Sum positive evidence weights, cap at 1.0. Anti-vibe evidence (the
 * `inverted` flag) doesn't appear here because eliminated grammars
 * are already excluded; this aggregator only sees positive signals.
 *
 * Sum-and-cap is the simplest aggregation; F3 may revisit with a
 * diminishing-returns curve if signal density needs to be weighted
 * differently from individual signal strength.
 */
function aggregateConfidence(evidence: SignalMatch[]): number {
  let score = 0;
  for (const e of evidence) {
    if (!e.inverted) score += e.weight;
  }
  return Math.min(1, score);
}

/**
 * Returns true if the given grammar's anti-vibe bucket matches any of
 * the user's anti-vibe signals — i.e., the grammar is eliminated per
 * Turn 8 §5.2's anti-vibe semantics. Shared between scoreGrammar
 * (which uses the result to omit candidates) and
 * computeEliminatedGrammars (which uses the result to surface the
 * elimination set to downstream stages).
 */
function isEliminatedByAntiVibes(
  grammarAntiVibes: ReadonlyArray<string>,
  signalAntiVibes: ReadonlyArray<string>,
): boolean {
  for (const signal of signalAntiVibes) {
    for (const altname of grammarAntiVibes) {
      if (matchesAltname(signal, altname)) return true;
    }
  }
  return false;
}

/**
 * Compute the per-axis set of grammar IDs eliminated by anti-vibe
 * matching. Stage 2 already eliminates these from its candidate
 * output; this function exposes the elimination set so Stage 5 can
 * honor anti-vibe semantics through canonical fill and snap-to-
 * canonical resolution.
 *
 * The set semantics matter: an empty Set on an axis means "no
 * eliminations on this axis"; an absent axis would also mean that.
 * For consistency, every axis is keyed (with an empty set when no
 * eliminations apply), so callers can do `.get(axis)` without
 * undefined-handling.
 *
 * Phase 2.1a fix per the deferred-doc Stage 5 elimination-respect
 * audit: until this landed, `fillAIDefaultsFromCanonical` and
 * `trySnapToCanonical` would re-introduce eliminated grammars when
 * the brief's positive signals routed to a canonical containing
 * them — silently overriding the user's "no X" anti-vibe.
 */
export function computeEliminatedGrammars(
  signals: ExtractedSignals,
  corpus: Corpus,
): EliminatedGrammars {
  const out: EliminatedGrammars = new Map();

  // Visual axes (loaded as Grammar arrays under corpus.axes).
  const visualAxes: Array<{ axis: Axis; grammars: Grammar[] }> = [
    { axis: "layout", grammars: corpus.axes.layout },
    { axis: "typography", grammars: corpus.axes.typography },
    { axis: "color", grammars: corpus.axes.color },
    { axis: "component", grammars: corpus.axes.component },
    { axis: "motion", grammars: corpus.axes.motion },
    { axis: "imagery", grammars: corpus.axes.imagery },
    { axis: "density", grammars: corpus.axes.density },
    { axis: "reading_pattern", grammars: corpus.axes.reading_pattern },
  ];

  for (const { axis, grammars } of visualAxes) {
    const eliminated = new Set<string>();
    for (const grammar of grammars) {
      if (isEliminatedByAntiVibes(grammar.altnames.anti_vibes, signals.anti_vibes)) {
        eliminated.add(grammar.id);
      }
    }
    out.set(axis, eliminated);
  }

  // Voice (loaded under corpus.voice.profiles, not corpus.axes).
  const voiceEliminated = new Set<string>();
  for (const profile of corpus.voice.profiles) {
    if (isEliminatedByAntiVibes(profile.altnames.anti_vibes, signals.anti_vibes)) {
      voiceEliminated.add(profile.id);
    }
  }
  out.set("voice", voiceEliminated);

  // Sanity check: every axis should be keyed.
  for (const axis of ALL_AXES) {
    if (!out.has(axis)) out.set(axis, new Set());
  }

  return out;
}

// src/routing/stage1/deterministic.ts
//
// Deterministic Stage 1 signal extraction. Walks the corpus's
// altname phrases + a small per-axis dictionary for the
// domain/functional_context/audience_signals categories (the spec
// doesn't carry those as altnames), and returns ExtractedSignals.
//
// The MCP server's Stage 1 does NOT call an LLM. The PRD §4.6
// overcommitted to an Anthropic API dependency; Turn 8 §5.1.1
// already noted Stage 1 may be done by the consuming AI tool. The
// consuming tool can optionally run its own LLM with the
// palate.brief-template prompt resource (Phase 3) for higher-recall
// extraction; the MCP server's deterministic Stage 1 is the default
// path for v0.1 — zero operational complexity, no API keys, no
// cache file, no network.
//
// Tradeoff: this extractor has lower recall than an LLM-grade one
// would on creative paraphrasing. A brief saying "Aman-style luxury
// resort" matches the bare brand "Aman" but a brief saying "the
// kind of hotel where you can hear yourself think" doesn't surface
// "luxury" as a vibe via altname matching alone. The fixtures'
// stub_signals reflect LLM-grade extraction; tests use the stub
// directly so test outcomes don't depend on this extractor's
// recall. This extractor is for production use on novel briefs.

import type { Axis } from "../../types/axis.js";
import { ALL_AXES } from "../../types/axis.js";
import type { Corpus } from "../../types/corpus.js";
import type { AltnameBucket, Grammar } from "../../types/grammar.js";
import type { VoiceProfile } from "../../types/voice.js";
import {
  emptyExtractedSignals,
  type ExtractedSignals,
  type SignalExtractor,
} from "../types.js";
import { normalizeForMatching } from "../matching.js";

// ---------------------------------------------------------------------------
// Domain / functional_context / audience_signals dictionaries
// ---------------------------------------------------------------------------
//
// The spec doesn't carry altnames for these three categories — they
// emerge from the brief's vocabulary, not from grammar altname
// blocks. The dictionaries below are seeded from canonical
// combination domains and common functional/audience tokens. F3 may
// expand them as production briefs surface gaps.

const DOMAIN_DICTIONARY: ReadonlyArray<string> = [
  "hospitality",
  "resort",
  "hotel",
  "fintech",
  "saas",
  "b2b",
  "consumer",
  "ai",
  "ai startup",
  "developer tools",
  "developer tool",
  "infrastructure",
  "infra",
  "wellness",
  "beauty",
  "skincare",
  "publishing",
  "editorial",
  "magazine",
  "journalism",
  "advocacy",
  "non-profit",
  "cause",
  "consumer hardware",
  "audio",
  "e-commerce",
  "ecommerce",
  "jewellery",
  "fashion",
  "indie",
  "creator tool",
  "indie saas",
  "members club",
  "design studio",
  "creative agency",
  "personal site",
  "writer",
  "essayist",
  "blog",
  "tech",
  "tech startup",
  "startup",
  "enterprise",
];

const FUNCTIONAL_DICTIONARY: ReadonlyArray<string> = [
  "landing page",
  "marketing page",
  "marketing site",
  "marketing",
  "product detail page",
  "product page",
  "dashboard",
  "application ui",
  "internal tools",
  "blog",
  "documentation",
  "essay",
  "article",
  "publication",
  "personal essay site",
  "portfolio",
  "catalog",
  "browsing",
  "onboarding flow",
  "booking flow",
  "launch",
  "launch page",
  "product launch",
  "brand site",
  "knowledge base",
  "mobile",
  "daily use",
  "site",
  "web home",
];

const AUDIENCE_DICTIONARY: ReadonlyArray<string> = [
  "power users",
  "first-time visitors",
  "first-time users",
  "engineers",
  "developers",
  "consumers",
  "sophisticated audience",
  "engaged reader",
  "skimming search-arrival visitors",
  "daily users",
  "women in their 20s and 30s",
  "women in their 30s",
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract signals from a brief deterministically. Walks the
 * corpus's altname buckets + the three category dictionaries above.
 * Returns the verbatim altname phrases that were matched (so Stage 2
 * can match them right back against the same altnames).
 *
 * The brief is normalized for matching (lowercased, hyphens → spaces,
 * punctuation collapsed). Same normalization applies to altname
 * phrases. Match is unidirectional: brief contains altname (after
 * normalization).
 *
 * Brand-exemplar altnames typically have a "like " prefix
 * ("like Aman", "like Stripe"). The extractor also tries the
 * stripped form so a brief saying "Aman-style" or just "Aman"
 * matches the bare brand even though the altname has the prefix.
 */
export function deterministicExtract(
  brief: string,
  corpus: Corpus,
): ExtractedSignals {
  const out = emptyExtractedSignals();
  const normalizedBrief = normalizeForMatching(brief);

  // Collect every altname across every grammar + voice profile in
  // the corpus, paired with its bucket. Walking each grammar once
  // and matching all five buckets in one pass keeps this O(N×M)
  // on N altnames and M brief length. ~1500 altnames × ~100 chars
  // is fast.
  const seen: Record<keyof AltnameBucket, Set<string>> = {
    vibes: new Set(),
    brand_exemplars: new Set(),
    vernacular: new Set(),
    anti_vibes: new Set(),
    compositional_intent: new Set(),
  };

  for (const axis of ALL_AXES) {
    const grammars = grammarsForAxis(axis, corpus);
    for (const grammar of grammars) {
      tryMatchBucket(
        normalizedBrief,
        grammar.altnames.vibes,
        "vibes",
        seen,
        out,
      );
      tryMatchBucket(
        normalizedBrief,
        grammar.altnames.vernacular,
        "vernacular",
        seen,
        out,
      );
      tryMatchBucket(
        normalizedBrief,
        grammar.altnames.anti_vibes,
        "anti_vibes",
        seen,
        out,
      );
      tryMatchBucket(
        normalizedBrief,
        grammar.altnames.compositional_intent,
        "compositional_intent",
        seen,
        out,
      );
      // Brand exemplars match BOTH the full altname phrase ("like
      // Aman") AND a stripped form ("Aman") so briefs using "X-style",
      // "X-coded", or just "X" still surface the brand signal.
      for (const altname of grammar.altnames.brand_exemplars) {
        if (matchAltnameInBrief(normalizedBrief, altname)) {
          if (!seen.brand_exemplars.has(altname)) {
            seen.brand_exemplars.add(altname);
            out.brand_exemplars.push(altname);
          }
          continue;
        }
        const stripped = stripBrandPrefix(altname);
        if (stripped !== null && stripped !== altname) {
          if (matchAltnameInBrief(normalizedBrief, stripped)) {
            if (!seen.brand_exemplars.has(altname)) {
              seen.brand_exemplars.add(altname);
              out.brand_exemplars.push(altname);
            }
          }
        }
      }
    }
  }

  // Domain / functional_context / audience_signals via dictionary.
  out.domain = matchDictionary(normalizedBrief, DOMAIN_DICTIONARY);
  out.functional_context = matchDictionary(
    normalizedBrief,
    FUNCTIONAL_DICTIONARY,
  );
  out.audience_signals = matchDictionary(normalizedBrief, AUDIENCE_DICTIONARY);

  return out;
}

/**
 * Build a SignalExtractor closure bound to a corpus. Conforms to the
 * SignalExtractor type alias so it composes with route() the same
 * way createStubStage1 does.
 */
export function createDeterministicStage1(corpus: Corpus): SignalExtractor {
  return async (brief: string): Promise<ExtractedSignals> => {
    return deterministicExtract(brief, corpus);
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function grammarsForAxis(
  axis: Axis,
  corpus: Corpus,
): Array<Grammar | VoiceProfile> {
  if (axis === "voice") return corpus.voice.profiles;
  return corpus.axes[axis];
}

function tryMatchBucket(
  normalizedBrief: string,
  altnames: ReadonlyArray<string>,
  bucket: keyof AltnameBucket,
  seen: Record<keyof AltnameBucket, Set<string>>,
  out: ExtractedSignals,
): void {
  for (const altname of altnames) {
    if (!matchAltnameInBrief(normalizedBrief, altname)) continue;
    if (seen[bucket].has(altname)) continue;
    seen[bucket].add(altname);
    out[bucket].push(altname);
  }
}

/**
 * Unidirectional substring match: does the (normalized) brief
 * contain the (normalized) altname? 3-char minimum to avoid
 * trivially-short matches like "a" or "ai".
 */
function matchAltnameInBrief(
  normalizedBrief: string,
  altname: string,
): boolean {
  const normalizedAltname = normalizeForMatching(altname);
  if (normalizedAltname.length < 3) return false;
  return normalizedBrief.includes(normalizedAltname);
}

/**
 * Strip "like ", "like a ", "like an " prefixes from a brand-exemplar
 * altname so briefs using "X-style" or just "X" still match. Returns
 * the stripped form or null if no recognized prefix was present.
 */
function stripBrandPrefix(altname: string): string | null {
  const match = /^(?:like\s+(?:a\s+|an\s+)?)(.+)$/i.exec(altname.trim());
  if (match === null) return null;
  return match[1]!.trim();
}

function matchDictionary(
  normalizedBrief: string,
  dictionary: ReadonlyArray<string>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const term of dictionary) {
    const normalized = normalizeForMatching(term);
    if (normalized.length < 2) continue;
    if (normalizedBrief.includes(normalized)) {
      if (!seen.has(term)) {
        seen.add(term);
        out.push(term);
      }
    }
  }
  return out;
}

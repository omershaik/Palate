// src/mcp/resources/index.ts
//
// Phase 3 Task 8 — MCP resource read callbacks. The 5 resources from
// the manifest dispatch through `readResource(corpus, uri)`. Each
// returns JSON content per the Task 8 review's resource-shape
// decisions: structured form is authoritative across all resources;
// markdown source preservation was rejected as inverting the source/
// derived relationship.
//
// URI matching:
//   - Fixed URIs (compatibility-model, canonical-combinations,
//     brand-fingerprints) match by exact string equality.
//   - Templated URIs (grammars/{axis}, altnames/{bucket}) match the
//     prefix and extract the templated segment from the URI tail.
//
// Error responses follow the same isError pattern established for
// tools — invalid axis or bucket params return content with a
// diagnostic JSON body. ReadResource doesn't carry an isError flag
// in MCP's protocol; we surface errors via a `{ error: ... }` shape
// the consuming client can detect.

import type { Axis } from "../../types/axis.js";
import { ALL_AXES } from "../../types/axis.js";
import type { Corpus } from "../../types/corpus.js";

const ALTNAME_BUCKETS = [
  "vibes",
  "brand_exemplars",
  "vernacular",
  "anti_vibes",
  "compositional_intent",
] as const;

type AltnameBucketKey = (typeof ALTNAME_BUCKETS)[number];

export interface ResourceReadResult {
  contents: Array<{
    uri: string;
    mimeType: "application/json";
    text: string;
  }>;
}

export function readResource(corpus: Corpus, uri: string): ResourceReadResult {
  // Templated: palate://spec/grammars/{axis}
  const grammarsMatch = uri.match(/^palate:\/\/spec\/grammars\/([a-z_]+)$/);
  if (grammarsMatch !== null) {
    return readGrammars(corpus, uri, grammarsMatch[1]!);
  }

  // Templated: palate://spec/altnames/{bucket}
  const altnamesMatch = uri.match(/^palate:\/\/spec\/altnames\/([a-z_]+)$/);
  if (altnamesMatch !== null) {
    return readAltnames(corpus, uri, altnamesMatch[1]!);
  }

  // Fixed URIs.
  switch (uri) {
    case "palate://spec/compatibility-model":
      return readCompatibilityModel(corpus, uri);
    case "palate://spec/canonical-combinations":
      return readCanonicalCombinations(corpus, uri);
    case "palate://spec/brand-fingerprints":
      return readBrandFingerprints(corpus, uri);
    default:
      return jsonContent(uri, {
        error: `Unknown resource URI: ${uri}`,
        available_uris: [
          "palate://spec/grammars/{axis}",
          "palate://spec/compatibility-model",
          "palate://spec/canonical-combinations",
          "palate://spec/brand-fingerprints",
          "palate://spec/altnames/{bucket}",
        ],
        templated_axis_values: ALL_AXES,
        templated_bucket_values: ALTNAME_BUCKETS,
      });
  }
}

// ---------------------------------------------------------------------------
// palate://spec/grammars/{axis}
// ---------------------------------------------------------------------------

function readGrammars(
  corpus: Corpus,
  uri: string,
  axisParam: string,
): ResourceReadResult {
  if (!isAxis(axisParam)) {
    return jsonContent(uri, {
      error: `Unknown axis '${axisParam}'.`,
      valid_axes: ALL_AXES,
    });
  }

  // Voice axis is structurally different — profiles have dimensional
  // coordinates Grammar doesn't carry. Surface both shapes per the
  // axis the caller asked for.
  if (axisParam === "voice") {
    return jsonContent(uri, {
      axis: "voice",
      kind: "voice_profiles",
      profiles: corpus.voice.profiles.map((p) => ({
        id: p.id,
        name: p.name,
        definition: p.definition,
        distinguishing_edge: p.distinguishing_edge,
        canonical_examples: p.canonical_examples,
        internal_logic: p.internal_logic,
        failure_mode: p.failure_mode,
        dimensional_coordinates: p.dimensional_coordinates,
        altnames: p.altnames,
      })),
      dimensions: corpus.voice.dimensions,
    });
  }

  return jsonContent(uri, {
    axis: axisParam,
    kind: "grammars",
    grammars: corpus.axes[axisParam].map((g) => ({
      id: g.id,
      name: g.name,
      definition: g.definition,
      distinguishing_edge: g.distinguishing_edge,
      substyles: g.substyles,
      canonical_examples: g.canonical_examples,
      internal_logic: g.internal_logic,
      registers_hosts: g.registers_hosts,
      registers_resists: g.registers_resists,
      failure_mode: g.failure_mode,
      altnames: g.altnames,
    })),
  });
}

// ---------------------------------------------------------------------------
// palate://spec/compatibility-model
// ---------------------------------------------------------------------------

function readCompatibilityModel(corpus: Corpus, uri: string): ResourceReadResult {
  return jsonContent(uri, {
    broken_combinations: corpus.broken_combinations,
    canonical_combinations: corpus.canonical_combinations,
    reduced_motion_fallbacks: corpus.reduced_motion_fallbacks,
  });
}

// ---------------------------------------------------------------------------
// palate://spec/canonical-combinations
// ---------------------------------------------------------------------------

function readCanonicalCombinations(
  corpus: Corpus,
  uri: string,
): ResourceReadResult {
  return jsonContent(uri, {
    count: corpus.canonical_combinations.length,
    canonicals: corpus.canonical_combinations.map((c) => ({
      id: c.id,
      name: c.name,
      axis_mappings: c.axis_mappings,
      axis_alternatives: c.axis_alternatives ?? {},
      brand_exemplars: c.brand_exemplars,
    })),
  });
}

// ---------------------------------------------------------------------------
// palate://spec/brand-fingerprints
// ---------------------------------------------------------------------------

function readBrandFingerprints(
  corpus: Corpus,
  uri: string,
): ResourceReadResult {
  // Passthrough — corpus.brand_fingerprints is already in the
  // BrandFingerprintsFile shape (version + fingerprints record).
  return jsonContent(uri, corpus.brand_fingerprints);
}

// ---------------------------------------------------------------------------
// palate://spec/altnames/{bucket}
// ---------------------------------------------------------------------------

function readAltnames(
  corpus: Corpus,
  uri: string,
  bucketParam: string,
): ResourceReadResult {
  if (!isAltnameBucket(bucketParam)) {
    return jsonContent(uri, {
      error: `Unknown altname bucket '${bucketParam}'.`,
      valid_buckets: ALTNAME_BUCKETS,
    });
  }

  const altnamesByAxis: Record<string, Array<{ grammar_id: string; phrases: string[] }>> = {};

  // Walk the 8 non-voice axes' grammars + voice profiles.
  for (const axis of ALL_AXES) {
    if (axis === "voice") {
      altnamesByAxis[axis] = corpus.voice.profiles.map((p) => ({
        grammar_id: p.id,
        phrases: p.altnames[bucketParam],
      }));
      continue;
    }
    altnamesByAxis[axis] = corpus.axes[axis].map((g) => ({
      grammar_id: g.id,
      phrases: g.altnames[bucketParam],
    }));
  }

  return jsonContent(uri, {
    bucket: bucketParam,
    altnames: altnamesByAxis,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonContent(uri: string, payload: unknown): ResourceReadResult {
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function isAxis(s: string): s is Axis {
  return (ALL_AXES as readonly string[]).includes(s);
}

function isAltnameBucket(s: string): s is AltnameBucketKey {
  return (ALTNAME_BUCKETS as readonly string[]).includes(s);
}

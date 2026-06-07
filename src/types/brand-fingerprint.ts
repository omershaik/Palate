// src/types/brand-fingerprint.ts
//
// The "derived" half of the Palate corpus per Turn 8 §7 / PRD §4.9. Brand
// fingerprints are the machine-extracted record of how each named brand
// exemplar currently expresses itself — what its actual hex codes are,
// what fonts it uses, what its voice scores, etc.
//
// In v0.1.0, brand-fingerprints.json is hand-populated as a structural
// stub (Group E2). The Phase 4 re-derivation worker takes it over from
// v0.1.1 onward.
//
// The five fingerprint signals (color, typography, spacing, radius,
// shadow) plus the voice fingerprint cover the surface the routing
// engine needs to detect drift from a brand's altname description.

import type { VoiceDimensions } from "./voice.js";

/**
 * One color sample extracted from a brand's rendered surface, with its
 * usage frequency in the rendered viewport. The worker keeps the top 8
 * by frequency (PRD §4.9 — smaller fingerprint = simpler comparison,
 * fewer false-positive drift flags).
 */
export interface ColorSample {
  /** Hex (#RRGGBB) or rgb(...) or rgba(...) — whatever the source CSS
   *  produced; normalized to lowercase hex by the worker when possible. */
  value: string;
  /** Fraction of pixels in the rendered viewport occupied by this color,
   *  on [0, 1]. */
  frequency: number;
}

/**
 * Typography fingerprint — what fonts and weights the brand currently
 * deploys. The worker reads computed `font-family` from heading and body
 * elements separately so the fingerprint captures the type-pairing
 * decision (Two-Hand vs Single-Family vs Editorial Print).
 */
export interface TypographyFingerprint {
  /** Computed font-family string for primary headings. */
  display_family: string;
  /** Computed font-family string for body text. */
  body_family: string;
  /** Optional monospace family if the brand uses one for code/data. */
  mono_family?: string;
  /** Distribution of font-weights observed across rendered text,
   *  expressed as { weight_value: usage_fraction }. */
  weight_distribution: Record<string, number>;
  /** Primary type scale extracted from heading vs body sizes (px). */
  type_scale_px: {
    h1: number;
    h2?: number;
    h3?: number;
    body: number;
  };
}

/**
 * Spacing/radius/shadow distributions — histograms of the most common
 * values across rendered components. The worker extracts these to detect
 * when a brand changes its component vocabulary (e.g., a Soft-Container
 * brand drifts toward Pill-and-Cushion radii).
 */
export interface DistributionFingerprint {
  /** Top values by frequency, expressed as { value_string: usage_fraction }. */
  top_values: Record<string, number>;
}

/**
 * One brand's complete fingerprint at a point in time.
 *
 * `fingerprint_id` is a stable identifier the spec's altnames point to;
 * it survives across re-derivation runs. `last_verified` updates each
 * time the worker confirms (or refreshes) the fingerprint.
 */
export interface BrandFingerprint {
  fingerprint_id: string;
  /** Display name, e.g., "Stripe", "Aman", "Cheval Blanc". */
  brand_name: string;
  /** Canonical URL the worker scrapes. */
  source_url: string;
  /** Top 8 colors by usage frequency in the rendered viewport. */
  color_tokens: ColorSample[];
  typography_fingerprint: TypographyFingerprint;
  spacing_distribution: DistributionFingerprint;
  radius_distribution: DistributionFingerprint;
  shadow_usage: {
    /** Number of unique box-shadow declarations encountered. */
    declaration_count: number;
    /** Average blur radius in px across declarations. */
    average_blur_px: number;
  };
  voice_coordinates: VoiceDimensions;
  /** ISO-8601 date of the most recent successful re-derivation run. */
  last_verified: string;
  /** Spec version this fingerprint was committed to (semver). */
  source_fingerprints_version: string;
}

/**
 * Tombstone for a brand that's referenced in corpus altname
 * brand_exemplars buckets but doesn't have a full fingerprint in
 * v0.1. Per Phase 3 Task 9: distinguishes "documented gap, fingerprint
 * pending" from "unknown brand" without fabricating placeholder
 * color / typography / voice data.
 *
 * Inclusion threshold for v0.1: brands with ≥3 brand_exemplars-bucket
 * mentions across the corpus get tombstones; ≥2-mention and singleton
 * gaps fall through to the get_brand_fingerprint tool's generic
 * NOT FOUND diagnostic and are Phase 4 worker territory by
 * definition.
 *
 * All four fields are required — consumers (AI tools calling
 * get_brand_fingerprint) need fallback_guidance to know how to route
 * around the missing fingerprint, and don't get to interpret an
 * absent reason / mention_count.
 */
export interface UnfingerprintedBrand {
  /** Human-readable brand name. */
  name: string;
  /** Why this brand isn't fingerprinted yet, in one sentence. */
  reason: string;
  /** Count of brand_exemplars-bucket mentions in the corpus that
   *  motivated the tombstone. */
  mention_count: number;
  /** Routing-shaped fallback for AI tools that can't get real
   *  fingerprint data. References canonicals by id + name, not
   *  speculative color / typography. One sentence. */
  fallback_guidance: string;
}

/**
 * The full brand-fingerprints.json shape: a record keyed by
 * fingerprint_id mapping to the fingerprint entry.
 *
 * `known_unfingerprinted` ships in v0.1 with documented gaps
 * (Phase 3 Task 9). Optional on the file type for backward
 * compatibility — older fingerprints.json files without this
 * field still load. The shipped v0.1 file always populates it.
 */
export interface BrandFingerprintsFile {
  version: string;
  generated_at: string;
  fingerprints: Record<string, BrandFingerprint>;
  known_unfingerprinted?: Record<string, UnfingerprintedBrand>;
}

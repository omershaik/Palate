# Task 6c Triage Table — Per-Axis-Only Failures (Phase 2.1 Path-2 Audit)

This document captures the per-fixture per-axis triage of the 9 fixture-rows where canonical_match is correct but per-axis routing or min_confidence assertions fail. Produced as the audit artifact of Phase 2.1's Path-2 close: triage-only, no implementation. The amendments documented here are v0.2 work items, NOT v0.1 changes.

## Methodology

Each per-axis FAIL is classified by root-cause type:

- **Type A — Altname coverage gap.** Brief signal exists in the brief; would naturally attest for the expected grammar; but the expected grammar's altname bucket does not have the phrase. Search-first attestation amendable per the Task 1 / 6b methodology.
- **Type B — Spec consistency / fixture mismatch.** The expected grammar doesn't match the canonical's parsed `axis_mappings` / `axis_alternatives`, OR the canonical's spec text supports a different grammar than the fixture asserts. Defer to v0.2 spec-consistency audit pass.
- **Type C — Brand-surface fanout.** Brand exemplar (Stripe, Apple, etc.) substring-matches multiple grammars on the same axis; engine picks the wrong one because the brand spreads its signal too thin. Per architectural pattern entry 7. v0.2 fix: whole-phrase matching + surface-specific altnames.
- **Type D — No Stage 2 candidate / brief signal absence.** Axis has zero Stage 2 candidates because brief doesn't naturally signal anything for the expected grammar. Engine falls back to AI-default or to a tangentially-related grammar that DOES match. Need altname amendment for a brief phrase that SHOULD route there but currently doesn't match any altname.
- **Type E — Register-adjacency tie.** Multiple grammars in the canonical's spec set tie at top conf; engine picks one, fixture asserts another (within the canonical's accept set). Coverage gap on disambiguating altname OR Stage 3b tie-break refinement.

## Per-fixture audit

Source data: `node dbg-task6a.mjs` + `node dbg-route-output.mjs` against each fixture (commit `9912cb1`).

### 1. saas-marketing-brand (3 axis FAILs + min_confidence)

Canonical: canonical-4 Standard SaaS Marketing (correct, conf 0.778). min_conf floor is 0.85 — currently below, will only reach 0.85 if the per-axis FAILs close. Brief: "typical YC startup, Stripe, Webflow template" + SaaS landing page vernacular.

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| imagery | IMG-5 (conf 1.00) | IMG-7 / IMG-6 | IMG-5 (brand+vernacular ev=2), IMG-8 (brand) | **Type C** (Stripe brand-fanout — Stripe routes to IMG-5 abstract 3D used by AI startups, not IMG-7 stock photo used by SaaS marketing) | Defer per entry 7. v0.2 whole-phrase matching: `"Stripe announcements"` should route to IMG-5; bare `"Stripe"` should route to canonical-4-aligned imagery. Currently `"Stripe"` substring-matches both. | — |
| reading_pattern | RP-3 (conf 0.90) | RP-2 | RP-3 (brand) | **Type C** (Stripe brand → RP-3 F-Pattern — fans across many RP grammars; canonical-4 RP-2 Z-Pattern doesn't appear in Stage 2 because no brief signal routes there) | Defer per entry 7. Could also be Type D if no Stripe altname exists in RP-2. v0.2 fix: surface-specific altname OR whole-phrase matching. | — |
| min_confidence | 0.778 | ≥0.85 | — | **Derived** | Closes when per-axis FAILs close. Per-axis cascade: 2 FAILs × ~0.10 score-impact = ~0.20 below floor. | — |

### 2. saas-marketing-vibes (2 axis FAILs)

Canonical: canonical-4 Standard SaaS Marketing (correct, conf 0.778). min_conf floor 0.7 — passes already. Brief: "standard SaaS landing page / modern / clean / conversion-focused / trustworthy and contemporary" + vernacular "single accent color, feature grid, snappy hovers".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| imagery | IMG-4 (conf 0.60) | IMG-7 / IMG-6 | IMG-4 (vibes ev=1) | **Type D** (no Stage 2 candidate for IMG-7/IMG-6; brief vibes "trustworthy and contemporary" routes IMG-4 instead) | Add a brief-attesting phrase to IMG-7 (Stock Photography). Brief has "standard SaaS landing page" + "conversion-focused" — these legitimately attest as stock-photo-using SaaS marketing. | `"standard SaaS landing page"` → IMG-7 vibes OR `"conversion-focused marketing"` → IMG-7 vibes |
| voice | VOICE-4 (conf 0.60) | VOICE-7 / VOICE-3 | VOICE-4 (vibes ev=1) | **Type D** (similar — `"trustworthy and contemporary"` or `"clean"` routes VOICE-4 Direct Professional, not VOICE-7 Conversion-Punchy or VOICE-3 Friendly Expert) | Add a brief-attesting phrase to VOICE-7 or VOICE-3. SaaS landing page voice IS conversion-punchy by attestation; the brief's "conversion-focused" should anchor there. | `"conversion-focused"` → VOICE-7 vibes OR `"trustworthy and contemporary"` → VOICE-3 vibes (Mailchimp / Notion / Webflow) |

### 3. editorial-longform-brand (1 axis FAIL)

Canonical: canonical-10 Editorial Long-Form (correct, conf 0.889). Brief: "Stripe Press, premium Substack" + vernacular "article page, hero opening, editorial type".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| typography | TYPE-2 (conf 0.90) | TYPE-1 / TYPE-3 | TYPE-2 (brand ev=1 from Stripe Press), TYPE-1 (vernacular ev=1) | **Type B** (canonical-10 typography spec inconsistency — same shape as Task 4c Case 2, deferred there). The altname `"like Stripe Press (Tiempos throughout)"` IS in TYPE-2 (Single-Family Discipline) — that's accurate attestation. But canonical-10 spec lists TYPE-1 (Two-Hand) / TYPE-3 (Editorial Print) as its typography. Stripe Press IS a single-family system (Tiempos) which is TYPE-2 territory; the canonical-10 spec is authentic for the Editorial Long-Form REGISTER but doesn't include TYPE-2 in alts. | Defer per Task 4c Case 2 + coverage-notes entry 6. v0.2 spec-consistency: add TYPE-2 to canonical-10 axis_alternatives.typography (acknowledging that some Editorial Long-Form sites use single-family systems). | — |

### 4. editorial-magazine-vibes (1 axis FAIL)

Canonical: canonical-2 Editorial Magazine (correct, conf 0.889). Brief: "magazine vibes, printed-page feel, art-directed, member's-club energy" + vernacular "asymmetric grid".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| motion | MOTION-5 (conf 0.60) | MOTION-2 | MOTION-5 (vibes ev=1) | **Type A** (need brief-signal attestation for MOTION-2 Restrained-Atmospheric. `"member's-club energy"` could attest for MOTION-2 — quiet hospitality movement. `"printed-page feel"` could too — magazine motion is restrained.) | Add `"member's-club energy"` or `"printed-page feel"` to MOTION-2 (Restrained-Atmospheric) altnames. | `"member's-club energy"` → MOTION-2 vibes OR `"printed-page feel"` → MOTION-2 vibes |

### 5. editorial-brand-hybrid-vibes (1 axis FAIL)

Canonical: canonical-12 Premium Editorial-Brand Hybrid / Soho House Tier (correct, conf 1.000). Brief: "members-club energy, editorial intelligence, hospitality warmth, considered editorial voice" + vernacular "multi-column editorial spreads, two-hand type".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| layout | LAYOUT-1 (conf 1.00) | LAYOUT-2 | LAYOUT-1 (vernacular ev=2 from "multi-column editorial spreads") | **Type B** (same shape as Task 6b fixture 2; canonical-12 spec text reads "Editorial-Grid Magazine + Vertical-Rhythm Editorial sections" supporting BOTH LAYOUT-2 and LAYOUT-1, but corpus loader picked only LAYOUT-1. The fixture asserts LAYOUT-2 — engine picked LAYOUT-1.) | Defer per coverage-notes entry 10. v0.2 spec-consistency: amend canonical-12 axis_alternatives.layout to `[LAYOUT-2, LAYOUT-1]`. | — |

### 6. ecommerce-catalog-brand (1 axis FAIL)

Canonical: canonical-11 E-Commerce Catalog (correct, conf 0.889). Brief: "Amazon, Mejuri" + vibes "e-commerce, friendly expert" + vernacular "product grid, white-background product photography, single-accent palette".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| component | COMP-4 (conf 0.60) | COMP-2 | COMP-4 (vibes ev=1 from "e-commerce" or "friendly expert") | **Type A** (need brief-signal attestation for COMP-2 Soft-Container System. `"product grid"` could attest if e-commerce product grids are documented as Soft-Container components. Brief vernacular has "product grid" already. Worth searching.) | Add `"product grid"` or `"e-commerce catalog"` to COMP-2 vernacular labels. | `"product grid"` → COMP-2 vernacular OR `"catalog page components"` → COMP-2 vernacular |

### 7. modern-ai-startup-vibes (1 axis FAIL)

Canonical: canonical-3 Modern AI Startup (correct, conf 0.889). Brief: "modern AI launch, clean, dark, contemporary" + vernacular "tile grid, abstract 3D" + comp_intent "multiple features to surface".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| voice | VOICE-4 (conf 0.60) | VOICE-7 / VOICE-5 | VOICE-4 (vibes ev=1 from "clean" or "contemporary") | **Type D** (no Stage 2 candidate for VOICE-7 Conversion-Punchy or VOICE-5 Premium Confident. Brief's "modern AI launch" could attest for VOICE-7 (AI-launch announcements are conversion-punchy) or VOICE-5 (premium AI brands like Anthropic / OpenAI use Premium Confident).) | Add `"AI launch"` or `"modern AI launch"` to VOICE-7 or VOICE-5 vibes/brand_exemplars. | `"modern AI launch"` → VOICE-5 vibes (Premium Confident — Anthropic / OpenAI / Vercel pattern) OR VOICE-7 (Conversion-Punchy — typical SaaS launch) |

### 8. premium-hardware-brand (1 axis FAIL)

Canonical: canonical-5 Premium Consumer Hardware (correct, conf 0.889). Brief: "Apple, Bang & Olufsen" + vibes "premium hardware" + vernacular "product detail page, frosted glass, product photography".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| reading_pattern | RP-6 (conf 0.90) | RP-2 | RP-6 (brand ev=1 from Apple/iOS substring) | **Type C** (Apple brand-surface conflation per architectural pattern entry 7. Brief is Apple's iPhone MARKETING page, but `"Apple"` substring-matches `"like Apple's iOS"` in RP-6 Mobile Thumb-Zone. Already documented as deferred in coverage-notes entry 7.) | Defer per existing entry 7. v0.2 whole-phrase matching: `"Apple"` bare brand should NOT substring-match `"like Apple's iOS"` — only `"Apple's iOS"` should. | — |

### 9. wellness-dtc-vibes (1 axis FAIL)

Canonical: canonical-6 Wellness / Beauty DTC (correct, conf 0.889). Brief: "warm and inviting, golden-hour, friendly voice, sun-soaked, light and conversational" + vernacular "lifestyle imagery".

| Axis | Engine pick | Expected | Stage 2 candidates | Type | Amendment proposal | Brief phrase candidate |
|---|---|---|---|---|---|---|
| layout | LAYOUT-2 (conf 0.60) | LAYOUT-4a / LAYOUT-4b | LAYOUT-2 (vibes ev=1) | **Type D** (no Stage 2 candidate for LAYOUT-4a Conversion-Stack or LAYOUT-4b Brand-Stack. Brief vibes route LAYOUT-2 — possibly via "warm and inviting" routing to editorial-magazine layout — but DTC sites use Conversion-Stack or Brand-Stack patterns.) | Add a brief-attesting phrase to LAYOUT-4b (Brand-Stack — DTC brand sites). `"DTC brand site"` or `"wellness brand site"` would attest for LAYOUT-4b. | `"DTC brand site"` → LAYOUT-4b brand_exemplars (Mejuri / Glossier / Goop pattern) |

## Summary classification

| Type | Count | Fixtures (per-axis) |
|---|---|---|
| A — Altname coverage gap (search-first amendable) | 2 | editorial-magazine-vibes/motion, ecommerce-catalog-brand/component |
| B — Spec consistency (defer to v0.2 spec audit) | 2 | editorial-longform-brand/typography, editorial-brand-hybrid-vibes/layout |
| C — Brand-surface fanout (defer per entry 7) | 3 | saas-marketing-brand/imagery, saas-marketing-brand/reading_pattern, premium-hardware-brand/reading_pattern |
| D — No Stage 2 candidate (need new altname coverage) | 4 | saas-marketing-vibes/imagery, saas-marketing-vibes/voice, modern-ai-startup-vibes/voice, wellness-dtc-vibes/layout |
| E — Register-adjacency tie | 0 | none observed |

Plus saas-marketing-brand min_confidence (derived — closes when its 2 axis FAILs close).

**Total per-axis FAILs: 11 across 9 fixture-rows.** Most fixtures have a single axis FAIL each; saas-marketing-brand has 2 (driving its min_confidence FAIL too). Type A + Type D combined = 6 fixtures with v0.2-tractable altname amendment paths; Type B + Type C = 5 fixtures requiring deeper v0.2 work (spec audit + whole-phrase matching).

## v0.2 work item summary

For the v0.2 backlog (`docs/v0.2-backlog.md`):

- **Type A/D amendments (6 axes)** — search-first attestation per the candidate phrases above. Estimated v0.2 work: 2-4h (search + apply + validate). Expected closures: ~3-5 fixture assertions.
- **Type B amendments (2 axes)** — combined with the broader spec-consistency audit pass (which also includes Task 4c Case 2 and the Mission-Earnest unresolvability). Estimated v0.2 work: 4-6h (spec walkthrough + amendments). Expected closures: ~2-3 fixture assertions.
- **Type C amendments (3 axes)** — close once whole-phrase matching for brand-exemplar altnames lands (per architectural pattern entry 7). Estimated v0.2 work: part of the Stage 2 matching restructure. Expected closures: ~2-3 fixture assertions.

These are NOT v0.1 work items. v0.1 closes Phase 2.1 with these classifications documented; v0.2 picks up from this audit table.

## Cross-references

- `docs/architectural-patterns.md` — entries 7 (brand-surface conflation), 8 (AI-default overlap), 9 (register-adjacency).
- `docs/altname-coverage-notes.md` — entries 6 (Cases deferred from Task 4b/4c), 7 (Apple/RP-6), 9 (Mission-Earnest), 10 (Soho House LAYOUT spec consistency), 11 (editorial-longform-vibes), 12 (cause-journalism-vibes), 13 (Stripe brand-fanout — added by Path 2 close), 14 (Apple brand-fanout — added by Path 2 close).
- `docs/v0.2-backlog.md` — prioritized v0.2 work items derived from these findings.

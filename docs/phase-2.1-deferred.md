# Phase 2.1 — Deferred Work from Phase 2 Group F (Post-F Honesty Report)

This document catalogs the 49 validation-suite failures remaining at the end of Phase 2 Group F's iteration cycle (F3-1, F3-2, F3-3). Each is real F3 work that the F3 cycle didn't close; they're deferred to Phase 2.1 with a corrected diagnosis. The post-F honesty report's initial categorization put rough estimates and root-cause guesses on these failures; F3-time inspection updated several. This file is the truth-of-record going forward.

End-of-F3 state: **384 of 433 tests pass (88.7%); 49 fail.** The pass-rate goal at the end of Phase 2.1 is ≥95%.

---

## Categorization

The 49 failures group into 6 categories, ordered by estimated cost.

### Category A — Adjacent-canonical disambiguation (~12 failures)

The engine routes to a canonical adjacent to the intended one. The brief's signals don't strongly enough disambiguate, and Stage 2/3 picks the closer-by-bucket-weight neighbor.

**Failing fixtures:**
- `cause-journalism-intent` — routes to Standard SaaS Marketing (intended: Cause/Journalism)
- `cause-journalism-vibes` — routes to Editorial Magazine (intended: Cause/Journalism)
- `creative-agency-vibes` — routes to Editorial Magazine (intended: Awwwards Creative Agency)
- `editorial-brand-hybrid-{brand,intent,vibes}` — routes to Editorial Magazine or Standard SaaS Marketing (intended: Editorial-Brand Hybrid)
- `editorial-longform-vibes` — routes to Cause/Journalism (intended: Editorial Long-Form)
- `editorial-magazine-intent` — routes to Standard SaaS Marketing (intended: Editorial Magazine)
- `plain-document-vibes` — routes to Luxury Hospitality (intended: Plain Document)
- `saas-marketing-brand` — routes to Modern AI Startup (intended: Standard SaaS Marketing)
- `ecommerce-catalog-vibes` — routes to Awwwards Creative Agency (intended: E-Commerce Catalog)

**Root cause.** Stage 2 bucket-matching scores neighboring canonicals close to each other when the brief uses generic vibes. The kickoff D3 adjustment (REGISTER_COHERENCE_AXIS_THRESHOLD = 6/9) lets either canonical pass the threshold, and Stage 3 picks whichever scores marginally higher.

**Estimated fix cost: ~4–6 hours.** Either tighten the threshold (risks under-routing intent-path canonicals) or add a tie-breaker that weights brand-exemplar matches and explicit vernacular more heavily than vibes — when the brief explicitly names a grammar via vernacular, it should outrank an implicit vibe-match.

---

### Category B — Stage 2 routing precision on per-axis assertions (~14 failures)

The engine routes to the right canonical (or close to it) but picks a different grammar on one axis than the fixture asserts. This is the per-axis assertion failing while canonical_match passes.

**Failing axis assertions (representative):**
- `application-ui-brand/typography` — got TYPE-2, expected one of [TYPE-5, TYPE-4]
- `creative-agency-intent/typography` — got TYPE-5, expected TYPE-6
- `developer-tool-intent/color` — got COLOR-8a, expected COLOR-4
- `editorial-longform-{brand,intent}/typography` — got TYPE-2 or TYPE-5, expected one of [TYPE-1, TYPE-3]
- `editorial-longform-vibes/imagery` — got IMG-3, expected IMG-1
- `plain-document-{intent,vibes}/typography` — got TYPE-5, expected TYPE-2
- `premium-hardware-brand/motion` — got MOTION-3, expected one of [MOTION-8, MOTION-5]
- `saas-marketing-{brand,vibes}/typography` — got TYPE-2, expected TYPE-5
- `wellness-dtc-intent/color` — got COLOR-8a, expected one of [COLOR-6, COLOR-2]

**Root cause.** Either the AI default for the axis (TYPE-2, COLOR-8a, MOTION-3) outranks the brief's signaled grammar, or the brief's vernacular phrases don't match any of the canonical's primary/alternative altname buckets. The Stage 5 fillAIDefaultsFromCanonical fires only when register-coherence ≥ 6/9; some of these fixtures land at exactly 6/9 or just under, missing the fill.

**Estimated fix cost: ~6–8 hours.** Two-pronged approach: (1) audit the altname buckets for the canonical primary grammars and add missing altnames the fixtures' vernacular signals invoke; (2) tune the fillAIDefaultsFromCanonical threshold so it fires for sparse-signal canonical fixtures.

**Methodology prior carried from Task 1.** Phase 2.1a Task 1's per-phrase attestation across 6 anti-vibe fixtures found that ~36% of original fixture vocabulary survived as well-attested design-community phrasing; ~64% was constructed-by-analogy and either dropped or replaced. Carry this prior into Task 4's altname bucket audit explicitly: expect ~30–40% of fixture-signaled phrases to survive attestation, log negative results for everything that doesn't, do NOT lower the methodology bar to hit a higher hit rate. The 36% number is the calibration point for honest fixture authorship. If Task 4 produces 80%+ attestation, that's evidence the fixtures were written with vocabulary research already done (good sign — confirms Task 4's specific fixtures are higher-quality than Task 1's). If it produces 10%, that's evidence either the methodology is being applied too strictly or the Category B fixture batch was authored from imagination (worth investigating before continuing).

**Question to hold for after Task 4 closes.** Tasks 4 and 5 may have substantial overlap. Task 5's threshold-tuning was originally scoped as a workaround for missing altname coverage; if Task 4's altname additions close ~8–10 of 14 Category B fixtures through coverage alone, Task 5 may need to be re-scoped or skipped — the threshold-tuning was always a workaround for the underlying coverage gap, and the right fix was always the coverage itself. Don't decide now; the Task 4 closure data determines it.

---

### Category C — Anti-vibe spec gaps (~6 failures)

Anti-vibe altnames are missing from the v0.1 grammar definitions, so anti-vibe signals don't eliminate the grammars they're meant to negate.

**Failing fixtures:**
- `anti-beauty-not-glossier-cliche` — must_avoid COMP-4 (Pill-and-Cushion); engine routes to it
- `anti-blog-no-decoration` — must_avoid LAYOUT-4a; engine routes to it
- `anti-brutalist-softer-than-gumroad` — must_avoid COLOR-5 (Saturated-Primary); engine routes to it
- `anti-hotel-not-bento` — must_avoid LAYOUT-4a (Marketing-Bento); engine routes to it
- `anti-saas-not-saasy` — must_avoid TYPE-5 (Inter-Default Stack); engine routes to it
- `anti-startup-no-build-the-future` — must_avoid VOICE-7 (Conversion-Punchy); engine routes to it

**Root cause.** The fixtures' anti-vibe phrases ("not Glossier-cliche", "no decoration", "softer than Gumroad", "not bento", "not SaaS-y", "no 'build the future'") don't appear in the anti-vibe altname buckets of the grammars they should eliminate. v0.1 anti-vibe coverage is uneven across grammars.

**Estimated fix cost: ~3–4 hours.** Spec amendment: add the missing anti-vibe altnames to LAYOUT-4a, COMP-4, COLOR-5, TYPE-5, VOICE-7 (and others as the audit discovers). No engine change needed once altnames are in place.

---

### Category D — Novel-but-coherent over-confidence (~4 failures, ranking issue)

The post-F report initially attributed this to Stage 5 fill aggressiveness. F3-2 inspection shows the actual root cause is Stage 2/3 ranking precedence: explicit vernacular naming a non-canonical grammar gets outranked by stronger brand-exemplar signals, so the novel signal never reaches Stage 4.

**Failing fixtures:**
- `novel-developer-tool-editorial` — engine reports canonical_match=Luxury Hospitality conf=1 (expected: novel)
- `novel-editorial-longform-glass-depth` — engine reports canonical_match=Editorial Long-Form conf=1 (expected: novel)
- `novel-luxury-hotel-scrollytelling` — engine reports canonical_match=Luxury Hospitality conf=1 (expected: novel)
- `novel-saas-quiet-authority` — engine reports canonical_match=Luxury Hospitality conf=1 (expected: novel)

**Root cause.** Brief: "Aman + scrollytelling-narrative motion". Stage 2 bucket-match yields motion candidates {MOTION-1: 0.9 via Aman brand, MOTION-6: 0.7 via "scrollytelling" vernacular}. Stage 3's confidence ranking picks the top — MOTION-1 wins. The novel signal is preserved in alternatives but doesn't influence canonical-match detection. The engine sees a perfect canonical-1 match.

**Estimated fix cost: ~4 hours.** Add a "novel-signal detector" — when an axis has a strong-confidence (≥0.5) alternative that doesn't match the canonical's primary or alternatives, lower the canonical_match_confidence proportionally. F3-2 added MAX_AI_DEFAULT_FILL_THRESHOLD = 2 architecturally; that constant becomes load-bearing once Stage 2/3 surfaces novel signals correctly.

---

### Category E — Contradictory-brief detection (~2 failures, partial v0.1)

The fixture's stub_signals include deliberately contradictory canonicals. The engine should surface a conflict warning rather than silently routing to one.

**Failing fixtures (DEFERRED to v0.2):**
- `fail-bento-and-quiet-luxury` — got canonical_match=Luxury Hospitality conf=1 (expected: conflict warning)
- `fail-contradictory-canonicals` — got canonical_match=Neo-Brutalist Indie SaaS conf=0.89 (expected: conflict warning)

**v0.1 status (post Phase 2.1a Task 2).** Phase 2.1a Task 2 attempted to close these via a score-distribution-based contradiction detector in Stage 5. Honest finding from implementation review: the score-distribution proxy doesn't fire on either fixture's actual signal pattern.

- `fail-bento-and-quiet-luxury` has `brand_exemplars: ["Aman"]` + dual-canonical vibes. Aman's brand-name extraction dominates Stage 1, routing all 9 axes to canonical-1 (Luxury Hospitality) at score 1.0. Top-2 ends up being canonical-12 (Premium Editorial-Brand Hybrid, ADJACENT to canonical-1), NOT canonical-3 (Modern AI Startup, the contradictory canonical the brief invokes via "bento-modern AI startup"). The contradiction signal exists in the brief but doesn't survive to the canonical-score distribution.
- `fail-contradictory-canonicals` has 4 spread-out vibes and no brand. No canonical dominates; top-1 (canonical-7) scores only 0.667, top-2 scores 0.556. Tie ratio 0.833, below any reasonable detector threshold.

**What v0.1 ships (scaffolding only):**
- `CoherenceVerdict.canonical_scores: Array<{canonical_id, score}>` — full canonical-score distribution exposed to Stage 5.
- `detectContradictoryCanonicals(verdict, corpus)` in `stage5-resolve.ts` — conservatively tuned (`CONTRADICTION_MAX_REGISTER_OVERLAP = 0`, `CONTRADICTION_TIE_RATIO = 0.95`) so zero canonical fixtures false-positive. The detector fires only on contrived/synthetic cases (truly distant register families with nearly-tied scores) — no v0.1 fixture exercises that path.

**v0.2 path:** signal-level detection. Examine `ExtractedSignals` directly — vibes, vernacular, brand exemplars — and check for multiple-register invocation BEFORE the routing pipeline collapses the signal. Per-vibe canonical attribution (assign each vibe phrase to its best-matching canonical based on altname matching; surface contradiction when multiple vibes attribute to different canonicals in different register families) is one viable design. The two failure-mode fixtures stay in the test suite as the validation cases for the v0.2 signal-level detector.

**Estimated fix cost (v0.2): ~3–4 hours.** Per-vibe canonical attribution + signal-level contradiction rule + integration with the existing Stage 5 architectural scaffolding. See `docs/architectural-patterns.md` "Contradiction detection should operate on signal-extraction outputs, not on downstream canonical scores" for the cross-phase pattern.

---

### Category F — Stage 4 unit-test fixture cleanup (~5 failures)

Tests in `stage4-coherence.test.ts` and `stage5-resolve.test.ts` assert behavior that pre-dates Phase 2 Group F's strict-match tightening (where AI-defaulted axes stopped counting as exact matches to fix the empty-brief over-route bug).

**Failing tests:**
- `stage4-coherence.test.ts > Aman + luxury hospitality signals → CANONICAL-1 exact match`
- `stage4-coherence.test.ts > OpenAI + AI startup signals → CANONICAL-3`
- `stage5-resolve.test.ts > coherent combination → no_resolution_needed strategy`
- `validation-suite.test.ts > broken-app-density-scroll-cinematic` — Stage 2 routing miss (mono-density components / scroll-driven cinematic motion vernacular not in altname buckets)
- `canonical-fixtures.test.ts` cross-reference test — incidental from test-only assertion cleanup

**Root cause.** Test fixture briefs that don't fully signal all 9 axes; the AI-defaulted axes break strict-match per the F-commit design.

**Estimated fix cost: ~1 hour.** Either add the missing axis signals to the test briefs (so Stage 2 routes all 9 axes via signal, no AI-defaults), or update the assertions to use the lenient register-coherence verdict instead of the strict canonical_match_id.

---

## Recap

| Category | Failures | Estimated cost | Priority |
|---|---|---|---|
| A — Adjacent-canonical disambiguation | ~12 | ~4–6h | High |
| B — Stage 2 routing precision | ~14 | ~6–8h | High |
| C — Anti-vibe spec gaps | ~6 | ~3–4h | Medium |
| D — Novel-signal detection | ~4 | ~4h | Medium |
| E — Contradictory-brief detection | ~2 | ~2–3h | Low |
| F — Stage 4 test fixture cleanup | ~5 | ~1h | Low (test-only) |
| **Total** | **~43** | **~20–26h** | |

(43 vs the 49 actual count — the gap is fixtures failing on multiple assertions where one fix closes both. The recap counts distinct ROOT CAUSES, not assertion failures.)

---

## Phase 2.1 plan

Three iterations, in priority order:

**Phase 2.1a (Categories C, F, E):** ~6h — easy wins. Spec altname additions, test cleanup, register-clash detector.

**Phase 2.1b (Categories A, B):** ~10h — Stage 2/3 routing precision improvements. The bulk of the remaining failures live here.

**Phase 2.1c (Category D):** ~4h — novel-signal detector wired up to the existing F3-2 architectural cap.

Target end-state: ≥95% pass rate (≤22 failures) before Phase 3 begins.

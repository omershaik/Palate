# Architectural Patterns to Hold Across Phases

Bug classes and architectural invariants that surfaced during phase work and that future phases should check for. Each entry names the pattern, where it's been observed, and where it's most likely to re-emerge.

This file is durable cross-phase guidance, not a per-phase deferred-work list. Phase-specific deferred work lives in `docs/phase-2.1-deferred.md`; per-grammar coverage findings live in `docs/altname-coverage-notes.md`.

---

## 1. Anti-vibe elimination must be respected by all downstream consumers of routing decisions

**The semantic.** Anti-vibes in Stage 2 ELIMINATE grammars from candidates (per Turn 8 §5.2's 1.5× weighting — anti-vibes weight more than positive signals precisely because elimination is stronger than discount). Any stage or component that re-introduces eliminated grammars — via canonical fill, fallback, or independent corpus lookup — silently violates the spec's stated routing logic. The 1.5× weighting becomes meaningless if downstream stages can override the elimination.

**Instances landed (Phase 2.1a Task 1):**

- **Stage 5 `fillAIDefaultsFromCanonical` and `trySnapToCanonical` bypassed elimination** — both functions iterated `canonical.axis_mappings` and synthesized a fresh candidate from the canonical's spec without checking whether that grammar was anti-vibe-eliminated. Fixed in commit `b498b32` ("Stage 5: respect anti-vibe elimination through canonical fill/snap"): the functions now take an `EliminatedGrammars` parameter and skip axes whose canonical primary AND every alternative is in `eliminated[axis]`. Skipped axes emit a `canonical_axis_skipped_due_to_elimination` info-severity warning.

- **Stage 3 AI-default fallback bypassed elimination** — `synthesizeAIDefault` returned the per-axis canonical AI default (TYPE-5, VOICE-7, etc.) regardless of whether that grammar had been eliminated. When the canonical AI default IS the target of an anti-vibe (e.g., "no Inter everywhere" eliminating TYPE-5, which is also typography's AI default), the AI-default fallback re-introduced the eliminated grammar. Fixed in commit `7de5b6c` ("Phase 2.1a Task 1 batch 2 + Stage 3 elimination respect"): when canonical AI default is eliminated, walk the axis's loaded grammars to find the first non-eliminated id as fallback. `isAIDefault` predicate relaxed to drop the specific-grammar-id check (semantic of "AI-default fallback" is now grammar-id-agnostic).

**Where to check for in future work.** Any code that takes a routing combination and adds, substitutes, or fills grammars must consult `EliminatedGrammars` from Stage 2 before doing so. The check is structural: "does this code path produce a grammar id without going through Stage 2's positive-signal-then-elimination filter?" If yes, it needs the elimination-respect logic.

**Phase 3's card generator is the obvious next place to verify this discipline holds.** If the card generator independently consults the corpus for grammar details — e.g., looking up a canonical's spec to fill in card details rather than using the engine's resolved combination directly — the same bug class returns. The card generator should treat the engine's `RoutingOutput.combination` as authoritative for which grammar was selected per axis, never re-deriving from canonical specs without consulting elimination info.

**Phase 4's re-derivation worker (brand fingerprints)** could similarly re-emerge if the worker generates fingerprints by combining canonical specs without considering routing-time elimination. The worker operates offline against the corpus, not against routing signals, so anti-vibe elimination doesn't directly apply — but if fingerprint generation ever takes user input or produces synthetic briefs to test routing, the same discipline applies.

**Test harness pattern.** When verifying any new component that produces grammar selections, include test fixtures with anti-vibe signals targeting grammars the new component would otherwise produce. If the test fails because the eliminated grammar appears, the new component has the bug class.

---

## 2. Contradiction detection should operate on signal-extraction outputs, not on downstream canonical scores

**The semantic.** When a brief explicitly invokes contradictory registers (e.g., "bento-modern AI startup AND quiet-luxury Aman hospitality"), the routing engine should detect the contradiction and surface a conflict warning rather than silently picking one register. The natural place to look for the contradiction signal is in the canonical-score distribution from Stage 4 (top-1 vs top-2 scores, register-overlap between them, etc.). That assumption turns out to be wrong: downstream proxies collapse multi-register signals into single-register dominance when brand-name signals are present in the brief.

**Instance observed (Phase 2.1a Task 2):**

The fixture `fail-bento-and-quiet-luxury` has `brand_exemplars: ["Aman"]` plus `vibes: ["bento-modern AI startup", "quiet-luxury hospitality"]`. Aman's brand-name match dominates Stage 1's signal output, routing all 9 axes to canonical-1 (Luxury Hospitality) at score 1.0. Top-2 ends up being canonical-12 (Premium Editorial-Brand Hybrid, ADJACENT to canonical-1), NOT canonical-3 (Modern AI Startup, the contradictory canonical the brief invokes via "bento-modern AI startup"). The contradiction signal exists in the brief but doesn't survive to the canonical-score distribution.

A score-distribution-based detector — what was attempted at first in Phase 2.1a Task 2 — produces a score profile for `fail-bento` that's identical to a single-register Aman luxury-hospitality brief: top-1 = 1.0, top-2 = 0.889 (an adjacent canonical), no detectable contradiction. The detector either fires on legitimate canonical fixtures (false positives) or doesn't fire on contradictory briefs (false negatives) — it can't reliably distinguish the cases via canonical-score data alone.

**The corrected pattern:** for contradiction detection specifically, examine `ExtractedSignals` directly — the brief's vibes, vernacular, brand exemplars, etc. — and check for multiple-register invocation BEFORE the routing pipeline collapses the signal into a single dominant canonical. Per-vibe canonical attribution (assign each vibe phrase to its best-matching canonical based on altname matching; if multiple vibes attribute to different canonicals in different register families, surface contradiction) is one viable design.

**v0.1 ships scaffolding only.** The `canonical_scores: Array<{canonical_id, score}>` field on `CoherenceVerdict` (Phase 2.1a Task 2 commit) is real and correct — it gives downstream consumers the full canonical-score distribution. The `detectContradictoryCanonicals` function in `stage5-resolve.ts` is also in place but conservatively tuned (`CONTRADICTION_MAX_REGISTER_OVERLAP = 0`, `CONTRADICTION_TIE_RATIO = 0.95`) so it produces zero false positives. The two failure-mode fixtures (`fail-bento-and-quiet-luxury`, `fail-contradictory-canonicals`) stay in the test suite as the validation cases for the v0.2 signal-level detector.

**Pattern as cross-phase guidance:** when designing a detector that operates on routing-pipeline output, ask whether the signal you're trying to detect could be COLLAPSED by the pipeline before reaching the detector's input. Brand-name extraction in Stage 1, anti-vibe elimination in Stage 2, and rank-and-pick in Stage 3 all collapse information; downstream proxies see the collapsed view. For signals that could be collapsed (multiple registers, multiple intents, contradictory anti-vibes), prefer detectors that operate on the upstream signal layer.

**Two takeaways for future task design:**

1. Before approving a detection rule "fires when X and Y," dry-run X and Y values against target fixtures and confirm the rule would actually fire as intended. The Task 2 design should have been sanity-checked against `fail-bento`'s actual score distribution before approval; that check would have caught the score-collapse flaw before implementation.

2. The signal layer is more diagnostic than the score layer for contradictions and probably for several other detection patterns. When designing detectors, prefer signal-layer rules over score-layer rules unless there's a specific reason to operate on the downstream proxy.

---

## 3. Refinement passes should use stable upstream rankings as alignment targets, not re-derive targets from current picks

**The semantic.** Refinement passes (e.g., Stage 3b's tie-breaker, future Stage 5 enhancements) often need a "what canonical does this brief invoke" alignment target. The natural place to compute it would be from the current per-axis picks — but that propagates the arbitrary-tie sort-order effects of Stage 3a's initial ranking through the refinement, which can amplify upstream misclassification rather than correct it.

**Instance landed (Phase 2.1b Task 4a):**

The original Task 4a design computed "top canonical" from Stage 3a's initial picks, then used that target to break ties on each axis. Review caught the issue: a high-confidence non-tied axis pulling the "top canonical from initial picks" toward canonical-4 while the brief is genuinely about canonical-9 (and canonical-9's axes happen to be the tied ones) would resolve ties toward canonical-4's primaries — amplifying the original misclassification rather than correcting it.

The corrected design (commit landing Task 4a) restructures the pipeline:

```
Stage 3a (initial ranking)
Stage 4 first pass (coherence check, scores against full candidate sets)
Stage 3b (tie-break refinement using Stage 4's canonical_scores as alignment target)
Stage 4 second pass (only if Stage 3b changed anything; cheap reference equality check)
Stage 5 (resolution with refined verdict)
```

Stage 4's canonical scoring runs against the full Stage 2 candidate set per axis — not just Stage 3a's picks. So Stage 4's `canonical_scores` ranking is independent of Stage 3a's sort-order arbitrariness. Stage 3b uses that stable upstream ranking as its alignment target. Single-pass and convergent because the alignment target is stable.

**Where to check for in future work.** Any refinement pass that needs a "high-level intent" target should consult the most-stable upstream signal, not derive from current picks. Examples:

- Stage 5 enhancements that want to know "which canonical is this combination closest to" should use Stage 4's `canonical_scores`, not re-compute from Stage 5's pre-fill combination.
- Future signal-level detectors should operate on `ExtractedSignals` (the most-upstream stable representation) rather than on Stage 4's downstream score proxies.
- Phase 3's card generator, when it needs canonical context for card rendering, should use the engine's resolved `canonical_match` from `RoutingOutput` directly — not re-derive from the resolved combination.

**Same architectural class as Task 2's signal-vs-score-layer finding** ("Contradiction detection should operate on signal-extraction outputs, not on downstream canonical scores", entry 2 above). Both surface the same underlying principle: information collapses as it flows downstream through the routing pipeline; refinement passes should reach for the most-upstream stable representation that contains the signal they need.

---

## 4. The deferred-doc's category boundaries are hypotheses, not commitments

**The semantic.** The deferred-work doc (`docs/phase-2.1-deferred.md`) categorizes failing tests into Category A/B/C/D/E/F at task-planning time. Those categories are useful for initial scope estimation — but each task's upfront audit may rediscover the boundaries. Treating categorizations as commitments (locking scope to "Cat B is altname work, period") risks committing implementation effort to misclassified problem shapes.

**Instances observed across Phase 2.1:**

- **Task 1 (Cat C):** Original categorization was "anti-vibe altname spec gaps." Upfront audit found ~64% of fixture vocabulary was constructed-by-analogy rather than search-attested; methodology produced ~36% spec-amendment closures + 4 negative results. The methodology rediscovered that some "Cat C" fixtures weren't reachable through anti-vibe altnames (require positive routing instead).

- **Task 2 (Cat E):** Original categorization was "register-clash detector." Implementation review found the score-distribution proxy was the wrong layer for contradiction detection (Aman brand-name extraction dominates Stage 1, so contradictions don't survive to canonical scores). Re-categorized as v0.2 signal-level detection; v0.1 ships scaffolding only.

- **Task 4a (Cat B):** Original categorization was "altname bucket gap" + "Stage 5 fill threshold tuning." Upfront audit found Cat B failures were primarily Stage 3 tie-breaking + Stage 5 fill threshold issues, with altname coverage as a minor contributor. Re-scoped Task 4 into 4a (Stage 3 tie-breaker), 4b (Stage 5 fill behavior), 4c (genuine altname gaps). The 36% attestation prior didn't apply to most Cat B failures because the problem shape wasn't vocabulary-coverage.

**Pattern: post-Task-1 inventory verification + per-task pre-implementation audit are load-bearing for honest scope management.** Skipping the audit risks committing implementation effort to misclassified problem shapes. The audit step is where re-categorization happens — and re-categorization is the methodology working, not failing.

**Where to check for in future work.** When starting a Phase 2.1+ task or Phase 3 task with a pre-existing categorization, treat the categorization as a hypothesis. Do an upfront audit (run the affected fixtures, trace failure root causes, verify that the categorization's assumed problem shape matches reality). If the audit surfaces a different problem shape, present findings before any implementation, hold for review, then re-scope. The Task 2 lesson ("don't expand scope mid-implementation") is honored by catching the misclassification at audit time — not by forcing implementation to match the wrong category.

---

## 5. When an engine balances competing concerns, defenses with different semantic axes catch different failure modes

**The semantic.** When an engine balances competing concerns (respect specific signals vs. follow canonical patterns; respect deliberate intent vs. correct arbitrary noise), defenses with different semantic axes catch different failure modes. Single-axis defenses can be evaded by configurations they weren't designed for. Relaxing or tightening one defense without considering the other risks regression. Document each defense's semantic purpose in code so future tuning preserves the dual-axis structure.

**Instance designed and partially shipped (Phase 2.1b Task 4a / 4b):**

Stage 5's `fillAIDefaultsFromCanonical` is designed to support both:

- `CANONICAL_OVERRIDE_THRESHOLD` (per-axis confidence floor protecting deliberate-signal picks). Defends against single-axis collapse: a high-confidence pick on one axis that's deliberately non-canonical should not be overridden just because the canonical specifies something else.

- `MAX_AI_DEFAULT_FILL_THRESHOLD = 2` (total-replacement cap preventing bulk collapse). Defends against bulk-axis collapse: a brief with multiple non-canonical signal-routed picks shouldn't have all of them overridden in a single fill operation, even if each pick is individually low-confidence.

In v0.1 (Task 4b), the threshold defense isn't load-bearing — Task 4b's targets are all AI-defaulted picks, and the not-in-canonical condition was overscoped beyond actual targets (post-implementation testing showed it broke novel-but-coherent fixtures). The threshold remains documented as a future defense for cases where signal-routed-but-non-canonical picks need fill (Cases 1, 2, 3 from the Task 4 high-confidence audit, deferred to Task 4c) and for v0.2 signal-level detection. The cap defense (`MAX_AI_DEFAULT_FILL_THRESHOLD=2`) stays shipped as protection against future scope changes — if a future task adds a not-in-canonical override condition, the cap prevents it from bulk-collapsing novel signatures.

**Where to check for in future work.** When designing engine logic that mediates between two competing concerns, ask: what defense protects against single-instance violation? what protects against bulk violation? Are they orthogonal axes? If so, both deserve to be shipped (or at least documented) even if v0.1's data only exercises one. Future tuning that relaxes/tightens one defense should explicitly consider the other's semantic purpose.

---

## 6. Bucket weights reflect signal-type discriminative power, not deliberateness

**The semantic.** Stage 2's bucket weights (Turn 8 §5.2: brand 0.9, vernacular 0.7, anti_vibes 0.8, vibes 0.6, compositional_intent 0.5) reflect signal-type discriminative power, not user deliberateness. A vibe coder writing "with scrollytelling-narrative motion" is being just as deliberate as one writing "like Aman" — the signals are equally intentional, but the engine assigns different confidences because vernacular is a less specific identifier than a brand exemplar.

**Defenses that use confidence as a proxy for deliberateness will misclassify novel-but-coherent fixtures whose deliberate signals happen to be vernacular-weighted.** A confidence threshold drawn between the brand and vernacular buckets (e.g., 0.85, separating brand-bucket-routed picks at 0.9+ from vernacular-bucket-routed picks at 0.7) can be evaded in either direction:

- Threshold above 0.7: a deliberate vernacular signal at 0.7 looks the same as an arbitrary bucket-match at 0.7. Both fall below the threshold; both are treated as "not deliberate."
- Threshold below 0.7: deliberate vernacular signals are protected, but so are accidental low-conf bucket-matches. Both look "deliberate."

**Instance observed (Phase 2.1b Task 4b):**

The `not-in-canonical + confidence-floor` shouldFill design tested during Task 4b broke 8 novel-but-coherent fixtures whose deliberate vernacular signals (typically 0.6–0.7 confidence) couldn't be distinguished from arbitrary bucket-match wrong-strong picks (typically 0.9+ confidence) by any confidence threshold. The fix was to drop the confidence-axis defense entirely and rely on AI-default-only fill in v0.1; high-confidence wrong-strong picks defer to Task 4c (altname coverage / spec consistency work) where the question becomes structural rather than confidence-based.

**Where to check for in future work.** v0.2 signal-level detection should treat all signal types as equally deliberate when present in the brief, regardless of bucket weight. Concrete implication: per-vibe canonical attribution (the v0.2 contradiction-detector design noted in entry 2) should iterate over `signals.vibes` and `signals.vernacular` and `signals.brand_exemplars` with equal weight when checking "did the brief explicitly invoke this canonical," even though Stage 2 weights them differently for ranking purposes. Same architectural class as Task 2's signal-vs-score-layer finding: the engine's information layer (confidence values, score distributions) doesn't reliably reflect brief intent at the granularity we want to discriminate.

**Generalizes beyond Stage 5.** Any future component that needs to distinguish "deliberate non-canonical signal" from "arbitrary bucket-match win" should either:
- Operate on signal-bucket presence rather than confidence values (binary "is signal present in brief" rather than "is confidence high"), or
- Reach for a different signal entirely (e.g., signal text matching specific spec phrases, or evidence-count thresholds with signal-type diversity requirements).

The two architectural patterns from Phase 2.1b (entry 3's stable-upstream-rankings, entry 6's confidence-vs-deliberateness) both flag specific instances where the engine's information layer disagrees with what we want to discriminate. v0.2 signal-level detection inherits both findings.

---

## 7. Brand-surface conflation: brands operate across multiple surfaces with different design vocabularies

**The semantic.** Brands frequently operate across multiple surfaces with different design vocabularies (marketing site, app interface, documentation, editorial publications). The same brand name routes to different grammars depending on which surface the brief invokes. Substring-based altname matching cannot distinguish "the user invoked the brand generically" from "the user invoked a specific surface."

**Examples observed:**

- **Linear:** marketing voice (linear.app) is plausibly Friendly Expert (VOICE-3) — friendly tone, conversion-oriented copy. App voice (interface labels, action verbs, error messages) is Direct Professional (VOICE-4) — minimal, action-oriented, no fluff. The same `"Linear"` signal in a brief substring-matches `"like Linear marketing"` in VOICE-3 even when the brief is about Linear's app interface, and substring-matches `"like Linear app"` in VOICE-4 even when the brief is about Linear's marketing site. Stage 2's bidirectional substring matching can't distinguish the two surfaces by signal text alone.

- **Apple:** iOS app interface IS Mobile Thumb-Zone (RP-6) — accurate attestation. iPhone product MARKETING page is Z-Pattern (RP-2) — different surface, different reading pattern. The same `"Apple"` signal substring-matches `"like Apple's iOS"` in RP-6 even when the brief is about Apple's marketing surface; can't disambiguate without surface-specific signal extraction.

- **Stripe:** marketing voice / typography (stripe.com using Söhne) is one surface; Stripe Press (editorial publication using Tiempos) is another; Stripe support (Friendly Expert helpdesk voice) is a third. Same brand, three surfaces, three different grammar placements legitimately.

**v0.1 mitigation: keep altnames accurate.** Substring-match collisions are Stage 2 deficiencies, not altname errors. Don't mutilate accurate altnames to work around the matching algorithm — the altname `"like Apple's iOS"` is correct attestation for RP-6 (Apple's iOS genuinely IS Mobile Thumb-Zone); rephrasing it to `"like iOS apps"` to dodge the brand-substring match would be a tactical workaround that papers over the real issue while losing attestation precision. Similarly, the altname `"like Linear marketing"` in VOICE-3 stays — it's correct for Linear's marketing surface — and the Phase 2.1b Task 4c amendment ADDS `"like Linear app"` to VOICE-4 alongside it, leaving the brand-surface disambiguation to Stage 3b's tie-breaker (Task 4a) which prefers the canonical-aligned candidate when ties exist.

**v0.2 fix: Stage 2 matching should treat brand-exemplar altnames as whole phrases, not substring-matchable tokens.** Multi-surface brands then need surface-specific altnames in their respective grammars (e.g., `"like Linear app"` in VOICE-4 alongside `"like Linear marketing"` in VOICE-3) with whole-phrase matching ensuring surface-specific signals route correctly. The signal `"Linear"` (bare brand) wouldn't substring-match `"like Linear marketing"` under whole-phrase rules; only signals like `"Linear marketing site"` or `"Linear's app"` would route precisely. This requires either (a) Stage 1 signal extraction to surface-tag brand mentions ("Linear in marketing context" vs "Linear in app context"), or (b) Stage 2 matching to require multi-word phrase overlap rather than single-token substring.

**Where to check for in future work.** When auditing or amending brand altnames in v0.1, leave the altnames accurate rather than rephrasing for substring-match avoidance. v0.2 work that touches Stage 2 matching should design with brand-surface disambiguation as a first-class concern. Phase 3's card generator should treat brand resolution as multi-surface aware: cards generated for a brief invoking "Apple's iPhone marketing" should not pull mobile-thumb-zone reading-pattern conventions from RP-6 even though Apple appears in RP-6's brand exemplars.

**Same architectural class as entries 2, 3, 6** — engine information layer doesn't reliably reflect brief intent at the granularity we want to discriminate. Four architectural patterns from Phase 2.1's iteration (entry 2 signal-vs-score, entry 3 stable-upstream, entry 6 confidence-vs-deliberateness, entry 7 brand-surface) all flag specific instances of the same underlying gap; v0.2 signal-level detection design inherits all four findings.

---

## 8. AI-default overlap doesn't reflect deliberate signal

**The semantic.** Stage 4's canonical-overlap score (`register_coherence_score`) counts BOTH signal-routed direct matches AND AI-default fallback matches as overlap. This is intentional for the lenient register-coherence view that Stage 5 uses to fill un-signaled axes from a canonical the brief invokes ("feel like X" sparse-intent fixtures depend on it). But it has a perverse consequence for Cat A disambiguation: canonicals whose specs ARE the AI defaults (CANONICAL-4 Standard SaaS Marketing is the worst offender — it's TYPE-5 / COLOR-8a / COMP-2 / MOTION-3 / IMG-7 / DEN-3 / VOICE-7 / RP-2 with LAYOUT-4a, every axis the engine's Stage 3 fallback) ALWAYS score a lenient 8/9 or 9/9 against any sparse brief, because the brief's AI-default-fallback picks "match" the canonical's AI-default specs. They beat canonicals with deliberate signal alignment in tied score comparisons even when the deliberate signal is what should anchor the routing decision.

**Examples observed (Phase 2.1b Task 6a):**

- **novel-saas-quiet-authority** (the empirical confirmation that confSum is bucket-weight noise): brief signals B2B SaaS marketing (LAYOUT-1 via "B2B enterprise SaaS"; COLOR-8a via "single-accent palette") + anti-vibes against VOICE-7. Stage 4 canonical_scores: top-4 tied at score=0.889 (8/9 overlap), each with directMatch=1 — canonical-1 (Luxury Hospitality) has LAYOUT-1 in its alts; canonical-4 (Standard SaaS Marketing) has COLOR-8a in its alts; canonical-11 and canonical-12 each have one alt-match. The lenient overlap score is identical because every other axis is AI-defaulted to a grammar that matches each canonical's spec via the AI-default conflation. The directMatch counts (1 each) tie. An early Task 6a draft used directConfidenceSum as a tertiary tie-breaker; it picked canonical-4 (0.700 from COLOR-8a vernacular weight) over canonical-1 (0.600 from LAYOUT-1 vibes weight). Stage 5 then snapped LAYOUT-1 → LAYOUT-4a (canonical-4's spec), producing a "perfect" register_coherence_score of 1.0 — the trivial-fill artifact, not a real canonical match. The fixture is novel-but-coherent and SHOULD route to a low-confidence novel state. Per architectural-patterns.md entry 6, bucket weights reflect signal-type discriminative power, NOT deliberateness — so confSum-as-tie-breaker discriminates by bucket weight rather than by the deliberate-signal axis the tie-breaker is meant to capture. The Task 6a checkpoint dropped confSum from the sort hierarchy in response. confSum stays computed and surfaced on each score record (v0.2 scaffolding for downstream consumers) but is not used as a discriminator.

- **editorial-magazine-intent / cause-journalism-intent:** sparse intent-path briefs with zero signal-routed picks. Every canonical's overlap score is 1.0 (every axis is AI-defaulted, every canonical's spec is "matched" via AI-default-conflation). Top-K canonicals all have directMatch=0, confSum=0 — the tie-breaker cannot differentiate any of them; the engine selects iteration-order top-1 (canonical-1 Luxury Hospitality) regardless of brief intent. routing_ambiguous fires but the canonical_match is silently committed.

- **The Cat A misroute pattern:** `saas-marketing-brand` routes to canonical-3 (Modern AI Startup) instead of canonical-4 (Standard SaaS Marketing) because canonical-3 has more directMatches (4) than canonical-4 (3). Stage 4 IS preferring signal-routed alignment in this case — the engine's pick is signal-correct relative to the brief's actual signals (Stripe / Webflow / hero / three-column features lean modernist). The fixture's expected canonical-4 reflects a fixture-design choice that doesn't survive contact with the engine's signal routing. Tie-breaker doesn't help here because the directMatch counts aren't tied — the issue is upstream in Stage 1/2 signal interpretation or in fixture expected-grammar choices.

**v0.1 mitigation: directMatch tie-breaker + routing_ambiguous warning.** Sort canonical_scores by overlap → directMatch count descending. Stable sort preserves canonical_combinations iteration order on residual ties (overlap and directMatch both equal). When top-1 vs top-2 tie at both levels and top-1 is above the 6/9 register-coherence threshold, set `routing_ambiguous=true` so route() surfaces an `info`-severity `routing_ambiguous` warning. The warning lets consuming AI tools ask the user a clarifying question rather than committing arbitrarily.

This is tactical — it doesn't change the underlying scoring; it just adds directMatch as a deliberate-signal proxy in the ranking and surfaces residual ambiguity. It does NOT close the AI-default-overlap bypass: canonicals whose specs ARE AI defaults still claim 1.0 register_coherence_score after Stage 5 fills un-signaled axes (because their specs match the AI-default fills trivially). The tie-breaker as shipped closes zero v0.1 fixtures because the actual Cat A failure patterns either (a) don't have ties at the overlap level (one canonical clearly outscores the others on the brief's signals), or (b) have ties that also tie on directMatch (so the deliberate-signal tie-breaker is inert). Task 6a's value is the architectural scaffolding (canonical_scores metadata for v0.2) and routing_ambiguous warning, not closure delta.

**v0.2 fix path: signal-routed-axes-aware overlap score.** Restructure `register_coherence_score` to use `directMatchCount / signalRoutedAxesCount` rather than `(directMatch + AI-default-match) / 9`. This denominates by the axes the brief actually signaled, so canonicals that ride on AI-default-overlap don't get rewarded for "matching" axes the brief never spoke to. Worked example (novel-saas-quiet-authority): brief signal-routes 2 axes (LAYOUT-1, COLOR-8a). Canonical-1's directMatchCount=1 (LAYOUT) → 1/2 = 0.5. Canonical-4's directMatchCount=1 (COLOR) → 1/2 = 0.5. Both score 0.5; neither hits the 6/9 register-coherence threshold; Stage 5 doesn't fill from either; the brief routes as novel — which is correct. Canonical-1 vs canonical-4 still tie, but at a level below the snap-trigger threshold so neither AI-default-collapses the routing.

The v0.1 deferral is principled: implementing v0.2's denominator change requires recalibrating downstream thresholds (REGISTER_COHERENCE_AXIS_THRESHOLD, the 0.85 min_confidence floor, the 6/9 fill trigger) since the score distribution changes shape. Phase 2.1's scope was Stage-level surgery on a stable scoring base; the denominator change is a v0.2 architectural shift.

**Where to check for in future work.** When investigating a "perfect canonical match" (conf=1.0) on a sparse-signal brief, check directMatchCount before trusting the score. A canonical with score=1.0 but directMatchCount<2 is almost certainly an AI-default-overlap artifact, not a real register coherence finding. The Stage 5 fill / snap pipeline should treat low-directMatch high-overlap canonicals with suspicion: the lenient overlap is a fill-eligibility signal, not a "this is the right canonical" signal. v0.2's score restructure makes this explicit; v0.1 consumers should look at directMatchCount alongside register_coherence_score when interpreting routing output for confidence calibration.

**Same architectural class as entries 2, 3, 6, 7** — engine information layer doesn't reliably reflect brief intent at the granularity we want to discriminate. Five architectural patterns from Phase 2.1's iteration (entry 2 signal-vs-score, entry 3 stable-upstream, entry 6 confidence-vs-deliberateness, entry 7 brand-surface, entry 8 AI-default-overlap) flag specific instances of the same underlying gap. v0.2 signal-level detection + score-restructure design inherits all five findings.

---

## 9. Register-adjacent canonicals have low maximum swing per altname amendment

**The semantic.** Two canonicals are *register-adjacent* when they share ≥6 of 9 axis specs. Their lenient overlap scores against any brief that routes to their shared axes will be close — typically within one axis (0.111 score delta), reflecting the single differential axis. Single-altname amendments produce at most +0.111 swing per amendment (one axis flips from `unsignalled` or `signal-mismatch` to `signal-routed match` for one canonical). Flipping routing between two register-adjacent canonicals at the same overlap score requires +0.222 — which means single-altname amendments structurally cannot disambiguate them. Coordinated multi-axis amendments are required, OR the underlying scoring needs to change (per entry 8's v0.2 path), OR signal-level disambiguation needs to operate before scores collapse (per entry 2's pattern).

**Examples observed (Phase 2.1b Task 6b audit):**

- **editorial-longform-vibes:** routes to canonical-14 (Cause / Journalism / Mission-Driven) at score 1.000 / direct=4 instead of canonical-10 (Editorial Long-Form Substack/Stripe Press) at 0.889 / direct=3. canonical-14 and canonical-10 share layout, color, density, reading_pattern, voice (canonical-10 voice is Editorial Considered, canonical-14 voice is Mission-Earnest — see the Mission-Earnest unresolvability note in altname-coverage-notes.md). The differentiators are typography (canonical-10 has TYPE-1/TYPE-3, canonical-14 has TYPE-1/TYPE-3 — same; not actually a differentiator), motion (canonical-10 = MOTION-1/MOTION-2; canonical-14 = MOTION-2/MOTION-6), imagery (canonical-10 = IMG-1/no imagery; canonical-14 = IMG-3). Two genuine differential axes. Required swing to flip: +0.222. Maximum amendment swing per axis: +0.111. Two coordinated attestations required, both for grammars that don't naturally route from the brief's signals ("essay style", "thoughtful blog", "engaged committed reader" don't authentically attest as "MOTION-1 restrained-atmospheric" or "IMG-1 editorial-photography"). v0.1 unfixable through search-first methodology.

- **editorial-brand-hybrid-brand:** routes to canonical-2 (Editorial Magazine) at score 1.000 / direct=6 instead of canonical-12 (Premium Editorial-Brand Hybrid / Soho House Tier) at 0.889 / direct=5. canonical-2 and canonical-12 share typography, color, component, motion, imagery, density. Differentiator is layout (canonical-2 = LAYOUT-2 only; canonical-12 = LAYOUT-1 only — though spec text reads "Editorial-Grid Magazine + Vertical-Rhythm Editorial sections" suggesting both should be in canonical-12's spec; corpus loader assigned only LAYOUT-1). Required swing +0.222 reachable via spec amendment (add LAYOUT-2 to canonical-12 alts) PLUS altname amendment (route brief's voice to VOICE-1 Quiet Authority via "Soho House" → VOICE-1 brand_exemplars). Two coordinated amendments — one spec-consistency, one altname. Deferred to v0.2 spec-consistency audit pass per Branch 2 framing.

- **cause-journalism-vibes:** routes to canonical-2 / canonical-10 tied at 0.889 / direct=5 instead of canonical-14 at 0.667 / direct=3. canonical-14 voice is Mission-Earnest which is in the corpus-loader's KNOWN_UNRESOLVABLE allowlist (see altname-coverage-notes.md) — voice axis cannot be flipped because the grammar doesn't load. With one of the three potential differentiator axes unfixable, only two remain (layout, imagery), each worth +0.111 — not enough to clear the +0.222 gap. v0.1 unfixable.

**v0.1 implication.** Fixtures whose expected and current canonicals are register-adjacent are not closeable through Task-1-style search-first altname methodology. The audit-first discipline (Task 6b's score-delta column pattern) catches this BEFORE search effort: when the per-fixture audit shows that the X-vs-Y differential axes number ≤ (required-delta / max-swing-per-amendment), defer to v0.2 with structural-hardness rationale rather than spending search effort on amendments that cannot collectively close the fixture.

**v0.2 fix paths:**

- **(a) Signal-level disambiguation** (per entry 2's pattern): operate on brief signals BEFORE Stage 4 score collapse. A brief that signals "essay style" + "engaged committed reader" + "long-form" + "drop caps" is signal-level-distinct from "documentary" + "photojournalism" + "cause-driven", but Stage 4's lenient overlap collapses both into editorial register. v0.2 signal extraction should flag these distinct register-adjacent intents and pass disambiguation context to Stage 4.
- **(b) Coordinated multi-amendment passes** that target multiple axes simultaneously, accepting that Sub-B audit becomes O(amendments) per fixture rather than O(1). This shifts altname work from "per-phrase search" to "per-fixture coordinated package" — methodologically heavier, but tractable for high-value fixtures.
- **(c) Entry-8 score restructuring** that makes signal-routed evidence weight more than overlap-based evidence. Combined with whole-phrase brand-exemplar matching (entry 7's v0.2 fix), the score signal should better reflect the brief's actual register intent rather than its AI-default-fallback shape.

**Where to check for in future work.** When auditing a Sub-B candidate, count the differential axes between current routing and expected canonical. If `differential_axes × max_amendment_swing < required_delta`, the fixture is register-adjacent-unfixable in v0.1 and should be deferred with a coverage-notes entry. The v0.2 audit redo can re-evaluate against the restructured score.

**Same architectural class as entries 2, 3, 6, 7, 8** — engine information layer doesn't reliably reflect brief intent at the granularity we want to discriminate. Six architectural patterns from Phase 2.1's iteration (entry 2 signal-vs-score, entry 3 stable-upstream, entry 6 confidence-vs-deliberateness, entry 7 brand-surface, entry 8 AI-default-overlap, entry 9 register-adjacency) all flag specific instances of the same underlying gap. v0.2 design inherits all six findings.

---

# Altname Coverage Notes — Negative Results from Search-First Audits

This file records cases where the Phase 2.1 altname-amendment methodology surfaced **negative results** — phrases that aren't well-attested as user vocabulary in design-community sources, where the practical implication is "fixture is wrong, not spec, but in some cases the fixture's intent isn't reachable through anti-vibes alone." Future contributors hitting the same questions can save the search and follow the documented practical path instead.

Methodology reference: search-first attestation per the Phase 2.1a kickoff (Reddit r/web_design, design-community Substacks, AI Slop catalogs from 925Studios + Monet, NN/G, Brutalist Web Design Manifesto, etc.). Multiple corroborating sources required for spec amendments.

---

## 1. COMP-4 (Pill-and-Cushion) avoidance via anti-vibes

**Question.** A fixture (`anti-beauty-not-glossier-cliche`) wanted to test that a brief saying "no Glossier clichés" routes the engine away from COMP-4 (Pill-and-Cushion components, the wellness-DTC default).

**Searched (May 2026).**
- `"Glossier-coded"` / `"Glossier-cliche"` — only appears in business-strategy articles ABOUT Glossier (Double V Consulting, BlueTickSocial, HBS), not as design-community vocabulary
- `"post-Glossier"` / `"anti-Glossier"` — appears in industry analysis (Cosmetics Business, Robin Report, Glossy podcasts) but not as standalone vibe-coder rejection phrases
- `"Glossier softness"` / `"Glossier sweetness"` / `"clean girl rejection"` — search returns Glossier critique articles (TheBubble, TFR, Varsity, Lemon8) framing the rejection in terms of *classism*, *exclusivity*, *effortlessness pretense*, and *product quality* — not as design-rejection vocabulary about pill-button components specifically
- `"rounded-2xl"` / `"pill button rejection"` / `"every startup pill"` — pill buttons are positively described in design-community sources (high-tech-renew, Cloud Four, Flux UI, Dribbble); critique vocabulary doesn't exist

**Negative result.** No attested anti-vibe vocabulary exists for "pill component as wellness-DTC cliché" rejection.

**Practical path.** Positive routing toward COMP-1 (Typographic-Discreet) or COMP-5 (Sharp-Geometric) via the brief's positive signals ("considered consumer beauty for grown-ups", premium register vibes, Aesop-/Le Labo-tier exemplars) is the practical way to route a brief away from COMP-4. Anti-vibe additions can't do this work in v0.1's vocabulary.

**Action taken.** Fixture revised to drop COMP-4 from `must_avoid`; only COLOR-6 avoidance retained (which IS closeable via attested "no millennial pink" anti-vibe).

---

## 2. VOICE-7 (Conversion-Punchy) avoidance from personal-blog briefs

**Question.** A fixture (`anti-blog-no-decoration`) wanted to test that a personal-blog brief saying "no marketing copy" routes away from VOICE-7 (the SaaS-marketing AI-default voice).

**Searched (May 2026).**
- `"no marketing copy"` / `"anti-marketing copy"` — search returns articles on "minimalist marketing strategy" (CopyPress, ZoomSphere, Medium/IIT-BHU, Winsome Marketing) — not literal user-typed rejection vocabulary
- `"no flashy components"` / `"no fancy components"` — concept attested in personal-blog/no-frills WordPress theme contexts (Astra, Minimalistique, ThemeForest), but the literal phrasing doesn't appear in design-community sources

**What IS attested for VOICE-7-adjacent rejection.**
- `"AI slop"` — well-attested as a 2025-2026 critique concept (Merriam-Webster's 2025 word, 925Studios catalog, Monet catalog, Wikipedia, Euronews). Specifically targets AI-generated content / cliché copy
- `"Build the future of work"` / `"Your all-in-one platform"` / `"Scale without limits"` — explicitly named by 925Studios as canonical AI-cliché copy phrases

**Negative result for THIS fixture.** The 925Studios attested phrases describe rejection of AI-generated cliché copy, not personal-blog-vs-marketing register. The fixture's brief context is human-written personal blog vs. SaaS-marketing pages; the AI-vs-human framing doesn't fit. Compositionally extending the attested phrases to fit ("not for personal blog", "no marketing voice") would be methodology-stretch, not search-attested.

**Practical path.** Positive routing toward VOICE-2 (Editorial Considered) or VOICE-4 (Direct Professional) via the brief's positive signals ("the writing is the experience", "personal blog", Document/Prose register) is the practical way to route a brief away from VOICE-7 in personal-blog contexts. For AI-default-rejection contexts specifically, "AI slop" / 925Studios cliché phrases ARE the right amendment target — see the future audit when an AI-rejection fixture surfaces.

**Action taken.** Fixture revised to drop VOICE-7 from `must_avoid`; only COMP-4 avoidance retained (closeable via attested "no decoration" anti-vibe).

---

## Pattern across both negative results

Both cases share a structural shape: the fixture attempted to test multi-grammar anti-vibe coverage with vocabulary that's attested for one of the targets but not the others. The methodology-consistent response is to **narrow `must_avoid` to the attested-coverage subset** and route the un-closeable grammars away through positive-signal mechanisms instead.

This is a Phase 2.1 finding, not a v0.2 spec gap per se: the spec deliberately doesn't have anti-vibe vocabulary for every conceivable rejection direction, and not every rejection a fixture might want to test is closeable through anti-vibes. The honest outcome is to test what's testable through attested vocabulary; the rest is engineering work for positive-signal routing improvements (Category B in the Phase 2.1 deferred doc).

---

## 3. Stage 5 fill bypassing Stage 2 anti-vibe elimination (resolved)

**Question.** During the May 2026 audit of Category C fixtures, two amendment-and-revision rounds (`anti-beauty-not-glossier-cliche` + COLOR-6, `anti-brutalist-softer-than-gumroad` + COLOR-5) shipped well-attested anti-vibe altnames per methodology — but the fixtures still failed because the engine returned the eliminated grammar in its routing output anyway.

**Investigation.** Stage 2 was correctly omitting anti-vibe-matched grammars from its candidate output (debug-traced: COLOR-6 absent from candidates after `"no millennial pink"` signal). Stage 5's `fillAIDefaultsFromCanonical` was then iterating `canonical.axis_mappings`, seeing that the canonical's primary didn't match the current pick, and synthesizing a new candidate from canonical specs — never checking whether the to-be-filled grammar had been eliminated by Stage 2. `trySnapToCanonical` had the same bypass.

**Spec semantic violated.** Turn 8 §5.2 weights anti-vibes at 1.5× explicitly because they "eliminate more grammars" — that weighting is meaningless if Stage 5 silently re-introduces eliminated grammars. The bug contradicted the routing logic the spec stated, not just test fixture expectations.

**Fix landed in commit [hash placeholder, fill in post-commit].** Stage 5 now respects elimination: `fillAIDefaultsFromCanonical(combination, verdict, corpus, eliminated)` and `trySnapToCanonical(combination, canonicalId, corpus, eliminated)` skip axes where the canonical's primary AND every alternative are in `eliminated[axis]`. When skipped, the axis stays at its Stage 3 secondary pick (or AI-default if no secondary survived); a `canonical_axis_skipped_due_to_elimination` info-severity warning surfaces in `open_warnings` so consumers see the skip explicitly.

**Methodology implication.** Anti-vibe spec amendments are now validatable end-to-end via the test suite from this point forward. Before the fix, well-attested anti-vibes could pass Stage 2 but fail to close fixtures due to engine architecture, which would have produced false-negative methodology signals — a methodology-correct amendment looking like a methodology-failed amendment. The methodology was sound; the engine had a bug; the bug was fixed; the methodology produced its intended value. Future contributors auditing anti-vibe altnames should not interpret "fixture didn't close after amendment" as "vocabulary wasn't really attested" without first verifying the elimination-respect logic is still in place.

**Multi-category audit.** The fix also closed two adjacent fixtures (`anti-beauty` + `anti-brutalist`) that had landed amendments earlier in the same session. It did NOT close fixtures in Categories A, B, or D — the bug was Cat-C-specific in terms of which fixtures it was blocking, even though the underlying issue was an architecturally significant violation of spec semantics.

---

## 4. Anti-bento-rejection-vocabulary (LAYOUT-3a/3b/3c bento-grid avoidance)

**Question.** A fixture (`anti-hotel-not-bento`) wanted to test that a brief saying "not a bento grid" routes the engine away from LAYOUT-3a (Marketing-Bento), LAYOUT-3b (Dashboard-Bento), and LAYOUT-3c (Editorial-Bento).

**Searched (May 2026).**
- `"bento grid" backlash` / `"bento grid" critique` / `"every startup uses bento"` — concept attested via Creative Boom ("10 trends creatives are so over in 2026"), multiple 2025/2026 design-trend articles ("Suddenly, every portfolio and SaaS landing page looked like a Japanese lunch box. The Bento Grid had taken over." / "rigid, static boxes of yesteryear are breaking open"). Bento-grid-overuse is recognized as a trend-fatigue topic.
- `"no bento"` / `"anti-bento"` — the literal rejection-form phrasing isn't directly quoted as designer vocabulary in any source. Search returns positive bento-grid template inspiration and trend-prediction articles, not rejection vocabulary.

**Negative result.** The bento-grid-overuse CONCEPT is attested but the specific rejection-form vocabulary ("no bento grid", "not a bento grid") isn't. Unlike `"no millennial pink"` (which DOES appear quoted as user vocabulary in design-beauty publications), the bento-rejection vocabulary is at the publication-acknowledgment-of-fatigue level only, with no convergent quote of a user-facing rejection phrase.

**Practical path.** Positive routing toward Luxury Hospitality canonical (LAYOUT-1 Vertical-Rhythm Editorial) via the brief's positive signals — `"boutique hotel"`, `"hospitality first"`, `"a place to stay"`, `"hospitality"` domain — is the practical way to route a hospitality brief away from bento layouts. The fixture was converted from anti-vibe-driven test to a pure positive-routing test in Phase 2.1a Task 1.

**Action taken.** Fixture revised to drop all anti-vibes; `must_avoid` cleared; the test now verifies the engine's positive-routing path.

---

## 5. Anti-conversion-stack-rejection-vocabulary (LAYOUT-4a avoidance)

**Question.** Two fixtures (`anti-saas-not-saasy`, `anti-blog-no-decoration`) wanted to test that a brief saying "not SaaS-y" / "not a YC-template clone" / "no marketing copy" / "not pushy with CTAs" routes the engine away from LAYOUT-4a (Conversion-Stack, the SaaS landing page default).

**Searched (May 2026).**
- `"not SaaS-y"` / `"not SaaSy"` — "SaaSy" exists as a positive label (Stay SaaSy blog). The rejection form isn't attested as design-community vocabulary. Same shape as fixture 1's `"Glossier-coded"` finding: the positive label exists, the rejection-form phrasing doesn't.
- `"not a YC-template clone"` — fixture-coined. No corroborating source quotes this phrase or close variant.
- `"no marketing copy"` / `"anti-marketing copy"` — search returns articles on "minimalist marketing strategy" but not literal user-typed rejection vocabulary. The CONCEPT (anti-marketing minimalism) is attested but the rejection-form phrase isn't.
- `"not pushy with CTAs"` — fixture-coined; descriptive prose.
- Homogenized-design critique IS attested (Medium/Sabharwal "When Everything Starts to Look the Same"; Sessions College "Homogenization in Design"; "tactile rebellion" 2026 design-trend coverage), but as concept-level critique not as anti-vibe rejection vocabulary targeting Conversion-Stack specifically.

**Negative result.** No attested anti-vibe vocabulary exists for "Conversion-Stack landing page rejection." Even though Conversion-Stack IS broadly recognized as the homogenized SaaS-landing-page default, the rejection-form vocabulary that specifically targets the LAYOUT axis (rather than VOICE-7 cliché copy or TYPE-5 Inter default) hasn't surfaced as a user-typed phrase in design-community sources.

**Practical path.** Positive routing toward alternative layout grammars via the brief's positive signals (e.g., `"personal blog"` + `"the writing is the experience"` → LAYOUT-8 Document/Prose; `"boutique hotel"` → LAYOUT-1 Vertical-Rhythm Editorial). Anti-vibe rejection of LAYOUT-4a from these contexts isn't reachable; the brief's other signals (TYPE-5 / COLOR-7 / VOICE-7 cliché rejection) ARE reachable and may incidentally route away from canonicals that have LAYOUT-4a as primary, providing partial coverage.

**Action taken.** `must_avoid` narrowed in two fixtures to drop LAYOUT-4a: `anti-blog-no-decoration` (Phase 2.1a batch 1) narrowed to `["COMP-4"]`; `anti-saas-not-saasy` (Phase 2.1a batch 2) narrowed to `["TYPE-5", "COLOR-7"]` (with COLOR-7 added per the explicit purple-to-blue-gradient signal in the brief).

---

## Altname form principle (anti-vibe bucket)

**Question.** Spec amendments add altnames in two distinct shapes — `"no millennial pink"` (rejection form) versus `"Build the future of"` (cliché form). Future contributors auditing the spec might wonder why some altnames are negation-shaped and others aren't.

**Principle.** Ship altnames in the form the source attestation quotes. If a published critique quotes the rejection form (`"no millennial pink"` — Glossy.co, BoF, Substack design newsletters quote this form), that ships. If a published critique quotes the cliché form itself (`"Build the future of work"` — 925Studios catalog explicitly names this as canonical AI-cliché copy), that ships.

**Mechanical correctness.** Stage 2's bidirectional substring matching (`matchesAltname` in `src/routing/matching.ts`) handles both forms cleanly: a brief with a rejection-form signal (`'no "Build the future of" hero'`) matches against a cliché-form altname (`"Build the future of"`) when the cliché phrase is contained in the signal phrase. Equally, a brief with a rejection-form signal (`"no millennial pink"`) matches a rejection-form altname of the same phrase via equal-after-normalization. Both forms work.

**The form choice is principled, not stylistic.** Don't reach for the rejection form when attestation gives the cliché form, or vice versa, just because the bucket "feels" like it should be all one shape. Following attestation keeps the spec grounded in observed user vocabulary instead of constructed-by-pattern phrases. Source comments should make the form choice traceable: "altname form is rejection form because attestation quotes this form" or "altname form is cliché form because attestation quotes the cliché itself."

**Examples currently shipped:**

| Grammar | Altname | Form | Attestation source-form |
|---|---|---|---|
| COLOR-6 | `no millennial pink` | rejection | Substack/Glossy.co quote rejection form |
| COLOR-6 | `millennial pink is dead` | rejection (publication-headline) | Glossy.co article title |
| COMP-4 | `no decoration` | rejection | Brutalist Web Design Manifesto critiques the concept; rejection form follows naturally |
| COLOR-5 | `less aggressive` | rejection (concept) | NN/G + design pubs use "aggressive" as the critique vocabulary |
| TYPE-5 | `no Inter everywhere` | rejection | 925Studios + 5+ sources call out Inter-as-AI-default; rejection form natural |
| COLOR-7 | `no purple-to-blue gradients` | rejection | 925Studios + dedicated articles on purple gradient critique |
| VOICE-7 | `Build the future of` | cliché | 925Studios catalog quotes the cliché form as canonical AI hero copy |
| VOICE-7 | `Trusted by thousands` | cliché | Medium/LaunchInTen quotes the exact cliché phrase |
| VOICE-7 | `Get started in 2 minutes` | cliché | Medium/LaunchInTen + Unbounce/Wearetenet SaaS CTA surveys |

---

## Future contributors

When Phase 2.1+ work surfaces a similar question — "what attested anti-vibe vocabulary eliminates grammar X?" — check this file first. If the question's already answered as a negative result, follow the practical path noted; don't repeat the search. If the answer changes (new attested vocabulary surfaces in design-community sources, the spec adds positive-signal routing that makes anti-vibes unnecessary, etc.), update the entry rather than adding a duplicate.

**Aggregate methodology results across Task 1 (six fixtures, ~25 anti-vibe phrases):**
- ~9 well-attested → spec amendments with source citations
- ~16 fixture-coined → dropped or replaced
- 4 negative results logged: COMP-4 wellness-DTC pill avoidance, VOICE-7 personal-blog rejection, anti-bento layout avoidance, anti-conversion-stack layout avoidance

Roughly 36% of the original fixture vocabulary survived per-phrase attestation. That's the honest measure of how much Phase 2 fixture vocabulary was constructed-by-analogy versus search-attested. Useful data point for v0.2 retrospective and for future contributors who might assume fixture vocabulary is a reliable proxy for user vocabulary — it isn't, by a 2:1 margin.

---

## 6. High-confidence wrong-strong picks deferred from Task 4b to Task 4c

**Question.** During Phase 2.1b Task 4b's pre-implementation verification, three Cat B fixtures had failing axes with confidence ≥0.85 — distinct from the AI-defaulted picks Task 4b's fill behavior was scoped to address. Task 4b deferred these to Task 4c with corrected diagnoses.

**The three cases.**

**Case 1: `application-ui-brand/voice` — VOICE-3 conf=0.900, expected VOICE-4.**

Evidence: `"like Linear marketing"` matches brand "Linear" in VOICE-3's brand_exemplars. But the brief is about Linear-as-APPLICATION (B2B dashboard), not Linear-as-MARKETING. The 0.90 confidence is attributable to a misleading altname placement: Linear's marketing voice IS in VOICE-3 (Friendly Expert), but the brief invokes Linear-as-app context where canonical-9's VOICE-4 (Direct Professional) is correct.

**Diagnosis: altname coverage issue.** The `"like Linear marketing"` altname in VOICE-3 conflates Linear-the-product (app) with Linear-the-marketing-voice — different surface areas of the same brand. Per attestation methodology, this is a candidate for altname surgery: either remove `"like Linear marketing"` from VOICE-3 (if Linear's marketing voice attestation is weak) or add disambiguating altnames to VOICE-4 ("application UI voice", "B2B SaaS app voice") so that brief signals targeting application context route to VOICE-4 with stronger confidence.

**Practical path (Task 4c).** Search-first methodology: verify Linear's marketing voice IS Friendly Expert per attested coverage; verify Direct Professional / VOICE-4 has adequate B2B-app altname coverage. Surgery accordingly.

---

**Case 2: `editorial-longform-brand/typography` — TYPE-2 conf=0.900, expected [TYPE-1, TYPE-3].**

Evidence: `"like Stripe Press (Tiempos throughout)"` matches brand "Stripe Press" in TYPE-2's brand_exemplars. TYPE-2 = Single-Family Discipline. Stripe Press literally uses Tiempos throughout — TYPE-2 IS what Stripe Press is, typographically. The 0.90 is genuine deliberate signal.

But canonical-10 (Editorial Long-Form / Substack-Stripe Press) lists Stripe Press as a brand exemplar AND specifies typography as `[TYPE-1, TYPE-3]`, EXCLUDING TYPE-2 — even though Stripe Press's actual typography is TYPE-2.

**Diagnosis: spec consistency question, NOT altname methodology.** The canonical's brand exemplar contradicts its axis specification. Resolution requires spec deliberation, not altname surgery. Three defensible interpretations:

- **A. Canonical typography is correct; Stripe Press is a wrong brand exemplar.** Remove from canonical-10's brands, add to a different canonical that fits typographically (canonical-15 Plain Document, which also has TYPE-2 territory).
- **B. Stripe Press is the right brand exemplar; canonical typography is incomplete.** Add TYPE-2 to canonical-10's typography acceptable set.
- **C. Both right; the fixture tests the wrong thing.** Editorial Long-Form is generally TYPE-1/TYPE-3, but Stripe Press specifically uses non-standard typography. The fixture should expect TYPE-2 since the brief specifically invokes Stripe Press.

All three are defensible; all three require spec deliberation.

**Practical path: deferred to dedicated spec-consistency audit pass.** Trying to resolve in Task 4c risks a hasty spec amendment without proper deliberation. The fixture failure is informative — it surfaced a real spec consistency question — and that signal is preserved by leaving it failing rather than papering over it. The fixture (`editorial-longform-brand`) stays failing in Phase 2.1 and beyond until a dedicated spec-consistency audit happens (likely v0.2 or a separate Phase 2.1d task).

---

**Case 3: `saas-marketing-brand/typography` — TYPE-2 conf=1.000, 2 evidence items, expected TYPE-5.**

Evidence: brand "Stripe" matches BOTH `"like Stripe (Inter and Sohne)"` AND `"like Stripe Press (Tiempos throughout)"` in TYPE-2's brand_exemplars. The first altname is misleading: Stripe-the-company uses Inter+Söhne (which is TYPE-5 Geometric-Modernist territory), NOT TYPE-2 Single-Family Discipline. The altname `"like Stripe (Inter and Sohne)"` was incorrectly placed in TYPE-2.

**Diagnosis: altname coverage issue (similar to Case 1 but cleaner-cut).** The brief's "Stripe" signal substring-matches both altnames, producing conf=1.0 from saturated brand-bucket matching. The brief is about typical YC SaaS landing page (Standard SaaS Marketing canonical, TYPE-5 typography). Stripe-the-company's actual marketing typography IS Inter+Söhne. The altname `"like Stripe (Inter and Sohne)"` belongs in TYPE-5, not TYPE-2.

**Practical path (Task 4c).** Search-first methodology: verify Stripe-the-company's marketing typography is attested as Inter+Söhne (well-established). Move the altname to TYPE-5. TYPE-2's brand exemplars then narrow to actual single-family-discipline brands (Stripe Press kept; Stripe-the-company removed).

---

**Common pattern across the three cases:** None are Stage 5 fill behavior issues. All three have the right grammar showing high confidence; the question is whether the high confidence is correct (deliberate Stripe Press signal in Case 2) or wrong (misleading altname placement in Cases 1 and 3). Confidence-based defenses can't distinguish the two — the structural fix is at the altname or spec layer, not the fill layer. See `docs/architectural-patterns.md` entry 6 ("Bucket weights reflect signal-type discriminative power, not deliberateness") for the cross-phase pattern.

**Estimated Task 4c cost:**
- Case 1 (Linear voice altname surgery): ~1h
- Case 2 (deferred to dedicated spec-consistency audit, NOT Task 4c)
- Case 3 (Stripe altname relocation): ~30min
- Plus original Task 4c scope: B4 fixtures (~1-2) and broken-app-density Stage 2 routing miss
- Total: ~3-4h, expected closures ~3-4 fixtures (Cases 1, 3, plus original B4 + routing miss). Case 2 stays deferred.

---

## 7. Apple/RP-6 brand-surface conflation deferred to v0.2

**Question.** During Phase 2.1a Task 1's exposure scan and Phase 2.1b Task 4c's audit, the fixture `premium-hardware-brand/reading_pattern` was identified as failing because brief signal `"Apple"` substring-matches `"like Apple's iOS"` in RP-6 (Mobile Thumb-Zone) brand_exemplars. Engine routes reading_pattern to RP-6, but the brief is about Apple's iPhone MARKETING page (desktop product detail), NOT Apple's iOS APP interface — so canonical-5 (Premium Consumer Hardware) RP-2 (Z-Pattern) is the correct expectation.

**Diagnosis.** RP-6's altname `"like Apple's iOS"` is CORRECT attestation. Apple's iOS genuinely IS Mobile Thumb-Zone reading pattern. The over-routing isn't an altname coverage error; it's a Stage 2 matching deficiency: substring matching can't distinguish "Apple invoked generically as a brand reference" from "Apple's iOS invoked specifically as a surface."

**Why this is NOT a Task 4c altname surgery target.** The proposed workaround during planning was "rephrase RP-6 altname to `like iOS apps` (drop the Apple prefix to avoid brand-substring match)." Phase 2.1b review rejected this approach: the rephrase mutilates an accurate altname to paper over a Stage 2 matching deficiency. `"like Apple's iOS"` is the correct attested form; substring-match collisions are the engine's problem, not the altname's. Don't sacrifice attestation accuracy for substring-match avoidance.

**v0.1 status:** the fixture (`premium-hardware-brand/reading_pattern`) stays failing as a known v0.1 limitation. Documented and architecturally categorized. Other Apple-brand fixtures (premium-hardware-vibes, premium-hardware-intent) likely have similar issues if they invoke Apple as a brand exemplar.

**v0.2 fix path (logged in `docs/architectural-patterns.md` entry 7 "brand-surface conflation"):** Stage 2 matching should treat brand-exemplar altnames as whole phrases, not substring-matchable tokens. Multi-surface brands (Apple, Linear, Stripe, others) then need surface-specific altnames in their respective grammars (e.g., `"like Apple's iOS"` in RP-6 vs `"like Apple's product marketing"` or similar in RP-2) with whole-phrase matching ensuring surface-specific signals route correctly. The signal `"Apple"` (bare brand mention) wouldn't substring-match `"like Apple's iOS"` under whole-phrase rules; only signals like `"Apple's iOS app"` or `"Apple iPhone iOS interface"` would route to RP-6.

**Practical path for v0.1.** Per F3-3 / Task 1 negative-result patterns, the correct response is to leave the altname accurate and accept the fixture failure as preserved signal — the brand-surface conflation is real, the fixture surfaces it cleanly, and a hasty workaround would obscure the v0.2 design space. The pattern is logged in architectural-patterns.md so Phase 3 / v0.2 work has the cross-phase context.

## 8. Methodology refinement: "most authentically attests for" not "could attest for"

**The semantic.** When a candidate phrase could plausibly belong to multiple grammars, the search-first methodology must determine which grammar the phrase most authentically attests for, not whether it could attest for any. Adding the same phrase to multiple grammars dilutes the signal across them and can cause Stage 2 confidence ties that the wrong canonical wins.

**Example (Phase 2.1b Task 6b fixture 1):** the phrase `"Webflow template"` plausibly attests for both COLOR-8a (Marketing Single-Accent — Webflow templates use neutrals + single accent palette) AND IMG-7 (Stock Photography — some Webflow templates use stock photography). Initial audit proposed adding to both. Search results determined which is the more authentic attestation:

- **COLOR-8a:** multi-source corroboration from design literature explicitly describing Webflow SaaS template color systems as "neutrals foundation + accent colors used sparingly" — exactly the COLOR-8a Marketing Single-Accent pattern. Sources: Merveilleux (color systems for SaaS), LandingPageFlow (best landing page color combinations), Webflow's own template style guides. **Strong attestation.**
- **IMG-7:** search returned mostly photography-template-FOR-photographers results (Stock X template is a template for stock photo agencies, not a SaaS template that uses stock photography). Webflow SaaS templates use diverse imagery (3D renders, custom illustration, hero shots, abstract graphics) — stock photography is not the most authentic imagery attestation for the phrase. **Weak/ambiguous attestation.**

Decision: applied to COLOR-8a only. Adding to both would dilute the signal and create a tie at the COLOR axis that wouldn't actually flip routing.

**Methodology rule.** When auditing an altname amendment that could plausibly belong to multiple grammars:

1. Per-grammar attestation: search separately for each candidate grammar's pairing.
2. Strength comparison: which has stronger corroboration in design literature, more multi-source agreement, more specific match to the grammar's defining attributes?
3. Apply only the strongest. If multiple attest equally, apply the one that most uniquely differentiates from sibling grammars (i.e., adds routing signal that wouldn't already be redundant).
4. Log the demoted attestation as a negative result if it could plausibly attest for the OTHER grammar but doesn't survive comparison.

This complements entry 6's "Form principle" and entry 7's "Surface conflation" guidance: methodology should distinguish authentic from plausible-but-weak, not bias toward "more amendments = more closure."

## 9. Mission-Earnest unresolvability and fixture impact

**The semantic.** `Mission-Earnest` is in the corpus loader's `KNOWN_UNRESOLVABLE` allowlist — a spec annotation in canonical-14 (Cause / Journalism / Mission-Driven) that doesn't load as a discrete grammar. The corpus loader recognizes the phrase as a canonical reference but has no real grammar to route to. Any fixture whose expected canonical references Mission-Earnest cannot close through altname methodology because the routing engine has no Mission-Earnest grammar in `corpus.voice.profiles` (or any other axis); brief signals cannot be routed to a grammar that doesn't exist.

**Fixtures affected:**

- **`cause-journalism-vibes`:** expected canonical-14 (Cause / Journalism / Mission-Driven) which references Mission-Earnest as one of its voice options. Currently routes to canonical-2 / canonical-10 tied (editorial register). The voice axis in canonical-14's specs cannot be flipped because Mission-Earnest doesn't load — the engine routes voice to one of the loaded VOICE profiles (typically VOICE-2 Editorial Considered, which is canonical-2's primary). Even if other axes were attested correctly, voice would remain a signal-routed-mismatch for canonical-14.
- **Possibly other cause-journalism fixtures** (`cause-journalism-intent`, `cause-journalism-brand` if present) have the same issue when their expected canonical-14 voice axis is at stake.

**v0.1 status.** Fixtures referencing Mission-Earnest stay failing as a known limitation. The KNOWN_UNRESOLVABLE allowlist is a corpus-loader-level decision (the loader treats certain spec annotations as descriptive metadata rather than discrete grammars to load); changing this behavior is corpus-loader scope, not altname-amendment scope.

**v0.2 fix paths.** Two options:

- **(a) Load Mission-Earnest as a real grammar** with full altname coverage (vibes, brand_exemplars, vernacular, anti_vibes, compositional_intent). The voice profile would describe the cause/journalism register: earnest, mission-driven, considered-but-purposeful, advocacy-coded. Brand exemplars: ProPublica, The Marshall Project, certain New Yorker investigative coverage, advocacy-focused publications. This would let `cause-journalism-vibes` route voice correctly and close the canonical_match assertion.
- **(b) Replace the Mission-Earnest reference in canonical-14 with a defined voice grammar** that fits the cause/journalism register. The closest existing fits are VOICE-2 (Editorial Considered) or VOICE-4 (Direct Professional). VOICE-2 fits the editorial-considered cause/journalism register but loses the mission-driven distinctness; VOICE-4 fits the direct-purpose cause/journalism register but loses the editorial considered voice. Either choice ships a less precise canonical-14 spec but enables the fixture to route.

Path (a) is the cleaner v0.2 design — Mission-Earnest is genuinely a distinct register worth its own grammar. Path (b) is the cheaper tactical fix if v0.2 deprioritizes new-grammar work. Phase 2.1's responsibility is to log the issue and the fix paths; the v0.2 design conversation decides which path to take.

**Cross-reference.** Architectural pattern entry 9 (register-adjacent canonicals) names `cause-journalism-vibes` as a structural-hardness fixture; the Mission-Earnest unresolvability is one of two factors making it unfixable in v0.1. The other is the register-adjacency between canonical-14 and canonicals 2/10 that share most editorial-axis specs.

## 10. Soho House LAYOUT spec-consistency question (canonical-12)

**Question.** During Phase 2.1b Task 6b fixture-2 audit, fixture `editorial-brand-hybrid-brand` (expected canonical-12 Premium Editorial-Brand Hybrid / Soho House Tier) was identified as failing because the brief routes layout to LAYOUT-2 (Editorial-Grid Magazine — canonical-2 Editorial Magazine's primary), but canonical-12's `axis_mappings.layout` is `LAYOUT-1` (Vertical-Rhythm Editorial). canonical-12 doesn't directMatch on layout; canonical-2 does. The brief's other axes (typo, comp, motion, imagery, voice) directMatch both canonicals; the layout differential is what gives canonical-2 the +1 directMatch lead.

**Search attestation.** Soho House design literature describes the brand's website as "editorial with member's-club context," "art-book format," "magazine grid layouts" — aligning with Editorial-Grid Magazine (LAYOUT-2), not Vertical-Rhythm Editorial (LAYOUT-1) or Bento Discipline (LAYOUT-3a). Sources: Studio Ilse (Soho House brand), Daisy Hardman (brand refresh), Justin Gordon (Soho House project), Working Not Working (global rebrand). The brand's print magazine uses grid layouts; the website layout is editorially structured.

**Spec text.** canonical-12's spec entry in `palate-grammar-survey-v0.2-turn8-compatibility-model.md` reads:

> **Layout:** Editorial-Grid Magazine + Vertical-Rhythm Editorial sections

The spec text supports BOTH layouts: Editorial-Grid Magazine as the primary structure with Vertical-Rhythm Editorial sections as compositional pattern. The corpus loader has parsed this as `axis_mappings.layout = LAYOUT-1` with no `axis_alternatives.layout`, missing the LAYOUT-2 reading from the spec text.

**Diagnosis.** This is a corpus-loader / spec-parsing gap, not an altname coverage gap. The spec author's intent (per the "+ ... sections" phrasing) is that canonical-12 accepts both LAYOUT-2 and LAYOUT-1; the loader picked one as primary and dropped the other. F3-1's multi-option canonical extension was designed for exactly this case — `axis_alternatives` should be `[LAYOUT-2, LAYOUT-1]`.

**v0.1 status.** Fixture `editorial-brand-hybrid-brand` stays failing as a known limitation. Defer to a v0.2 spec-consistency audit pass that walks each canonical's spec text against the parsed `axis_mappings` + `axis_alternatives` and surfaces parser gaps.

**v0.2 fix path.** Spec-consistency audit task that:

1. Reads each canonical's spec text in `palate-grammar-survey-v0.2-turn8-compatibility-model.md`.
2. Identifies "+ ... sections" or "X with Y" or "X or Y" phrasings on each axis.
3. Verifies the corresponding `axis_mappings` + `axis_alternatives` pair includes all referenced grammars.
4. Updates the loader's spec-parser logic OR amends the canonical entries directly to make multi-grammar specs explicit.

For canonical-12 specifically: amend `axis_alternatives.layout` to `[LAYOUT-2, LAYOUT-1]`. This alone gives canonical-12 a layout directMatch (matching the brief's LAYOUT-2 pick) and ties it with canonical-2 on directMatch count (both at 6). Combined with a "Soho House" → VOICE-1 (Quiet Authority) altname amendment (canonical-12 specifies Voice as Editorial Considered OR Quiet Authority; VOICE-1 is in canonical-12 alts but NOT canonical-2), the voice axis would flip canonical-12 to a +1 directMatch lead, closing the fixture. Two amendments coordinated — one spec-consistency, one altname.

**Cross-reference.** Architectural pattern entry 9 (register-adjacency) names `editorial-brand-hybrid-brand` as needing coordinated multi-amendment to close. The spec-consistency layer must land first; only then does the altname amendment have the structural foundation to flip routing.

**Methodology pattern.** This is the same shape as Task 4c Case 2 (canonical-10 typography spec inconsistency — Stripe Press / Editorial Long-Form). Both are spec-text-vs-corpus-loader gaps where the spec author intended a multi-grammar accept set but the loader picked one. v0.2 spec-consistency audit is the natural home for both.

## 11. Editorial-longform-vibes register-adjacency deferral

**Question.** Phase 2.1b Task 6b fixture-3 audit identified `editorial-longform-vibes` as a Sub-B candidate. Brief signals "essay style", "long-form reading", "thoughtful blog", "real article", "engaged committed reader", "generous spacing", "restrained motion", "drop caps". Expected canonical-10 (Editorial Long-Form / Substack / Stripe Press); engine routes to canonical-14 (Cause / Journalism / Mission-Driven) at score 1.000 / direct=4 vs canonical-10 at 0.889 / direct=3.

**Per-axis differential analysis.** canonical-14 and canonical-10 share most editorial-axis specs (typography both have TYPE-1/TYPE-3, color both have COLOR-3, density both have DEN-1, reading_pattern both have RP-3). The genuine differentiators are:

- **Motion:** canonical-10 = MOTION-1/MOTION-2; canonical-14 = MOTION-2/MOTION-6. MOTION-1 (Restrained-Atmospheric / Slow-Fade Editorial) is in canonical-10 but not canonical-14.
- **Imagery:** canonical-10 = IMG-1/no-imagery; canonical-14 = IMG-3 (Documentary Photography). IMG-1 (Editorial Photography) is in canonical-10 but not canonical-14.

Two genuine differential axes. Required swing to flip: +0.222. Maximum amendment swing per axis: +0.111. Two coordinated attestations required.

**Attestation feasibility.** Brief signals don't authentically attest for the differential grammars:

- "restrained motion" → MOTION-1 (Restrained-Atmospheric / Slow-Fade Editorial): plausible attestation but generic — "restrained motion" describes both MOTION-1 and MOTION-2; not a unique differentiator. Adding to MOTION-1 alone might shift the routing if MOTION-2 doesn't already match the phrase, but the search bar (per Task 1's discipline) requires multi-source corroboration that "restrained motion" routes more authentically to MOTION-1's editorial-fade pattern than MOTION-2's broader restrained category.
- "long-form essay" / "engaged committed reader" → IMG-1 (Editorial Photography) or "no imagery": these are reading/editorial signals, not imagery signals. Adding these to IMG-1's altnames would conflate editorial-publication signals with imagery-grammar signals — a category error that risks misrouting other fixtures.

**Diagnosis.** This is a register-adjacency case (architectural-patterns.md entry 9). canonical-10 and canonical-14 share enough specs that single-altname amendments produce only +0.111 swing per amendment, but the +0.222 gap requires coordinated multi-amendment. The brief's signals don't naturally attest for the differential grammars — applying amendments anyway would lower the methodology bar (entry 6's Form principle warns against this).

**v0.1 status.** Fixture `editorial-longform-vibes` stays failing as a known limitation. Documented and architecturally categorized.

**v0.2 fix paths.** Per architectural-patterns.md entry 9:

- **(a) Signal-level disambiguation:** brief signals "essay style" + "engaged committed reader" + "long-form" + "drop caps" are signal-level-distinct from "documentary" + "photojournalism" + "cause-driven" but Stage 4's lenient overlap collapses both into editorial register. v0.2 signal extraction should flag these distinct register-adjacent intents.
- **(b) Coordinated multi-amendment passes** that target multiple axes simultaneously, accepting that Sub-B audit becomes O(amendments) per fixture rather than O(1).
- **(c) Entry-8 score restructuring** (signal-routed-axes-aware overlap denominator) reshapes the score distribution so register-adjacent canonicals don't tie at the lenient overlap level.

**Cross-reference.** Architectural pattern entry 9 lists this fixture as the primary empirical example of register-adjacency unfixability through single-altname methodology.

## 12. Cause-journalism-vibes deferred (Mission-Earnest + register-adjacency)

**Question.** Phase 2.1b Task 6b fixture-4 audit identified `cause-journalism-vibes` as a Sub-B candidate. Brief signals "documentary", "unvarnished", "real", "photojournalism", "longform reading", "restrained editorial", "cause-driven" + vernacular "two-color monochrome". Expected canonical-14 (Cause / Journalism / Mission-Driven); engine routes to canonical-2 / canonical-10 tied at 0.889 / direct=5 vs canonical-14 at 0.667 / direct=3.

**Per-axis differential analysis.** Three potential differentiators:

- **Layout:** canonical-2 = LAYOUT-2; canonical-10 = LAYOUT-4c; canonical-14 = LAYOUT-4c/LAYOUT-5. Brief layout pick is LAYOUT-1 (signal-routed via "documentary" or similar) — doesn't match any canonical's primary. Need to flip to LAYOUT-4c to gain canonical-14 directMatch (and canonical-10 directMatch — both editorial-longform canonicals share LAYOUT-4c).
- **Imagery:** canonical-2 = IMG-1 (Editorial Photography); canonical-14 = IMG-3 (Documentary). Brief's "documentary" + "photojournalism" naturally attest for IMG-3.
- **Voice:** canonical-2 = VOICE-2 (Editorial Considered); canonical-14 = Mission-Earnest (UNRESOLVABLE — see entry 9 above). Voice axis cannot be flipped because Mission-Earnest doesn't load as a discrete grammar.

**Attestation feasibility.** The voice axis is structurally unfixable per the Mission-Earnest unresolvability finding (entry 9 above). Of the remaining two axes:

- Layout flip: "documentary" → LAYOUT-4c attestation is plausible. Search target.
- Imagery flip: "documentary" → IMG-3 (Documentary) is the natural attestation.

**Score math.** Even with both axes flipped (+0.111 each = +0.222 total), the gap to close is +0.222 (canonical-2 at 0.889 vs canonical-14 at 0.667). Hits the threshold exactly — but with voice unfixable, canonical-14 stays one axis behind because canonical-2 maintains the voice directMatch. Worked example post-amendments:

- canonical-2: layout (was directMatch on LAYOUT-2 via brief's mismatch — actually LAYOUT-1 wasn't matching; canonical-2 has 5 directMatches on typo/comp/motion/imagery/voice/RP). After flips: imagery loses (IMG-1→IMG-3, signal-routed mismatch for canonical-2), voice unchanged → 4 directMatch + 3 unsignalled = 7. Score 0.778.
- canonical-14: layout gains (LAYOUT-4c is canonical-14's primary), imagery gains (IMG-3 matches canonical-14), voice stays as signal-routed-mismatch (no Mission-Earnest grammar to route to) → 5 directMatch + 3 unsignalled = 8. Score 0.889.

canonical-14 narrowly wins 0.889 vs canonical-2 0.778. Possible closure if both attestations land.

**Branch resolution.** Two amendments needed — both with reasonable attestation potential. But Mission-Earnest unresolvability remains a known issue: canonical-14's voice is permanently signal-routed-mismatch, capping the canonical's maximum directMatch count below what other canonicals can achieve. Future similar fixtures will have the same ceiling.

**v0.1 status.** Deferred. Two coordinated amendments make this fixture borderline-tractable, but the search effort and the spec-consistency-overlap with the Mission-Earnest issue justify deferring to a coordinated v0.2 pass that fixes the underlying structural issues. The Phase 2.1b commit notes the deferral with this entry as the structural-hardness rationale.

**v0.2 fix paths.** Two coordinated tracks:

- Resolve Mission-Earnest per entry 9 above (load as real grammar OR replace with VOICE-2/VOICE-4).
- Apply layout/imagery altname amendments per the per-axis attestation.

Once Mission-Earnest is resolved, the fixture becomes single-amendment-tractable (just imagery flip), with the layout flip optional reinforcement.

**Cross-reference.** Architectural pattern entry 9 lists this fixture alongside `editorial-longform-vibes` as register-adjacency cases. The Mission-Earnest factor makes this one even less tractable in v0.1; even fixing the resolvable axes leaves the canonical capped on directMatch count.

## 13. Stripe brand-fanout cataloging (multi-axis)

**The semantic.** Phase 2.1b Task 6c audit cataloged the full distribution of `"Stripe"` as a brand_exemplar altname across the axis grammars. Stripe is the canonical multi-surface brand: stripe.com (marketing), Stripe Dashboard (application UI), Stripe Press (editorial publication), Stripe API (developer documentation), Stripe Elements (component library), Stripe support (helpdesk). Each surface has a different design vocabulary, so different grammars legitimately reference Stripe.

**Cataloged Stripe altname distribution (commit `9912cb1`):**

| Axis | Grammar | Bucket | Phrase | Surface |
|---|---|---|---|---|
| typography | TYPE-2 (Single-Family Discipline) | brand_exemplars | `like Stripe Press (Tiempos throughout)` | Stripe Press (editorial) |
| typography | TYPE-5 (Geometric-Modernist) | brand_exemplars | `like Stripe` (bare) | stripe.com (marketing) |
| color | COLOR-7 (Iridescent / Saturated-Primary) | brand_exemplars | `like Stripe's announcements` | Stripe announcement pages (modern-AI register) |
| color | COLOR-8a (Marketing Single-Accent) | brand_exemplars | `Stripe purple` + (Phase 2.1b Task 6b) `like a Webflow template` | stripe.com marketing color system |
| color | COLOR-8b (Application Single-Accent) | brand_exemplars | `like Stripe Dashboard` | Stripe Dashboard application |
| component | COMP-2 (Soft-Container System) | brand_exemplars | `like Stripe` (bare) | stripe.com component vocabulary |
| imagery | IMG-3 (Editorial Photography) | brand_exemplars | `like Stripe Press` | Stripe Press editorial |
| imagery | IMG-5 (3D Render) | brand_exemplars | `like Stripe's abstract 3D` | Stripe announcement 3D renders |
| imagery | IMG-7 (Stock Photography) | brand_exemplars | `like Stripe` (bare) | stripe.com marketing stock photo |
| density | DEN-1 / DEN-3 / DEN-4 / DEN-5 | implied | `Stripe` matches (per dbg-task6a observation) | various surfaces |
| voice | VOICE-2 (Editorial Considered) | brand_exemplars | `like Stripe Press articles` | Stripe Press voice |
| voice | VOICE-3 (Friendly Expert) | brand_exemplars | `like Stripe support` | Stripe support voice |
| voice | VOICE-7 (Conversion-Punchy) | brand_exemplars | `like Stripe` (bare, marketing) | stripe.com marketing voice |
| voice | VOICE-9 (Technical Precise) | brand_exemplars | `like Stripe API docs` | Stripe API documentation |
| reading_pattern | RP-3 (F-Pattern) | brand_exemplars | `like Stripe` (bare, marketing — implicit) | stripe.com layout reading pattern |

**The fanout pattern.** "Stripe" appears in altnames across 6 axes × 2-4 grammars per axis. Substring-based matching means the bare signal `Stripe` in a brief routes to ALL of these simultaneously: every grammar with "Stripe" in any altname gets a brand-bucket match (weight 0.9), creating Stage 2 ties at conf 0.9 across multiple grammars on each axis. Stage 3 / Stage 3b breaks ties via canonical alignment, which works WHEN the canonical is correctly identified, but fails when the brief's actual surface intent (e.g., Stripe MARKETING vs Stripe PRESS vs Stripe DASHBOARD) doesn't match the canonical the brief was meant to invoke.

**Fixtures observably affected:**

- `saas-marketing-brand` (per Task 6c triage): brief `"Stripe"` (intended as marketing reference) routes typography to TYPE-2 (Stripe Press surface), imagery to IMG-5 (announcement 3D surface), voice to VOICE-2 (Press surface), reading_pattern to RP-3 (instead of canonical-4's RP-2). Several axes wrong because Stripe brand fans out across surface-specific altnames.
- `saas-marketing-vibes`: per Task 6c triage, similar fanout pattern on imagery + voice (Type D, no Stage 2 candidate for canonical-4's IMG-7 because brief vibes don't have stock-photo signal).
- `editorial-longform-brand`: typography misroute (`Stripe Press` → TYPE-2 Single-Family, but canonical-10 spec has TYPE-1/TYPE-3). Type B spec consistency.

**Phase 3 Task 4 follow-on observation: brand-fanout is visible in card OUTPUT, not just routing decisions.** When `saas-marketing-brand` was used to test card-level voice guidelines during Phase 3 Task 4, the routed voice landed on VOICE-3 (Friendly Expert, via `like Stripe support` altname in VOICE-3) instead of canonical-4's primary VOICE-7 (Conversion-Punchy). The card-level effect: `voice_guidelines.do_use` and `voice_guidelines.do_not_use` reflect VOICE-3's directives (helpful, conversational, contractions) rather than the canonical-aligned VOICE-7's directives (benefit-led headlines, anti-"Build the future of"). The card is internally coherent (it ships VOICE-3 directives consistently), but the canonical_combination field still reads "Standard SaaS Marketing" — surface mismatch a debugging contributor would notice. v0.2 whole-phrase matching addresses this upstream; no card-generator-level mitigation is needed since the routing engine is the source of truth and the card faithfully serializes its decisions. Tests for VOICE-7's directives use direct profile override to exercise the profile contract without coupling to the fixture-level routing limitation.

**v0.1 status.** Cataloging only — no amendments applied. The Stripe-fanout altnames are individually accurate (each represents a real Stripe surface attestation) but collectively produce substring-match collisions when "Stripe" is invoked generically. Per architectural-patterns.md entry 7's "don't mutilate accurate altnames" principle, no in-place fix.

**v0.2 fix path.** Per architectural pattern entry 7's whole-phrase matching:

1. Stage 2 matching changes from substring to whole-phrase.
2. The bare signal `Stripe` no longer matches `like Stripe Press (Tiempos throughout)` (different phrase) — only signals that contain the full phrase do. So a brief that says `"like Stripe Press"` routes typography to TYPE-2; a brief that says just `"Stripe"` routes typography to TYPE-5 only (where the bare `like Stripe` altname lives).
3. Briefs invoking Stripe generically (no surface qualifier) need to default to the marketing surface — stripe.com — by adding bare-`Stripe`-only altnames to the marketing-aligned grammars on each axis.
4. Surface-specific altnames stay in surface-aligned grammars: `like Stripe Press` in editorial grammars, `like Stripe Dashboard` in application grammars, etc.

**Methodology pattern.** The Stripe fanout is the most visible instance of the multi-surface brand pattern (entry 7); Apple has the same shape (entry 14 below). Future brand catalogs in the corpus should follow surface-tagged altnames from the start: `Apple's iPhone marketing` vs `Apple's iOS app` vs `Apple's Music app` rather than bare `Apple`. The corpus parser may need to enforce surface-tagging on multi-surface brands.

## 14. Apple brand-fanout cataloging (multi-axis)

**The semantic.** Same shape as entry 13 for Stripe. Apple is a multi-surface brand: Apple's iPhone product marketing (apple.com/iphone), Apple's iOS app interfaces, Apple's marketing site (apple.com), Apple's product 3D renders, Apple's Music / TV+ apps. Each surface has a distinct design vocabulary; several grammars reference Apple's surfaces.

**Cataloged Apple altname distribution (commit `9912cb1`, partial — full corpus walk would surface more):**

| Axis | Grammar | Bucket | Phrase | Surface |
|---|---|---|---|---|
| typography | TYPE-2 (Single-Family Discipline) | brand_exemplars | `like Apple's San Francisco` | Apple SF type system (used everywhere — iOS + marketing) |
| color | COLOR-7 (Iridescent / Saturated-Primary) | brand_exemplars | `like Apple's gradient pages` | Apple iPhone marketing gradient style |
| component | COMP-? | brand_exemplars | `Apple HIG-coded` | iOS Human Interface Guidelines components |
| imagery | IMG-5 (3D Render) | brand_exemplars | `like Apple's product 3D` | iPhone product 3D renders |
| reading_pattern | RP-6 (Mobile Thumb-Zone) | brand_exemplars | `like Apple's iOS` | iOS app interfaces |
| layout | LAYOUT-4b (Brand-Stack) — implicit | (not cataloged in this audit) | `like Apple's product detail page` | iPhone marketing product detail |

**The fanout pattern (Apple-specific).** Apple's bare `Apple` substring-matches at minimum:

- TYPE-2 via `like Apple's San Francisco`
- COLOR-7 via `like Apple's gradient pages`
- IMG-5 via `like Apple's product 3D`
- RP-6 via `like Apple's iOS`
- (others implicit)

A brief that says just `"Apple"` (intended as iPhone marketing) gets bucket-matches on at least 4 grammars across 4 axes. The Apple/RP-6 mismatch in `premium-hardware-brand` (documented in entry 7) is the most visible Apple-fanout failure: brief intends iPhone MARKETING (RP-2 Z-Pattern desktop product detail) but routes RP-6 (Mobile Thumb-Zone for iOS apps) because `Apple` substring-matches `like Apple's iOS`.

**Fixtures observably affected:**

- `premium-hardware-brand`: reading_pattern misroutes RP-6 instead of RP-2 (entry 7 already documented). Type C.
- Other Apple-brand fixtures (`premium-hardware-intent`, `premium-hardware-vibes`) have similar issues on the surface-disambiguation axes (color iridescent vs single-accent, imagery 3D vs hardware-product, etc.) when they invoke Apple as a brand exemplar.

**v0.1 status.** Same as entry 13 — cataloging only. No amendments. The Apple altnames are individually accurate; the substring-match collision is the engine deficiency.

**v0.2 fix path.** Same as entry 13 — whole-phrase matching + surface-specific altnames. Specific Apple surface-tagging:

- `like Apple's iOS` stays in RP-6 / iOS-component grammars; only matches when brief contains the full surface qualifier
- `like Apple's iPhone marketing` added to LAYOUT-4b / RP-2 / IMG-? for the iPhone marketing surface
- `like Apple's product 3D` stays in IMG-5
- `like Apple's San Francisco` stays in TYPE-2 (this one is universally Apple's typography)

**Cross-reference.** Architectural pattern entry 7 names brand-surface conflation as the v0.2 fix target. Entries 13 (Stripe) and 14 (Apple) are the empirical catalogs that show the scope of the fix needed.

## 15. Task 7 (Cat D novel-signal detector) deferred to v0.2

**Question.** Phase 2.1c was scoped for Task 7 — implementing a novel-signal detector for the 2 remaining Cat D fixtures (`novel-developer-tool-editorial`, `novel-luxury-hotel-scrollytelling`). The detector would identify briefs that intentionally mix register-distinct grammars (e.g., devtool layout + editorial typography + serif color) and route them as `novel-but-coherent` rather than collapsing them into a nearby canonical via Stage 5 fill.

**Why deferred.** Phase 2.1's Path-2 close (post-Task-6b cost-benefit review) determined that:

1. **The expected closures from Task 7 are 0-2 fixtures.** Implementing the novel-signal detector requires the same architectural surface as v0.2's score restructure (entry 8) — both touch Stage 4's overlap calculation, Stage 5's fill behavior, and the relationship between signal-routed evidence and AI-default fill. Implementing in v0.1 then redoing for v0.2 is duplicated effort.
2. **Phase 3 (MCP server + card generator) ships v0.1's user-facing value.** Task 7's 0-2 fixture closures vs Phase 3's user-facing artifact is a real tradeoff; user impact wins.
3. **Architectural scaffolding has already landed.** Phase 2.1 has documented 9 architectural patterns including entries 2 (signal-vs-score), 8 (AI-default overlap), and 9 (register-adjacency) — all of which inform the novel-signal-detector design path. The detector isn't a v0.1 prerequisite; it's a v0.2 design decision that benefits from the patterns Phase 2.1 produced.

**v0.1 status.** Both Cat D fixtures stay failing as documented architectural placeholders:

- `novel-developer-tool-editorial`: brief is "developer tool marketing site / Long-Form Stack layout / Editorial Print typography / serif palette". Routes to canonical-1 (Luxury Hospitality) at conf 1.0 via the AI-default-overlap collapse pattern (entry 8). Should route as novel-but-coherent.
- `novel-luxury-hotel-scrollytelling`: brief is "luxury hotel website with scrollytelling / Brand-Stack layout / restrained motion / lifestyle photography". Routes to canonical-1 (Luxury Hospitality) at conf 1.0 via the same pattern; the scrollytelling RP-3 signal isn't enough to mark it as novel.

**v0.2 fix path.** Combined Stage 4/5 redesign:

- Score restructure (entry 8) reshapes overlap to use signal-routed-axes denominator. The two novel fixtures' `directMatchCount / signalRoutedAxesCount` will be far below 1.0 because they signal-route to grammars from MULTIPLE register families (not all-aligned-to-one-canonical). Score below register-coherence threshold → no Stage 5 fill → routed as novel.
- Signal-level disambiguation (entry 2) provides a per-signal canonical-attribution layer that Stage 4 can use to detect cross-canonical signal patterns BEFORE collapsing to a single canonical match.
- Combined effect: novel-but-coherent briefs route correctly without a dedicated detector — the score restructure does the work.

**Methodology pattern.** Same shape as Task 2 (register-clash detector that ended up as architectural scaffolding rather than fixture closure). Detector-style approaches to novel-signal patterns work better when integrated into the score layer than as parallel detection passes. The v0.2 design conversation should consolidate detector ideas into the scoring restructure rather than implementing standalone detectors per failure mode.

**Cross-reference.** Architectural pattern entries 2, 8, 9. The Path-2 close commit notes Task 7's deferral with this entry as the structural rationale.

## 16. MCP server uses deterministic Stage 1, not LLM Stage 1

**Question.** Phase 3 Task 7 wired the `route` and `route_multi` MCP tools to use `createDeterministicStage1(corpus)` rather than the LLM-backed Stage 1 prompt path (`STAGE1_SYSTEM_PROMPT_V1` from `src/routing/stage1/prompt.ts`). The PRD §4.6 originally over-committed to an Anthropic API dependency for the MCP server's Stage 1 ("The MCP server requires an Anthropic API key as a configuration parameter"); the implementation walked it back per Turn 8 §5.1.1's note that Stage 1 may be done by the consuming AI tool.

**Diagnosis.** Three reasons the deterministic path is correct for v0.1:

1. **Operational complexity.** MCP servers run in user environments (Claude Code, Cursor) without guaranteed API key access. Requiring `ANTHROPIC_API_KEY` at server startup would block users who don't have a key, can't get one, or run in air-gapped environments.
2. **Architectural reasonableness.** The consuming AI tool is itself an LLM-grade signal extractor — Claude Code, Cursor, and v0 all run Claude/GPT inside themselves. A user's brief can be reformulated into structured signals by the consuming tool BEFORE it calls `palate.route`, using the `palate.brief-template` prompt (Task 8). This pushes LLM-grade extraction to the tool that already has LLM access; the MCP server's Stage 1 just needs to handle the structured-or-loose brief that arrives.
3. **v0.2 path is opt-in, not default.** v0.2 can add LLM Stage 1 as an opt-in config (`PALATE_LLM_STAGE1=anthropic` env var with a paired `ANTHROPIC_API_KEY`). The deterministic path stays the default; LLM Stage 1 is for users who want higher recall on creative paraphrasing and have keys configured.

**v0.1 status.** Deterministic Stage 1 is the MCP server's default. AI tools that want LLM-grade extraction read the `palate.brief-template` prompt and reformulate the user's brief into structured signals before calling `route`. The deterministic Stage 1 walks the corpus altname phrases for whatever signals the brief contains.

**v0.2 fix path.** Add LLM Stage 1 as opt-in:

1. New env var: `PALATE_LLM_STAGE1` (values: unset/`deterministic` for default, `anthropic` for LLM path).
2. When `anthropic`, server expects `ANTHROPIC_API_KEY` at startup and fails fast if missing.
3. Server uses `STAGE1_SYSTEM_PROMPT_V1` + the SDK's structured output config to extract signals from briefs.
4. MCP server caches signal extractions by brief hash to avoid re-running on identical briefs (per PRD §4.6's cost mitigation).
5. The deterministic path stays available as a fallback; a server config could try LLM first, fall back to deterministic on quota exhaustion or transient errors.

**Cross-reference.** PRD §4.6, Turn 8 §5.1.1, src/routing/stage1/deterministic.ts header comment ("The MCP server's Stage 1 does NOT call an LLM... PRD §4.6 overcommitted to an Anthropic API dependency; Turn 8 §5.1.1 already noted Stage 1 may be done by the consuming AI tool"). This entry consolidates the rationale + v0.2 fix path so the deferral is traceable for v0.2 design.

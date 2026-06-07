# Palate Grammar Survey v0.2 — Turn 6: Voice Grammar

This document covers the seventh axis: **Voice**. Voice was given its own turn because the *representation format* is itself architectural work — voice doesn't decompose into discrete grammars the way visual axes do. The earlier turns named layout grammars, color grammars, typography grammars as discrete categories with substyles. Voice resists that treatment.

After researching the working industry vocabulary, I've concluded the right representation is a **two-layer model**:

1. **Layer 1 — Continuous dimensions.** Voice is most precisely described as a position in a multi-dimensional space. The Nielsen Norman Group's four-dimension framework (humor, formality, respectfulness, enthusiasm) is the working industry standard, empirically tested, and used by Lovable, Microsoft, Google, and most modern voice systems. I'm extending it slightly to include two more practical dimensions for web copy (rhythm and vocabulary register), totaling six.

2. **Layer 2 — Named voice profiles at common points in that space.** Discrete grammars at specific coordinates. These are named voice profiles like *"Quiet Authority"* or *"Friendly Expert"* — not because they're the only valid voices, but because they're the most common combinations briefs route to.

Both layers ship in the spec. The dimensions let any voice be precisely described; the profiles let common voices be named and routed to without the user specifying coordinates.

This is different from how the other axes work, and I want to flag that explicitly. Layout grammar has 14 named grammars and that's the entire spec for layout. Voice has 6 dimensions *plus* 9 profiles, and the profiles are not exhaustive — they're the common ones, with the dimensions providing a continuous coordinate system for everything else.

---

## Why this representation, with honest trade-offs

Three options I considered:

**Option A — Discrete grammars only.** Treat voice like the visual axes — name 8–10 grammars, each with substyles. *Rejected.* Voice doesn't decompose cleanly. "Casual playful" and "casual professional" share too much; "Apple-confident" and "Stripe-precise" overlap in ways that resist clean separation. Forcing voice into discrete grammars produces taxonomic noise.

**Option B — Continuous dimensions only.** Just specify the six dimensions, let the LLM router compose any point in the space. *Rejected for v0.1.* Without named profiles, vibe coders have no entry points — "I want a friendly expert voice" is much more retrievable than "I want enthusiasm 7, formality 4, humor 3, respectfulness 8." The dimensions alone are too abstract for the system's intended users.

**Option C — Two-layer (dimensions + profiles).** *Selected.* The dimensions provide the precise coordinate system; the profiles provide the named common entry points; the altname blocks (vibes, brand exemplars, vernacular, anti-vibes, compositional intent) sit on the *profiles*, not the dimensions. This handles both the "I want it to sound like Stripe" entry path and the "make it casual but matter-of-fact" entry path.

The honest cost: Voice is more complex to represent than the visual axes. The Compatibility Model in Turn 8 will need to handle dimension-based routing alongside grammar-based routing. This is real architectural work, not free.

---

# THE SIX VOICE DIMENSIONS

Each dimension is a continuous scale from one extreme to the other. A brand's voice can sit at either extreme or anywhere between. The first four dimensions are the Nielsen Norman framework, empirically tested by NN/G's research with measurable effects on user perception.

## Dimension 1 — Humor (Funny ↔ Serious)

The degree to which the writing attempts humor.

- **Funny end:** Plays on words, puns, jokes, self-deprecation, references that assume cultural context. Mailchimp's lifecycle emails, Innocent Drinks' bottle copy, Wendy's social media.
- **Serious end:** No attempts at humor; the message is delivered straight. Healthcare communications, financial disclosures, legal copy.
- **Middle:** Light dryness, occasional wit, but humor isn't the primary register. Most modern SaaS marketing operates here.

**Working effect:** NN/G's research shows humorous tones perform best for "friendliness" perception but slightly worse for "trustworthiness" in high-stakes contexts. Calibrating humor to context matters — humor in an error message is different from humor in a billing notification.

## Dimension 2 — Formality (Formal ↔ Casual)

The degree to which writing adopts professional vs conversational register.

- **Formal end:** Complete sentences, no contractions, structured paragraphs, professional vocabulary. Legal communications, scientific writing, traditional financial services.
- **Casual end:** Contractions, fragments, conversational rhythms, slang where appropriate. Social media, modern consumer brands, lifestyle DTC.
- **Middle:** Conversational but disciplined — contractions OK, slang restrained. Most modern SaaS, Stripe-coded register.

**Working effect:** NN/G's research found casual tones rated higher on friendliness and approachability across most contexts. Formal tones rated higher on authority for high-stakes contexts (medical, legal, financial).

## Dimension 3 — Respectfulness (Respectful ↔ Irreverent)

The degree to which the writing treats its subject matter with reverence vs irreverence. Importantly: this is about attitude toward *subject matter*, not toward audience. A brand can be irreverent about its category while remaining respectful to its readers.

- **Respectful end:** Treats subject with appropriate seriousness, no mockery, no provocations. Healthcare, education, journalism, premium hospitality.
- **Irreverent end:** Pokes fun at the category, undermines convention, takes provocative stances. Liquid Death, Oatly, Cards Against Humanity, neo-brutalist indie SaaS.
- **Middle:** Takes subject seriously but doesn't worship it. Most considered consumer brands.

**Working effect:** Irreverence is a strong differentiator in saturated markets — Liquid Death's whole positioning is built on irreverence about water packaging. But irreverence in regulated industries (healthcare, finance) breaks trust quickly.

## Dimension 4 — Enthusiasm (Enthusiastic ↔ Matter-of-Fact)

The degree to which the writing conveys emotional energy.

- **Enthusiastic end:** Exclamation points, energetic phrasing, emotional language, "amazing," "incredible," "thrilled." Wellness brands, consumer beauty, optimistic tech.
- **Matter-of-Fact end:** Neutral declarative sentences, no emotional language, just information. Documentation, technical writing, premium hospitality (which signals confidence by *not* trying to excite).
- **Middle:** Conveys interest in the subject without performance. Most considered B2B.

**Working effect:** Enthusiasm correlates with friendliness perception but can read as desperate or overselling in premium contexts. NN/G's research showed casual+enthusiastic tones performed best overall, but this masks important context-dependence.

## Dimension 5 — Rhythm (Punchy ↔ Flowing)

(Extension beyond NN/G — this is mine, derived from working-designer commentary.)

The degree to which sentences are short and punchy vs long and flowing.

- **Punchy end:** Short sentences. Sometimes fragments. Often imperative. Apple's ad copy, Nike's campaigns, modern conversion-optimized landing pages.
- **Flowing end:** Long sentences with subordinate clauses, embedded thoughts, considered cadence. Editorial publishing, longform journalism, premium hospitality copy.
- **Middle:** Mix of punchy and flowing depending on emphasis.

**Working effect:** Punchy rhythm correlates with conversion-coded marketing; flowing rhythm correlates with editorial-coded brands. Modern SaaS marketing is overwhelmingly punchy, which is part of why it all sounds the same.

## Dimension 6 — Vocabulary Register (Expert ↔ Plain)

(Extension beyond NN/G — also mine.)

The degree to which the writing uses domain-specific vocabulary vs accessible plain language.

- **Expert end:** Domain jargon, technical precision, assumes reader knowledge. Stripe API documentation, technical product marketing, B2B for sophisticated audiences.
- **Plain end:** Plain language, no jargon, explains terms before using them. Monzo's banking communications, Headspace's wellness copy, Microsoft's accessibility-coded documentation.
- **Middle:** Domain vocabulary used but explained, technical precision balanced with accessibility.

**Working effect:** Expert register builds credibility with technical audiences but excludes everyone else. Plain register builds trust with consumers but can feel patronizing to experts. Many brands fail by picking the wrong register for their audience.

---

# THE NINE NAMED VOICE PROFILES

These are common combinations in the six-dimensional space, each with altname blocks. They're the entry points vibe coders use to invoke a voice. The Compatibility Model in Turn 8 will define each profile's coordinates in the dimensional space; this turn names them and provides altnames.

The profiles are organized roughly from most-formal to most-irreverent.

---

## VOICE-1. Quiet Authority

**Definition.** Confident, restrained, declarative. Doesn't try to convince — assumes the reader already understands the brand's standing. Sentences are clean, vocabulary precise, claims sparing. The voice of luxury hospitality, premium fashion, considered editorial.

**Dimensional coordinates (approximate):** Serious, Formal, Respectful, Matter-of-Fact, Flowing, Plain.

**Distinguishing edge.** Versus *Editorial Considered* — Quiet Authority refuses ornament; Editorial Considered embraces editorial moves like pull-quotes and rhetorical flourishes. Versus *Premium Confident* — Quiet Authority refuses to sell; Premium Confident communicates premium-ness while still doing marketing work.

**Canonical examples.** Aman properties, Cheval Blanc, Hermès editorial, considered fashion houses (Loewe, Phoebe Philo's brand), premium gallery and museum sites.

**Internal logic.**
- Sentences are short-to-medium, declarative, often without rhetorical flourish.
- Adjectives are sparing — the brand earns description through specificity, not adjective stacking.
- No exclamation points. No performance. No urgency.
- Often paired with Editorial-Spacious density, Editorial Photography, Vertical-Rhythm Editorial layout.

**Failure mode.** AI tries to imitate Quiet Authority by removing some adjectives and exclamation points but keeping the underlying sales structure ("Discover our..." → "Our...") . The voice still reads as marketing-with-restraint, not as confident reduction.

- **Vibes:** *quiet luxury voice* — *expensive but restrained* — *no urgency in the writing* — *like a luxury hotel* — *unhurried copy* — *confident without selling*
- **Brand exemplars:** *like Aman's copy* — *like Cheval Blanc* — *like Hermès editorial* — *like Loewe*
- **Vernacular labels:** *quiet luxury voice* — *restrained voice* — *editorial-quiet copy* — *premium understatement*
- **Anti-vibes:** *not salesy* — *no "discover," "unleash," "unlock"* — *no exclamation points* — *not pushy* — *no "Build the future"*
- **Compositional intent:** *I want copy that doesn't try to convince* — *I'm building for an audience that already trusts the brand* — *make it feel expensive but quiet* — *I don't want it to sound like a startup*

---

## VOICE-2. Editorial Considered

**Definition.** Magazine-coded — measured, intelligent, with editorial moves like pull-quotes, parenthetical asides, rhythm shifts. The voice of considered editorial publications and brands that want to feel publishing-coded.

**Dimensional coordinates (approximate):** Slightly Serious to Middle Humor, Slightly Formal, Respectful, Slightly Enthusiastic, Flowing, Middle Vocabulary.

**Distinguishing edge.** Versus *Quiet Authority* — Editorial Considered embraces ornament; Quiet Authority refuses it. Versus *Friendly Expert* — Editorial Considered is publication-coded; Friendly Expert is product-coded.

**Canonical examples.** Apartamento, Cereal Magazine, Soho House journal, NYT Style, Stripe Press articles, considered Substack publications.

**Internal logic.**
- Long-form rhythms with deliberate sentence-length variation.
- Editorial moves: parenthetical asides, dashes for emphasis, occasional pull-quotes.
- Vocabulary is precise and considered, but accessible (not academic).
- Often paired with Editorial Print typography, Two-Color Monochrome color, Vertical-Rhythm Editorial or Editorial-Grid Magazine layout.

**Failure mode.** AI imitates editorial style with a single rhythm shift or em-dash and calls it editorial. Real editorial voice has *sustained* rhythm and *sustained* intelligence — partial commitment reads as performative rather than editorial.

- **Vibes:** *magazine voice* — *editorial copy* — *like a real publication* — *thoughtful writing* — *considered* — *like a Soho House feature*
- **Brand exemplars:** *like Apartamento's copy* — *like Cereal Magazine* — *like Stripe Press articles* — *like NYT Style*
- **Vernacular labels:** *editorial voice* — *magazine voice* — *long-form voice* — *publication-style copy* — *editorial register*
- **Anti-vibes:** *not feature-bullet copy* — *not punchy SaaS copy* — *no "Get started in 2 minutes"*
- **Compositional intent:** *I want copy that has rhythm and intelligence* — *make it feel like a real publication* — *I want the writing to do work, not just label features*

---

## VOICE-3. Friendly Expert

**Definition.** Warm but knowledgeable. The voice of products that want to be approachable while still signaling competence. Mailchimp, Stripe (in customer-facing contexts), Notion, modern consumer fintech.

**Dimensional coordinates (approximate):** Light Humor, Casual, Respectful, Slightly Enthusiastic, Mixed Rhythm, Plain (with strategic Expert vocabulary).

**Distinguishing edge.** Versus *Direct Professional* — Friendly Expert has warmth and lightness; Direct Professional is purely functional. Versus *Casual Playful* — Friendly Expert maintains expertise signal; Casual Playful prioritizes humor over expertise.

**Canonical examples.** Mailchimp, Stripe (in customer-facing contexts), Notion, Monzo, Linear (in marketing), Webflow's documentation.

**Internal logic.**
- Contractions and conversational rhythm.
- Light humor used as seasoning, not the meal — never slows down information delivery.
- Technical content is explained, not avoided.
- Often paired with Geometric-Modernist typography, Marketing Single-Accent color, Soft-Container components.

**Failure mode.** AI conflates Friendly Expert with Casual Playful and adds too much humor — "Oh hi! 👋 Looks like you're trying to..." — which feels performative rather than expert. Real Friendly Expert is warm but information-dense.

- **Vibes:** *friendly but smart* — *Mailchimp-coded* — *warm and helpful* — *Stripe-warm* — *approachable expert* — *like a knowledgeable friend*
- **Brand exemplars:** *like Mailchimp* — *like Notion* — *like Stripe support* — *like Monzo* — *like Linear marketing*
- **Vernacular labels:** *friendly expert voice* — *warm professional* — *approachable technical* — *Mailchimp voice* — *Stripe voice*
- **Anti-vibes:** *not corporate* — *not stiff* — *not overly playful* — *not too cute* — *no "Oh hi! 👋"*
- **Compositional intent:** *I want it to be warm but credible* — *make it sound like a knowledgeable friend* — *I'm building a product, not a stand-up routine*

---

## VOICE-4. Direct Professional

**Definition.** Functional, clean, utility-first. No warmth and no coldness — just clear information delivered respectfully. Microsoft's documentation voice, GitHub's product copy, Google Developers' technical writing.

**Dimensional coordinates (approximate):** Serious, Middle Formality, Respectful, Matter-of-Fact, Punchy, Middle Vocabulary.

**Distinguishing edge.** Versus *Friendly Expert* — Direct Professional has no warmth performance; Friendly Expert leans into warmth. Versus *Quiet Authority* — Direct Professional is utility-first; Quiet Authority is brand-confidence-first.

**Canonical examples.** Microsoft documentation, GitHub product copy, Google Developers, IBM technical writing, considered B2B for sophisticated audiences, scientific publications.

**Internal logic.**
- Direct sentence structures, active voice preferred.
- No emotional language; no performance.
- Vocabulary is appropriate to audience — technical with technical readers, plain with general readers.
- Errors and edge cases are described literally, not euphemized.
- Often paired with Mono or Geometric-Modernist typography, Application Single-Accent color, Application-Density components.

**Failure mode.** AI sometimes drifts toward Quiet Authority (removing all marketing language) when Direct Professional is correct — producing copy that's neither functional nor confident, just neutral. Direct Professional is *actively* utility-first, not absent of voice.

- **Vibes:** *clear and direct* — *no fluff* — *Microsoft-coded* — *documentation voice* — *clean functional* — *no nonsense*
- **Brand exemplars:** *like Microsoft documentation* — *like GitHub copy* — *like Google Developers* — *like IBM technical writing* — *like Linear app*
  <!-- "like Linear app" added in Phase 2.1b Task 4c per attestation: multi-source convergence on Linear's app/interface voice as direct, minimal, action-oriented. Sources: LogRocket "Linear design: The SaaS design trend" ("clean and purposefully minimal", "being direct and offering minimal choices"); SaaSUI "Linear UI/UX Interface" (clean, action-oriented); Morgen "Linear Guide" ("issues should be clear and action-oriented, using a consistent structure: [Verb] [What] [Context]"); Linear's own UI redesign blog post (emphasis on clarity and directness without unnecessary complexity). Multiple corroborating sources confirm Linear's app voice fits Direct Professional (functional/clear/no-fluff). The pre-existing "like Linear marketing" in VOICE-3 is preserved — Linear's MARKETING site voice is a separate question that the Task 4c search didn't disprove (and may genuinely be Friendly Expert, distinct from Linear's app surface). The two altnames are intentionally placed in different voice grammars to capture brand-surface attestation distinctly; brief signals targeting Linear-as-app context (B2B dashboard, application UI) route to canonical-9 + VOICE-4 via the Stage 3b tie-breaker (Task 4a) which prefers the canonical-aligned candidate when ties exist. See docs/architectural-patterns.md "brand-surface conflation" pattern for the cross-phase v0.2 work needed to make brand-token substring matching less collision-prone. -->

- **Vernacular labels:** *direct voice* — *functional voice* — *documentation voice* — *technical writing* — *clear copy*
- **Anti-vibes:** *not marketing* — *not flowery* — *not chatty* — *no exclamation points* — *no humor*
- **Compositional intent:** *I want clear, useful information* — *no fluff, just what the user needs to know* — *I'm building documentation, not marketing*

---

## VOICE-5. Premium Confident

**Definition.** Apple's voice. Confident, clear, deliberately simple, benefit-driven. Treats sophistication as a given and distills it into accessible language. Premium hardware brands, considered consumer tech.

**Dimensional coordinates (approximate):** Serious, Slightly Casual, Respectful, Slightly Enthusiastic, Punchy, Plain.

**Distinguishing edge.** Versus *Quiet Authority* — Premium Confident still does marketing work (it's selling products); Quiet Authority refuses to sell. Versus *Friendly Expert* — Premium Confident has more authority and less warmth; Friendly Expert is warmer and more approachable.

**Canonical examples.** Apple product pages and marketing, Tesla product descriptions, Bang & Olufsen, premium consumer hardware brands, considered B2B with long sales cycles.

**Internal logic.**
- Short, clean sentences. Often imperative or declarative. Almost never compound.
- Benefit-driven, not feature-driven — describes what the product *does for you*, not what it *is*.
- Vocabulary is plain even when subject is sophisticated. Apple doesn't say "high-resolution display"; they say "the most stunning display we've ever made."
- Often paired with Marketing-Airy density, Product Photography or 3D Render, Brand-Stack layout.

**Failure mode.** AI imitates Apple-voice with the punchy short sentences but loses the *specificity* that makes Apple's copy work. The result reads as generic premium-aspiring marketing rather than as Premium Confident.

- **Vibes:** *Apple voice* — *premium and clear* — *confident simple* — *benefit-driven* — *like a hardware launch*
- **Brand exemplars:** *like Apple* — *like Tesla* — *like Bang & Olufsen* — *premium consumer hardware*
- **Vernacular labels:** *Apple voice* — *premium voice* — *confident voice* — *benefit-driven copy*
- **Anti-vibes:** *not technical-jargon* — *not feature-bulleted* — *not chatty* — *not editorial-flowing*
- **Compositional intent:** *I want it to feel like an Apple product page* — *premium but accessible* — *make complexity feel simple* — *speak in benefits, not features*

---

## VOICE-6. Casual Playful

**Definition.** Light, conversational, lightly humorous. The voice of consumer brands that want to feel like friends. Headspace, Glossier, Innocent Drinks, modern beauty and wellness.

**Dimensional coordinates (approximate):** Funny, Casual, Respectful, Enthusiastic, Punchy, Plain.

**Distinguishing edge.** Versus *Friendly Expert* — Casual Playful prioritizes warmth and humor over expertise signaling; Friendly Expert keeps expertise primary. Versus *Irreverent Bold* — Casual Playful is friendly and respectful; Irreverent Bold provokes.

**Canonical examples.** Headspace, Glossier, Innocent Drinks, Calm, modern beauty and wellness DTC brands, friendly consumer products.

**Internal logic.**
- Contractions, fragments, conversational rhythms.
- Light humor used liberally — puns, asides, gentle self-deprecation.
- Often uses second person ("you") and even first person plural ("we").
- Often paired with Pill-and-Cushion components, Pastel-Vibrant color, Lifestyle Photography or Custom Illustration imagery.

**Failure mode.** AI conflates Casual Playful with sales-coded enthusiasm and produces copy that reads as desperate-friendly rather than confident-friendly. Real Casual Playful is light *because* the brand is comfortable with itself; AI playfulness often reads as performance.

- **Vibes:** *playful and warm* — *like a friend* — *Headspace-coded* — *Innocent-coded* — *light and conversational* — *fun consumer voice*
- **Brand exemplars:** *like Headspace* — *like Glossier* — *like Innocent Drinks* — *like Calm*
- **Vernacular labels:** *casual playful* — *friendly voice* — *consumer-friendly voice* — *light voice*
- **Anti-vibes:** *not B2B* — *not enterprise* — *not stiff* — *not corporate* — *not too clever*
- **Compositional intent:** *I want it to sound like a friend* — *make it light and warm* — *I'm targeting consumers, not businesses*

---

## VOICE-7. Conversion-Punchy

**Definition.** The default modern SaaS marketing voice. Punchy headlines, benefit-focused subheads, urgent CTAs. The voice that AI defaults to and that all SaaS sites end up sounding like.

**Dimensional coordinates (approximate):** Middle Humor, Slightly Casual, Respectful, Slightly Enthusiastic, Punchy, Middle Vocabulary.

**Distinguishing edge.** Versus *Premium Confident* — Conversion-Punchy is selling actively; Premium Confident is communicating premium-ness. Versus *Friendly Expert* — Conversion-Punchy is conversion-optimized; Friendly Expert is relationship-oriented.

**Canonical examples.** Most YC startup landing pages, most v0/Lovable/Bolt outputs, most modern SaaS marketing (in the marketing surfaces, not the product itself), Webflow templates.

**Internal logic.**
- Short headlines (4–8 words). Benefit-driven subheads.
- Imperative CTAs ("Start free," "Get started," "Book a demo").
- Hero copy follows the formula: bold claim + supporting clarification + dual CTA.
- This is the AI default. Naming it as a profile lets briefs route *away* from it when other voices would be correct.
- Often paired with Conversion-Stack layout, Standard-Marketing density, Soft-Container components.

**Failure mode.** This *is* the failure mode for many briefs — vibe coders default to it because it's the most heavily-trained pattern. The mitigation is naming it explicitly and providing the anti-vibes that route briefs to better-suited voices.

- **Vibes:** *startup landing page voice* — *SaaS marketing voice* — *typical YC voice* — *standard product page copy*
- **Brand exemplars:** *typical YC startup voice* — *standard v0 output voice* — *generic SaaS landing page*
- **Vernacular labels:** *conversion copy* — *SaaS voice* — *landing page voice* — *startup voice*
- **Anti-vibes:** *(this IS the AI default — failure is using it where it doesn't belong)* — *not for hospitality* — *not for editorial* — *not for premium* — *Build the future of* — *Trusted by thousands* — *Get started in 2 minutes*
  <!-- "Build the future of" / "Trusted by thousands" / "Get started in 2 minutes" — three canonical AI-cliché SaaS landing page hero/CTA phrases attested in design-community vocabulary as the homogenized pattern users explicitly reject. Sources: 925Studios "AI Slop Web Design: Complete Guide" (lists "Build the future of work" / "Your all-in-one platform" / "Scale without limits" as canonical AI-cliché headlines that "say nothing about the actual product because AI generates them by averaging every headline it has seen"); Monet "Escape AI Slop Landing Page Design"; Medium/LaunchInTen "How to Write High-Converting Headlines for Your SaaS Landing Page in 2026" (uses "Trusted by thousands" / "Get started in 2 minutes" as exact cliché-rejection examples, contrasting with measurable-outcome headlines like "summarize meetings in 47 seconds"); Unbounce + Wearetenet SaaS landing page surveys documenting that ~80% of SaaS pages use "Start Free Trial" / "Get Started" / "Try for Free" / "Request a Demo" as CTAs. Altname form here is the cliché phrase itself (not the rejection form): bidirectional-substring matching means signal "no 'Build the future of' hero" contains the altname "Build the future of" → matches → eliminates VOICE-7. Form choice follows the attestation — 925Studios + Medium/LaunchInTen quote the cliché form, so the cliché form ships. See docs/altname-coverage-notes.md "Altname form principle" for the general rule. Fires for VOICE-7 specifically because VOICE-7 IS the Conversion-Punchy AI-default voice that produces these clichés. -->
- **Compositional intent:** *I want a standard, modern SaaS marketing voice* — *I'm building a typical landing page* — *I need conversions and the voice should support that*

---

## VOICE-8. Irreverent Bold

**Definition.** Anti-corporate, provocative, willing to challenge convention. The voice of brands that differentiate through personality and refusal of category norms. Liquid Death, Oatly, Cards Against Humanity, neo-brutalist indie SaaS.

**Dimensional coordinates (approximate):** Funny, Casual, Irreverent, Enthusiastic, Punchy, Plain.

**Distinguishing edge.** Versus *Casual Playful* — Irreverent Bold is *about something* (challenging the category, the corporate norm, the convention); Casual Playful is friendly without provocation. Versus *Conversion-Punchy* — Irreverent Bold rejects standard sales language; Conversion-Punchy operates within it.

**Canonical examples.** Liquid Death (water packaging), Oatly (oat milk anti-dairy stance), Cards Against Humanity, much of indie SaaS launches with neo-brutalist component grammar, Gumroad's voice.

**Internal logic.**
- Direct, often confrontational. Names competitors, names the category's failures, names its own jokes.
- Refuses category clichés deliberately — Liquid Death refuses the "clean wellness" tone of bottled water; Oatly refuses the "natural goodness" tone of dairy alternatives.
- Often uses humor as a weapon, not just as decoration.
- Often paired with Hard-Bordered components, Saturated-Primary color, Punchy-Discrete motion.

**Failure mode.** AI sometimes imitates the surface (some sass, some "bold" claims) without the *foundation* (a category to challenge, a position to defend). The result reads as edgy-for-edgy-sake rather than as Irreverent Bold.

- **Vibes:** *anti-corporate* — *bold and provocative* — *Liquid Death-coded* — *Oatly-coded* — *neo-brutalist voice* — *not-like-the-others*
- **Brand exemplars:** *like Liquid Death* — *like Oatly* — *like Gumroad* — *like Cards Against Humanity*
- **Vernacular labels:** *irreverent voice* — *anti-corporate voice* — *bold copy* — *provocative voice* — *disruptive voice*
- **Anti-vibes:** *not safe* — *not corporate* — *not friendly-startup* — *not Mailchimp-warm*
- **Compositional intent:** *I want to challenge the category* — *the brand is built on rejecting convention* — *make it provoke, not please*

---

## VOICE-9. Technical Precise

**Definition.** Domain-expert voice, pitched to technical audiences who want competence signaled through vocabulary, precision, and intellectual honesty. The voice of developer tools, technical infrastructure products, and B2B for sophisticated audiences.

**Dimensional coordinates (approximate):** Serious, Slightly Casual, Respectful, Matter-of-Fact, Mixed Rhythm, Expert.

**Distinguishing edge.** Versus *Direct Professional* — Technical Precise uses domain vocabulary explicitly to signal audience-fit; Direct Professional moderates vocabulary for broader access. Versus *Friendly Expert* — Technical Precise refuses warmth performance; Friendly Expert leans into warmth.

**Canonical examples.** Stripe API documentation, Linear's developer-coded marketing, Vercel's documentation, Cloudflare technical content, considered developer-tool marketing, Datadog's technical surfaces.

**Internal logic.**
- Domain vocabulary used precisely without explanation when audience is assumed expert.
- Concrete examples and specific implementations preferred over abstract claims.
- Acknowledges complexity and trade-offs rather than oversimplifying.
- Often paired with Mono-Discipline typography, Application Single-Accent color, Marketing-Density components, Application-Dense or Marketing-Dense density.

**Failure mode.** AI sometimes generates Technical Precise voice that has the *vocabulary* (terms like "idempotent," "asynchronous," "deterministic") without the *substance* — the words appear correct but the underlying claims are vague or wrong. Real Technical Precise voice is precise *because the writer knows the domain*; AI fakery is detectable by experts within seconds.

- **Vibes:** *developer voice* — *technical precision* — *for builders and engineers* — *Stripe API-coded* — *Linear-developer voice*
- **Brand exemplars:** *like Stripe API docs* — *like Linear's developer marketing* — *like Vercel docs* — *like Cloudflare technical content*
- **Vernacular labels:** *technical voice* — *developer voice* — *engineering voice* — *technical-precise copy* — *expert-audience voice*
- **Anti-vibes:** *not for non-technical users* — *not consumer-friendly* — *not chatty* — *not warm-marketing*
- **Compositional intent:** *I'm building for engineers and they will sniff out fakery* — *I want technical credibility through vocabulary and specificity* — *the audience is sophisticated and the voice should match*

---

# AI-SLOP VOICE ANTI-PATTERNS (CROSS-CUTTING)

These are voice tells that signal AI-generated copy regardless of which voice profile was attempted. They cross all profiles and represent the *generic AI voice* the spec exists to avoid.

The vocabulary anti-patterns:
- **The verb stack:** *delve, unleash, unlock, empower, seamlessly, effortlessly, revolutionize, transform.* The most-flagged AI-coded verbs.
- **The transition phrases:** *Furthermore, In today's fast-paced world, It's important to note that, Additionally, Moreover, In conclusion.*
- **The aspirational hero formulas:** *"Build the future of [X]," "Empower [Y] to [Z] better products," "The future of [W]," "Reimagine [V]."*
- **The placeholder copy:** *"Welcome to [Business Name], we offer quality [Service]," "Built for scale, easy to use, secure by default," "Trusted by thousands of teams worldwide."*
- **The hedging:** *"may help," "can support," "designed to enable."* Soft language that avoids commitment because the model doesn't actually know what the product does.
- **The bullet symmetry:** Three bullets, each with the same structure ("Faster X / Better Y / Simpler Z"). Real bullets don't always rhyme.

Naming these explicitly lets every voice profile include "no [AI-coded vocabulary]" in its anti-vibes, which gives the routing system positive signal for avoiding them.

This isn't a separate voice profile — it's a *cross-cutting anti-vibe layer* that applies to all profiles. The Compatibility Model in Turn 8 will formalize how anti-vibes work across the spec.

---

# How voice interacts with the other axes

Voice is unusually load-bearing for routing decisions because *the same visual grammars can host multiple voices* and *the same voice can be hosted by multiple visual grammars*. Some natural co-occurrences:

- **Quiet Authority + Vertical-Rhythm Editorial layout + Editorial Photography + Editorial-Spacious density + Stillness motion** = the luxury hospitality complete vocabulary
- **Friendly Expert + Conversion-Stack layout + Custom Illustration + Standard-Marketing density + Functional-Snappy motion** = friendly fintech / consumer SaaS
- **Premium Confident + Brand-Stack layout + 3D Render + Marketing-Airy density + Atmospheric-Depth motion** = Apple-tier consumer hardware vocabulary
- **Conversion-Punchy + Marketing-Bento layout + Standard-Marketing density + Functional-Snappy motion** = the modern AI startup vocabulary
- **Irreverent Bold + Neo-Brutalism layout + Saturated-Primary color + Hard-Bordered components + Punchy-Discrete motion** = neo-brutalist indie SaaS
- **Technical Precise + Marketing-Density components + Mono-Discipline typography + Application Single-Accent color** = developer-tool marketing
- **Editorial Considered + Editorial-Grid Magazine layout + Editorial Photography + Two-Color Monochrome color + Restrained-Atmospheric motion** = considered editorial publishing

Some combinations are *broken*:
- **Quiet Authority + Conversion-Stack layout** — the layout demands marketing energy the voice refuses to provide
- **Casual Playful + Hyper-Dense density** — the voice wants warmth, the density wants efficiency
- **Irreverent Bold + Editorial-Spacious + Restrained-Atmospheric motion** — the bold voice is suppressed by everything around it
- **Technical Precise + Pill-and-Cushion components + Pastel-Vibrant color** — the components and color contradict the voice's seriousness

Some combinations are *novel-but-coherent*:
- **Premium Confident + Documentary Photography** — premium hardware shown through behind-the-scenes manufacturing footage. Rare but defensible for craft-coded premium brands.
- **Quiet Authority + Mono-Discipline typography + Dark-Mode color** — premium-quiet voice in a developer-tool aesthetic. Stripe Press in some treatments approaches this.
- **Editorial Considered + Hard-Bordered components** — editorial intelligence in a neo-brutalist visual frame. Some Awwwards-tier publications experiment here.

The full Compatibility Model in Turn 8 will formalize this matrix.

---

# Open questions for v0.2

1. **The dimension extension (Rhythm and Vocabulary) is mine, not Nielsen Norman's.** I added them because they're real working-designer concerns — punchy vs flowing rhythm and expert vs plain vocabulary are explicit decisions in copy guidelines. But they may overlap with the four NN/G dimensions in ways that haven't been empirically tested. Flag for Turn 8 whether they should remain as dimensions or be folded into rhythm-based and vocabulary-based *substyles* of existing dimensions.

2. **Nine profiles may be too few or too many.** Common voices not represented as profiles: *Heritage Considered* (Stripe Press, premium-craft brands), *Mission-Earnest* (cause organizations, journalism, education), *Aspirational-Lifestyle* (fitness, wellness, athletics with motivational register). Each one is defensible as its own profile; together they could push the count to 12 or more. The routing test applies — does a brief uniquely route to *Heritage Considered* in a way that doesn't also fit *Editorial Considered* or *Premium Confident*? Worth revisiting in Turn 8.

3. **Voice profiles are more brittle to brand drift than visual grammars.** A brand like Mailchimp may shift its voice over 3–4 years more dramatically than it shifts its color palette. The maintenance cadence for voice altnames may need to be tighter than for visual grammars.

4. **Voice and copy generation overlap.** When the spec says "Friendly Expert voice," is Palate dictating *the voice* or *the actual copy*? The grammar specifies voice; the actual copy generation falls outside Palate's scope (it's the consuming AI tool's job). But the line is fuzzy — voice profiles include vocabulary anti-vibes that are essentially copy guidance. Flag for Turn 8 where the boundary lives.

5. **The dimensional representation may need its own UI.** If Palate ships with both profiles and dimensions, the MCP tool calling interface needs to handle both — `voice_profile: "Friendly Expert"` AND `voice_dimensions: { humor: 4, formality: 3, ... }` for the cases where briefs need fine control. This is implementation work for the eventual MCP server, but the spec should anticipate it.

---

*Turn 6 complete. Voice axis covered with 6 dimensions and 9 named profiles. Total spec status: 71 grammars across 8 axes (Layout 14, Typography 6, Color 9, Component 9, Motion 9, Imagery 9, Density 6, Voice 9) plus 6 voice dimensions as a separate representation layer. One axis remains: Reading-Pattern (Turn 7). Then Turn 8 (Compatibility Model) and Turn 9 (Synthesis Document).*

*Push back on anything before I proceed to Turn 7.*

# Palate v0.1 — Synthesis Document

This is the ninth and final document in the v0.1 spec. It synthesizes everything from Turns 0 through 8 into a coherent ship-ready artifact — the document a contributor reads first when joining the project, and the document that anchors implementation of the actual Palate MCP server.

The eight prior turns built the spec piece by piece. This document is the spec *as a whole*, with the parts arranged in the order someone implementing Palate would read them rather than the order I wrote them.

---

# 0. WHAT PALATE IS

Palate is an open-source MCP server that gives AI coding tools (Cursor, Lovable, v0, Claude Code, Bolt) a real design vocabulary. The problem it solves: AI-generated websites all look the same because language models default to the most common patterns in their training data — Inter font, purple-to-blue gradients, rounded-2xl on everything, three-column feature grids, "Build the future" hero copy. The result is what designers call **AI slop**: websites that look like they could belong to any company in any industry.

Palate fixes this by exposing a structured design vocabulary the AI tool can route against. When a user says "make it feel like a luxury hotel" or "I'm building a developer tool that needs to feel serious," Palate returns a card containing the right combination of typography, color, components, motion, imagery, density, voice, and reading patterns — opinionated, internally coherent, and resistant to the AI-default failure modes.

It's not a component library. It's not a Figma plugin. It's not a content generator. It's a *design vocabulary as MCP context* — a structured spec the AI tool reads to make better decisions about what to build.

## The thesis in one sentence

If AI-generated websites look the same because models default to the safe-mean of their training data, the fix is to give models access to *better* training data at runtime — curated, structured, opinionated — through a protocol they can already speak.

## Why an MCP server, not a markdown file

Static `DESIGN.md` files (like getdesign.md and the awesome-claude-design repository) work for single-brand styling but don't compose. Palate is multi-axis: a brief specifies multiple dimensions (luxury hotel + warm earthy palette + slightly playful voice) that need to combine coherently. An MCP server can run routing logic; a markdown file can't.

The MCP architecture also gives us:
- *Versioning.* Users pin to a v0.1.5 spec; v0.1.9 ships updated brand fingerprints without breaking their site.
- *Maintenance.* The brand fingerprint corpus updates automatically without users having to re-fetch markdown files.
- *Composition.* Multiple Palate cards can be combined for multi-page sites, with consistency checks between them.
- *Conflict detection.* The server can refuse incoherent combinations and suggest corrections.

---

# 1. THE EIGHT AXES

A complete website design vocabulary has eight independent decision axes. Each axis has its own grammars (named patterns) with substyles. A brief routes to one grammar per axis (occasionally two, when sections of the page differ); the combination is the design.

### 1.1 Layout (14 grammars)

How the page is structured at the macro level. The grammars cover everything from quiet-luxury vertical-rhythm to neo-brutalist anti-grids to data-dense dashboards.

Grammars: Vertical-Rhythm Editorial · Editorial-Grid Magazine · Marketing-Bento · Dashboard-Bento · Editorial-Bento · Conversion-Stack · Brand-Stack · Long-Form Stack · Scrollytelling Longform · Broken-Grid / Anti-Grid · Neo-Brutalism · Document / Prose · Catalog / Grid-of-Things · SPA / Dashboard · Side-Scroll / Horizontal

(That's 15, but Side-Scroll is treated as a substyle within Catalog for v0.1; will likely promote to its own grammar in v0.2 if briefs justify.)

### 1.2 Typography (6 grammars)

The system of typeface and type-treatment decisions.

Grammars: Two-Hand System · Single-Family Discipline · Editorial Print Vocabulary · Mono-Discipline · Geometric-Modernist (the AI default) · Maximalist-Expressive

### 1.3 Color (9 grammars)

The palette logic, from quiet-luxury restraint to neo-brutalist saturation to systematic application UI colors.

Grammars: Three-Color Discipline · Earth-Pulled Restraint · Two-Color Monochrome · Dark-Mode Dominant · Saturated-Primary · Pastel-Vibrant · Iridescent / Gradient-Tech · Marketing Single-Accent · Application Single-Accent

### 1.4 Component (9 grammars)

The atomic UI vocabulary — buttons, cards, inputs, navigation.

Grammars: Typographic-Discreet · Soft-Container System (the AI default) · Hard-Bordered (Neo-Brutalist) · Pill-and-Cushion · Sharp-Geometric · Glass / Layered · Maximalist-Decorative · Application-Density · Marketing-Density

### 1.5 Motion (9 grammars + Reduced-Motion layer)

How the page moves, in response to what triggers, with what easing.

Grammars: Stillness as Discipline · Restrained-Atmospheric · Functional-Snappy · Punchy-Discrete · Scroll-Driven Cinematic · Scrollytelling Narrative · Kinetic-Expressive · Atmospheric-Depth · Loading-and-Latency

Plus the cross-cutting Reduced-Motion layer specifying fallbacks for each grammar.

### 1.6 Imagery (9 grammars)

What visual content lives on the page, how it's sourced, how it's composed.

Grammars: Editorial Photography · Lifestyle Photography · Documentary Photography · Product Photography · 3D Render / CGI · Custom Illustration · Stock Photography (the AI-default failure mode) · Iconography and System Imagery · AI-Generated Imagery

### 1.7 Density (6 grammars)

How much information per screen, how it's spaced, what user expertise is assumed.

Grammars: Editorial-Spacious · Marketing-Airy · Standard-Marketing (the AI default) · Marketing-Dense · Application-Dense · Hyper-Dense

### 1.8 Voice (9 profiles + 6 dimensions)

The hybrid axis. Voice is represented as both continuous dimensions (precise coordinate system) and named profiles (common entry points).

Profiles: Quiet Authority · Editorial Considered · Friendly Expert · Direct Professional · Premium Confident · Casual Playful · Conversion-Punchy (the AI default) · Irreverent Bold · Technical Precise

Dimensions: Humor (funny↔serious) · Formality (formal↔casual) · Respectfulness (respectful↔irreverent) · Enthusiasm (enthusiastic↔matter-of-fact) · Rhythm (punchy↔flowing) · Vocabulary (expert↔plain)

The first four dimensions are the empirically-validated Nielsen Norman framework; the last two are working extensions.

### 1.9 Reading-Pattern (6 grammars)

How the user's eye moves across the page.

Grammars: F-Pattern · Z-Pattern · Gutenberg Diagram · Layer-Cake · Spotted / Bypassing · Mobile Thumb-Zone

---

# 2. ALTNAMES — THE FIVE-BUCKET ENTRY SYSTEM

Each grammar carries five distinct categories of alternative names. These are how vibe coders enter the system in their own language — not in designer terminology.

1. **Vibes** — feeling-coded phrases. *"Premium and sleek," "playful," "calm and reassuring."*
2. **Brand exemplars** — specific brands as patterns. *"Like Stripe," "like Aman," "like a typical YC startup."*
3. **Vernacular labels** — community shorthand. *"Editorial layout," "bento grid," "neo-brutalism."*
4. **Anti-vibes** — negative identification. *"Not SaaS-y," "no Inter everywhere," "no purple-to-blue gradients."*
5. **Compositional intent** — design problem in user voice. *"I want it to feel expensive but not loud," "I'm building for power users."*

Total altname entries across the spec: ~1,500.

The vocabulary is grounded in published industry sources — Lovable's documentation, Vercel's v0 prompting guide, the awesome-claude-design repository, and named AI Slop catalogs. It's not invented; it's collected.

---

# 3. THE COMPATIBILITY MODEL

The Compatibility Model from Turn 8 is the spec's integration layer. It does five things:

1. **Defines hard rules** — 22 broken combinations across five families (register mismatches, functional mismatches, motion-component mismatches, voice-visual mismatches, reading-pattern/layout forcing).
2. **Names canonical combinations** — 15 multi-axis pairings that cover the most common briefs (Luxury Hospitality, Editorial Magazine, Modern AI Startup, Standard SaaS Marketing, Premium Consumer Hardware, Wellness/Beauty DTC, Neo-Brutalist Indie SaaS, Developer Tool Marketing, Application UI, Editorial Long-Form, E-Commerce Catalog, Premium Editorial-Brand Hybrid, Awwwards Creative Agency, Cause/Journalism, Plain Document).
3. **Supports novel-but-coherent space** — combinations not in the 15 canonicals but defensible. The compositional intent altname bucket primarily serves this routing path.
4. **Provides routing logic** — the five-stage pipeline that maps brief → axis combination.
5. **Specifies the accessibility layer** — Reduced-Motion fallbacks per motion grammar plus broader WCAG 2.2 AA commitments.

Full details are in `compatibility-model.md`.

---

# 4. THE MAINTENANCE ARCHITECTURE

Per the architectural decision: structural grammars are curated, brand exemplars are derived. The spec is hybrid — markdown for interpretation work, JSON for observation work.

**The static curated spec** — markdown files for grammar definitions, voice dimensions and profiles, interpretive altname buckets (vibes, vernacular labels, anti-vibes, compositional intent). Source of truth for *what the system thinks*. Updated through GitHub PR review.

**The brand fingerprints** — `brand-fingerprints.json` containing current visual and voice expression for each brand exemplar named in altnames. Source of truth for *what brands currently look and sound like*. Updated automatically by the re-derivation worker.

**The re-derivation worker** runs monthly:
1. Visits each canonical URL on the brand watch list (~70 brands)
2. Captures full-page screenshots, computed CSS, primary copy
3. Extracts visual fingerprint (colors, typography, spacing, radii, shadows)
4. Extracts voice fingerprint (six-dimensional coordinates from copy analysis)
5. Compares to existing fingerprints, flags drift > threshold
6. Commits updated fingerprints with new `last_verified` dates
7. Generates drift report for human review

The MCP server reads both sources at routing time. Brief comes in → altname matching consults both interpretive (curated) and observational (derived) data → routing produces a card.

This contains the staleness problem without taking on the operational complexity of runtime scraping.

---

# 5. THE MCP SERVER ARCHITECTURE

The actual server is straightforward by MCP standards — the complexity is in the routing logic and corpus, not the protocol.

### 5.1 Server primitives exposed

Per MCP convention, the server exposes:

**Tools** (the AI tool can call these):
- `palate.route(brief: string) → Card` — main routing endpoint. Takes a natural-language brief, returns a single best-match card.
- `palate.route_multi(brief: string) → Card[]` — variation. Returns multiple cards for multi-page sites.
- `palate.validate(combination: AxisCombination) → ValidationResult` — checks an explicit axis combination for coherence; returns broken-combinations conflicts if any.
- `palate.list_canonical() → CanonicalCombination[]` — lists the 15 canonical combinations with their axis mappings.
- `palate.get_brand_fingerprint(brand: string) → BrandFingerprint` — returns the current fingerprint for a named brand.

**Resources** (the AI tool can read these):
- `palate://spec/grammars/{axis}` — full grammar definitions per axis
- `palate://spec/compatibility-model` — broken combinations, routing rules
- `palate://spec/canonical-combinations` — the 15 canonical pairings
- `palate://spec/brand-fingerprints` — current brand observation data
- `palate://spec/altnames/{bucket}` — altname blocks per axis per bucket

**Prompts** (templates the AI tool uses):
- `palate.brief-template` — a structured prompt template that helps the AI tool extract clean signals from user briefs before routing.

### 5.2 Routing pipeline (recap from Turn 8)

```
[User brief]
    ↓
[Stage 1: Extract signals]  — brand exemplars, vibes, vernacular, anti-vibes, intent, context
    ↓
[Stage 2: Bucket match]  — score each signal against all five altname buckets
    ↓
[Stage 3: Confidence per axis]  — rank candidate grammars per axis
    ↓
[Stage 4: Coherence check]  — broken combinations, register coherence, intent fit
    ↓
[Stage 5: Conflict resolution]  — override, snap-to-canonical, or surface conflict
    ↓
[Card output]  — full axis combination + tokens + components + voice guidelines + accessibility
```

### 5.3 Card schema

The card schema is detailed in Turn 8 Section 8. Summary: each card contains the axis combination, design tokens (CSS variables ready for use), component recipes, anti-pattern lists (AI-slop tells to avoid), voice guidelines (do-use and do-not-use phrases), reduced-motion fallback specs, accessibility commitments, and metadata including version and confidence.

This is the artifact AI coding tools consume. They drop it into a `.palate/` directory in their project, or feed it directly into context.

### 5.4 Transport

Both stdio (for local tools like Cursor and Claude Code) and Streamable HTTP (for remote/hosted use). MCP standard.

### 5.5 Authorization

OAuth 2.1 per MCP recommendation, but v0.1 ships with optional auth — public usage is anonymous. Auth becomes load-bearing if v0.2 adds personalization or rate-limited usage tiers.

---

# 6. THE REPOSITORY STRUCTURE

```
palate/
├── README.md                           — project intro, quick start
├── CONTRIBUTING.md                     — how to add altnames, grammars, fingerprints
├── LICENSE                             — open source license
├── spec/                               — the static curated spec
│   ├── grammars/
│   │   ├── layout.md
│   │   ├── typography.md
│   │   ├── color.md
│   │   ├── component.md
│   │   ├── motion.md
│   │   ├── imagery.md
│   │   ├── density.md
│   │   ├── voice.md                   — includes both profiles and dimensions
│   │   └── reading-pattern.md
│   ├── compatibility-model.md          — broken combinations, routing logic, accessibility layer
│   ├── canonical-combinations.md       — the 15 canonicals with full axis mappings
│   ├── brand-fingerprints.json         — derived data, machine-updated
│   └── altnames/
│       ├── vibes.md
│       ├── brand-exemplars.md
│       ├── vernacular.md
│       ├── anti-vibes.md
│       └── compositional-intent.md
├── tools/
│   ├── re-derivation/                  — the scraper and voice analyzer
│   │   ├── scraper.ts
│   │   ├── visual-fingerprint.ts
│   │   ├── voice-analyzer.ts
│   │   └── drift-report.ts
│   ├── routing-test/                   — validation suite
│   │   ├── canonical-tests.ts          — tests all 15 canonical combinations
│   │   ├── novel-tests.ts              — sample novel-but-coherent space
│   │   └── broken-combination-tests.ts — verifies hard-rules detection
│   └── examples/                       — sample briefs and expected outputs
│       └── briefs/
│           ├── 01-luxury-hotel.json
│           ├── 02-saas-landing.json
│           └── ... (20-30 examples)
├── mcp-server/                         — the actual server code
│   ├── src/
│   │   ├── routing/                    — the five-stage pipeline
│   │   ├── corpus/                     — spec loading
│   │   ├── card-generator/             — card schema population
│   │   ├── validation/                 — coherence checking
│   │   └── server.ts                   — MCP protocol layer
│   ├── package.json
│   └── README.md
├── docs/
│   ├── architecture.md                 — system architecture
│   ├── grammar-authoring.md            — how to write a new grammar
│   ├── altname-curation.md             — how to add altnames
│   ├── brand-fingerprint-format.md     — the JSON schema
│   └── mcp-integration.md              — how to use Palate from Cursor/Lovable/v0
└── .github/
    ├── workflows/
    │   ├── re-derivation.yml           — runs the worker monthly
    │   ├── routing-tests.yml           — validates spec on every PR
    │   └── publish-mcp.yml             — releases new versions
    └── ISSUE_TEMPLATE/
        ├── new-grammar.md
        ├── new-altname.md
        └── brand-fingerprint-drift.md
```

---

# 7. THE v0.1 SHIP CHECKLIST

What needs to be true for v0.1.0 to release:

**Spec content:**
- [ ] All 9 axis grammar documents finalized (drawn from Turns 1–7 with consolidation)
- [ ] Compatibility model document finalized (Turn 8)
- [ ] Canonical combinations document finalized (15 combinations with full axis mappings)
- [ ] All ~1,500 altname entries reviewed for authentic voice
- [ ] Initial brand-fingerprints.json populated for the ~70 brand exemplars

**Tooling:**
- [ ] Re-derivation worker functional, tested against the brand watch list
- [ ] MCP server implementing the five-stage routing pipeline
- [ ] Card generator producing the schema from Section 8
- [ ] Routing-test validation suite passing on all 15 canonicals
- [ ] Integration tested with at least Claude Code and Cursor

**Documentation:**
- [ ] README explaining what Palate is and how to install
- [ ] CONTRIBUTING explaining the curated/derived split
- [ ] Examples directory with 20–30 sample briefs and expected outputs
- [ ] At least one detailed walkthrough showing brief → card → AI-tool-output for a non-canonical combination

**Infrastructure:**
- [ ] Public GitHub repository
- [ ] CI/CD running re-derivation monthly
- [ ] Versioning scheme implemented (semantic versioning, version pinning supported)
- [ ] MCP server published to npm or wherever MCP tools register

---

# 8. WHAT v0.2 DEFERS

Real things v0.1 doesn't ship that v0.2 should:

- **Embedding-based altname retrieval.** v0.1 uses LLM interpretation against curated altnames; v0.2 adds vector embedding retrieval for arbitrary phrasings. Required when altname coverage gaps become routing failures.
- **Mission-Earnest and Aspirational-Lifestyle voice profiles.** Considered for v0.1 but didn't pass the routing test. v0.2 may add them if accumulated brief data justifies.
- **RTL language variants.** v0.1 ships LTR-default. v0.2 adds reading-pattern grammars for RTL languages and East Asian variants.
- **Per-vertical extension grammars.** Hospitality-specific layout substyles, fintech-specific component substyles, etc. v0.1 keeps grammars general; v0.2 layers verticals on top.
- **Brand observatory dashboard.** A visualization tool that shows current brand fingerprints alongside their spec descriptions, helping contributors flag drift visually.
- **Multi-page composition.** v0.1 generates per-page cards; v0.2 supports multi-page brief routing where the cards must stay consistent across pages.
- **The `Side-Scroll / Horizontal` layout grammar.** Currently a substyle within Catalog; v0.2 may promote it if briefs justify.

---

# 9. THE PROJECT IDENTITY

Palate is an open-source MCP server. The project should signal:

- **It's curated, not generated.** The spec is human-curated work, even when brand fingerprints are automated. The opinionated design judgment is the value.
- **It's anti-AI-slop, not anti-AI.** The system *helps* AI tools produce better work. It's a corrective layer, not an opposition.
- **It's composable, not prescriptive.** Eight axes that combine. Not "use this template."
- **It's authentic-voiced, not designer-coded.** Vibe coders enter the system in their own language.
- **It's auditable, not magical.** Every routing decision can be explained. The grammars and altnames are public; nothing is hidden.

The README's first paragraph should make all five of these clear in the user's first 30 seconds.

---

# 10. WHAT'S NEXT

Three concrete next steps after the v0.1 spec is locked:

**1. Build the routing-test validation suite first.** Before writing the MCP server code, write the tests. Each of the 15 canonical combinations should have a brief that routes to it. Each of the 22 broken combinations should be detected and blocked. The test suite is the spec's executable form.

**2. Build the re-derivation worker second.** Get the brand fingerprint pipeline working before the routing layer. The fingerprints are the most error-prone part of the system; getting them right early de-risks everything downstream.

**3. Build the MCP server third.** Once tests are passing and fingerprints are reliable, the server is mostly glue. Implement the five-stage pipeline against the corpus, generate cards per the schema, ship.

**4. Then test against real briefs.** Open the project publicly. Watch how vibe coders actually invoke it. Discover the gaps. Iterate.

---

*v0.1 spec complete. Nine documents totaling ~80,000 words. The eight axes, the compatibility model, the maintenance architecture, the routing logic, the card schema, the v0.1 ship plan. Palate is ready to be built.*

*The next artifact this project produces shouldn't be more spec — it should be the routing-test validation suite.*

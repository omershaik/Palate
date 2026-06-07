# Palate Grammar Survey v0.2 — Turn 8: Compatibility Model

This document integrates everything across the eight axes into a working system. After seven turns of grammar definition, the spec contains 77 grammars across eight axes plus 6 voice dimensions. The Compatibility Model is what makes it *work as a system* rather than as a catalogue.

It does five things:

1. **Hard rules.** Which axis combinations are coherent, which are broken, and how to detect each.
2. **Novel-but-coherent space.** How the system handles combinations that haven't been canonicalized but are defensible.
3. **Routing logic.** How a brief gets mapped to a combination of grammars across the eight axes.
4. **Accessibility layer.** The cross-cutting Reduced-Motion specification and broader accessibility commitments.
5. **Maintenance and scraping architecture.** Per the earlier decision: static spec + periodic re-derivation tool, structural grammars curated, brand exemplars derived.

It also resolves the open questions accumulated across all seven prior turns. There were 27 of them; I've addressed each in the relevant section below.

---

# 1. THE EIGHT AXES, RESTATED

For reference, here's the consolidated axis structure after Turn 7:

| Axis | Grammar count | Representation |
|---|---|---|
| Layout | 14 | Discrete grammars |
| Typography | 6 | Discrete grammars |
| Color | 9 | Discrete grammars |
| Component | 9 | Discrete grammars |
| Motion | 9 | Discrete grammars + Reduced-Motion layer |
| Imagery | 9 | Discrete grammars |
| Density | 6 | Discrete grammars |
| Voice | 9 profiles + 6 dimensions | Hybrid (continuous + discrete) |
| Reading-Pattern | 6 | Discrete grammars |
| **Total** | **77 grammars** | **Plus voice dimensions** |

Each grammar carries a five-bucket altname block: vibes, brand exemplars, vernacular labels, anti-vibes, compositional intent. Total altname entries across the spec: ~1,500 by my count.

---

# 2. HARD RULES — BROKEN COMBINATIONS

A **broken combination** is a pairing of grammars from different axes that produces incoherent output regardless of how well each individual grammar is implemented. The system must detect and refuse these — either by routing to a corrected combination, or by surfacing the conflict to the user.

The broken combinations fall into five families.

## Family A — Register Mismatches

These break because the grammars belong to incompatible brand registers.

| Combination | Why it breaks |
|---|---|
| Vertical-Rhythm Editorial layout + Conversion-Punchy voice | Layout signals quiet luxury, voice signals startup conversion. Reader senses the conflict immediately. |
| Aman-coded color (Three-Color Discipline) + Pill-and-Cushion components | Quiet luxury palette wants Typographic-Discreet or Sharp-Geometric components. Pill-and-Cushion is consumer-friendly register. |
| Hard-Bordered components + Restrained-Atmospheric motion | Component register is punchy and discrete; motion register is smooth and editorial. They contradict. |
| Stock Photography + Vertical-Rhythm Editorial layout | Layout signals premium custom photography; stock breaks the register entirely. |
| AI-Generated Imagery + any luxury voice profile (Quiet Authority, Premium Confident, Editorial Considered) | Luxury registers depend on perceived authenticity; AI imagery breaks trust. |
| Conversion-Punchy voice + Editorial-Spacious density | Voice wants to drive action; density wants to support reading. They work against each other. |

## Family B — Functional Mismatches

These break because the grammars are designed for different functional contexts.

| Combination | Why it breaks |
|---|---|
| F-Pattern reading + centered-everything layout | F-pattern requires left-aligned content for left-margin scanning. Centered alignment fights the entire grammar. |
| Z-Pattern reading + heavy text density | Z-pattern works only with visual structure and light text. Heavy text triggers F-pattern instead, wasting the bottom-right CTA. |
| Application-Density components + Marketing-Bento layout | Application components want utility-tight contexts; bento marketing wants generous cells. |
| Mobile Thumb-Zone reading + critical actions in stretch zone | The grammar is *defined* by thumb reach. Placing actions out of reach breaks the grammar's reason for existing. |
| Hyper-Dense density + first-time-user audience | Hyper-dense assumes expert user; first-time users can't navigate it. |
| Layer-Cake reading + uninformative headings | Layer-cake requires headings to carry meaning. "Introduction" / "Background" headings fail entirely. |

## Family C — Motion-Component Mismatches

These break because the motion grammar can't operate on the component grammar's surfaces.

| Combination | Why it breaks |
|---|---|
| Glass / Layered components + Stillness-as-Discipline motion | Glass effects only become legible *with* motion (parallax revealing content underneath). Stillness defeats the components. |
| Typographic-Discreet components + Punchy-Discrete motion | Typographic-Discreet has no shapes to "punch." There's nothing to discrete-animate. |
| Maximalist-Decorative components + Stillness-as-Discipline motion | Decorative components imply expressiveness; stillness contradicts that. |
| Mono-Density (Application) components + Scroll-Driven Cinematic motion | Application UI wants instant feedback motion; scroll-cinematic wants directed reveals. Different motion kinds for different purposes. |

## Family D — Voice-Visual Mismatches

These break because the voice doesn't fit the visual frame.

| Combination | Why it breaks |
|---|---|
| Technical Precise voice + Pill-and-Cushion components + Pastel-Vibrant color | Voice signals seriousness; visual elements signal consumer-friendly playfulness. |
| Quiet Authority voice + Conversion-Stack layout | Voice refuses to sell; layout is built for conversion. Internal contradiction. |
| Casual Playful voice + Hyper-Dense density | Voice wants warmth and breathing room; density refuses both. |
| Irreverent Bold voice + Editorial-Spacious + Restrained-Atmospheric motion | The bold voice is suppressed by everything around it. |

## Family E — Reading-Pattern / Layout Forcing

These aren't strictly broken, but the layout doesn't permit the reading pattern's optimization.

| Combination | Why it strains |
|---|---|
| Gutenberg reading + skimming audience | Gutenberg only applies when readers are engaged. Designing for it when audience is skimming wastes the bottom-right zone. |
| F-Pattern + Z-Pattern in same page section | Eye-tracking shows users default to one or the other, not both. The page has to commit. |

**Total broken combinations defined explicitly: 22.** This is not exhaustive — the matrix of pairwise combinations across all axes is in the thousands — but it covers the most common conflicts that AI tools produce by default and that a routing system should detect.

---

# 3. CANONICAL COHERENT COMBINATIONS

A **canonical combination** is a multi-axis pairing that has been validated as coherent in the wild — there are real, recognizable brands operating at this combination. These are the system's reliable defaults.

I'm naming **15 canonical combinations** that cover the most common briefs the MCP will receive. Each one corresponds to a recognizable register that vibe coders invoke regularly.

## 1. Luxury Hospitality

- **Layout:** Vertical-Rhythm Editorial
- **Typography:** Two-Hand System
- **Color:** Three-Color Discipline or Earth-Pulled Restraint
- **Component:** Typographic-Discreet
- **Motion:** Stillness as Discipline
- **Imagery:** Editorial Photography (Travel and Place substyle)
- **Density:** Editorial-Spacious
- **Voice:** Quiet Authority
- **Reading-Pattern:** Gutenberg (engaged) or F-pattern (skimming)
- **Brand exemplars:** Aman, Cheval Blanc, Singita, Soho House (quiet pages), considered fashion houses

## 2. Editorial Magazine

- **Layout:** Editorial-Grid Magazine
- **Typography:** Editorial Print Vocabulary or Two-Hand System
- **Color:** Earth-Pulled Restraint or Two-Color Monochrome
- **Component:** Sharp-Geometric or Typographic-Discreet
- **Motion:** Restrained-Atmospheric (Slow-Fade Editorial substyle)
- **Imagery:** Editorial Photography (mixed substyles)
- **Density:** Editorial-Spacious
- **Voice:** Editorial Considered
- **Reading-Pattern:** Gutenberg or F-Pattern
- **Brand exemplars:** Apartamento, Cereal Magazine, Soho House journal, NYT Style

## 3. Modern AI Startup

- **Layout:** Marketing-Bento (AI-Startup substyle)
- **Typography:** Geometric-Modernist
- **Color:** Dark-Mode Dominant or Iridescent
- **Component:** Soft-Container System
- **Motion:** Functional-Snappy
- **Imagery:** 3D Render (Stylized or Abstract substyles)
- **Density:** Standard-Marketing
- **Voice:** Conversion-Punchy or Premium Confident
- **Reading-Pattern:** Z-Pattern
- **Brand exemplars:** OpenAI, Anthropic, Linear marketing, Vercel, modern AI launches

## 4. Standard SaaS Marketing

- **Layout:** Conversion-Stack (SaaS-Refined substyle)
- **Typography:** Geometric-Modernist
- **Color:** Marketing Single-Accent
- **Component:** Soft-Container (Tailwind-Default or Stripe-Coded Refined)
- **Motion:** Functional-Snappy
- **Imagery:** Stock Photography or Custom Illustration
- **Density:** Standard-Marketing
- **Voice:** Conversion-Punchy or Friendly Expert
- **Reading-Pattern:** Z-Pattern
- **Brand exemplars:** Most YC startups, Stripe marketing, typical Webflow templates

## 5. Premium Consumer Hardware

- **Layout:** Brand-Stack (Product-Detail substyle)
- **Typography:** Single-Family Discipline
- **Color:** Iridescent or Dark-Mode Dominant
- **Component:** Glass / Layered (Light-Translucent substyle)
- **Motion:** Atmospheric-Depth or Scroll-Driven Cinematic
- **Imagery:** Product Photography (Studio-Lit) or 3D Render (Photorealistic)
- **Density:** Marketing-Airy
- **Voice:** Premium Confident
- **Reading-Pattern:** Z-Pattern + Brand-Stack scrolling
- **Brand exemplars:** Apple, Tesla, Bang & Olufsen, premium hardware launches

## 6. Wellness / Beauty DTC

- **Layout:** Conversion-Stack with Editorial elements, or Brand-Stack
- **Typography:** Two-Hand System or Geometric-Modernist
- **Color:** Pastel-Vibrant or Earth-Pulled Restraint (Warm-Saturated)
- **Component:** Pill-and-Cushion
- **Motion:** Restrained-Atmospheric (Breathing Hover substyle)
- **Imagery:** Lifestyle Photography (Sun-Soaked or Quiet-Moment)
- **Density:** Standard-Marketing or Marketing-Airy
- **Voice:** Casual Playful
- **Reading-Pattern:** Z-Pattern
- **Brand exemplars:** Glossier, Headspace, Aesop, modern beauty/wellness DTC

## 7. Neo-Brutalist Indie SaaS

- **Layout:** Neo-Brutalism
- **Typography:** Maximalist-Expressive or Mono-Discipline
- **Color:** Saturated-Primary
- **Component:** Hard-Bordered (Pure Brutalist or Hard-Shadow substyles)
- **Motion:** Punchy-Discrete
- **Imagery:** Custom Illustration or Stock with bold treatment
- **Density:** Standard-Marketing
- **Voice:** Irreverent Bold
- **Reading-Pattern:** Z-Pattern
- **Brand exemplars:** Gumroad, Around, Paddle, indie SaaS launches with neo-brutalist component grammar

## 8. Developer Tool Marketing

- **Layout:** Marketing-Bento (SaaS-Refined) or Conversion-Stack (Long-Form variant)
- **Typography:** Mono-Discipline or Geometric-Modernist with Mono accents
- **Color:** Dark-Mode Dominant
- **Component:** Marketing-Density components
- **Motion:** Functional-Snappy
- **Imagery:** 3D Render (Abstract) or Iconography or screenshot-led
- **Density:** Marketing-Dense
- **Voice:** Technical Precise
- **Reading-Pattern:** F-Pattern (heavy text) or Z-Pattern
- **Brand exemplars:** Stripe API page, Linear's developer marketing, Vercel docs landing, Cloudflare technical content

## 9. Application UI (Modern B2B Dashboard)

- **Layout:** SPA / Dashboard or Dashboard-Bento
- **Typography:** Geometric-Modernist or Mono-Discipline
- **Color:** Application Single-Accent or Dark-Mode Dominant
- **Component:** Application-Density (Mono-Density Application)
- **Motion:** Functional-Snappy + Loading-and-Latency
- **Imagery:** Iconography (Custom Icon System), screenshots, data visualization
- **Density:** Application-Dense
- **Voice:** Direct Professional
- **Reading-Pattern:** Task-driven (custom — see canonical 9 note below)
- **Brand exemplars:** Linear, Stripe Dashboard, Notion, GitHub, modern B2B applications

*Note on canonical 9:* Reading-pattern in application UIs is task-driven rather than scan-driven — users have specific actions in mind. The closest grammar is Mobile Thumb-Zone for mobile applications and a custom mix for desktop. This is flagged as Open Question Resolution #14 below.

## 10. Editorial Long-Form (Substack / Stripe Press)

- **Layout:** Long-Form Stack
- **Typography:** Two-Hand System or Editorial Print Vocabulary
- **Color:** Two-Color Monochrome or Three-Color Discipline
- **Component:** Sharp-Geometric or Typographic-Discreet
- **Motion:** Stillness as Discipline or Restrained-Atmospheric
- **Imagery:** Editorial Photography (where present) or no imagery
- **Density:** Editorial-Spacious
- **Voice:** Editorial Considered
- **Reading-Pattern:** Gutenberg
- **Brand exemplars:** Stripe Press articles, premium Substack publications, longform journalism

## 11. E-Commerce Catalog

- **Layout:** Catalog / Grid-of-Things
- **Typography:** Geometric-Modernist or Two-Hand System (for fashion)
- **Color:** Marketing Single-Accent
- **Component:** Soft-Container with product-card vocabulary
- **Motion:** Functional-Snappy + Loading-and-Latency
- **Imagery:** Product Photography (varied substyles per category)
- **Density:** Standard-Marketing or Marketing-Dense
- **Voice:** Friendly Expert (consumer) or Technical Precise (B2B)
- **Reading-Pattern:** Spotted (intentional, comparative-browsing)
- **Brand exemplars:** Amazon, Airbnb listings, Mejuri, considered DTC catalog sites

## 12. Premium Editorial-Brand Hybrid (Soho House Tier)

- **Layout:** Editorial-Grid Magazine + Vertical-Rhythm Editorial sections
- **Typography:** Two-Hand System with Editorial Print moves
- **Color:** Earth-Pulled Restraint (Warm-Heritage) or Three-Color Discipline
- **Component:** Sharp-Geometric or Typographic-Discreet
- **Motion:** Restrained-Atmospheric
- **Imagery:** Editorial Photography (mixed) + Lifestyle Photography (Quiet-Moment)
- **Density:** Editorial-Spacious
- **Voice:** Editorial Considered or Quiet Authority
- **Reading-Pattern:** F-Pattern with Gutenberg sections
- **Brand exemplars:** Soho House, Hermès editorial, considered hospitality with editorial register

## 13. Awwwards-Tier Creative Agency

- **Layout:** Broken-Grid / Anti-Grid
- **Typography:** Maximalist-Expressive
- **Color:** Iridescent or Saturated-Primary or Two-Color Monochrome
- **Component:** Maximalist-Decorative or Sharp-Geometric
- **Motion:** Kinetic-Expressive (often with WebGL or Cursor-Reactive substyles)
- **Imagery:** Custom Illustration, 3D Render, or Documentary
- **Density:** Variable, often Marketing-Airy in spread but Hyper-Dense in moments
- **Voice:** Editorial Considered or Irreverent Bold
- **Reading-Pattern:** Spotted (intentional) with art-directed eye paths
- **Brand exemplars:** Locomotive, KOTA, Studio La Tas, BDSN Club, Awwwards Site of the Day winners

## 14. Cause / Journalism / Mission-Driven

- **Layout:** Long-Form Stack or Scrollytelling Longform
- **Typography:** Two-Hand System or Editorial Print Vocabulary
- **Color:** Two-Color Monochrome or restrained earth
- **Component:** Sharp-Geometric or Typographic-Discreet
- **Motion:** Restrained-Atmospheric or Scrollytelling Narrative
- **Imagery:** Documentary Photography (Photojournalism or Reportage)
- **Density:** Editorial-Spacious
- **Voice:** *Mission-Earnest* (a profile I considered but didn't add — see Open Question Resolution #16 below; closest existing is Quiet Authority + matter-of-fact)
- **Reading-Pattern:** Gutenberg
- **Brand exemplars:** NYT longform, IPCC reports, NASA mission sites, advocacy organization sites

## 15. Plain Document (Paul Graham Tier)

- **Layout:** Document / Prose
- **Typography:** Single-Family Discipline (often serif) or browser default
- **Color:** Two-Color Monochrome (essentially black on white)
- **Component:** Typographic-Discreet (often no components at all)
- **Motion:** Stillness as Discipline
- **Imagery:** None or rare (no imagery is itself a choice)
- **Density:** Editorial-Spacious
- **Voice:** Editorial Considered or Direct Professional
- **Reading-Pattern:** Gutenberg
- **Brand exemplars:** Paul Graham's site, Gwern, Dan Luu's blog, Bret Victor

---

# 4. NOVEL-BUT-COHERENT SPACE

A **novel-but-coherent combination** is one that's not in the canonical list but is defensible — the axis choices don't break each other; they just haven't been canonicalized as a recognizable register. The system should support these without forcing every brief into one of the 15 canonicals.

This is the bucket your earlier note about "may even create its own style" lives in. The Compositional Intent altname bucket exists *primarily* to serve novel-but-coherent routing.

## How the system identifies novel-but-coherent

Three checks run sequentially:

**Check 1: No broken combinations.** The proposed combination doesn't include any pair from the 22 broken combinations in Section 2.

**Check 2: Coherent register.** The combination doesn't span incompatible registers — for example, mixing luxury-hospitality color (Three-Color Discipline) with neo-brutalist motion (Punchy-Discrete) would be a register clash even though it's not on the broken list, because the brand register signals are pulling in different directions.

**Check 3: Compositional intent fits.** The user's stated compositional intent (from the prompt) actually maps to the proposed combination. If the user said "I want it to feel premium but rooted," the proposed combination should serve that.

If all three pass, the combination is *novel-but-coherent* and the system serves it.

## Examples of novel-but-coherent combinations

These are real, defensible combinations that aren't in the 15 canonicals:

- **Editorial Long-Form + Atmospheric-Depth motion + Glass / Layered components.** Editorial article pages with subtle atmospheric depth on quotations and call-outs. No canonical brand operates here, but it's coherent.
- **Premium Consumer Hardware + Documentary Photography.** Premium hardware shown through behind-the-scenes manufacturing footage. Some heritage menswear approaches this.
- **Modern AI Startup + Editorial Considered voice.** AI startup landing page with longer-form considered copy instead of conversion-punchy. Less common but defensible for AI products marketing to sophisticated audiences.
- **Wellness DTC + Neo-Brutalist components.** Wellness brand with hard-bordered components. Rare but possible — some Y2K-revival wellness brands experiment here.
- **Plain Document + Mono-Discipline typography + Dark-Mode color.** Personal site for technical writer in dark mode terminal aesthetic. Gwern in some treatments approaches this.

## How novel-but-coherent gets handled in routing

Three options for the routing logic when it identifies a novel-but-coherent combination:

1. **Serve directly.** Return the combination with a note that this isn't a canonical register but is coherent. Confidence indicator below 1.0.
2. **Suggest a canonical match.** If the novel combination is *close* to a canonical one, surface the canonical and let the user accept or stick with novel.
3. **Ask for confirmation.** For high-divergence novel combinations, ask the user whether they really want to route here or whether they meant something canonical.

The MCP server's tool schema should support all three behaviors and let the consuming AI tool choose based on user prompt context.

---

# 5. ROUTING LOGIC

This section defines how a brief gets translated into an axis combination. The routing layer is the heart of what makes Palate work as an MCP server.

## 5.1 Brief → Routing Pipeline

```
[USER BRIEF]
    ↓
[Stage 1: Extract Signals]
    ↓
[Stage 2: Bucket Match]
    ↓
[Stage 3: Confidence Scoring per Axis]
    ↓
[Stage 4: Coherence Check]
    ↓
[Stage 5: Conflict Resolution]
    ↓
[OUTPUT: Axis Combination + Cards + Confidence]
```

### Stage 1: Extract Signals

The LLM router (the consuming AI tool, or an embedded LLM in the MCP server) extracts signals from the brief:

- **Brand exemplars mentioned** ("like Stripe," "make it like Aman")
- **Vibe phrases** ("premium," "playful," "warm")
- **Vernacular labels** ("editorial layout," "bento grid")
- **Anti-vibes** ("not SaaS-y," "no Inter everywhere")
- **Compositional intent** ("I want it to feel quiet but credible")
- **Functional context** ("I'm building a marketing page for a developer tool")
- **Audience signals** ("for power users," "first-time visitors")
- **Domain signals** ("hospitality," "fintech," "indie SaaS")

### Stage 2: Bucket Match

For each signal, find matches across all five altname buckets in all 77 grammars (plus voice profiles):

- Brand exemplar match — score 0.9 (high confidence — direct invocation)
- Vibe match — score 0.6 (medium — vibes are less specific)
- Vernacular match — score 0.7 (medium-high — designer terms are precise)
- Anti-vibe match — score 0.8 inverted (high — anti-vibes positively locate the OPPOSITE grammar)
- Compositional intent match — score 0.5 (medium-low — intent requires more interpretation)

The same signal often matches multiple grammars across multiple axes. That's expected — "modern" matches Geometric-Modernist typography, Soft-Container components, Functional-Snappy motion, AND Marketing Single-Accent color. The compatibility check in Stage 4 resolves these into a coherent combination.

### Stage 3: Confidence Scoring per Axis

For each of the 8 axes, the router computes a ranked list of matching grammars with confidence scores. The top match per axis is the candidate; secondary matches are kept as alternatives.

Each axis has independent scoring. Voice has the additional dimensional layer — if the brief specifies coordinates ("matter-of-fact," "no humor"), those override profile matches.

### Stage 4: Coherence Check

The candidate combination (top match per axis) is checked against:

1. The 22 broken combinations from Section 2.
2. The register-coherence heuristic (do all axes signal the same brand register?).
3. The compositional intent expressed in the brief (does the combination serve the stated intent?).

If the candidate combination passes all three, it's served.

If it fails any, Stage 5 runs.

### Stage 5: Conflict Resolution

When the candidate combination contains broken pairs or register clashes, the router chooses one of three resolutions:

**Resolution A — Override one axis.** Keep all axes except the conflicting one; replace the conflicting axis with its second-ranked match. Often this resolves the conflict because the secondary match is more compatible with the rest.

**Resolution B — Snap to canonical.** If the candidate combination is *close* to a canonical from Section 3, snap to the canonical even if it overrides some lower-confidence axis matches. This is the safest default.

**Resolution C — Surface conflict to user.** For combinations the system can't resolve confidently, return both options with a flag — let the consuming AI tool present them to the user for choice.

## 5.2 Disambiguation rules for ambiguous altname matches

When a single signal matches multiple grammars across multiple axes (the "modern" case), use these rules:

1. **Domain context wins.** If the brief mentions "fintech" or "luxury hotel" or "developer tool," the domain biases the routing across all axes.
2. **Functional context wins.** "Marketing page" and "application UI" trigger different default biases for layout, density, and component grammar.
3. **Audience expertise wins.** "For power users" pulls density and component toward Application-Dense; "for first-time visitors" pulls toward Marketing-Airy.
4. **Anti-vibes are weighted 1.5×.** Negative signals are more diagnostic than positive ones — "not SaaS-y" is a clearer routing signal than "premium" because it eliminates more grammars.
5. **Compositional intent wins ties.** When two axis combinations score equally, the one that better serves the stated compositional intent wins.

## 5.3 What the MCP server returns

The output schema:

```json
{
  "combination": {
    "layout": { "grammar": "Vertical-Rhythm Editorial", "substyle": "Hospitality-Coded", "confidence": 0.92 },
    "typography": { "grammar": "Two-Hand System", "substyle": "Display Serif + Sans Body", "confidence": 0.88 },
    "color": { "grammar": "Earth-Pulled Restraint", "substyle": "Warm-Matte Earth", "confidence": 0.85 },
    "component": { "grammar": "Typographic-Discreet", "substyle": "Bordered-Word", "confidence": 0.91 },
    "motion": { "grammar": "Stillness as Discipline", "substyle": "Stillness-with-Hover", "confidence": 0.87 },
    "imagery": { "grammar": "Editorial Photography", "substyle": "Travel and Place Editorial", "confidence": 0.83 },
    "density": { "grammar": "Editorial-Spacious", "substyle": "Magazine-Spaced", "confidence": 0.86 },
    "voice": {
      "profile": "Quiet Authority",
      "dimensions": { "humor": 1, "formality": 6, "respectfulness": 9, "enthusiasm": 2, "rhythm": 6, "vocabulary": 4 },
      "confidence": 0.89
    },
    "reading_pattern": { "grammar": "Gutenberg Diagram", "substyle": "Engaged-Article", "confidence": 0.78 }
  },
  "canonical_match": "Luxury Hospitality",
  "canonical_match_confidence": 0.91,
  "reduced_motion_fallback": { /* see Section 6 */ },
  "cards": [ /* the actual content the AI tool consumes — see Section 8 */ ],
  "alternatives": [ /* secondary axis matches kept for reference */ ],
  "open_warnings": [ /* any conflicts resolved during routing that the user should know about */ ]
}
```

This is the routing output schema as it would actually ship in v0.1 of the MCP server.

---

# 6. ACCESSIBILITY LAYER (REDUCED-MOTION + BROADER COMMITMENTS)

Per Mohammed's earlier decision, the Reduced-Motion layer is cross-cutting — every motion grammar inherits a reduced-motion fallback specification. This section formalizes it.

## 6.1 Reduced-Motion fallbacks per motion grammar

| Motion Grammar | Reduced-Motion Fallback |
|---|---|
| Stillness as Discipline | No fallback needed (no motion in the first place). |
| Restrained-Atmospheric | Disable parallax. Reduce fade durations to ~10ms (effectively instant). Keep hover color transitions. |
| Functional-Snappy | Reduce all transition durations to ~10ms. Keep state changes visible (don't break feedback). Remove decorative micro-interactions. |
| Punchy-Discrete | Already mostly motion-discrete; minimize residual smooth transitions. |
| Scroll-Driven Cinematic | Disable scroll-triggered animations entirely. Show all content in final state on load. This is a substantial fallback — page works without the cinema. |
| Scrollytelling Narrative | Most challenging. Often requires a dedicated reduced-motion version that presents the story as continuous text/images without scroll-locked behavior. May need to render a separate page. |
| Kinetic-Expressive | Disable continuous and reactive motion. Show typography in primary state without axis animation. Remove cursor-reactive effects. |
| Atmospheric-Depth | Replace translucent/blurred surfaces with opaque-with-borders versions. Disable parallax-depth motion. |
| Loading-and-Latency | Disable shimmer effects (decorative). Keep functional loaders (skeleton, progress bars) since they convey state information. |

Every Palate card includes a `reduced_motion_fallback` field that declares the fallback explicitly. The MCP server's output includes the fallback alongside the primary motion grammar.

## 6.2 Broader accessibility commitments

Beyond reduced-motion, the spec commits to:

- **WCAG 2.2 AA contrast minimums.** Every color grammar's substyles include contrast-validated color pairings.
- **Touch target minimums (44×44px).** Every component grammar's substyles meet mobile tap target standards.
- **Keyboard navigation.** Every component grammar specifies focus states; every motion grammar's fallback supports keyboard traversal.
- **Screen reader semantics.** Every component grammar's substyles are described in terms compatible with semantic HTML and ARIA where applicable.
- **High-contrast modes.** Every color grammar includes a high-contrast variant for users with prefers-contrast preferences.

These commitments are implementation requirements for cards Palate generates, not just descriptions. The card schema (Section 8) includes accessibility fields that must be populated.

---

# 7. MAINTENANCE & SCRAPING ARCHITECTURE

This is the section your earlier decision called for explicitly. The architecture has four parts: a static curated spec, a periodic re-derivation tool, version pinning, and a contributor workflow.

## 7.1 The static curated spec (the markdown corpus)

Source of truth for: structural grammars, voice dimensions and profile coordinates, the interpretive altname buckets (vibes, vernacular, anti-vibes, compositional intent).

Format: markdown files like the seven turns we've produced, plus the synthesis document (Turn 9).

Update cadence: human-curated. Changes go through pull-request review on the public repository (per the open-source-from-day-one decision).

Versioning: semantic versioning. v0.1.0 is the initial ship. v0.2.0 adds the imagery embedding layer mentioned in earlier turns. Breaking changes increment the major version.

## 7.2 The periodic re-derivation tool

Source of truth for: brand exemplar fingerprints — the *current* visual and voice expression of each brand named in the spec.

Format: a separate JSON file (`brand-fingerprints.json`) that the MCP server reads alongside the markdown corpus. Brand exemplars in altnames carry a `last_verified` date and a `fingerprint_id` that points into this file.

Update cadence: monthly automated re-derivation, plus on-demand updates when contributors flag drift.

Architecture:

```
[Brand Watch List]              [Static Spec markdown]
       ↓                                   ↓
[Re-Derivation Worker]
       ↓
   ┌───┴───┐
   ↓       ↓
[Scraper] [Voice Analyzer]
   ↓       ↓
[Visual fingerprint]   [Voice coordinates]
   └───┬───┘
       ↓
[brand-fingerprints.json] (versioned)
       ↓
[MCP Server reads at routing time]
```

The re-derivation worker:

1. Visits each canonical URL on the brand watch list (~70 URLs covering the brand exemplars across all axes).
2. Captures: full-page screenshot, computed CSS for the page, raw HTML, primary copy text.
3. Runs visual fingerprint analysis: extracts color tokens (top 8 colors by usage frequency), typography (computed `font-family` and weights), spacing values (most common padding/margin units), border radius distribution, shadow usage.
4. Runs voice analysis: extracts headline + body copy, runs through dimensional analysis (humor, formality, respectfulness, enthusiasm scores), classifies to nearest profile.
5. Compares to existing fingerprint in `brand-fingerprints.json`. Flags drift > threshold.
6. Commits new fingerprints with `last_verified` dates updated.
7. Generates a drift report for human review.

## 7.3 Version pinning

The MCP server takes a `palate_version` parameter. v0.1.5 returns the spec as of that version's brand fingerprints; v0.1.9 returns updated fingerprints.

Users pinning to v0.1.5 see "Mailchimp" interpreted as it was in May 2026; users on v0.1.9 see the November 2026 interpretation. This protects against unexpected drift breaking existing AI-generated sites that rely on stable interpretation.

## 7.4 Contributor workflow

The static spec lives in a public GitHub repository. Contributors:

- File issues for missing brand exemplars or grammar gaps.
- Submit pull requests adding altnames or fixing existing ones.
- Submit pull requests with new canonical combinations they've identified.
- Run the re-derivation tool locally to flag drift before opening PRs.

Repository structure (proposed):

```
palate/
├── spec/
│   ├── grammars/
│   │   ├── layout.md
│   │   ├── typography.md
│   │   ├── color.md
│   │   ├── component.md
│   │   ├── motion.md
│   │   ├── imagery.md
│   │   ├── density.md
│   │   ├── voice.md
│   │   └── reading-pattern.md
│   ├── compatibility-model.md   (this document)
│   ├── canonical-combinations.md
│   ├── brand-fingerprints.json   (derived, machine-updated)
│   └── altnames/
│       └── [bucket files per axis]
├── tools/
│   ├── re-derivation/    (the scraper and voice analyzer)
│   ├── routing-test/     (validation suite)
│   └── examples/         (sample briefs and expected routing outputs)
├── mcp-server/           (the actual MCP server code)
└── docs/
    ├── README.md
    ├── CONTRIBUTING.md
    └── examples/
```

## 7.5 The hybrid approach in practice

The architectural decision was: structural grammars curated, brand exemplars derived. Concretely:

- *Vertical-Rhythm Editorial* as a layout grammar — its definition, substyles, internal logic, registers it hosts and resists — is in `spec/grammars/layout.md`. Updated through human review.
- *"Like Aman"* as an altname pointing to Vertical-Rhythm Editorial — the *fingerprint* of what Aman currently looks like is in `brand-fingerprints.json`. Updated automatically.
- The interpretive bucket for that altname (compositional intent: "I want it to feel like a luxury hotel") stays in the curated spec — the interpretation is human work.

The MCP server reads both at routing time and combines them. The fast routing path (matching altnames, scoring grammars) is cheap; the maintenance work (keeping fingerprints fresh) happens out-of-band.

---

# 8. CARD SCHEMA

The cards are what the consuming AI tool actually receives — the structured design context that tells Cursor or Lovable or v0 what to generate. This section formalizes the card schema.

A card is one axis combination. The MCP server returns one or more cards per brief.

```json
{
  "card_id": "luxury-hospitality-aman-coded-v0.1.0",
  "version": "0.1.0",
  "canonical_combination": "Luxury Hospitality",
  "axes": {
    "layout": { /* full Layout axis spec */ },
    "typography": { /* full Typography axis spec */ },
    "color": { /* full Color axis spec, with WCAG-validated pairings */ },
    "component": { /* full Component axis spec */ },
    "motion": { /* full Motion axis spec */ },
    "imagery": { /* full Imagery axis spec */ },
    "density": { /* full Density axis spec */ },
    "voice": { /* Voice profile + dimensions */ },
    "reading_pattern": { /* Reading-Pattern axis spec */ }
  },
  "tokens": {
    "color": { /* CSS variables ready for use */ },
    "typography": { /* font-family, scale, line-heights */ },
    "spacing": { /* spacing scale */ },
    "radius": { /* border-radius scale */ },
    "motion": { /* timing tokens, easing functions */ }
  },
  "components": {
    /* component recipes — button, card, input, nav, modal — each with
       primary, secondary, tertiary variants matching the component grammar */
  },
  "anti_patterns": [
    /* explicit list of AI-slop patterns to avoid for THIS combination */
  ],
  "voice_guidelines": {
    "do_use": [ /* phrases and patterns that fit the voice profile */ ],
    "do_not_use": [ /* AI-slop voice tells: "delve, unleash, unlock," etc. */ ]
  },
  "reduced_motion_fallback": {
    /* full fallback spec per Section 6 */
  },
  "accessibility": {
    "contrast_validation": "WCAG_2.2_AA",
    "touch_targets": "44px_minimum",
    "keyboard_navigation": "all_interactive_elements_focusable",
    "high_contrast_variant": { /* alternative tokens */ }
  },
  "metadata": {
    "last_updated": "2026-05-15T10:00:00Z",
    "source_grammars_version": "0.1.0",
    "source_fingerprints_version": "0.1.5",
    "confidence": 0.91
  }
}
```

This is the artifact AI coding tools consume. The structural grammar definitions are converted into concrete tokens and recipes that fit into a `.palate/` directory or get fed directly into the AI tool's context window.

---

# 9. RESOLUTION OF OPEN QUESTIONS FROM TURNS 1–7

Across the seven prior turns, I logged 27 open questions. Here's how the Compatibility Model resolves each one. (Numbered by appearance, not by axis.)

**Layout-1 (Bento-as-grammar):** Resolved in Turn 3 — Bento Modular split into Marketing-Bento, Dashboard-Bento, Editorial-Bento.

**Layout-2 (Hero-and-Stack split):** Resolved in Turn 3 — split into Conversion-Stack, Brand-Stack, Long-Form Stack.

**Layout-3 (Document/Prose as null state):** Resolved here — Document/Prose remains as a grammar (briefs do route to it: "make it like Paul Graham's site"), but it's marked as the *minimum-grammar* baseline, used for content where no other grammar's compositional rules apply. Confidence threshold for routing to Document/Prose is higher than for other grammars (we want strong signal before we strip away all design decisions).

**Typography-1 (Kinetic-Variable migration):** Resolved in Turn 3 — migrated to Motion as substyle of Kinetic-Expressive.

**Color-1 (Single-Accent split):** Resolved in Turn 3 — split into Marketing Single-Accent and Application Single-Accent.

**Color-2 (Earth-Pulled substyle naming):** Resolved in Turn 2 — geographic names replaced with aesthetic names (Warm-Saturated, Warm-Matte, Cool-Matte, Warm-Heritage).

**Component-1 (Soft-Container vs Apple-Refined):** Resolved in Turn 3 — Apple-Refined migrated to Glass / Layered as Light-Translucent substyle.

**Component-2 (Mono-Density split):** Resolved in Turn 3 — split into Application-Density and Marketing-Density.

**Motion-1 (Glass / Layered motion grammar):** Resolved in Turn 3 — Atmospheric-Depth added as 8th motion grammar.

**Motion-2 (Scroll-Driven Cinematic vs Scrollytelling Narrative):** Kept as separate grammars per the routing-test discipline. Compositional intent differs (marketing reveal vs editorial narrative) even when implementation overlaps.

**Motion-3 (Kinetic-Variable typography):** Resolved in Turn 3 — migrated to Motion's Kinetic-Expressive as Variable-Font Kinetic substyle.

**Motion-4 (Reduced-Motion as separate grammar):** Resolved here — Reduced-Motion is a *cross-cutting layer*, not a grammar. Section 6 of this document formalizes it.

**Motion-5 (Loading and Latency grammar):** Resolved in Turn 3 — Loading-and-Latency added as 9th motion grammar.

**Imagery-1 (Stock Photography as grammar):** Kept as a grammar (briefs explicitly route toward and away from it). Marked in card schema as the AI-default failure mode for many briefs.

**Imagery-2 (AI-Generated Imagery versioning):** The maintenance architecture in Section 7 handles this — the AI-imagery substyles will need annual review more than other substyles. Flagged for the re-derivation tool's special-attention list.

**Imagery-3 (Density vs Component overlap):** Resolved here — they're separate axes representing separate decisions. Application-Density density is "how much information per screen"; Application-Density components are "how each atom is sized." They co-occur frequently but are independent decisions in the card schema.

**Imagery-4 (Iconography axis location):** Kept in Imagery axis. Iconography is technically about UI atoms (component-coded), but vibe coders explicitly invoke iconography ("I want custom icons, not Lucide") in language that fits Imagery-axis altnames better than Component-axis altnames.

**Imagery-5 (Hyper-Dense vs Application-Dense merging):** Kept as separate grammars. The routing test passes — briefs for "Bloomberg trading platform" route to Hyper-Dense in a way that doesn't fit Application-Dense.

**Voice-1 (Rhythm and Vocabulary as dimensions):** Kept as dimensions for v0.1. Flagged for empirical validation in v0.2 — if the dimensions don't add routing precision in real use, they may collapse into the four NN/G dimensions.

**Voice-2 (Nine profiles vs more):** Kept at 9 for v0.1. *Heritage Considered*, *Mission-Earnest*, and *Aspirational-Lifestyle* were considered as additional profiles. Heritage Considered overlaps too much with Editorial Considered to pass the routing test. Mission-Earnest and Aspirational-Lifestyle are flagged for v0.2 — they may become real profiles if briefs accumulate that don't fit any of the 9.

**Voice-3 (Voice profile drift):** Resolved by the maintenance architecture in Section 7. Voice profiles' brand exemplars are derived; the structural definition stays curated.

**Voice-4 (Voice vs copy generation):** Resolved here — Palate dictates the voice profile and dimensions; the consuming AI tool generates the copy. The voice_guidelines field in the card schema bridges them — it gives "do use" and "do not use" patterns the AI tool applies during copy generation.

**Voice-5 (Dimensional UI in MCP):** Resolved by the card schema — `voice` field includes both `profile` and `dimensions`, and the routing logic supports both invocation paths.

**Reading-Pattern-1 (Reading-Pattern as separate axis):** Kept as separate axis. The dependencies on Layout are real but routable — the Compatibility Model handles them through the broken-combinations table.

**Reading-Pattern-2 (Spotted dual nature):** Resolved here — Spotted as *intentional* (catalog browsing) is the grammar; Spotted as *failure-mode* is moved to a diagnostic flag in the card schema. The card includes an `anti_patterns` field that flags broken-hierarchy failures.

**Reading-Pattern-3 (Mobile per-grammar variants):** Resolved here — Mobile Thumb-Zone is sufficient as a single mobile-specific grammar. Per-grammar mobile variants would be redundant; the responsive behavior is handled in the tokens (the card schema specifies mobile-adapted spacing and component sizes).

**Reading-Pattern-4 (RTL language variants):** Flagged for v0.2. v0.1 ships LTR-default. The Compatibility Model includes a placeholder for RTL grammar variants that will be populated when v0.2 expands internationalization.

**Reading-Pattern-5 (Spotted split):** Resolved by the dual-treatment above — Spotted-as-intentional stays as a grammar; Spotted-as-failure-mode becomes a diagnostic.

---

# 10. WHAT v0.1 SHIPS

For implementation clarity, here's what v0.1 actually delivers:

**Spec content:**
- 8 axes with 77 grammars and ~250 substyles
- 6 voice dimensions
- 15 canonical combinations
- 22 documented broken combinations
- ~1,500 altname entries across 5 buckets
- The Reduced-Motion accessibility layer
- Initial brand fingerprints for ~70 brands

**Tooling:**
- The re-derivation worker (initially run weekly during v0.1 stabilization, then monthly)
- The MCP server with the routing pipeline from Section 5
- Card generation supporting the schema in Section 8
- A routing-test validation suite covering all 15 canonical combinations and a sample of novel-but-coherent space

**Documentation:**
- The synthesis document (Turn 9)
- Per-axis grammar documents
- Compatibility model (this document)
- Examples directory with 20–30 sample briefs and their expected routing outputs

**What v0.2 defers:**
- Mission-Earnest and Aspirational-Lifestyle voice profiles (if accumulated brief data justifies them)
- RTL language variants of reading-pattern grammars
- Embedding-based retrieval for altnames (currently using LLM interpretation against curated altnames)
- The brand observatory dashboard
- Per-vertical extension grammars (hospitality-specific layout substyles, fintech-specific component substyles)

---

*Turn 8 complete. The Compatibility Model integrates eight axes with hard rules, novel-but-coherent space, routing logic, accessibility layer, maintenance architecture, card schema, and resolution of all 27 prior open questions.*

*Turn 9 next: Synthesis Document. The spec coherent as a single ship-ready artifact, ready to be turned into the actual Palate MCP server.*

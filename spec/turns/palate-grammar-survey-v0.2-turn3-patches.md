# Palate Grammar Survey v0.2 — Turn 3: Back-Catalog Patches

This document patches Turns 1 and 2 with subdivisions authorized in the previous conversation turn. It applies the **routing-test discipline**: a substyle earns its place only if a brief can route to it without routing to its parent grammar's other substyles. Substyles that always travel together get merged. Substyles that point to genuinely different decisions get split — sometimes promoted to their own grammar.

This document supersedes Turns 1 and 2 wherever it touches them. Turns 4 onward will reference this consolidated state.

---

## Summary of changes

**Layout (Turn 0 — original survey):**
- *Bento Modular* splits into three grammars
- *Hero-and-Stack* splits into three grammars
- Layout grammar count goes from 11 to 14 (with three names retired)

**Typography (Turn 1):**
- *Kinetic-Variable* substyle migrates out of Typography to Motion
- Typography grammar count goes from 7 to 6

**Color (Turn 1):**
- *Single-Accent System* splits into two grammars
- *Earth-Pulled Restraint* substyle naming corrected (already applied in Turn 2 preface)
- Color grammar count goes from 8 to 9

**Component (Turn 2):**
- *Soft-Container System* loses its *Apple-Refined* substyle (migrates to Glass/Layered)
- *Mono-Density* splits into two grammars
- Component grammar count goes from 8 to 9

**Motion (Turn 2):**
- *Atmospheric-Depth Motion* added as new grammar (paired with Glass/Layered components)
- *Loading-and-Latency Motion* added as new grammar
- *Kinetic-Expressive* gains *Kinetic-Variable Typography* substyle (migrated from Typography)
- Motion grammar count goes from 7 to 9

**New cross-cutting concept (lives in the Compatibility Model, Turn 7):**
- **Reduced-Motion Layer** as an attribute every motion grammar inherits, not a separate grammar.

**Total axis counts after patches:** Layout 14, Typography 6, Color 9, Component 9, Motion 9, plus four axes still to come (Imagery, Density, Voice, Reading-Pattern). Final spec will be approximately 60–70 grammars across eight axes.

---

# PATCHES TO LAYOUT GRAMMAR

## Bento Modular splits into three grammars

The original *Bento Modular* grammar described tiled grids of mixed-size cells, but the routing test exposes three internally-coherent expressions that don't safely compose. A brief asking for "Apple-style product page" routes to one grammar; a brief asking for "analytics dashboard" routes to another; a brief asking for "modular content tile layout for editorial" routes to a third. They share *cell-tile* logic but diverge in cell density, motion behavior, and information density per cell.

### LAYOUT-3a. Marketing-Bento

**Definition.** Tiled grid of mixed-size cells where each cell is a *self-contained marketing claim*. Cells are large (often 25–50% of viewport on desktop), low information density per cell, often containing a feature name plus a one-line claim plus an illustrative visualization. The grammar of contemporary product marketing pages.

**Distinguishing edge.** Versus *Dashboard-Bento* — Marketing-Bento has fewer, larger cells optimized for communication; Dashboard-Bento has many small cells optimized for information density. Versus *Editorial-Bento* — Marketing-Bento cells contain product claims; Editorial-Bento cells contain content excerpts.

**Substyles.**
- **Apple-Tier Marketing-Bento.** Large cells (often 1×2 or 2×2 spans), generous internal padding, refined typography, often paired with subtle gradients and product imagery. The Apple product detail page vocabulary.
- **AI-Startup Marketing-Bento.** 2×2 grid most common, dark-mode dominant, glow effects on cells, gradient backgrounds, Geometric-Modernist typography. The 2023–2026 AI product launch vocabulary.
- **SaaS-Refined Marketing-Bento.** Lighter, more restrained cell treatment, careful spacing, often with monochrome or single-accent color. Stripe, Linear's marketing pages.

**Canonical examples.** Apple product detail pages (iPhone, MacBook), Stripe's announcement pages, Linear marketing, OpenAI product pages, virtually every AI startup landing page 2023–2026, Vercel.

**Internal logic.**
- 2–4 column grid on desktop, 1 column on mobile.
- Cells are 1×1, 1×2, 2×1, 2×2 — mixed-size is the structural point.
- Cell internal padding is generous (32–64px on desktop) — this distinguishes from Dashboard-Bento's tight padding.
- Each cell contains: short heading, 1–2 sentence claim, illustrative visual. Information density per cell is *low*.
- Often paired with Geometric-Modernist typography, Dark-Mode Dominant or Single-Accent color, Soft-Container components, Functional-Snappy or Atmospheric-Depth motion.

**Registers it hosts.** Tech products, AI products, modern SaaS marketing, fintech marketing, developer tool launches, contemporary consumer tech.

**Registers it resists.** Hospitality (any tier). Editorial publishing. Heritage. Anywhere "scannable feature density" isn't the value proposition.

**Failure mode.** AI defaults to Marketing-Bento for *every* tech-coded brief, regardless of whether the product actually has bento-worthy features. The result is sites where the bento grid contains generic "Built for scale / Easy to use / Secure by default" placeholder cells.

### LAYOUT-3b. Dashboard-Bento

**Definition.** Tiled grid of small cells optimized for information density. Each cell is a metric, a status, an actionable element, or a mini-visualization. The grammar of analytics dashboards, ops tools, and data-rich application home pages.

**Distinguishing edge.** Versus *Marketing-Bento* — Dashboard-Bento prioritizes information density over communication; cells are smaller and more numerous. Versus *Catalog* — Dashboard-Bento cells are heterogeneous (different content types per cell); catalog cells are homogeneous.

**Substyles.**
- **Metrics-First Dashboard-Bento.** Cells are mostly KPI tiles — number, label, trend indicator. Common in analytics products and executive dashboards.
- **Mixed-Widget Dashboard-Bento.** Cells contain a mix of metrics, charts, lists, and quick actions. Common in modern admin panels and ops tools.
- **Customizable Dashboard-Bento.** Users can rearrange or resize cells. Implies drag-and-drop interaction. Common in productivity tools and BI products.

**Canonical examples.** Stripe Dashboard home, Linear's project dashboard, Notion's database overviews, GitHub's repo home, AWS Console home, Datadog dashboards, modern BI products.

**Internal logic.**
- 4–8 column grid on desktop, often denser than Marketing-Bento.
- Cell internal padding is tight (12–24px) — information density is the point.
- Cells contain functional elements: numbers, charts, lists, quick actions. Type is small (12–14px).
- Often paired with Geometric-Modernist or Mono typography, Dark-Mode Dominant or Application Single-Accent color, Mono-Density (Application-Density) components.

**Registers it hosts.** B2B SaaS dashboards, analytics products, ops tools, admin panels, BI tools, productivity application home pages.

**Registers it resists.** Marketing pages of any kind. Hospitality. Editorial. Anywhere users are *deciding* rather than *acting*.

**Failure mode.** AI applies Dashboard-Bento spacing and density to marketing pages, producing tool-UI-coded marketing that feels cold. The opposite failure (Marketing-Bento padding inside dashboards) wastes space.

### LAYOUT-3c. Editorial-Bento

**Definition.** Tiled grid of mixed-size cells where cells contain *editorial content* — article previews, content excerpts, photographs, quotes. The grammar of contemporary content sites and modular editorial layouts.

**Distinguishing edge.** Versus *Editorial-Grid Magazine* — Editorial-Bento uses self-contained tiles in a uniform grid system; Editorial-Grid Magazine uses asymmetric column-spanning layout with art-directed grid breaks. Versus *Marketing-Bento* — Editorial-Bento contains editorial content (excerpts, photographs); Marketing-Bento contains product claims.

**Substyles.**
- **Magazine-Tile Editorial-Bento.** Mixed-size tiles each containing an article preview (headline, deck, image, byline). Modern editorial homepages.
- **Curation-Bento.** Tiles each contain a curated reference — a photograph with caption, a pull-quote, a content fragment. Lifestyle and editorial publications.
- **Portfolio-Bento.** Mixed-size tiles each containing a portfolio piece — image plus title plus role. Creative portfolios using bento logic.

**Canonical examples.** Modern Wired homepage, Are.na (in some views), Apartamento homepage, Pinterest (for editorial pinboards), portfolio sites using bento, modern lifestyle publications.

**Internal logic.**
- 3–4 column grid typical, with mixed-size cells (1×1, 1×2, 2×1, 2×2).
- Cell internal padding moderate (16–32px).
- Cells contain editorial atoms — type and image working together, with editorial typography conventions.
- Often paired with Editorial-Print or Two-Hand typography, Three-Color or Two-Color Monochrome color, Sharp-Geometric or Typographic-Discreet components, Restrained-Atmospheric motion.

**Registers it hosts.** Editorial publications, lifestyle magazines, creative portfolios, content-driven products that want modular browsing, art and design publications.

**Registers it resists.** SaaS marketing. Application UIs. Anywhere uniform information density (Catalog) or feature-claim density (Marketing-Bento) is the actual goal.

**Failure mode.** AI conflates Editorial-Bento with Catalog (uniform tiles) or with Editorial-Grid Magazine (asymmetric breaks), producing layouts that have neither the modular tile-quality of bento nor the editorial-art-direction of magazine.

---

## Hero-and-Stack splits into three grammars

The original *Hero-and-Stack* grammar described full-viewport hero plus standardized content blocks stacked vertically. The routing test exposes three internally-coherent expressions: pages designed to *convert* are not the same as pages designed to *communicate*, which are not the same as pages designed to *document*.

### LAYOUT-4a. Conversion-Stack

**Definition.** The original Hero-and-Stack as commonly understood: full-viewport hero, then standardized content blocks (features, social proof, testimonials, CTA banner), every section optimized for conversion. The default SaaS landing page.

**Distinguishing edge.** Versus *Brand-Stack* — Conversion-Stack has CTAs in every section; Brand-Stack has communication without urgent ask. Versus *Long-Form Stack* — Conversion-Stack uses scannable feature-block sections; Long-Form Stack uses continuous reading.

**Substyles.**
- **YC-Default.** Hero with bold headline plus subhead plus dual CTA, three-column feature grid, testimonial carousel, logo strip, final CTA banner. The most common AI default for "build me a landing page."
- **SaaS-Refined.** More careful spacing, restrained color, single primary CTA per section, fewer conversion bells. Stripe, Linear marketing.
- **Aggressive-Conversion.** Sticky CTAs, urgency banners, exit-intent modals, social proof everywhere. Direct-response coded products.

**Canonical examples.** Virtually every Y Combinator company's landing page, Webflow templates, default v0/Lovable/Bolt output, most B2B SaaS marketing.

**Internal logic.**
- Each section has a single primary message and a CTA (explicit or implicit).
- Sections are roughly screen-tall on desktop.
- Visual rhythm is predictable: hero → features → social proof → testimonials → final CTA.
- Often paired with Geometric-Modernist typography, Single-Accent color (Marketing variant), Soft-Container components, Functional-Snappy motion.

**Registers it hosts.** SaaS, B2B marketing, consumer subscription products, marketplaces, anything where converting visitors into signups is the entire point.

**Registers it resists.** Hospitality. Editorial. Cultural. Heritage. Anywhere quiet confidence beats conversion focus.

**Failure mode.** This is the AI default for *everything*. The failure mode is applying it where it doesn't belong — which is roughly half the briefs Palate exists to handle.

### LAYOUT-4b. Brand-Stack

**Definition.** Full-viewport hero, then content blocks stacked vertically, but blocks are designed to *communicate* rather than convert. Each section explores an aspect of the brand or product without a CTA. The grammar of premium product detail pages and considered brand sites.

**Distinguishing edge.** Versus *Conversion-Stack* — Brand-Stack has at most one CTA, often in a quiet final section; Conversion-Stack has CTAs throughout. Versus *Vertical-Rhythm Editorial* — Brand-Stack uses discrete content blocks with clear separation; VRE uses continuous editorial flow.

**Substyles.**
- **Product-Detail Brand-Stack.** Full-viewport hero with product imagery, then sections each exploring a feature or capability with extended visual treatment. Apple product detail pages (the non-bento ones), Tesla product pages.
- **Mission-Communication Brand-Stack.** Hero plus 3–5 sections each elaborating a brand value or commitment. Considered consumer brands, B2B with long sales cycles.
- **Service-Showcase Brand-Stack.** Hero plus sections each presenting a service offering with supporting imagery. Agencies, premium service providers.

**Canonical examples.** Apple's product detail pages (iPhone scrollthroughs, MacBook Air pages), Tesla's product pages, premium consumer hardware pages, considered brand sites for B2B, agency capability pages.

**Internal logic.**
- Each section communicates without urgency. The user isn't being sold; the user is being *shown*.
- Sections often span more than one screen each — they're elaborate, not scannable.
- Often paired with Restrained-Atmospheric or Scroll-Driven Cinematic motion.
- The single CTA, if present, is the final section and is quiet.

**Registers it hosts.** Premium consumer hardware, considered B2B with long sales cycles, agencies, premium services, brand-led products.

**Registers it resists.** Anywhere immediate conversion is the goal. SaaS with self-serve signup. E-commerce. Anywhere users are evaluating quickly.

**Failure mode.** AI conflates Brand-Stack with Conversion-Stack and adds CTAs and feature grids to every section, breaking the considered communication. Or it conflates Brand-Stack with Vertical-Rhythm Editorial and removes all section structure, losing the discrete-block clarity.

### LAYOUT-4c. Long-Form Stack

**Definition.** Full-viewport hero, then continuous long-form content (article, essay, documentation) stacked vertically. The grammar of writing-led pages that use a hero opening but commit to extended reading after.

**Distinguishing edge.** Versus *Document/Prose* — Long-Form Stack has a designed hero and section-level structure; Document/Prose has minimal styling and continuous text. Versus *Brand-Stack* — Long-Form Stack is text-led; Brand-Stack is visual-led.

**Substyles.**
- **Article-Hero Long-Form.** Hero contains article title, subtitle, byline, often a feature image. Then continuous reading. Modern editorial publications.
- **Essay-Stack.** Designed hero (often with a pull-quote or large opening line), then long-form prose with editorial typography. Substack publications, considered essay sites.
- **Documentation Long-Form.** Hero contains topic title and table-of-contents. Then continuous documentation with code samples and diagrams. Stripe Press, technical documentation that wants a designed feel.

**Canonical examples.** Stripe Press article pages, modern editorial features (NYT, Atlantic, New Yorker article pages), Substack with custom themes, considered technical documentation, longform journalism.

**Internal logic.**
- Hero is designed; body is continuous reading.
- Body uses Editorial Print typography conventions (drop caps, pull-quotes, italics).
- Body line length and font size are optimized for reading (32–42rem column, 16–18px body).
- Often paired with Two-Hand or Editorial-Print typography, Two-Color Monochrome or Three-Color color, Sharp-Geometric or Typographic-Discreet components, Stillness or Restrained-Atmospheric motion.

**Registers it hosts.** Editorial publications, considered essay sites, longform journalism, premium technical documentation, considered blogs.

**Registers it resists.** SaaS marketing. Application UIs. Anywhere scanning beats reading.

**Failure mode.** AI applies Hero-and-Stack defaults (feature grids, social proof, CTAs) to what should have been a Long-Form Stack, fragmenting the continuous reading experience.

---

# PATCHES TO TYPOGRAPHY GRAMMAR

## Kinetic-Variable migrates from Typography to Motion

The original Typography survey (Turn 1) included *Kinetic-Variable* as the seventh typography grammar — type as motion, variable fonts shifting axes in response to scroll and time. On reflection (and confirmed in your previous answer), the motion logic dominates the typography decision. A brief asking "make the type animate" is fundamentally a motion brief that uses typographic technique, not a typographic decision that happens to involve motion.

**Action:** *Kinetic-Variable Typography* is removed from Typography Axis 1 and migrates into Motion Axis 4 as a substyle of *Kinetic-Expressive Motion* (see Motion patches below).

**Result:** Typography goes from 7 grammars to 6.

The remaining six typography grammars are:
1. Two-Hand System (Serif Display + Sans Body)
2. Single-Family Discipline
3. Editorial Print Vocabulary
4. Mono-Discipline (Terminal-Coded)
5. Geometric-Modernist (Tech-Sans Default)
6. Maximalist-Expressive (Anti-Type-Hierarchy)

No internal substyles change for the remaining six.

---

# PATCHES TO COLOR GRAMMAR

## Single-Accent System splits into two grammars

The original *Single-Accent System* (Turn 1's COLOR-8) collapsed two genuinely different uses of the same structural pattern. A marketing page with a primary CTA accent color is solving a different design problem than a dashboard with status accent colors. The accent does different *work*, follows different rules, and lives in different layout contexts. The routing test fails — a brief asking for "modern marketing site" and a brief asking for "analytics dashboard" should not route to the same color grammar.

### COLOR-8a. Marketing Single-Accent

**Definition.** A palette of mostly neutrals (warm or cool greys, off-whites, near-blacks) with exactly one strong accent color used for primary CTAs, brand emphasis, and visual interest. The accent's job is *attraction* — drawing the eye to actions and key moments.

**Distinguishing edge.** Versus *Application Single-Accent* — Marketing Single-Accent uses the accent decoratively and for primary CTAs; Application Single-Accent uses accents systematically for state signaling. Versus *Earth-Pulled Restraint* — Marketing Single-Accent allows saturated accents (electric blue, deep purple, brand red); Earth-Pulled requires earth-tone accents only.

**Substyles.**
- **Light-Mode Marketing.** Light grey backgrounds, near-black foreground, single saturated accent (often blue, purple, green, or brand-specific) used on primary CTAs and key highlights. Default modern SaaS marketing.
- **Dark-Mode Marketing.** Dark backgrounds, off-white foreground, single saturated accent for CTAs and emphasis. Tech product marketing, AI startups.
- **Brand-Color Marketing.** The accent is brand-specific and is used decoratively as well as functionally — Stripe purple, Linear's purple, Vercel's accent color, Spotify green. Brand identity is part of the palette.

**Canonical examples.** Stripe marketing, Linear marketing, Vercel, virtually every modern SaaS landing page, OpenAI marketing, Anthropic marketing.

**Internal logic.**
- The accent is *the* color — used for primary CTAs, brand emphasis, hover states on links, and occasionally decorative backgrounds.
- Frequency of use is moderate to high — appears multiple times per screen, not the "used 4 times in document" discipline of Earth-Pulled.
- Often paired with Geometric-Modernist typography, Soft-Container components, Functional-Snappy motion.

**Registers it hosts.** Tech product marketing, B2B SaaS, AI products marketing, fintech marketing, modern consumer products.

**Registers it resists.** Hospitality. Editorial publishing. Heritage. Anywhere accent restraint is the brand statement.

**Failure mode.** AI defaults to this palette for everything tech-coded. The failure isn't the palette — it's applying it to non-marketing contexts (dashboards) where Application Single-Accent's systematic accent rules would be correct.

### COLOR-8b. Application Single-Accent

**Definition.** A palette of greys and a *system of accent colors* used to teach UI: one color for primary actions, another for success states, another for warnings, another for errors, another for information. Each accent color has a specific job and the same color always means the same thing.

**Distinguishing edge.** Versus *Marketing Single-Accent* — Application Single-Accent uses multiple accents systematically for state signaling; Marketing Single-Accent uses one accent for emphasis. Versus *Multi-Accent Dashboard* (which I considered as a separate grammar but failed the routing test against this one and merged) — they're the same thing, just under a clearer name.

**Substyles.**
- **Light-Mode Application.** Light grey backgrounds, near-black foreground, systematic accents (blue=action, green=success, yellow=warning, red=error, purple=premium). The standard modern dashboard palette.
- **Dark-Mode Application.** Dark backgrounds with the same systematic accents at appropriate luminance. Linear, Vercel dashboards, modern dev tools.
- **High-Contrast Application.** Same logic but with elevated contrast for accessibility — ensures WCAG AAA contrast on all accent-on-background pairings. Healthcare, financial, government applications.

**Canonical examples.** Stripe Dashboard, Linear app, GitHub, Notion app, Asana, every modern B2B application UI.

**Internal logic.**
- Accent colors are a *system*, not decorations. Each color has one job.
- The same color always means the same thing throughout the application — green is success, never decoration.
- Body text is never an accent color. Decorative elements never use accents.
- Often paired with Geometric-Modernist or Mono typography, Mono-Density (Application) components, Functional-Snappy motion.

**Registers it hosts.** B2B SaaS application UIs, dashboards, productivity tools, financial applications, healthcare applications, government applications.

**Registers it resists.** Marketing pages (where decorative accent use breaks the system). Hospitality. Editorial.

**Failure mode.** AI uses one of these accents inconsistently — sometimes red means error, sometimes red means decoration. The grammar requires that the system be a *system*; consistency is the entire point.

**Result:** Color goes from 8 grammars to 9.

---

# PATCHES TO COMPONENT GRAMMAR

## Soft-Container System loses Apple-Refined substyle

The original *Soft-Container System* (Turn 2's COMP-2) included four substyles: Material-Coded, Tailwind-Default, Apple-Refined, Stripe-Coded Refined. The routing test fails on *Apple-Refined* — a brief asking for "Apple-style component treatment" routes to *Glass / Layered Components* (COMP-6), not to Soft-Container. The translucent surfaces, frosted-glass effects, and atmospheric depth that define Apple-Refined are the defining features of Glass/Layered, not refinements of Soft-Container.

**Action:** *Apple-Refined* substyle is removed from Soft-Container System and folded into Glass / Layered as a recognized substyle (alongside Frosted-Glass, Layered-Depth, Subtle-Gradient-Glass, Light-Translucent — note that Apple-Refined is essentially Light-Translucent under a different name; consolidating to *Light-Translucent / Apple-Refined*).

**Soft-Container System now has three substyles:**
- Material-Coded
- Tailwind-Default (the AI default)
- Stripe-Coded Refined

## Mono-Density splits into Marketing-Density and Application-Density

The original *Mono-Density* (Turn 2's COMP-8) treated information-dense components as a single grammar coded for application UIs. But you correctly flagged that B2B marketing pages can use Mono-Density styling while still being marketing contexts. The routing test fails: a brief for "B2B marketing page that signals enterprise seriousness" and a brief for "analytics dashboard" both want dense components but are doing different work.

### COMP-8a. Application-Density (Mono-Density Application)

**Definition.** Components designed for true application UIs — dashboards, IDEs, data tables, admin panels. Tight padding (4–12px), small typography (12–14px), minimal radii (2–4px), restrained color, optimized for showing many actionable elements simultaneously.

**Distinguishing edge.** Versus *Marketing-Density* — Application-Density components are functional UI elements (clickable rows, sortable columns, filter chips); Marketing-Density components are dense-looking but communicate-coded. Versus *Soft-Container* — Application-Density refuses generous padding and soft radii in favor of information density.

**Substyles.**
- **Dashboard-Application Density.** Modern B2B dashboard component vocabulary. Linear app, Stripe Dashboard.
- **IDE-Coded Density.** Developer tool component vocabulary, monospace dominance. Code editors, terminal-coded products.
- **Data-Table Density.** Components optimized around data tables. Financial tools, analytics products.
- **Spreadsheet Density.** Grid-based component layout mimicking spreadsheets. Productivity tools, planning software.

**Canonical examples.** Same as original Mono-Density: Linear in-app, Stripe Dashboard, GitHub, Notion in-app, every modern SaaS application UI.

**Internal logic.** As original Mono-Density.

**Registers it hosts.** B2B SaaS application UIs, dashboards, productivity tools, financial applications.

**Registers it resists.** Marketing pages (where Marketing-Density's looser version is correct). Anything content-driven.

### COMP-8b. Marketing-Density

**Definition.** Components designed for *marketing pages that signal enterprise seriousness through density*. Tighter than Soft-Container, looser than Application-Density. Used when "this product handles serious data" is part of the marketing pitch.

**Distinguishing edge.** Versus *Application-Density* — Marketing-Density is for marketing surfaces, not application UIs; padding is somewhat looser, type is somewhat larger, but the dense-feeling visual register is preserved. Versus *Soft-Container* — Marketing-Density is consciously denser than the Tailwind default; typically smaller padding (12–20px instead of 24–32px), tighter type, more on-screen.

**Substyles.**
- **Enterprise-Serious Marketing-Density.** B2B marketing pages that visually communicate "this is a serious product for serious work." Bloomberg-coded marketing, financial product marketing.
- **Developer-Tool Marketing-Density.** Marketing pages that show product UI tightly — feature cards that look like product cells, dense documentation snippets in marketing surfaces. Linear marketing, Stripe API page.
- **Documentation-Adjacent Marketing.** Marketing pages that blend with documentation surfaces — denser than typical marketing, but still hosts brand and conversion elements. API product marketing.

**Canonical examples.** Bloomberg Terminal marketing pages, financial product marketing (Plaid for institutional surfaces), Linear's developer-coded marketing, Stripe's API page, technical product marketing for sophisticated audiences.

**Internal logic.**
- Padding is tighter than Soft-Container default (12–20px) but looser than Application-Density (which is 4–12px).
- Type is smaller than typical marketing (14–15px body vs 16–18px), but larger than Application-Density (12–14px).
- Hover states are present and immediate — this is still a marketing surface, not an app UI.
- Often paired with Geometric-Modernist or Mono typography, Marketing Single-Accent color, Functional-Snappy motion.

**Registers it hosts.** B2B SaaS marketing for sophisticated audiences, financial product marketing, developer tool marketing, technical product marketing.

**Registers it resists.** Consumer products. Hospitality. Editorial. Anywhere warmth or accessibility matters more than density signaling seriousness.

**Failure mode.** AI conflates Marketing-Density with Application-Density and produces marketing pages that feel like dashboards (cold, action-coded, no brand warmth). Or conflates with Soft-Container and produces overly-spaced marketing that fails to signal "serious tool."

**Result:** Component goes from 8 grammars to 9.

---

# PATCHES TO MOTION GRAMMAR

Three changes to Motion: addition of *Atmospheric-Depth Motion*, addition of *Loading-and-Latency Motion*, and the migration of Kinetic-Variable Typography in as a substyle of Kinetic-Expressive.

## MOTION-8. Atmospheric-Depth (NEW)

**Definition.** Motion grammar paired with Glass / Layered components. Atmospheric-Depth motion is what makes glass and layered surfaces *legible* — translucency requires content underneath shifting, layered surfaces require parallax-like depth motion, and frosted-glass effects only become visible *with* movement.

**Distinguishing edge.** Versus *Restrained-Atmospheric* — Atmospheric-Depth is specifically tied to Glass/Layered components and behaves with depth-aware logic; Restrained-Atmospheric is ambient editorial motion that works without depth components. Versus *Functional-Snappy* — Atmospheric-Depth is slower and more cinematic; Functional-Snappy is fast feedback.

**Substyles.**
- **Glass-Reveal Depth.** Frosted-glass surfaces reveal content beneath them as the user scrolls or interacts. Apple's product pages.
- **Layered-Parallax Depth.** Multiple layered surfaces move at different speeds creating perceptible depth. iOS-coded products.
- **Translucent-Sheet Depth.** Modal sheets and overlays with translucency that reveals page beneath — slide-up sheets, side panels, atmospheric overlays.
- **Light-Glass Depth.** Very subtle depth effects — frosted surfaces with minimal blur, gentle layered shadows. Considered consumer products.

**Canonical examples.** Apple product pages, iOS interfaces (some translation to web), modern Mac App Store, premium consumer hardware sites, considered AI products with depth treatments.

**Internal logic.**
- Translucency requires content to *be* underneath — depth motion presupposes layered architecture.
- Performance matters — bad backdrop-filter implementation introduces lag, breaking the entire grammar.
- Reduced-motion preferences require fallbacks: opaque surfaces with subtle borders rather than translucent depth.
- Often paired with Glass / Layered components, Geometric-Modernist or Single-Family typography, Iridescent or Light-Mode color.

**Registers it hosts.** Premium consumer tech, design tools with refined surfaces, modern consumer products signaling sophistication, contemporary AI products.

**Registers it resists.** Hospitality (depth effects feel tech-coded, not luxury-coded). Editorial publishing. Heritage. Anything content-heavy where depth interferes with reading. Anywhere "rooted" or "considered" is the brand statement.

**Failure mode.** AI imitates the surface (frosted backgrounds, light translucency) without the underlying depth architecture — putting frosted-glass on flat-color backgrounds where there's nothing underneath to blur. The grammar requires actual layered content; mimicry fails.

## MOTION-9. Loading-and-Latency (NEW)

**Definition.** A motion grammar dedicated to *waiting* — what happens visually when the system is doing work the user can't see. Skeleton loaders, shimmer effects, optimistic UI updates, progress indicators, loading states. The grammar of telling users "we're processing" without making them think the page is broken.

**Distinguishing edge.** Versus *Functional-Snappy* — Functional-Snappy is feedback for *completed* actions; Loading-and-Latency is feedback for *pending* actions. Versus all other motion grammars — Loading-and-Latency is the cross-cutting "what does the page do while waiting" axis that other grammars don't address.

**Substyles.**
- **Skeleton-First Loading.** Content shapes appear before content arrives — gray rectangles where text and images will be. Modern web standard for content-heavy pages.
- **Shimmer Loading.** Subtle moving gradient on placeholder elements indicating "still loading." Common in modern social and content products.
- **Optimistic UI.** UI updates *before* the server confirms — assumes success, rolls back on failure. Fast products with clear failure recovery.
- **Determinate Progress.** A progress bar with known completion percentage. File uploads, multi-step operations.
- **Indeterminate Progress.** A spinner or pulsing element when completion percentage is unknown. Quick loading states.
- **Spinner-Only Loading.** Just a spinner. Simple, sometimes appropriate, often a fallback.
- **Empty-State Loading.** When no data exists yet — a designed empty state rather than a loader. Treats absence as a designed state.

**Canonical examples.** Linear (skeleton-first), GitHub (skeleton + shimmer), Stripe Dashboard (optimistic UI for many actions), modern social products, modern productivity tools, well-designed financial apps.

**Internal logic.**
- Loading states must appear within 100ms of action — beyond that, users perceive the system as broken.
- Operations under 1 second don't need loaders (the loader appearing and disappearing is more disruptive than the wait).
- Operations over 1 second require *something* — never just nothing.
- Determinate progress is preferred over indeterminate when completion percentage is known.
- Optimistic UI requires clear failure-recovery UI — silent failure is hostile.
- Reduced-motion preferences must be honored: shimmer effects often need to be disabled in reduced-motion mode.

**Registers it hosts.** All application UIs that fetch data. All e-commerce that processes transactions. All modern web products with backend dependencies. Increasingly, content-heavy marketing pages with progressive content loading.

**Registers it resists.** Static marketing pages with no async behavior. Document/Prose contexts. Anywhere there's nothing to wait for.

**Failure mode.** AI defaults to spinners for everything, including operations under 1 second (where the spinner's appearance is more disruptive than the wait). Or it omits loading states entirely for slow operations, making the page feel broken. Or it uses skeleton loaders that don't match the content shape that arrives, creating layout shift on load.

## Kinetic-Expressive gains Kinetic-Variable Typography substyle

Per the migration from Typography Axis 1, *Kinetic-Variable Typography* joins *Kinetic-Expressive Motion* as a recognized substyle.

**Kinetic-Expressive's substyles are now:**
- Cursor-Reactive
- Time-Based Kinetic
- Audio-Reactive
- **Variable-Font Kinetic Typography** (formerly its own typography grammar) — variable font axes animate in response to scroll, hover, or time. Fraunces stretching its `SOFT` axis as scroll progresses. Type foundry showcases.
- WebGL-Driven Kinetic

**Result:** Motion goes from 7 grammars to 9.

---

# CROSS-CUTTING ADDITION: REDUCED-MOTION LAYER

Reduced-motion preferences are not their own grammar — they're an attribute every motion grammar inherits. Every motion grammar must specify a *reduced-motion fallback*: what the page does for users who have indicated `prefers-reduced-motion: reduce`.

This is a real accessibility requirement (WCAG 2.2) and a real design decision. The fallbacks differ by grammar:

- **Stillness as Discipline:** No fallback needed (no motion in the first place).
- **Restrained-Atmospheric:** Disable parallax, reduce fade durations to near-instant, keep color transitions on hover.
- **Functional-Snappy:** Reduce transition durations to ~10ms (effectively instant) but keep state changes visible. Don't break feedback.
- **Punchy-Discrete:** Already mostly motion-discrete; minimize residual smooth transitions.
- **Scroll-Driven Cinematic:** Disable scroll-triggered animations entirely. Show content in final state on load. This is a significant fallback — the page works without the cinema.
- **Scrollytelling Narrative:** Most challenging. Often requires a dedicated reduced-motion version that presents the story as continuous text/images without scroll-locked behavior.
- **Kinetic-Expressive:** Disable continuous and reactive motion. Show typography in its primary state without axis animation.
- **Atmospheric-Depth:** Replace translucent/blurred surfaces with opaque-with-borders versions. Disable parallax-depth motion.
- **Loading-and-Latency:** Disable shimmer effects (they're decorative); keep functional loaders (skeleton, progress bars) since they convey state information.

This layer will be formally specified in Turn 7's Compatibility Model. For now, every Palate concierge-card must include a `reduced_motion_fallback` field declaring how the design behaves under reduced-motion preferences.

---

# UPDATED ROUTING-TEST OBSERVATIONS

Applying the routing-test discipline to the existing grammars surfaced one additional issue worth flagging for Turn 7's Compatibility Model:

**Layout — Document/Prose's existence as a grammar is questionable.** Per the original survey's open question #2, Document/Prose may be the *absence* of a grammar rather than a grammar itself — the fallback when no grammar is selected. Current position: keep it as a grammar because briefs do explicitly route to it ("write me a personal site like Paul Graham's"), but flag for the Compatibility Model that it has minimal compositional rules and serves partly as the null state.

No action this turn; logged for Turn 7.

---

# CONSOLIDATED GRAMMAR COUNTS AFTER PATCHES

| Axis | Pre-patch count | Post-patch count | Net change |
|---|---|---|---|
| Layout | 11 | 14 | +3 (Bento, Hero-and-Stack each split into 3) |
| Typography | 7 | 6 | −1 (Kinetic-Variable migrated to Motion) |
| Color | 8 | 9 | +1 (Single-Accent split) |
| Component | 8 | 9 | +1 (Mono-Density split; Apple-Refined removed from Soft-Container) |
| Motion | 7 | 9 | +2 (Atmospheric-Depth, Loading-and-Latency added) |
| **Subtotal (5 axes covered)** | **41** | **47** | **+6** |
| Imagery | TBD | TBD | Turn 4 |
| Density | TBD | TBD | Turn 4 |
| Voice | TBD | TBD | Turn 5 |
| Reading-Pattern | TBD | TBD | Turn 6 |

Plus substyles within each grammar: averaging ~3.5 per grammar across the 47 covered, the spec currently contains ~165 named patterns. Final spec across all eight axes likely lands around 250–300 named patterns.

---

*Turn 3 (the patch turn) complete. Turn 4 will cover Imagery and Density grammars, applying the same routing-test discipline from the start. Turn 5 will cover Voice (its own turn because the representation format is itself architectural work). Turn 6 will cover Reading-Pattern. Turn 7 will be the Compatibility Model with the Reduced-Motion Layer formalized. Turn 8 will be the Synthesis Document.*

*Push back on anything in the patches before I proceed to Turn 4.*

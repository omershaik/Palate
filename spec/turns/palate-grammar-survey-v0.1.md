# Palate Grammar Survey v0.1

A typology of web layout grammars. This document is the spine of the Palate schema. Cards inherit from grammars; cards within different grammars do not safely compose for a single brief.

A *grammar* is a structural-geometric pattern: column logic, image-text relationships, vertical rhythm rules, whitespace anchoring, and motion behavior. Grammar is distinct from *register* (the typographic and tonal voice — luxury hospitality vs. fintech vs. editorial) and distinct from *eye-scanning patterns* (F-pattern, Z-pattern — these describe how users read, not how pages are structured).

This survey covers eleven grammars. The number is deliberate — fewer collapses real distinctions, more is taxonomic vanity. Each entry follows the same schema so the differences are visible by structural comparison.

---

## Schema

For each grammar:

- **One-line definition** — what it is, geometrically
- **Distinguishing edge** — what separates it from its nearest neighbors
- **Canonical examples** — sites that are unambiguous expressions
- **Compositional logic** — column rules, ratios, spacing, edge behavior
- **Motion vocabulary** — what kind of movement belongs and what doesn't
- **Registers it hosts** — the verticals and tones that fit naturally
- **Registers it resists** — what breaks if you try to force it
- **Failure mode** — what goes wrong when AI imitates this without understanding it

---

## 1. Vertical-Rhythm Editorial

**Definition.** Single-column scroll, alternating between contained-text passages and uncontained (full-bleed) photography or imagery, with generous outer margins. Reads like a printed essay scrolled vertically.

**Distinguishing edge.** Versus *Editorial-Grid Magazine* — VRE is single-column with full-bleed image breaks; EGM is multi-column with side-by-side text-image relationships. Versus *Document/Prose* — VRE uses imagery as compositional material; D/P is text-only or text-dominant.

**Canonical examples.** Aman properties, Cheval Blanc, Singita, Como Hotels, much of Hermès editorial, Apple's longform product pages (some of them — others are bento), New York Times Magazine longform features.

**Compositional logic.**
- Single reading column, typically 32–40rem max-width, centered or set with outer margin asymmetry.
- Outer margin (page edge to content) is always generous — typically 8–12% of viewport on desktop, never less than 6%.
- Full-bleed imagery breaks the column rhythm — image extends edge-to-edge of viewport.
- Vertical spacing between sections is large (8–12rem on desktop) — empty space is compositional material.
- No side-by-side text-image relationships in body. Text passages and images alternate vertically.
- Type scale is dramatic: display headlines 80–120px+ on desktop, body 15–17px. Contrast in scale creates rhythm.

**Motion vocabulary.** Almost none. Slight fade-in on scroll, possible parallax on hero photography. Scroll speed is the user's; the page does not animate against them. Stillness is the message.

**Registers it hosts.** Luxury hospitality, heritage brands, fashion houses (especially European), cultural institutions, fine arts publishing, architectural practices, longform editorial.

**Registers it resists.** Anything transactional or conversion-driven. Anything aimed at low-attention or first-time customers. Anything where information density matters. SaaS. Consumer tech. F&B with energy and theatre.

**Failure mode.** When AI tries to imitate this, it tends to produce a two-column hero with a text block on one side and an image on the other (which is actually editorial-grid behavior), then under-fills the columns so they float. The result reads as "off-balance" rather than "restrained." This is exactly what Run B of the Devigarh experiment did.

---

## 2. Editorial-Grid Magazine

**Definition.** Multi-column structured grid with art-directed breaks, side-by-side text-image relationships, and visible-but-violable column logic. Scroll reads like stacked magazine spreads.

**Distinguishing edge.** Versus *Vertical-Rhythm Editorial* — EGM permits and requires multi-column body composition; VRE forbids it. Versus *Bento Modular* — EGM's grid is asymmetric and editorial; bento is uniform-tile and modular. Versus *Catalog* — EGM uses the grid as compositional material; catalog uses it as inventory display.

**Canonical examples.** Soho House, Apartamento, Cereal Magazine, Monocle, NYT Style, Wired, Kinfolk, Ace Hotel, Hoxton, The New Yorker.

**Compositional logic.**
- 6 to 12-column underlying grid, but elements span columns asymmetrically (1.4fr vs 1fr is more characteristic than 1fr vs 1fr).
- Text passages live in 2-3 column blocks with body width 28–34rem.
- Photography crops past column edges deliberately; pull-quotes break into margins.
- Section transitions feel like turning pages — definite breaks, not gradual fades.
- Italics, drop caps, pull-quotes, sidebar callouts are part of the system.
- Outer margins are smaller than VRE (4–7% of viewport) because the grid does the structural work.

**Motion vocabulary.** Restrained but present — slow fades on photography, gentle parallax on hero, occasional hover state on type. Movement is "leafing through a magazine" not "tech demo."

**Registers it hosts.** Editorial hospitality (Soho House, Ace), members clubs, lifestyle brands with personality, food and travel publishing, fashion editorial, cultural commentary.

**Registers it resists.** True quiet luxury (use VRE). Pure transactional flows. Heritage/vernacular brands where the geography is the protagonist. Anything requiring scannable information density.

**Failure mode.** When AI imitates this, it produces multi-column layouts with uniform 1:1 splits and centered text in each column — losing both the asymmetry and the print-magazine voice. The grid becomes visible as a grid instead of as a system being used.

---

## 3. Bento Modular

**Definition.** Tiled grid of mixed-size cells, each a self-contained "feature card." Inspired by Japanese bento boxes and popularized by Apple's product pages around 2020. Now ubiquitous in fintech, AI products, and SaaS.

**Distinguishing edge.** Versus *Editorial-Grid Magazine* — bento cells are self-contained units with internal padding; EGM elements break across grid cells. Versus *Hero-and-Stack* — bento composes information density into a single screen view; hero-and-stack alternates full-viewport content blocks vertically. Versus *Catalog* — bento cells are heterogeneous (different content types per cell); catalog cells are homogeneous (same type, varying values).

**Canonical examples.** Apple product pages (iPhone, MacBook), Stripe, Linear, Notion, Vercel changelog, most YC company landing pages 2023+, OpenAI, Anthropic's own site, Arc browser, Raycast, every AI startup since 2023.

**Compositional logic.**
- 3-4 column underlying grid on desktop.
- Cells span 1×1, 1×2, 2×1, 2×2 typically. Mixed-size is the point — uniform sizes look like catalog.
- Each cell has internal padding (typically 24–48px) and contains: a feature name, a one-line claim, often an illustrative image or visualization.
- Cell backgrounds are differentiated — soft greys, brand-colored, dark-on-light contrasts, sometimes video.
- Outer container max-width is typically 1280–1440px.
- Vertical rhythm between bento sections is moderate (4–6rem).
- Frequently dark-mode dominant.

**Motion vocabulary.** Hover states on cells (lift, glow, content reveal). Sometimes scroll-triggered cell entrance animations. In-cell media (looping video, Lottie) is common. The motion is "interface coming alive."

**Registers it hosts.** Tech products, fintech, AI products, developer tools, productivity software, modern consumer apps, anything where "feature density on one screen" is the value proposition.

**Registers it resists.** Hospitality of any kind. Editorial. Heritage. Anything requiring narrative. Anything where the product is a *place* or an *experience* rather than a *system*. Restaurant sites. Cultural institutions.

**Failure mode.** When AI imitates this in the wrong context, it produces "feature grids" where bento doesn't belong — e.g., turning a hotel's amenities into a bento grid, which is exactly the anti-pattern hospitality cards must forbid. The bento cell shape is so legible that AI reaches for it as a default whenever there are 4-8 things to show.

---

## 4. Hero-and-Stack

**Definition.** Full-viewport hero (image, video, or large type), then standardized content blocks stacked vertically: features, social proof, testimonials, CTA. The default SaaS landing page. The grammar AI tools generate by default when given no other instruction.

**Distinguishing edge.** Versus *Bento Modular* — H&S stacks blocks vertically with one focus per block; bento composes multiple cells into one screen view. Versus *Vertical-Rhythm Editorial* — H&S has discrete content blocks separated by spacing; VRE has continuous editorial flow.

**Canonical examples.** Vercel, virtually every Y Combinator company's landing page, most B2B SaaS marketing sites, Webflow templates, the default output of Lovable/v0/Bolt when not heavily art-directed.

**Compositional logic.**
- Full-viewport hero (100vh) with centered or left-aligned headline, subhead, primary + secondary CTA.
- Content blocks below alternate between centered text, three-column feature grids (this is the hospitality anti-pattern), testimonial carousels, logo strips, and final CTA banner.
- Each block is approximately one screen tall.
- Outer container 1080–1280px max-width.
- Visual rhythm is predictable and conversion-optimized: every section has a CTA or social proof element.

**Motion vocabulary.** Scroll-triggered fade-ins on each section, hover lifts on cards, gradient animations on CTAs, occasional Lottie illustrations.

**Registers it hosts.** SaaS, B2B, consumer subscription products, marketplaces, anything that needs to convert visitors into signups.

**Registers it resists.** Hospitality. Editorial. Cultural. Heritage. Anything where the value proposition isn't a feature list. Anything that wants to feel *considered* rather than *converting*.

**Failure mode.** This is the AI default. The failure mode is *applying it everywhere*. Most of what Mohammed and I have been calling "AI slop" in luxury hospitality contexts is hero-and-stack grammar applied to a brief that needed a different grammar entirely.

---

## 5. Scrollytelling Longform

**Definition.** Scroll-locked narrative where content reveals are tied to scroll position. Often features sticky media (image or video that stays in view while text scrolls past), progressive reveals, and animation triggered by scroll percentage.

**Distinguishing edge.** Versus *Vertical-Rhythm Editorial* — scrollytelling uses scroll as a directorial tool (reveal timing, sticky elements, parallax); VRE treats scroll as user-controlled reading speed only. Versus *Hero-and-Stack* — scrollytelling has continuous narrative; H&S has discrete blocks.

**Canonical examples.** New York Times special features ("Snow Fall" was the canonical early example, "The Road Was Long" by IDMC is a recent one), The Pudding, Bloomberg longform, some Apple product reveals, NASA mission sites, IPCC climate reports, museum digital exhibitions.

**Compositional logic.**
- Full-viewport sections, each tied to a scroll segment.
- Sticky media (image or video) commonly fills 60-100% of viewport while text scrolls in the remaining margin.
- Scroll progress drives animation: fade-ins, image transitions, type reveals, map zooms, data visualizations.
- Vertical extent is long — often 10x or more the height of a normal page.
- Content is narrative — there is a beginning, middle, and end the user is being walked through.

**Motion vocabulary.** Heavy and central. Movement *is* the design. Scroll-jacked transitions, sticky elements, progressive reveals, scroll-driven animation. The user's scroll is the playback control.

**Registers it hosts.** Investigative journalism, data storytelling, cause/advocacy campaigns, museum and cultural digital exhibitions, narrative-driven marketing for products with a story (Apple-tier launches), scientific communication.

**Registers it resists.** Anything transactional or conversion-focused. Anything where users want to scan, not read. Anything where mobile-first behavior dominates (scrollytelling is desktop-native and degrades poorly on mobile).

**Failure mode.** When AI imitates this without understanding the narrative requirement, it produces scroll-triggered fade-ins on every section of a normal site, which feels gimmicky rather than purposeful. Scrollytelling without a story is just slow loading.

---

## 6. Broken-Grid / Anti-Grid

**Definition.** Layouts that deliberately violate uniform grid expectations — overlapping elements, off-axis placement, asymmetric weight distribution, intentional irregularity. There is still an underlying grid (otherwise the layout reads as accidental), but it is treated as something to push against.

**Distinguishing edge.** Versus *Editorial-Grid Magazine* — EGM has a visible grid being used editorially; broken-grid has a hidden grid being violated. Versus *Vertical-Rhythm Editorial* — VRE is calm and aligned; broken-grid creates visual tension. Versus *Neo-Brutalism* — broken-grid is about violating geometric expectations; neo-brutalism is about raw, unpolished, bordered structures.

**Canonical examples.** Awwwards Site of the Day winners, KOTA's own site, Studio La Tas, much of Locomotive's portfolio, many design agency sites (especially European), fashion houses with creative-led marketing (Hermès experimental pages, Calvin Klein, JW Anderson), Hugo Inc., Public Library, much of the FWA winners list.

**Compositional logic.**
- Underlying grid exists (typically 12-column) but elements are placed off-grid or span unusual ranges.
- Text overlaps imagery, or imagery overlaps imagery.
- Type scale extremes — display elements at viewport-filling size juxtaposed with very small body text.
- Negative space is anchored asymmetrically — large empty regions to one side or corner balanced by dense content elsewhere.
- Common move: a single element placed at a deliberate "wrong" position to create focal tension.
- Often dark-mode or color-extreme.

**Motion vocabulary.** Often high — cursor effects, scroll-triggered text and image entrances, custom WebGL elements, kinetic typography. The motion is "this site has been art-directed."

**Registers it hosts.** Design agencies, fashion brands targeting fashion-literate audiences, creative portfolios, experimental editorial, music and arts brands, anything signaling "we are makers, not marketers."

**Registers it resists.** Anything requiring trust through familiarity. Financial services. Healthcare. Enterprise B2B. Hospitality at the quiet-luxury end (the tension this grammar creates is the opposite of what quiet luxury wants). Catalogs and listings.

**Failure mode.** When AI imitates this, it produces layouts that read as accidentally broken rather than deliberately broken — the difference is the underlying grid discipline, which AI tends to skip. The result looks like a buggy page rather than a designed one.

---

## 7. Neo-Brutalism

**Definition.** Heavy borders (often solid black 2-4px), high contrast, blocky compartmentalized layouts, primary or saturated colors, system or monospace fonts, deliberate flatness (no shadows, no gradients, no soft edges). Inspired by brutalist architecture and revived from early-2020s onwards.

**Distinguishing edge.** Versus *Bento Modular* — both compartmentalize, but bento cells are soft-edged and product-focused; neo-brutalist boxes are hard-edged with thick borders and high contrast. Versus *Broken-Grid* — neo-brutalism's grid is rigid and structured; broken-grid's grid is being violated. Versus *Hero-and-Stack* — neo-brutalism rejects the polished SaaS aesthetic that H&S embodies.

**Canonical examples.** Gumroad (post-2021 redesign), Figma's marketing site (parts of it), Linear's bolder pages, Arc browser, Raycast (some pages), Drudge Report (the brutalist ancestor — text-only), Around (video conferencing), many indie SaaS launches 2023-2025, much of Awwwards' "Brutalism" category.

**Compositional logic.**
- Hard rectangular boxes with thick solid borders (often 2-4px black).
- High contrast color palette — bright primaries, saturated secondaries, stark black and white.
- No shadows. No gradients. No border-radius above 4px (often 0).
- Type is often sans-serif, geometric, sometimes monospace, always large and confident.
- Layout is compartmentalized but not necessarily symmetric — boxes can be different sizes and asymmetrically placed.
- Backgrounds are often solid color (cream, pastel, or stark white/black) that makes the bordered boxes pop.

**Motion vocabulary.** Often punchy — boxes shift on hover, colors invert, hard transitions rather than smooth fades. Animation is sharp and discrete, not continuous.

**Registers it hosts.** Indie SaaS, design tools, creative agencies, fashion brands targeting Gen Z, "anti-corporate" startups, design education, experimental products, brands explicitly signaling "we're not like the others."

**Registers it resists.** Banking, healthcare, enterprise, hospitality, anything requiring conventional polish or trust signaling, heritage brands, luxury at any tier.

**Failure mode.** When AI imitates this without understanding the cultural register, it produces designs that look like 1990s websites — the *raw* and the *intentional* collapse into each other. Neo-brutalism only works when the rest of the system (typography, copy, photography) is contemporary; otherwise it just reads as broken.

---

## 8. Document / Prose

**Definition.** Content-first, often single-column, intentionally minimal styling. Typography and content do almost all the work. The grammar of writers' personal sites, technical documentation, and longform essays.

**Distinguishing edge.** Versus *Vertical-Rhythm Editorial* — D/P is plain by intention; VRE is restrained but composed. D/P doesn't use imagery as compositional material; VRE does. Versus *Scrollytelling Longform* — D/P is static; scrollytelling is animated. Versus *Editorial-Grid Magazine* — D/P is single-column; EGM is multi-column.

**Canonical examples.** Paul Graham's site, Gwern, Stripe Press, Bret Victor, Maggie Appleton's earlier site, many academic personal sites, Dan Luu, Julia Evans, much of Substack's reading view, MDN documentation.

**Compositional logic.**
- Single column, typically 36–44rem (650–720px) max-width.
- Centered or left-aligned with simple margin.
- Typography is the entire design system — typically a single serif for body (Charter, Source Serif, Iowan Old Style) or a single careful sans (Inter, IBM Plex).
- Headings are sized clearly but not dramatically. The hierarchy is *legible*, not *expressive*.
- Color palette is 2-3 colors maximum: ink, paper, occasionally a link color.
- Imagery, when present, is functional (diagrams, screenshots) and constrained to column width.

**Motion vocabulary.** None. The site doesn't move. Scroll is for reading. The browser handles all interaction.

**Registers it hosts.** Personal essays and writing, technical documentation, research publishing, academic work, software engineering blogs, philosophy and longform argument, code reference.

**Registers it resists.** Anything commercial. Anything performative. Anything brand-driven. The grammar is so plain that decoration reads as intrusion.

**Failure mode.** AI rarely fails *at* this grammar — it's structurally simple. AI fails *to choose it* when it's the right choice, defaulting instead to hero-and-stack with feature grids for content that should have been a document.

---

## 9. Catalog / Grid-of-Things

**Definition.** Uniform card grid, primary purpose is browsing many items of the same type. The grammar of e-commerce, real estate listings, restaurant guides, art galleries, and any "list of X" experience.

**Distinguishing edge.** Versus *Bento Modular* — catalog cells are homogeneous (same type, varying values: 12 products, 50 listings); bento cells are heterogeneous. Versus *Editorial-Grid Magazine* — catalog has uniform cells; EGM breaks the grid editorially.

**Canonical examples.** Amazon, Shopify storefronts, Airbnb search results, Booking.com, Zillow, Dribbble, Pinterest, Behance, Spotify's album grid, most museum collection browsers, restaurant aggregators.

**Compositional logic.**
- Uniform card cells, typically 3-5 columns on desktop, 2 on tablet, 1 on mobile.
- Each card contains: image (consistent aspect ratio), title, primary metadata (price, location, rating).
- Filters and sorting in a sidebar or top bar.
- Pagination or infinite scroll at the bottom.
- Cards are scannable, not readable — the grammar assumes the user is comparing, not engaging.

**Motion vocabulary.** Hover states on cards (slight lift or image swap), filter transitions, lazy-load fades. Motion is functional — feedback for state changes — not decorative.

**Registers it hosts.** E-commerce, marketplaces, listings, search results, image-driven browsing, anywhere users compare options.

**Registers it resists.** Anywhere the proposition is *one specific thing* rather than *many options*. Hospitality (a single property is not a catalog item). Editorial. Anything narrative.

**Failure mode.** AI applies this when there are 4-8 items and the items deserved editorial treatment instead — turning a hotel's 6 suites into a catalog grid loses the narrative the suites should have had.

---

## 10. SPA / Dashboard

**Definition.** Persistent navigation chrome (sidebar, top bar) with content panes that update without full-page reloads. Not a "page" in the document sense — an application surface.

**Distinguishing edge.** Versus everything else — SPA/dashboard is an application UI, not a marketing or content page. The grammar is fundamentally different: persistent state, multiple panes, focused interaction zones.

**Canonical examples.** Linear app, Notion app, Figma, Slack, Gmail, Asana, every modern B2B SaaS product UI, GitHub, Stripe Dashboard, AWS Console.

**Compositional logic.**
- Left sidebar (navigation) + top bar (context/actions) + main content pane is the dominant pattern.
- Main content pane fills remaining viewport.
- Density is high — interfaces show many actionable elements simultaneously.
- Spacing is tight (8-16px) compared to marketing pages.
- Type is small and functional (13-15px body).
- Often dark-mode dominant.

**Motion vocabulary.** Functional and immediate — pane transitions, modal entries, tooltip appearances, drag-and-drop feedback. Motion is feedback for state changes, never decorative.

**Registers it hosts.** B2B SaaS, productivity tools, developer tools, internal tools, admin panels, anywhere users *work*.

**Registers it resists.** Marketing pages. Anything content-driven. Anything where users are deciding rather than acting.

**Failure mode.** Marketing pages built in this grammar feel like product UIs (cold, dense, functional) rather than marketing (warm, narrative, considered). The inverse — product UIs built in marketing grammars — is also a failure but rarer.

---

## 11. Side-Scroll / Horizontal

**Definition.** Content moves horizontally rather than (or in addition to) vertically. Either pure horizontal scroll, or hybrid layouts where horizontal swipe is a primary axis of navigation.

**Distinguishing edge.** Versus all other grammars — the scroll axis is the differentiator. Most web design assumes vertical; side-scroll deliberately violates that assumption.

**Canonical examples.** Netflix's row-based browsing, Apple TV interface on web, Longshot Features (referenced in research), some portfolio sites (especially photographers), Spotify's playlist rows, museum exhibition sites, gallery showcases, some experimental Awwwards winners.

**Compositional logic.**
- Horizontal axis is primary or co-primary with vertical.
- Often paired with vertical sections — vertical scroll between thematic chapters, horizontal scroll within them.
- Requires explicit affordances (arrow buttons, scroll indicators) because horizontal scroll is not the default user expectation.
- Each "frame" of horizontal content tends to be viewport-sized or close to it.
- Mobile adaptation is challenging — usually requires re-architecting the layout.

**Motion vocabulary.** Scroll-driven horizontal panning, snap-points between frames, parallax across horizontal axis, sometimes mouse-drag-to-scroll on desktop.

**Registers it hosts.** Photography portfolios, video showreels, experimental editorial, gallery and museum sites, brand experiences, some retail catalog experiences (especially fashion lookbooks), entertainment platforms.

**Registers it resists.** Anything content-dense or text-heavy. Anything mobile-first. Anything users need to skim quickly. Most commercial use cases.

**Failure mode.** AI rarely produces this grammar without explicit instruction — it's not in the default vocabulary. When forced, it tends to produce horizontal scroll without the affordances or the structural integrity, leaving users disoriented.

---

## What this means for Palate

**Eleven grammars is the right granularity.** Each one has a clear distinguishing edge. Each one has registers it hosts and resists. None of them collapse into another without losing real distinctions.

**Grammars are not blendable across the geometric axis.** Aman (vertical-rhythm editorial) and Soho House (editorial-grid magazine) cannot be averaged for layout purposes. A brief that wants both must pick one as the geometric base and import the other's tonal qualities only.

**Grammars are blendable across the tonal axis.** Within a chosen grammar, multiple cards' typographic and tonal vocabularies can compose freely. The constraint is geometric, not stylistic.

**The schema implication.** Cards declare a `grammar` field (one of eleven). The MCP retrieval routes a brief to a grammar first, then to cards within that grammar. The MCP refuses to compose cards across grammars unless the user explicitly opts in to a *register-only* import.

---

## Open questions for v0.2

1. Does *Bento Modular* deserve to split into "Apple-tier bento" (large cells, marketing-oriented) and "fintech bento" (denser cells, dashboard-adjacent)? They use the same compositional logic but at different scales.

2. Is *Document / Prose* really a grammar or just "plain HTML"? It might be the absence of a grammar rather than a grammar itself. If so, it could be removed and treated as the fallback.

3. *Type-monumental* — large-typography-as-architecture sites (Cereal-style, some Bulgari pages, Calvin Klein at certain points). Is this its own grammar, or is it a high-extreme expression of vertical-rhythm editorial? Current placement is folded into VRE; may need to split.

4. Is there a missing grammar for *spatial / canvas* (zoom-and-pan, 2D-positioned content)? It exists (Bruno Simon's portfolio, some experimental sites) but I'm not sure it's mature enough as a category to warrant a slot. Currently excluded.

5. The eye-scanning patterns (F-pattern, Z-pattern, Gutenberg diagram) are not grammars — they're orthogonal user-behavior models. They should inform the schema as a separate dimension (e.g., a card might note "this layout assumes Z-pattern scanning on desktop") rather than appear as their own grammars.

---

*v0.1 — May 2026. This document is intended to be revised. Push back on any grammar definition, edge case, or omission.*

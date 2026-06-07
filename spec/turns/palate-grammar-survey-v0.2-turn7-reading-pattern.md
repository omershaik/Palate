# Palate Grammar Survey v0.2 — Turn 7: Reading-Pattern Grammar

This document covers the eighth and final axis: **Reading-Pattern**. This is the axis I dismissed in the original layout survey and that you correctly elevated to its own grammar. It governs *how the user's eye moves across the page* — which content positions get attention, which get ignored, where CTAs should sit, which patterns mobile vs desktop trigger.

Reading-Pattern grammar is distinct from layout (which arranges content) and from density (which controls how much content). It's the meta-decision about *how the eye is expected to traverse the page*. Different content types and audiences trigger different scanning patterns; designing against the wrong pattern wastes attention on positions users don't look at.

This axis is heavily research-backed. The patterns below are documented in eye-tracking studies — Nielsen Norman Group's 2006 F-pattern study (replicated many times since), the Gutenberg diagram from typography history, mobile thumb-zone research from Steven Hoober and NN/G. I'm drawing on the documented evidence directly rather than inventing.

The routing-test discipline applies: a substyle earns its place only if a brief can route to it without routing to its parent grammar's other substyles.

---

# What this axis represents (and what it doesn't)

Reading-Pattern grammar specifies the *expected scanning behavior* the page is designed for. It's not a description of how every user will actually behave — eye-tracking shows substantial variation between users. It's the design decision about which scanning pattern to *optimize for* given the page's content type, audience, and context.

A blog post optimized for F-pattern reading places its hook in the top-left, key claims at the start of paragraphs, and bullets along the left margin. The same content optimized for Layer-cake reading uses heavy headings and subheadings that carry the meaning even when the reader skips the body text between them. These are different design decisions producing visibly different pages from the same content.

This grammar interacts with layout, typography, and density tightly. The Compatibility Model in Turn 8 will formalize these dependencies.

There are six reading-pattern grammars worth distinguishing.

---

## RP-1. F-Pattern (Text-Heavy Scanning)

**Definition.** The most common eye-scanning pattern, identified by Nielsen Norman Group's 2006 study and replicated many times since. Users scan text-heavy pages in an F shape: a horizontal sweep across the top, a shorter horizontal sweep further down, then a vertical scan down the left margin. The grammar of long-form content, blogs, articles, search results, and most text-dense pages.

**Distinguishing edge.** Versus *Layer-cake* — F-pattern users read more body text than Layer-cake users; Layer-cake skips body text almost entirely and scans only headings. Versus *Z-pattern* — F-pattern is for text-heavy content; Z-pattern is for visually-structured content with lighter text. Versus *Gutenberg* — F-pattern emerges with skimming; Gutenberg emerges with engaged reading.

**Substyles.**
- **Classic F-pattern.** Three or more horizontal scan lines plus a left-margin vertical scan. Content-heavy blog posts, long-form articles, search results pages.
- **E-pattern variant.** The same scanning behavior but with three horizontal lines instead of two. Slightly more engaged reader, slightly more text scanned. NN/G research notes E variants are common.
- **Inverted-L variant.** A single horizontal scan at the top plus a vertical scan down the left. Shorter content, less engaged reader. Common on mobile and on pages where users decided quickly that the content wasn't relevant.

**Canonical examples.** Most blog posts, Medium articles, NYT article pages, search results (Google, Amazon), Wikipedia, most editorial publications, most documentation pages, most longform content.

**Internal logic.**
- The top-left is the highest-attention zone. Headlines, page titles, and primary content go here.
- The left margin gets vertical scanning attention — bullets, subheadings, and key terms placed here have higher visibility.
- Content past the right margin and below the fold gets progressively less attention.
- F-pattern is what users do when they're *skimming*, not *reading deeply*. Designing for F-pattern means accepting that most content won't be read.
- Often paired with Long-Form Stack or Document/Prose layout, Editorial-Spacious or Standard-Marketing density, Two-Hand or Editorial Print typography.

**Registers it hosts.** Blog posts, articles, documentation, news, search results, longform editorial, content-heavy marketing pages.

**Registers it resists.** Application UIs (which use Z-pattern or task-driven scanning). Marketing pages with heavy visual elements (which use Z-pattern). Mobile-first content (which uses Mobile Thumb-Zone). Pages where users are deeply engaged and reading thoroughly (which use Gutenberg).

**Failure mode.** AI generates F-pattern-friendly content but places key claims in the middle or right of paragraphs, where F-pattern scanners won't see them. Or it uses centered text and centered headings, which fights the F-pattern entirely. The grammar requires *positional discipline* — putting key content where eyes will be.

- **Vibes:** *blog scanning* — *article scanning* — *news scanning* — *standard reading pattern* — *the way people skim*
- **Brand exemplars:** *like NYT articles* — *like Medium posts* — *like a typical blog* — *like Wikipedia* — *standard documentation*
- **Vernacular labels:** *F-pattern* — *F-shaped reading* — *text scanning* — *blog reading pattern*
- **Anti-vibes:** *not centered everything* — *not for visual landing pages* — *not for application UIs*
- **Compositional intent:** *I'm publishing text content people will skim* — *put the important stuff top-left and along the left margin* — *I want the page to be scannable*

---

## RP-2. Z-Pattern (Visual-Structured Scanning)

**Definition.** The eye moves in a Z shape across visually-structured pages with light text density: a horizontal sweep across the top (logo to nav CTAs), a diagonal drop through the page's hero/visual content, then a horizontal sweep across the bottom (where primary CTAs typically sit). The grammar of marketing landing pages, product pages, and visually-structured content with lighter text.

**Distinguishing edge.** Versus *F-pattern* — Z-pattern is for visually-structured pages with less text; F-pattern is for text-heavy pages. Versus *Gutenberg* — Z-pattern is what users do when scanning to decide; Gutenberg is what users do when fully engaged.

**Substyles.**
- **Single-Z Landing.** One Z movement across the page — top-left logo, top-right nav CTA, diagonal through hero, bottom CTA. Single-screen marketing pages.
- **Multi-Z Stack.** Multiple Zs stacked vertically — each section operates as its own Z. Conversion-stack landing pages with multiple sections.
- **Reverse-Z (RTL-coded).** Z-pattern reversed for right-to-left reading languages (Arabic, Hebrew, etc.). Same logic, mirrored.

**Canonical examples.** Most modern SaaS landing pages, most e-commerce product pages, most v0/Lovable/Bolt outputs in marketing mode, most YC company landing pages, most Webflow templates.

**Internal logic.**
- Top-left: brand mark / logo. The Z starts here.
- Top-right: secondary CTA, login link, key navigation. First rightward sweep finds this.
- Diagonal middle: hero headline + supporting content + primary visual. The diagonal of the Z.
- Bottom-left: secondary content or social proof.
- Bottom-right: primary CTA. The Z ends here, and this is where users settle.
- Often paired with Conversion-Stack layout, Standard-Marketing density, Marketing Single-Accent color.

**Registers it hosts.** SaaS landing pages, marketing pages, product detail pages, e-commerce product pages, conversion-optimized surfaces.

**Registers it resists.** Long-form articles (which use F-pattern). Application UIs (which use task-driven scanning). Mobile-first content (which uses thumb-zone patterns).

**Failure mode.** AI defaults to Z-pattern for marketing pages without considering whether the actual content fits. Pages with lots of text get Z-pattern designed treatment but trigger F-pattern scanning behavior, and the design wastes its bottom-right CTA on content users skim past.

- **Vibes:** *landing page scanning* — *marketing page reading* — *typical product page* — *standard SaaS reading*
- **Brand exemplars:** *like a typical YC landing page* — *like a v0-default output* — *standard marketing page reading*
- **Vernacular labels:** *Z-pattern* — *Z-shaped reading* — *landing page pattern* — *marketing reading pattern*
- **Anti-vibes:** *not for text-heavy pages* — *not for application UIs* — *not for editorial*
- **Compositional intent:** *I'm building a marketing page where users decide quickly* — *the eye should land on the CTA last* — *I want a typical landing page reading flow*

---

## RP-3. Gutenberg Diagram (Engaged Reading)

**Definition.** The pre-digital pattern from typography theory, describing how the eye moves through pages of evenly-distributed content when the reader is *genuinely engaged* (not skimming). The eye sweeps left to right, top to bottom, in horizontal axes of orientation, ending at the bottom-right "terminal optical zone." Strong fallow areas (top-right, bottom-left) get less attention unless emphasized visually.

**Distinguishing edge.** Versus *F-pattern* — Gutenberg applies when readers are *engaged* and actually reading; F-pattern applies when readers are *skimming*. Versus *Z-pattern* — Gutenberg applies to evenly-distributed text content; Z-pattern applies to visually-structured pages with sparse text.

**Substyles.**
- **Classical Gutenberg.** Pre-digital reading pattern from typography. Books, magazine pages, dense newspaper layouts. Applies to web when the reader is genuinely engaged with the content.
- **Engaged-Article Gutenberg.** Long-form web articles where the reader has committed — they're not skimming. The pattern applies, but the design must earn the engagement first.
- **Document-Prose Gutenberg.** Plain text web pages (Paul Graham, Gwern, technical documentation) where readers arrive committed to reading. The whole page operates on Gutenberg.

**Canonical examples.** Books and magazines (the original context). Long-form essays where readers committed (Stripe Press article pages, Paul Graham essays, premium Substack with engaged audiences). Documentation pages users have actively chosen to read.

**Internal logic.**
- The eye follows "reading gravity" — top-left to bottom-right.
- Strong fallow areas (top-right, bottom-left) receive less attention; the design either places less-important content there or emphasizes those zones with visual contrast.
- The terminal optical zone (bottom-right) is where the eye finally settles. CTAs and conclusions live here.
- This pattern *only* applies when the reader is genuinely engaged. For skimmers, F-pattern applies instead.
- Often paired with Editorial-Spacious density, Long-Form Stack or Document/Prose layout, Two-Hand or Editorial Print typography.

**Registers it hosts.** Books, longform essays, engaged-audience publications, documentation that users actively choose to read, prose-first content where readers arrive committed.

**Registers it resists.** Marketing pages (where users decide quickly). Search results (where users skim). Most blog content (where F-pattern applies). Application UIs (which use task-driven scanning).

**Failure mode.** Designers assume Gutenberg applies when F-pattern actually does. The page is laid out for engaged reading but users are skimming, so the carefully-placed terminal-zone content gets ignored. The grammar requires *honest assessment* of whether your audience is engaged or skimming.

- **Vibes:** *engaged reading* — *book-like reading* — *like reading a real article* — *committed reader* — *long-form engagement*
- **Brand exemplars:** *like reading a book* — *like a Paul Graham essay* — *like Stripe Press articles* — *like a printed magazine page*
- **Vernacular labels:** *Gutenberg diagram* — *engaged reading pattern* — *reading gravity* — *committed-reader pattern*
- **Anti-vibes:** *not for skimmers* — *not for marketing* — *not for landing pages*
- **Compositional intent:** *my readers are committed and will actually read* — *I'm publishing essays, not selling products* — *the design should reward sustained reading*

---

## RP-4. Layer-Cake (Heading-Skipping)

**Definition.** Users scan only headings and subheadings, skipping body text entirely. The eye-tracking heatmap shows horizontal stripes — alternating layers of read content (headings) and skipped content (body), like the layers of a cake. The grammar of search-driven readers, reference-style content, and busy users in scanning mode.

**Distinguishing edge.** Versus *F-pattern* — Layer-cake users skip body text almost entirely; F-pattern users at least scan the start of paragraphs. Versus *Spotted/Bypassing* — Layer-cake is systematic (headings only); Spotted is scattered (random elements).

**Substyles.**
- **Classic Layer-cake.** Headings carry the meaning; body text is for the rare reader who commits. Reference documentation, technical manuals, search-result pages.
- **Subheading-Heavy Layer-cake.** Heavy use of H2 and H3 headings every few sentences. Modern SEO-optimized content, knowledge bases, FAQ pages.
- **Bullet-Layer Layer-cake.** Bullet lists serve as visual layers — users scan bullets, skip prose between them. How-to articles, listicles.

**Canonical examples.** Stack Overflow answers, Wikipedia (when users are searching for specific information), modern SEO-optimized blog content, knowledge bases, FAQ pages, listicle journalism, technical documentation users navigate by heading.

**Internal logic.**
- Headings must carry the meaning by themselves. A reader who reads only the headings should still understand the page.
- Body text exists for the engaged reader but is acceptably skipped. Design must not punish skipping.
- Headings should be visually distinctive — clear hierarchy, generous spacing above, strong typographic contrast.
- Often paired with Long-Form Stack layout, Editorial-Spacious density, Two-Hand typography.

**Registers it hosts.** Reference documentation, knowledge bases, FAQ pages, SEO-optimized content, listicle journalism, technical manuals, anything where users arrive looking for specific information.

**Registers it resists.** Marketing landing pages (where Z-pattern applies). Engaged longform reading (where Gutenberg applies). Application UIs.

**Failure mode.** Headings that don't carry meaning ("Introduction," "Background," "Overview") fail Layer-cake readers entirely. The grammar requires headings to be *informative* — telling the reader what's in the section, not just labeling it.

- **Vibes:** *heading scanning* — *skip-the-body reading* — *headings only* — *fast reference reading* — *search-driven reading*
- **Brand exemplars:** *like Stack Overflow answers* — *like Wikipedia search results* — *like a modern FAQ page* — *like a knowledge base*
- **Vernacular labels:** *layer-cake pattern* — *heading-only scanning* — *subheading-driven reading* — *reference reading pattern*
- **Anti-vibes:** *not engaged reading* — *not for marketing* — *not for landing pages*
- **Compositional intent:** *users are searching for specific information, not reading the whole thing* — *headings need to carry the meaning* — *I'm writing reference content, not narrative*

---

## RP-5. Spotted / Bypassing (Scattered-Attention)

**Definition.** Eye movement is non-systematic — the user's attention jumps between elements based on visual prominence, without following any of the structured patterns above. Common on visually-cluttered pages, on pages where users are uncertain what they want, and on pages where multiple competing elements demand attention. This is partly a *failure mode* and partly a real design context for certain content types.

**Distinguishing edge.** Versus *Layer-cake* — Spotted is non-systematic (random elements); Layer-cake is systematic (headings only). Versus the structured patterns (F, Z, Gutenberg) — Spotted lacks structure entirely.

**Substyles.**
- **Visual-Catalog Spotted.** Eye jumps between thumbnails on catalog pages, comparing options. E-commerce product listings, image galleries. Here Spotted is intentional — the user is comparing.
- **Cluttered-Page Spotted.** Eye jumps because no element is clearly dominant. The failure mode of cluttered design.
- **Decision-Paralysis Spotted.** Eye jumps because the user can't decide which element matters. Common on poorly-prioritized landing pages.
- **Attention-Grabbing Spotted.** Eye jumps because too many elements compete (animation, color, motion). Common on Y2K-revival, maximalist, and over-stimulated marketing.

**Canonical examples.** Pinterest browsing, Amazon search results (when comparing), Behance galleries, image-heavy catalog pages, badly-cluttered marketing pages (the failure mode), maximalist design portfolios.

**Internal logic.**
- For *intentional* Spotted (catalog browsing): all elements are equally weighted; no hierarchy is intended; the user is comparing options.
- For *failure-mode* Spotted: hierarchy is missing or broken; the design needs visual priority added.
- Designing for intentional Spotted means optimizing for *comparability* — uniform tiles, consistent imagery, scannable metadata.
- Designing *against* failure-mode Spotted means adding hierarchy — making one element clearly dominant.
- Often paired with Catalog layout (intentional) or any layout when broken (failure-mode).

**Registers it hosts (intentional).** Catalog browsing, image galleries, product comparison pages, Pinterest-style discovery interfaces, portfolio grids.

**Registers it resists.** Marketing pages with conversion goals (where one element should dominate). Reading-focused content. Application UIs.

**Failure mode.** Designers assume their cluttered page is "engaging" because eye-tracking shows lots of fixations. Lots of fixations without conversion is *Spotted as failure mode*, not engagement.

- **Vibes:** *browsing scanning* — *comparing options* — *catalog reading* — *gallery scanning* — *Pinterest-style*
- **Brand exemplars:** *like browsing Pinterest* — *like Amazon search results* — *like a Behance gallery* — *like Dribbble*
- **Vernacular labels:** *spotted pattern* — *bypassing pattern* — *catalog scanning* — *gallery scanning* — *comparison reading*
- **Anti-vibes:** *not for conversion* — *not for narrative* — *not for marketing landing pages*
- **Compositional intent:** *users are comparing options* — *all the items should be equally weighted* — *I'm building for browsing, not deciding immediately*

---

## RP-6. Mobile Thumb-Zone (One-Handed Scanning)

**Definition.** The mobile-specific reading and interaction pattern, where eye movement *and* thumb reach jointly determine which screen positions get attention. The bottom third of the screen (the "natural zone") gets highest interaction accuracy and most attention; the top third (the "stretch zone") requires hand repositioning and gets least attention. The grammar of mobile-first design.

**Distinguishing edge.** Versus all desktop patterns — Mobile Thumb-Zone is constrained by physical hand position, not just eye movement. The same content's optimal positioning differs on desktop vs mobile.

**Substyles.**
- **Right-Handed Thumb-Zone.** Bottom-right is the strongest zone (most users are right-handed). Primary CTAs, key actions sit here.
- **Two-Handed Thumb-Zone.** When users hold the phone with both hands (typing, gaming). Top-third remains accessible but eye movement still favors lower regions.
- **One-Hand-Stretching Thumb-Zone.** Larger phones force users to stretch or reposition. The "natural zone" shrinks; designers must keep critical actions in tighter areas.
- **Tablet Thumb-Zone.** Different physics on tablets — both hands typically used, edges of screen are easier to reach than centers.

**Canonical examples.** Modern mobile apps (Instagram, TikTok, Twitter, WhatsApp), mobile e-commerce (Amazon mobile, Airbnb mobile), mobile-first web experiences, considered mobile design (Apple's iOS guidelines, Google's Material Design mobile spec).

**Internal logic.**
- Bottom-third "natural zone" = 96% tap accuracy (NN/G research). Place primary actions here.
- Middle-third "comfortable zone" = decent accuracy, moderate attention. Place secondary actions and content here.
- Top-third "stretch zone" = 61% tap accuracy. Avoid critical actions here unless contextually necessary (status bars, system notifications).
- Eye attention follows similar gradient — users attend more to lower portions of the screen because their thumb is there.
- Bottom navigation bars exist *because* of thumb-zone research. Putting nav at the top of mobile screens fights this pattern.
- Often paired with mobile-adapted layouts, Mobile-Density density, larger touch targets.

**Registers it hosts.** All mobile-first interfaces. All apps. All mobile-optimized web experiences. Increasingly, all web experiences (since mobile is majority traffic).

**Registers it resists.** Desktop-only experiences (where keyboard and mouse change the dynamics). Tablet-optimized interfaces (which have different physics). Print-coded layouts that don't adapt to mobile.

**Failure mode.** Desktop layouts shrunk to mobile size without adaptation — primary CTAs in the top-right (where thumb can't reach), navigation menus across the top (forcing repositioning), critical actions buried in the stretch zone. AI defaults frequently produce this failure when generating "responsive" layouts that are really just smaller desktop layouts.

- **Vibes:** *mobile-first* — *thumb-friendly* — *one-handed use* — *mobile reading* — *bottom navigation*
- **Brand exemplars:** *like Instagram's mobile UI* — *like TikTok* — *like Apple's iOS* — *like Google's Material Design mobile*
- **Vernacular labels:** *thumb zone* — *thumb-friendly design* — *mobile thumb-zone* — *bottom-nav design* — *mobile-first layout*
- **Anti-vibes:** *not desktop-shrunk* — *not nav-on-top mobile* — *no critical actions in stretch zone*
- **Compositional intent:** *most of my users are on mobile* — *I want primary actions reachable by thumb* — *the design must work one-handed*

---

# How Reading-Pattern interacts with the other axes

Reading-Pattern is unusually *forced* by other axis decisions. Choosing F-pattern means committing to text-heavy layout and scannable typography; choosing Mobile Thumb-Zone means designing primary actions into the bottom third regardless of what desktop convention says. Some natural co-occurrences:

- **F-Pattern + Long-Form Stack layout + Editorial-Spacious density + Two-Hand typography** = standard text-heavy article reading
- **Z-Pattern + Conversion-Stack layout + Standard-Marketing density + Marketing Single-Accent color** = standard SaaS landing page
- **Gutenberg + Long-Form Stack layout + Editorial-Spacious density + Editorial Print typography** = engaged-reader essay site
- **Layer-cake + Document/Prose layout + Editorial-Spacious density + clear heading hierarchy** = reference documentation
- **Spotted (intentional) + Catalog layout + Editorial-Bento + Product Photography** = e-commerce browsing
- **Mobile Thumb-Zone + SPA / Dashboard layout + Application-Density components** = modern mobile app UI

Some combinations are *broken*:

- **F-Pattern + centered everything** — the F-pattern requires left-aligned content; centered alignment fights the grammar
- **Z-Pattern + heavy text density** — Z-pattern only works with visual structure and light text; heavy text triggers F-pattern instead
- **Gutenberg + skimming audience** — Gutenberg only applies when readers are engaged; skimmers trigger F-pattern
- **Layer-cake + uninformative headings** — Layer-cake requires headings to carry meaning; "Introduction" headings fail entirely
- **Mobile Thumb-Zone + critical actions in stretch zone** — the grammar is defined by thumb reach; placing actions out of reach breaks it

Some combinations are *novel-but-coherent*:

- **F-Pattern + Marketing-Bento layout** — bento marketing pages where each cell is text-heavy and triggers F-pattern within the cell. Rare but defensible for technical product marketing.
- **Gutenberg + Hard-Bordered components** — engaged reading in a neo-brutalist visual frame. Stripe Press in some treatments approaches this.
- **Mobile Thumb-Zone + Editorial-Spacious density** — mobile-first editorial reading with generous spacing. Modern mobile-optimized longform journalism.

---

# Open questions for v0.2

1. **Reading-Pattern may overlap with Layout more than other axes overlap with each other.** The choice of F-pattern essentially demands a text-heavy long-form layout; the choice of Z-pattern demands a marketing structure. The Compatibility Model in Turn 8 will need to decide whether Reading-Pattern is a separate axis with strong layout constraints, or substyles of the layout grammars themselves.

2. **The structured patterns (F, Z, Gutenberg) have substantial empirical research behind them; Spotted and Layer-cake have less.** Spotted in particular is *partly a failure mode and partly a real design context*. The grammar exists to handle both, but the dual nature is unusual. Worth flagging for Turn 8 whether Spotted should be split into "Intentional Spotted (catalog browsing)" and "Failure-mode Spotted (broken hierarchy)" as separate grammars.

3. **Mobile Thumb-Zone is the only grammar specific to a device class.** Other grammars are device-agnostic. This raises whether Reading-Pattern needs *device-specific variants* of every grammar (mobile F-pattern, mobile Z-pattern, etc.), or whether Mobile Thumb-Zone covers the mobile case adequately. Currently treating Mobile Thumb-Zone as the mobile-specific grammar; flag for Turn 8 whether per-grammar mobile variants are needed.

4. **Reading-Pattern interacts with culture and language direction.** The patterns above are based on left-to-right reading languages. Right-to-left languages (Arabic, Hebrew) reverse the patterns; some East Asian contexts have additional pattern variants. Currently treating LTR as default; flag for Turn 8 whether RTL variants need explicit grammar definitions.

5. **The Spotted grammar's dual nature may need a different representation.** Most other grammars are positive design choices; Spotted is *partly* a positive choice (catalog browsing) and *partly* a failure mode to detect and fix. This is unusual. The grammar may need to split into two: one for intentional comparative-browsing patterns (which is design grammar), and one for the failure mode (which is more like a diagnostic flag than a grammar).

---

*Turn 7 complete. Reading-Pattern axis covered with 6 grammars. Total spec status: 77 grammars across 8 axes (Layout 14, Typography 6, Color 9, Component 9, Motion 9, Imagery 9, Density 6, Voice 9, Reading-Pattern 6) plus the 6 Voice dimensions as a separate representation layer.*

*All eight axes are now defined. The remaining work is integration and packaging:*
*- Turn 8 — Compatibility Model: how the axes constrain each other, the maintenance/scraping architecture for brand exemplar staleness (per your earlier decision), the reduced-motion accessibility layer, the routing logic, and the open questions accumulated across all turns*
*- Turn 9 — Synthesis Document: the spec coherent as a single document, with the v0.1 implementation plan*

*Push back on anything in the Reading-Pattern grammars before I proceed to Turn 8.*

# Palate Grammar Survey v0.2 — Turn 2: Component & Motion

This is Turn 2 of 4 in the multi-axis grammar survey. It covers two of the eight axes that compose a website's design vocabulary: **Component** and **Motion**.

A correction to Turn 1 belongs at the top of this document, because it changes the framing for everything that follows. In Turn 1, the *Earth-Pulled Restraint* color grammar had four substyles named geographically (Mediterranean, Deccan-Mughal, Northern-European, American-Heritage). Geographic naming was a mistake — it created false specificity (the names imply you can't use the palette outside that region, which isn't true) and presupposed cultural knowledge that this spec shouldn't require. The corrected substyles are aesthetic, not geographic:

- **Warm-Saturated Earth.** Sun-warmed neutrals (sand, terracotta, deep olive) with a saturated red-orange or deep blue-green accent.
- **Warm-Matte Earth.** Warm neutrals leaning toward sandstone, brass, oxblood, with a deep madder, indigo, or peacock accent.
- **Cool-Matte Earth.** Cooler off-whites, soft greiges, charcoal, with a single deep navy or bottle-green accent.
- **Warm-Heritage Earth.** Cream, oxblood, deep brown, ochre, with a single saddle-tan or ink-blue accent.

This document, and Turns 3 and 4, will use aesthetic naming throughout. Any grammar should be readable by any working designer regardless of cultural or project context.

---

# AXIS 3 — COMPONENT GRAMMAR

Component grammar is the system of decisions about: how interactive atoms (buttons, links, inputs, cards, navigation, badges, modals) are styled, shaped, and behave. Component decisions are where AI-generated sites are most easily detected as AI-generated — because the same default button style, the same default card with `rounded-2xl shadow-lg`, appears across millions of pages. Component grammar is the axis where conscious choice has the highest visible payoff.

It is distinct from layout (where components are placed) and from typography (what's inside them). A vertical-rhythm-editorial layout can host any of several component grammars; the choice depends on the brand register being expressed.

There are eight component grammars worth distinguishing.

---

## COMP-1. Typographic-Discreet (Inline-as-Component)

**Definition.** Buttons and interactive elements are *typographic*, not *containerized*. Primary actions are an underlined word in body type or a serif phrase with a thin border. There are almost no visible button "shapes" — the page reads as text with active words in it.

**Distinguishing edge.** Versus *Soft-Container* — Typographic-Discreet has no fill or background on most interactive elements; Soft-Container always has a visible button shape. Versus *Hard-Bordered* — Typographic-Discreet borders are hairline (1px) or absent; Hard-Bordered uses thick borders as the defining element.

**Substyles.**
- **Inline-Underline.** All actions are underlined inline links in body type. The "Reserve" function is a serif word with a 1px underline, never a button. Aman, Cheval Blanc.
- **Bordered-Word.** A single serif or sans word inside a thin (1px) rectangular border, with generous internal padding. The border is the only thing distinguishing it from body text. Soho House, Apartamento.
- **Caret-Link.** A word followed by a small chevron or arrow character (›, →, ↗) indicating "this leads somewhere." No background, no border. Common in editorial publishing.

**Canonical examples.** Aman properties, Cheval Blanc, Soho House (most pages), most quiet-luxury hospitality, most considered fashion houses, fine-arts publishing.

**Internal logic.**
- The component shape is *typographic*, not graphic. The component IS the typography.
- Hover states are minimal: a color shift, an underline thickening from 1px to 2px, a slight color change to an accent. Never a fill appearing, never a transform, never a shadow.
- Primary and secondary actions are differentiated by *position* (primary is more prominent in the layout) and by *typographic weight* (primary may be slightly bolder), not by container weight.
- The grammar refuses to "sell" — there is no visual urgency anywhere.

**Registers it hosts.** Luxury hospitality, considered fashion, editorial publishing, heritage brands, fine arts, anywhere quiet confidence is the brand statement.

**Registers it resists.** Anywhere conversion is the goal. SaaS. E-commerce. Anywhere users need to find actions quickly under cognitive load. Anything explicitly playful.

**Failure mode.** AI imitates the surface — uses underlined inline links — but adds container backgrounds or shadows elsewhere on the page (sticky CTAs, floating booking widgets), breaking the entire grammar. Typographic-Discreet only works when the *whole* component system commits.

---

## COMP-2. Soft-Container System

**Definition.** All interactive elements live inside soft-edged containers — buttons with moderate border-radius (8–16px), cards with light shadows, inputs with rounded corners and subtle backgrounds. The default modern product UI vocabulary, popularized by Material Design and refined by contemporary design systems.

**Distinguishing edge.** Versus *Typographic-Discreet* — Soft-Container always uses visible component shapes; Typographic-Discreet uses none. Versus *Hard-Bordered* — Soft-Container uses gentle radii and soft shadows; Hard-Bordered uses sharp corners and thick solid borders. Versus *Pill-and-Cushion* — Soft-Container uses moderate radii (8–16px); Pill-and-Cushion uses extreme radii (rounded-full or near-full).

**Substyles.**
- **Material-Coded.** Filled primary buttons, outline secondary, text tertiary. Card surfaces with elevation shadows. The classic Google Material vocabulary, slightly refined.
- **Tailwind-Default.** `rounded-md` to `rounded-xl` on everything, `shadow-sm` to `shadow-md` on cards, hover lifts. The most common AI default. Every Lovable/v0/Bolt output before art-direction.
- **Apple-Refined.** Subtle gradients (very light), translucent surfaces (frosted-glass effects), refined shadows. Component shapes are softer, more organic. Apple's product pages, contemporary consumer apps.
- **Stripe-Coded Refined.** A more disciplined version of Material — radii of exactly 6–8px (never the safe-middle 12px), shadows only on hover, primary buttons in brand purple, very precise spacing. Modern SaaS that wants to feel premium.

**Canonical examples.** Stripe, Linear (some pages), virtually every SaaS landing page, every modern dashboard, every YC company's MVP, the default v0 output, every Notion-coded product.

**Internal logic.**
- Border-radius is between 4px and 16px on most elements. The "rounded-2xl on everything" pattern is the AI-default failure mode within this grammar — the safe-middle radius is the tell.
- Shadows are present but restrained: `shadow-sm` to `shadow-md` typical; `shadow-lg` reserved for hover or modals.
- Primary/secondary/tertiary hierarchy is conventional: filled, outline, text. Or filled, ghost, text.
- Often paired with Geometric-Modernist typography and Single-Accent color systems.

**Registers it hosts.** SaaS, B2B, modern consumer apps, fintech, AI products, anywhere "trustworthy and contemporary" is the goal. The vast majority of commercial web traffic.

**Registers it resists.** Hospitality at any quality tier (the safe-middle radii read as SaaS, not hospitality). Editorial. Heritage. Anywhere conscious deviation from the SaaS default is the brand statement.

**Failure mode.** This is the AI default for *everything*. The failure mode is using it where it doesn't belong — most visibly when applied to hospitality, editorial, or heritage briefs where Typographic-Discreet or Hard-Bordered would have been correct. The hospitality anti-patterns explicitly forbid Soft-Container defaults (rounded-2xl, shadow-lg, three-column feature grids with cards).

---

## COMP-3. Hard-Bordered (Neo-Brutalist Components)

**Definition.** Components defined by thick solid borders (typically 2–4px black), zero or near-zero border-radius, no shadows, flat fills in saturated or stark colors. Buttons are hard rectangles. Cards are bordered boxes. The grammar refuses softness as a design statement.

**Distinguishing edge.** Versus *Soft-Container* — Hard-Bordered uses sharp corners and thick borders; Soft-Container uses soft radii and gentle shadows. Versus *Pill-and-Cushion* — Hard-Bordered is rectangular and stark; Pill-and-Cushion is soft and cushioned.

**Substyles.**
- **Pure Brutalist.** True black borders (2–4px), zero radius, primary or near-primary color fills, no shadows. The textbook neo-brutalism component vocabulary.
- **Soft-Brutalist.** Thick borders but slightly rounded (4–6px), pastel fills instead of primaries, occasional drop-shadow that's offset (hard 4px shadow, no blur). Around, Around-coded design tools.
- **Mono-Brutalist.** Black-and-white only, no color fills, thick borders, monospace type inside. Indie developer tools, technical-minded brutalism.
- **Hard-Shadow Brutalist.** Thick borders plus an offset hard shadow (no blur, fixed offset like 4px 4px 0 black). The shadow is geometric, not atmospheric. Common in 2023–2026 indie SaaS.

**Canonical examples.** Gumroad (post-2021), Figma's marketing pages (some), Around, Paddle (some pages), much of Awwwards' Brutalism category, indie SaaS launches 2023–2026, neo-brutalist component libraries.

**Internal logic.**
- Border thickness is 2–4px and *uniform* across the system. Inconsistent border weights destroy the grammar.
- Border-radius is 0–4px maximum. The safe middle (8–16px) is forbidden.
- Shadows are *geometric*, not atmospheric — if shadows are used, they have hard edges and fixed offsets, not blur.
- Hover and active states are *punchy*: borders shift color, fills invert, components translate by a few pixels. Never smooth fades.
- Often paired with Geometric-Modernist or Mono typography and Saturated-Primary color.

**Registers it hosts.** Indie SaaS, design tools, creative agencies, fashion brands targeting Gen Z, anti-corporate startups, design education, brands signaling "we're not like the others."

**Registers it resists.** Hospitality, banking, healthcare, enterprise, anything requiring conventional polish, heritage brands, luxury at any tier.

**Failure mode.** AI imitates the surface (thick borders, sharp corners) but loses the component coordination — using Hard-Bordered for some elements and Soft-Container for others on the same page, which destroys both grammars. Real Hard-Bordered systems are *systematically committed*.

---

## COMP-4. Pill-and-Cushion

**Definition.** Components defined by extreme rounded radii — pills (radius equal to half the height) for buttons, fully-rounded cards, capsule-shaped tags, ovoid badges. Components feel cushioned, soft, friendly.

**Distinguishing edge.** Versus *Soft-Container* — Pill-and-Cushion uses full-rounded radii on most elements; Soft-Container uses moderate radii. Versus *Typographic-Discreet* — Pill-and-Cushion has visible component shapes; Typographic-Discreet does not.

**Substyles.**
- **Pure Pill.** All buttons are pill-shaped (rounded-full). Cards have generous radii (24–32px). Friendly, contemporary. Common in beauty, wellness, lifestyle.
- **Mixed-Pill.** Pills for primary actions, soft-rectangular for secondary. Selective use creates hierarchy.
- **Cushion-Card.** Cards with very generous radius (24–48px) and soft, saturated fills. Cards feel like pillows. Common in Y2K-revival and dopamine-coded brands.
- **Pill-with-Shadow.** Pills plus restrained shadows on hover, creating a "lifted" feeling. Fitness apps, wellness, consumer health.

**Canonical examples.** Glossier, Headspace (some periods), Calm, much of Bumble's interface, modern beauty and wellness brands, contemporary consumer health apps, Pinterest's UI.

**Internal logic.**
- The radius is *committed* — full-pill for buttons means full-pill consistently. Half-measures (rounded-3xl that isn't quite a pill) read as confused.
- Often combined with Pastel-Vibrant color and friendly Geometric-Modernist typography.
- Internal padding is generous — pills with cramped padding feel wrong; the cushion needs space inside.
- Hover states are gentle: slight color deepening, slight shadow appearing, occasional bounce-easing.

**Registers it hosts.** Beauty, wellness, lifestyle, consumer health, dating apps, optimistic brands, products targeting younger demographics, anything signaling "we are friendly."

**Registers it resists.** Luxury at any tier (the cushioning reads as commercial, not premium). Editorial. Heritage. B2B. Enterprise. Anything where conscious restraint is the brand statement.

**Failure mode.** AI applies pill radii inconsistently — pills on primary buttons, soft-rectangular on secondary, sharp on tertiary — creating component chaos. Or it overuses pills on a page where Soft-Container would have been the better default, making the page feel candy-colored where it should have been business-coded.

---

## COMP-5. Sharp-Geometric (Editorial-Modernist)

**Definition.** Components with sharp corners (zero or near-zero radius), restrained borders (1px hairline, often in low-contrast color), no shadows, careful use of negative space. The component grammar of considered editorial and architectural-design products.

**Distinguishing edge.** Versus *Hard-Bordered* — Sharp-Geometric uses 1px hairline borders; Hard-Bordered uses 2–4px thick borders. Versus *Typographic-Discreet* — Sharp-Geometric has visible (if subtle) component containers; Typographic-Discreet does not. Versus *Soft-Container* — Sharp-Geometric refuses radius entirely; Soft-Container is built on radii.

**Substyles.**
- **Hairline-Defined.** 1px borders in low-contrast color (15–30% darker than background), zero radius, careful internal padding. Editorial and architectural design.
- **Type-Plus-Rule.** Components are typographic with a thin horizontal or vertical rule above/below. The rule defines the component, not the border. Common in print-coded editorial.
- **Boxed-Quiet.** Components inside thin-bordered rectangles with restrained typography. The border is structural, not decorative. Considered consumer brands.

**Canonical examples.** Apartamento, Cereal Magazine, Stripe Press, much of Klim Type Foundry's site, Type Foundry showcase sites, considered architectural practice sites, art gallery and museum digital experiences.

**Internal logic.**
- Sharpness is the discipline. A radius of even 4px breaks the grammar.
- Borders are 1px and often in colors derived from the palette (a warm-grey ink-30 against cream paper), not stark black.
- Hover states are minimal — a color shift on the border, occasionally a fill appearing.
- Often paired with Editorial-Print typography and Three-Color or Two-Color Monochrome palettes.

**Registers it hosts.** Editorial publishing, architectural practices, type foundries, fine arts and gallery sites, considered fashion (especially European), design publications, museum and cultural institutions.

**Registers it resists.** Anything explicitly playful or warm. SaaS. Most consumer products. Hospitality (where Typographic-Discreet is the closer fit). Anywhere components need high clickability or conversion focus.

**Failure mode.** AI imitates the surface (1px borders, no radius) but adds shadows on hover or uses a button fill that breaks the restraint. The grammar requires sustained discipline across every state and component; partial commitment fails.

---

## COMP-6. Glass / Layered (Translucent-Atmospheric)

**Definition.** Components built around translucency, frosted-glass effects, layered surfaces, and atmospheric depth. The grammar of contemporary Apple/iOS design and refined consumer tech.

**Distinguishing edge.** Versus *Soft-Container* — Glass/Layered uses translucent surfaces with backdrop-filter; Soft-Container uses opaque surfaces with shadows. Versus *Hard-Bordered* — Glass/Layered is atmospheric and depth-based; Hard-Bordered is flat and hard-edged.

**Substyles.**
- **Frosted-Glass.** Components have semi-transparent backgrounds with `backdrop-filter: blur()` creating a frosted effect over the page content. Apple's site, modern iOS-coded products.
- **Layered-Depth.** Components stack on each other with soft shadows creating perceived depth. Modal sheets that slide up from the bottom, layered cards.
- **Subtle-Gradient-Glass.** Glass effects combined with soft gradient surfaces, often metallic or iridescent. Modern AI launches, some consumer tech.
- **Light-Translucent.** Very subtle translucency (90%+ opacity) creating a gentle atmospheric quality without obvious blur effects. Used by considered consumer brands.

**Canonical examples.** Apple's product pages, Linear (some surfaces), Arc browser, modern iOS-coded products, Figma (some interfaces), refined consumer tech generally.

**Internal logic.**
- Translucency requires backdrop-filter support and content underneath worth blurring. Glass-on-flat-background defeats the purpose.
- Depth is *atmospheric*, not geometric — soft, blurred shadows that feel like real-world light.
- Performance matters: glass effects can introduce rendering cost. Used sparingly.
- Often paired with Geometric-Modernist typography and Iridescent color grammars.

**Registers it hosts.** Premium consumer tech, design tools, modern consumer products, AI products signaling sophistication, contemporary refined SaaS.

**Registers it resists.** Hospitality (glass effects feel tech-coded, not luxury-coded). Editorial. Heritage. Anywhere "rooted" or "considered" is the brand statement. Anything text-heavy (glass interferes with reading).

**Failure mode.** AI applies frosted-glass as decoration — putting it on backgrounds with no underlying content, or on components that don't need depth. The grammar requires actual layering to be meaningful; surface mimicry produces "shiny" rather than "atmospheric."

---

## COMP-7. Maximalist-Decorative

**Definition.** Components that bear visible decoration — ornaments, illustrative elements, custom shapes, hand-drawn or organic forms, components that don't fit standard rectangle/pill primitives. The grammar of expressive lifestyle and creative brands.

**Distinguishing edge.** Versus all other component grammars — Maximalist-Decorative refuses standard component primitives. Buttons might be irregular shapes; cards might be torn-paper effects; navigation might be a custom illustration.

**Substyles.**
- **Collage-Component.** Components built from layered torn-paper, sticker, or scrapbook elements. Lifestyle brands targeting creative audiences.
- **Hand-Drawn.** Components defined by hand-drawn borders, illustrations, organic shapes. Authentic, craft-coded brands.
- **Sticker-Style.** Components feel like physical stickers — chunky, slightly imperfect, often with offset shadows. Creative tools, education products.
- **Custom-Shape.** Components are bespoke shapes (not rectangles or pills) — ovals, blob shapes, irregular polygons. Creative agencies, fashion brands targeting Gen Z.

**Canonical examples.** Lush, Headspace (some campaigns), Starface, fashion brands targeting Gen Z, lifestyle and beauty brands wanting personality, creative agency portfolios, art-directed lifestyle products.

**Internal logic.**
- Underlying compositional discipline must exist (otherwise the components read as accidentally chaotic), but the component surface refuses standard UI primitives.
- Often paired with Maximalist-Expressive typography and Pastel-Vibrant or Saturated-Primary color.
- Performance and accessibility matter — custom-shape components must still be clickable, focusable, and screen-reader-accessible. The grammar is hard to do well.
- Components frequently incorporate custom illustration or photography.

**Registers it hosts.** Lifestyle brands, beauty, wellness, fashion targeting younger demographics, creative agencies, art-driven projects, brands wanting visible personality.

**Registers it resists.** Anything requiring conventional usability signals. SaaS. B2B. Banking. Healthcare. Hospitality at any quality tier. Editorial publishing requiring scannable text.

**Failure mode.** AI rarely produces this grammar without explicit instruction — it requires custom illustration and SVG work that isn't in default code generation. When forced, the result tends to be "stock illustration on a normal button" rather than truly decorative components.

---

## COMP-8. Mono-Density (Information-Dense)

**Definition.** Components designed for high information density — small, tight, with minimal padding, optimized for showing many things at once. The component grammar of dashboards, data tables, IDEs, and admin panels.

**Distinguishing edge.** Versus all marketing-oriented component grammars — Mono-Density privileges information density over visual polish. Padding is tight (4–8px). Components are small. Many things fit on screen.

**Substyles.**
- **Dashboard-Default.** Tight padding, small typography (13–14px), minimal radii (2–4px), restrained color signaling. Modern B2B dashboards.
- **IDE-Coded.** Information density of a code editor — every pixel counts, monospace dominance, dense rows of actionable elements. Developer tools, IDEs, terminal-coded products.
- **Data-Table-First.** Components optimized for data tables — tight rows, alignment-critical, color signaling for status. Financial tools, analytics products, admin panels.
- **Spreadsheet-Coded.** Grid-based component layout that mimics spreadsheet density — cells, rows, columns of compact information. Productivity tools, planning software.

**Canonical examples.** Linear (in-app), Stripe Dashboard, GitHub, every modern SaaS application UI, Notion (in-app), Asana, every B2B internal tool, every admin panel.

**Internal logic.**
- Padding is 4–12px on most components. Generous padding (16px+) wastes density.
- Type is small and functional (12–14px body in dashboards is normal).
- Color is used to teach UI: status colors are systematic and consistent (green = success, blue = info, etc.).
- Often paired with Geometric-Modernist or Mono typography and Single-Accent or Dark-Mode Dominant color.
- Hover states are immediate and functional: row highlights, tooltip appearances, action affordances.

**Registers it hosts.** B2B SaaS application UIs, dashboards, developer tools, productivity tools, financial products, anywhere users *do work* and need to see many things simultaneously.

**Registers it resists.** Marketing pages (where Mono-Density feels cold). Anything content-driven. Anywhere narrative or warmth matters. Consumer products where users are deciding rather than acting.

**Failure mode.** AI uses Mono-Density on marketing pages, producing tool-UI-coded marketing that feels cold and unwelcoming. Or it uses marketing-grammar component padding (24–32px) on dashboard interfaces, wasting space and reducing information density. The two contexts require different component grammars; AI tends to default to marketing for everything.

---

# AXIS 4 — MOTION GRAMMAR

Motion grammar is the system of decisions about: what moves, when it moves, how fast, with what easing, in response to what triggers, and how motion contributes to the overall design language. Motion is where many AI-generated sites *feel* AI-generated — not because of what's on screen but because of how it behaves. Default scroll-fade-ins on every section, hover-lifts on every card, spring-bounce animations on every button. Motion without choreography is the AI tell.

It is distinct from layout (where things sit) and from component (how they're shaped). A vertical-rhythm-editorial layout with Typographic-Discreet components can express several different motion grammars depending on register.

There are seven motion grammars worth distinguishing.

---

## MOTION-1. Stillness as Discipline

**Definition.** A motion grammar that refuses motion almost entirely. Nothing animates on scroll. Hover states are color shifts, not transforms. There are no scroll-triggered fade-ins, no parallax, no kinetic typography, no number counters. The page is *still*, and the stillness is the design statement.

**Distinguishing edge.** Versus *Restrained-Atmospheric* — Stillness as Discipline allows almost no motion at all; Restrained-Atmospheric permits slow, minimal motion. Versus all other motion grammars — Stillness is defined by absence.

**Substyles.**
- **Pure Stillness.** Zero animation on the page. Even hover states are minimal (color shift, underline thickening). Aman, Cheval Blanc, considered fashion editorial.
- **Stillness-with-Hover.** Page itself doesn't animate; hover states on links and buttons are present but restrained — color shifts, slight underline transitions over 200–300ms.
- **Print-Coded Stillness.** The page behaves like a printed magazine page — scroll moves through content, but the content doesn't react to the scroll. The user controls all motion.

**Canonical examples.** Aman properties, Cheval Blanc, much of Hermès editorial, considered fashion houses (Loewe, Phoebe Philo's brand, JW Anderson's quieter pages), most luxury hospitality, art gallery and museum sites.

**Internal logic.**
- Motion implies effort to capture attention. Stillness signals confidence — the brand doesn't compete for attention.
- Permissible motion: page-load fade-in (very subtle), color transitions on hover (200–300ms), modal entries (where unavoidable for functionality).
- Forbidden motion: scroll-triggered fade-ins, parallax, kinetic typography, number counters, marquee tickers, scroll-jacked sections, hover-lifts on cards, spring animations.
- The grammar requires *commitment*. A single scroll-triggered animation breaks the entire register.

**Registers it hosts.** Luxury hospitality, considered fashion, fine arts, heritage brands, editorial publishing where reading is the goal, anywhere quiet confidence is the brand statement.

**Registers it resists.** Anything requiring engagement-through-movement. SaaS marketing. Consumer products. Anywhere conversion is the goal. Tech products signaling "we are alive and modern."

**Failure mode.** AI imitates Stillness as Discipline by reducing some motion but not eliminating it — keeping fade-ins on scroll, keeping hover-lifts on cards. The result reads as "slightly less animated SaaS page" rather than as actual stillness. The grammar only works when committed.

---

## MOTION-2. Restrained-Atmospheric

**Definition.** Motion exists but is slow, deliberate, and atmospheric rather than punchy. Subtle parallax on hero photography, slow fade-ins on photographs as the user scrolls, gentle hover transitions over 300–400ms, occasional slow-zoom on hero imagery. The page breathes; it doesn't perform.

**Distinguishing edge.** Versus *Stillness as Discipline* — Restrained-Atmospheric permits motion; Stillness forbids it. Versus *Functional-Snappy* — Restrained-Atmospheric is slow (300–500ms typical); Functional-Snappy is fast (100–200ms). Versus *Scroll-Driven Cinematic* — Restrained-Atmospheric is ambient; Scroll-Driven Cinematic is directed and choreographed.

**Substyles.**
- **Parallax-Hero.** Hero photography has gentle parallax on scroll — moves slower than the surrounding page. Subtle, not dramatic. Common in editorial-magazine grammars.
- **Slow-Fade Editorial.** Photographs fade in slowly as they enter the viewport. 400–600ms typical, ease-out easing. Soho House, considered editorial.
- **Breathing Hover.** Hover states have a subtle, slow color or opacity transition. The hover itself takes 300–500ms to complete. Considered hospitality and editorial brands.
- **Gentle-Image-Reveal.** Images reveal with a slow horizontal or vertical wipe rather than a fade. More cinematic but still restrained.

**Canonical examples.** Soho House, Apartamento, Cereal Magazine, much of Hermès editorial, considered hospitality with magazine-coded grammars, art gallery sites with subtle motion, refined editorial publishing.

**Internal logic.**
- Timing is slow: 300–500ms typical for transitions. Faster reads as functional; slower reads as elegant.
- Easing is gentle: `ease-out` for entrances, `ease-in-out` for state changes. Spring or bounce easing breaks the grammar entirely.
- Motion is *ambient*, not *directed* — it doesn't demand attention or signal urgency.
- Often paired with Vertical-Rhythm or Editorial-Grid layouts and serif-led typography.

**Registers it hosts.** Considered hospitality, editorial publishing, fashion houses with personality, fine arts, lifestyle brands wanting elegance over energy, refined consumer products.

**Registers it resists.** SaaS marketing (where Functional-Snappy is the convention). Action-driven applications. Anywhere users need fast feedback. E-commerce with conversion focus.

**Failure mode.** AI imitates Restrained-Atmospheric by slowing down standard SaaS animations — making fade-ins 600ms instead of 200ms — without changing what's animating. The result feels sluggish rather than elegant. Real Restrained-Atmospheric chooses *which* elements move (typically photography, very rarely text or UI).

---

## MOTION-3. Functional-Snappy

**Definition.** Fast, immediate motion serving as feedback for user actions. Hover states complete in 100–200ms. Modal entries are 200–250ms. The motion grammar of well-designed applications and SaaS — the user clicks, the system responds immediately, the feedback is invisible because it's correct.

**Distinguishing edge.** Versus *Restrained-Atmospheric* — Functional-Snappy is fast (100–200ms); Restrained-Atmospheric is slow (300–500ms). Versus *Punchy-Discrete* — Functional-Snappy is smooth; Punchy-Discrete is sharp and sometimes hard. Versus *Scroll-Driven Cinematic* — Functional-Snappy responds to direct interaction; Scroll-Driven Cinematic responds to scroll position.

**Substyles.**
- **Material-Coded.** Standard Material Design timings — 200ms for transitions, 300ms for inter-screen, ease-in-out by default. The reference standard for product UIs.
- **Apple-Refined.** Slightly faster, slightly more curated easing. Custom cubic-beziers (often `cubic-bezier(0.4, 0.0, 0.2, 1)`). Apple's HIG conventions.
- **Tailwind-Default.** `transition-all duration-200`. The default modern web vocabulary; what AI generates by default.
- **Linear-Coded.** Faster than standard (150ms typical), more precise easing curves, motion as part of the brand statement. Linear's app and marketing site.

**Canonical examples.** Stripe, Linear, every modern SaaS, every modern dashboard, every well-designed application UI, the default v0/Lovable/Bolt motion vocabulary.

**Internal logic.**
- Timing is fast: 100ms for hover state changes (acknowledgment), 200ms for transitions (state changes), 300ms for larger movements (modal entries).
- Easing is `ease-out` for entrances (start fast, decelerate to a stop), `ease-in` for exits, `ease-in-out` for state changes.
- Motion is *feedback*, not *performance*. Users should feel the system responding, not see a show.
- Reduced-motion preferences are honored — motion is decorative, not load-bearing for the experience.

**Registers it hosts.** SaaS, B2B, applications, dashboards, consumer products with action-driven flows, e-commerce with conversion focus, productivity tools.

**Registers it resists.** Editorial publishing (where slower motion suits reading). Luxury hospitality (where motion implies effort to attract). Anywhere quiet confidence is the brand statement.

**Failure mode.** This is the AI default for *everything*. The failure mode is using it where it doesn't belong — luxury hospitality with snappy 200ms hover transitions reads as commercial, not premium.

---

## MOTION-4. Punchy-Discrete

**Definition.** Sharp, discrete motion — components shift in fixed-position jumps rather than smooth transitions, colors invert hard, hover states are immediate not eased. The motion grammar of neo-brutalism and anti-design products.

**Distinguishing edge.** Versus *Functional-Snappy* — Punchy-Discrete uses sharp, sometimes immediate state changes; Functional-Snappy uses smooth easing. Versus *Stillness as Discipline* — Punchy-Discrete is intentionally motion-forward; Stillness is motion-refusing.

**Substyles.**
- **Hard-Cut.** State changes are *immediate* — no transition, no easing. Click a button and it inverts. Hover and it shifts. Border-of-zero-frames motion. Classic neo-brutalism.
- **Step-Animation.** Motion happens in 2–4 discrete frames rather than continuous interpolation. A button press is "down" → "up", not a smooth scale transition.
- **Snap-to-Position.** Components snap to grid positions when interacted with. No gradual movement.
- **Hard-Shadow Punch.** Components shift their shadow position discretely on hover (e.g., shadow moves from `4px 4px 0` to `2px 2px 0`), creating a tactile-but-discrete feel.

**Canonical examples.** Gumroad (post-2021), much of Awwwards' Brutalism category, indie SaaS launches with neo-brutalist component grammar, anti-design portfolios, design-tool launches with character.

**Internal logic.**
- Smooth easing is *forbidden* — discreteness is the point.
- Timing is fast (under 100ms) when motion is permitted.
- Motion *announces itself* — the component telling you it's been interacted with through visible state change.
- Often paired with Hard-Bordered components and Saturated-Primary color.

**Registers it hosts.** Indie SaaS, design tools, creative agencies, fashion brands targeting Gen Z, anti-corporate startups, anywhere "we're not like the others" is the brand statement.

**Registers it resists.** Hospitality (any tier), banking, healthcare, enterprise B2B, anywhere conventional polish matters, anywhere motion needs to feel "premium" or "smooth."

**Failure mode.** AI applies Punchy-Discrete to a single component (a button with a hard shift) while keeping smooth easing elsewhere. The grammar requires consistency — partial commitment reads as broken animation rather than designed punch.

---

## MOTION-5. Scroll-Driven Cinematic

**Definition.** Motion choreographed to scroll position. Elements reveal, transform, or animate as the user scrolls — but the motion is *directed*, not random. Headlines slide in from off-axis, photography crossfades, type animates in sync with the scroll. The page is a film the user controls with their scroll wheel.

**Distinguishing edge.** Versus *Restrained-Atmospheric* — Scroll-Driven Cinematic is directed and choreographed; Restrained-Atmospheric is ambient. Versus *Scrollytelling Narrative* — Scroll-Driven Cinematic uses scroll as a directing tool for marketing or product storytelling; Scrollytelling Narrative is for longform editorial content with sticky media and progressive reveals.

**Substyles.**
- **Editorial-Cinematic.** Photography and headlines reveal with directed motion as the user scrolls. Awwwards-tier marketing pages, considered product launches.
- **Scroll-Pinned Sequence.** A section pins to the viewport while internal animation plays out as the user scrolls. Apple's product reveal pages.
- **Layered-Parallax.** Multiple layers move at different speeds creating depth. More elaborate than simple parallax — multiple layers, choreographed.
- **Scroll-Triggered Reveal.** Elements animate in as they enter the viewport, but with *specific* directional intent (sliding from offscreen, scaling from a point) rather than generic fade-in.

**Canonical examples.** Apple's product reveal pages (iPhone, MacBook launches), much of Awwwards Site of the Day, considered product launches, narrative-driven marketing sites, Stripe's announcement pages.

**Internal logic.**
- Motion is *choreographed*, not random. Each animation has a reason — emphasizing a transition, revealing a key fact, creating spatial relationship.
- Scroll-pinning requires careful implementation — janky pinning destroys the experience.
- Performance is critical. Scroll-driven motion that introduces lag is worse than static.
- Reduced-motion preferences must be honored aggressively — scroll-cinematic without reduced-motion fallbacks is hostile.

**Registers it hosts.** Apple-tier product launches, considered product reveals, narrative-driven marketing, creative agency portfolios, design tool launches, anything where the launch is a moment.

**Registers it resists.** Editorial publishing where reading dominates. Luxury hospitality (cinematic motion reads as marketing, not luxury). Most B2B SaaS. Anything the user comes back to repeatedly (cinematic motion is exhausting on the second visit).

**Failure mode.** AI imitates Scroll-Driven Cinematic by adding scroll-triggered fade-ins to every section — which is *animation*, not *cinema*. Real Scroll-Driven Cinematic is rare, expensive to produce, and choreographed. Generic AI animation is the most common form of fakery in this grammar.

---

## MOTION-6. Scrollytelling Narrative

**Definition.** Long-form scroll-locked narrative where the page is *told* through scroll. Sticky media stays in view while text scrolls past it. Animations trigger at specific scroll percentages. The user is being walked through a story; their scroll is the playback control.

**Distinguishing edge.** Versus *Scroll-Driven Cinematic* — Scrollytelling is for narrative content (journalism, data stories, museum exhibitions); Scroll-Driven Cinematic is for marketing and product launches. The compositional intent is different.

**Substyles.**
- **Sticky-Media Editorial.** A photograph or video pins to the viewport while text scrolls past it on one side. NYT longform, Pudding stories.
- **Data-Visualization Narrative.** Charts and visualizations animate as the user scrolls through interpretation. Bloomberg longform, climate journalism.
- **Map-Driven Narrative.** Maps zoom, pan, and reveal as the user scrolls through geographic story. NASA mission sites, geographic journalism.
- **Image-Sequence Narrative.** Image sequences (sometimes thousands of frames) animate frame-by-frame as the user scrolls. Apple product launches occasionally use this.

**Canonical examples.** NYT longform features, Pudding, Bloomberg longform, NASA mission sites, IPCC reports, museum digital exhibitions, scientific communication, narrative-driven cause campaigns.

**Internal logic.**
- The scroll controls a *story*, not a marketing reveal. There is a beginning, middle, and end.
- Sticky media must be implemented carefully (CSS sticky or scroll-jacked with intersection observers) — janky sticky destroys the narrative.
- The narrative is the design — without a story to tell, scrollytelling is just animation.
- Frequently desktop-native; mobile scrollytelling requires re-architecture and often degrades.

**Registers it hosts.** Investigative journalism, data storytelling, museum and cultural digital exhibitions, narrative-driven cause campaigns, scientific communication, narrative product launches with substantial story content.

**Registers it resists.** Most marketing pages. SaaS. E-commerce. Hospitality. Anywhere users want to scan rather than read. Anywhere mobile-first behavior dominates.

**Failure mode.** AI rarely produces this grammar — it requires substantial JavaScript scaffolding and careful narrative design. When forced, AI tends to produce sticky-media fragments without the underlying story, which reads as "fancy scrolling" rather than as scrollytelling.

---

## MOTION-7. Kinetic-Expressive

**Definition.** Motion is itself the design language — typography animates, components transform expressively, the page reacts to mouse movement, scroll, audio, or time with kinetic creativity. The motion grammar of creative agencies, type foundries, and brands signaling "we are makers."

**Distinguishing edge.** Versus *Scroll-Driven Cinematic* — Kinetic-Expressive can respond to many triggers (mouse, time, audio, scroll); Scroll-Driven Cinematic is scroll-bound. Versus *Punchy-Discrete* — Kinetic-Expressive is smooth and continuous; Punchy-Discrete is hard-cut.

**Substyles.**
- **Cursor-Reactive.** Components or backgrounds react to mouse position. Cursor effects, magnetic buttons, custom cursor shapes. Common in design agency portfolios.
- **Time-Based Kinetic.** Elements animate continuously over time — typography breathing, gradients shifting, abstract shapes morphing. Often background-level, not foreground.
- **Audio-Reactive.** Motion responds to audio playback or input. Music sites, podcast brands, audio-driven experiences.
- **Variable-Font Kinetic.** Variable font axes animate in response to scroll, hover, or time. Fraunces stretching its `SOFT` axis as you scroll. Type foundry showcases.
- **WebGL-Driven Kinetic.** Three.js or similar WebGL motion — 3D typography, generative backgrounds, interactive 3D objects. Awwwards Site of the Day vocabulary.

**Canonical examples.** Type foundry showcases (Fraunces, Recursive, Söhne), creative agency portfolios (Studio La Tas, Locomotive, KOTA), much of Awwwards Site of the Day, music brand sites, design-tool launches with character, BDSN Club portfolios.

**Internal logic.**
- Motion is the *brand statement*. Reducing it diminishes the brand.
- Performance and accessibility are real constraints — kinetic-expressive sites must still be usable on mid-range devices and must honor reduced-motion preferences.
- Kinetic-expressive done badly is much worse than restrained motion done well — there's no neutral middle ground.
- Often paired with Maximalist-Expressive typography and Iridescent or Saturated-Primary color.

**Registers it hosts.** Creative agencies, design portfolios, type foundries, music brands, art-driven projects, design-tool launches, brands signaling "we are makers and the medium is part of the message."

**Registers it resists.** Hospitality. Editorial publishing where reading is the goal. Most B2B. Most commercial use cases. Anywhere mobile-first behavior dominates.

**Failure mode.** AI rarely produces Kinetic-Expressive convincingly — it requires JavaScript animation libraries (GSAP, Framer Motion, Lenis) and careful choreography that AI generates poorly without scaffolding. The result is often *random* motion (constantly-animating loops) rather than *expressive* motion (specific moments of motion that mean something).

---

# How these axes interact (preview, continued)

Component grammar and motion grammar are tightly coupled — components determine *what* moves, motion determines *how*. Some natural co-occurrences:

- **Typographic-Discreet components** + **Stillness as Discipline motion** = Aman, Cheval Blanc register
- **Soft-Container components** + **Functional-Snappy motion** = Stripe, Linear register
- **Hard-Bordered components** + **Punchy-Discrete motion** = neo-brutalist register
- **Pill-and-Cushion components** + **Restrained-Atmospheric motion (Breathing Hover substyle)** = wellness, beauty register
- **Sharp-Geometric components** + **Stillness as Discipline motion** = Editorial publishing register
- **Glass / Layered components** + **Restrained-Atmospheric motion** = Apple, contemporary refined consumer tech
- **Maximalist-Decorative components** + **Kinetic-Expressive motion** = creative agency, Y2K-revival register
- **Mono-Density components** + **Functional-Snappy motion** = SaaS application UIs

Some combinations are *broken*:

- **Typographic-Discreet** + **Punchy-Discrete motion** = the components have no shapes to punch
- **Hard-Bordered components** + **Restrained-Atmospheric motion** = the discreteness of the components fights the smoothness of the motion
- **Glass / Layered components** + **Stillness as Discipline motion** = the depth effects require some motion to be legible
- **Maximalist-Decorative components** + **Stillness as Discipline motion** = the decorative components imply expressiveness that stillness contradicts

Some combinations are *novel-but-coherent*:

- **Sharp-Geometric components** + **Kinetic-Expressive motion (Variable-Font substyle)** = considered editorial with kinetic typography. Rare but obviously workable for type foundries doing editorial work.
- **Mono-Density components** + **Restrained-Atmospheric motion** = dashboards with editorial pacing. Uncommon but defensible for premium analytical products.
- **Pill-and-Cushion components** + **Punchy-Discrete motion** = soft components with hard motion. The Cute-alism crossover register flagged in Turn 1.

The full Compatibility Model in Turn 4 will formalize this matrix across all eight axes.

---

# Open questions for v0.2

1. **Does *Glass / Layered components* require its own motion grammar?** Glass effects only become legible *with* some motion (the user moving past, content underneath shifting). The grammar may presuppose Restrained-Atmospheric in a way other grammars don't presuppose specific motions.

2. **Are *Scroll-Driven Cinematic* and *Scrollytelling Narrative* different grammars or substyles of one grammar?** Currently treating them as distinct because compositional intent differs (marketing vs. journalism), but the technical implementation is similar. May be worth merging.

3. **Is *Kinetic-Variable Typography* (from Turn 1) really a typography grammar, or is it actually a motion grammar substyle?** Currently in Typography but flagged for movement to Motion's Variable-Font Kinetic substyle. Leaning toward Motion being the right home — the motion logic dominates the typography decision.

4. **Should *Mono-Density components* split between *Marketing-Density* and *Application-Density*?** A B2B marketing page can use Mono-Density styling while still being a marketing context, not an app UI. Currently treating Mono-Density as application-coded only; may need a marketing variant.

5. **Reduced-motion preferences are an axis we haven't named.** Every motion grammar has a "reduced-motion fallback" — what the page does for users who prefer-reduced-motion. This isn't a separate grammar but it's part of every motion grammar's internal logic. Currently mentioned in passing; may deserve more explicit treatment.

6. **Is there a *Refresh / Loading* motion grammar we haven't named?** Skeleton loaders, shimmer effects, optimistic UI updates, progress indicators — these are motion decisions that span all the named grammars but have their own internal logic. Currently folded into Functional-Snappy's substyles but may deserve separate treatment.

---

*Turn 2 complete. Turn 3 will cover Imagery grammar, Density grammar, Voice grammar, and Reading-Pattern grammar (the F/Z/Gutenberg eye-scanning patterns elevated from "discarded" to "fourth axis of Turn 3"). Turn 4 will deliver the full Compatibility Model.*

*Push back on anything that doesn't sit right before I proceed.*

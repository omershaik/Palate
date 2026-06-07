# Palate Grammar Survey v0.2 — Typography & Color

This is Turn 1 of 4 in the multi-axis grammar survey. It covers two of the eight axes that compose a website's design vocabulary: **Typography** and **Color**.

Where the layout survey defined eleven structural-geometric grammars, this document defines grammars at a different level of abstraction. Typography and color are not page-structures; they are *systems of decisions* that govern how text and chromatic information behave throughout a design. Each axis has its own grammars (named, internally-coherent vocabularies) and its own substyles (variants within a grammar that share its logic but diverge in expression).

The schema for each grammar is:

- **Definition** — what the grammar is, structurally
- **Distinguishing edge** — how it differs from its nearest neighbors
- **Substyles** — named variants within the grammar
- **Canonical examples** — sites that are unambiguous expressions
- **Internal logic** — the rules and ratios that make it work
- **Registers it hosts** — verticals and tones that fit naturally
- **Registers it resists** — what breaks if you force it
- **Failure mode** — what AI gets wrong when imitating it

A note on substyles, since you specifically asked for them: I've researched each grammar with explicit attention to internal splits. Bento, for example, doesn't decompose cleanly into "Apple-tier" and "fintech" the way I initially suggested — the real split is along three axes (cell density, cell variation, motion presence), which produces five recognizable substyles. Where my research surfaced a real distinction, I've named it. Where it didn't, I've said so rather than invent one.

---

# AXIS 1 — TYPOGRAPHY GRAMMAR

Typography grammar is the system of decisions about: typeface selection, pairing logic, scale relationships, weight and style usage, special typographic moves (italics, drop caps, all-caps, ligatures, numerals), and how type behaves at extremes of size and density.

It is distinct from layout grammar (where the type sits on the page) and from voice grammar (what the type says). A vertical-rhythm-editorial layout can host any of several typography grammars. The choice is independent.

There are seven typography grammars worth distinguishing.

---

## TYPE-1. The Two-Hand System (Serif Display + Sans Body)

**Definition.** A high-contrast pairing where a personality-bearing serif handles display and headlines while a neutral sans-serif handles body and UI. The two hands have clearly different jobs: the serif gives the design its voice; the sans gives it its readability and scale.

**Distinguishing edge.** Versus *Single-Family Discipline* — Two-Hand uses two type families with different classifications (one serif, one sans); single-family uses one. Versus *Inverse Two-Hand* — Two-Hand puts the serif at display and sans at body; the inverse flips that relationship.

**Substyles.**
- **Editorial Two-Hand.** Transitional or modern serif (Tiempos, GT Sectra, Canela, Domaine Display) paired with humanist sans (Söhne, Untitled Sans, GT America, Suisse). Magazine and luxury brand vocabulary.
- **Classical Two-Hand.** Old-style or transitional serif (Garamond, Caslon, Baskerville) paired with grotesque sans (Helvetica, Akzidenz, Inter). Conservative, institutional, publishing.
- **Display-Heavy Two-Hand.** A high-character display serif (Recoleta, Playfair Display, Cormorant — though Cormorant is a hospitality anti-pattern) paired with neutral sans body. Wedding-industrial or consumer-luxury register; often a tell of AI-default thinking.
- **High-Contrast Modern Two-Hand.** A modern serif with extreme thick/thin contrast (Didot, Bodoni, GT Super) paired with geometric sans (Söhne, Plus Jakarta, Geist). Fashion, contemporary luxury, editorial with strong art direction.

**Canonical examples.** Aman (Editorial), Soho House (Editorial), New York Times (Classical), most fashion houses' marketing sites (High-Contrast Modern), most heritage hospitality (Editorial).

**Internal logic.**
- The serif and sans must be from clearly different classifications — pairing a transitional serif with a humanist serif fails the "contrast without conflict" test.
- Display scale is dramatic (60–120px+ on desktop). Body is comfortable for reading (15–18px).
- Body font is rarely used at display sizes; display font is rarely used at body sizes. Each typeface stays in its lane.
- Letter-spacing is tight on display (typically -0.01 to -0.02em), neutral on body.
- One typographic accent move is permitted (italics in pull-quotes, small-caps in eyebrows) but not stacked.

**Registers it hosts.** Luxury hospitality, editorial publishing, fashion, heritage brands, fine arts, considered consumer brands, longform magazines.

**Registers it resists.** Tech products requiring uniformity, dashboards, anything where typographic personality competes with information density. Neo-brutalist contexts (which want raw single-family treatment).

**Failure mode.** AI defaults to Cormorant + Inter as the Two-Hand pairing because both are popular Google Fonts and both signal "premium" in training data. The result reads as wedding-industrial. Real Editorial Two-Hand requires more deliberate selection — Tiempos, GT Sectra, Söhne are not on Google Fonts, which keeps them out of AI defaults but is exactly why they signal taste.

---

## TYPE-2. Single-Family Discipline

**Definition.** One type family does all the work — display, body, UI, captions. The contrast comes from weight, size, optical-size axis, italic/roman, and small-caps variations within that one family.

**Distinguishing edge.** Versus *Two-Hand System* — Single-Family uses one family; Two-Hand uses two. Versus *Mono-Discipline* — Single-Family typically uses a family with multiple optical sizes and weights; Mono-Discipline uses a monospace, often a single weight.

**Substyles.**
- **Variable-Font Single-Family.** Modern variable fonts (Fraunces, Inter, Recursive, Söhne) used across their full axis range — `opsz`, `wght`, `SOFT`, `slnt` — to create hierarchy through axis manipulation rather than family changes. Run B of the Devigarh experiment used this with Fraunces.
- **Classical Super-Family.** A type system designed as a coordinated family across multiple classifications (Apple's San Francisco family — SF Pro, SF Compact, SF Mono, SF Serif; or Klim's Söhne family — Söhne, Söhne Schmal, Söhne Mono, Söhne Breit). All weights and styles by the same designer, rigorously coordinated.
- **Serif-Only Discipline.** A single serif family (Tiempos, Source Serif, Iowan Old Style) used across display and body. Common in literary and academic publishing.
- **Sans-Only Discipline.** A single sans family (Inter, Söhne, Suisse Int'l, Neue Haas Grotesk) used across display and body. Common in tech products with strong typographic identity (Linear, Stripe, Vercel).

**Canonical examples.** Stripe (Sans-Only with Inter — extended later with custom Sohne variants), Linear (Sans-Only), Apple's product pages (Classical Super-Family), Fraunces showcases generally (Variable-Font), Stripe Press (Serif-Only with Tiempos).

**Internal logic.**
- Hierarchy is created through scale, weight, optical-size variation, and italics — never through family change.
- Variable-font axes (where available) are used as design tools: `opsz` is set lower for body and higher for display; `SOFT` is increased for italics or decorative use; `wght` carries primary hierarchy.
- The family chosen must have enough range to handle every typographic job in the system. A single-family system using a one-weight family fails immediately.
- Often paired with a strict color and component grammar — Single-Family Discipline tends to live in systems with overall typographic restraint.

**Registers it hosts.** Tech products with strong design identity, literary publishing, design tools, considered SaaS, anything signaling "we have a single coherent voice." Variable-Font Single-Family is increasingly the 2025–2026 default for new design-led products.

**Registers it resists.** Editorial-magazine vocabularies that want visible typographic contrast. Hospitality brands wanting the warmth of a serif body paired with sans navigation. Heritage brands wanting historical-classification contrast.

**Failure mode.** AI uses a single family but fails to exploit its axes — defaulting to a 400-weight body and 700-weight headline with no use of variable axes, optical-size variation, or italics. The result is single-family-by-accident, which reads as poverty rather than discipline. Real Single-Family Discipline announces itself through subtle but visible craft.

---

## TYPE-3. Editorial Print Vocabulary

**Definition.** A multi-typeface system that explicitly borrows from print-magazine typography: drop caps, pull-quotes, eyebrows, sidebars, italicized lead-ins, footnotes, occasional all-caps in small-cap form. The page is treated as a magazine spread, not a webpage.

**Distinguishing edge.** Versus *Two-Hand System* — Editorial Print uses *more than two* typefaces and treats them as a coordinated typographic system, not a clean serif-sans split. Versus *Maximalist-Expressive* — Editorial Print is disciplined and rule-based; Maximalist-Expressive is rule-breaking.

**Substyles.**
- **Magazine-Cool.** Two serifs (one display, one text) plus one sans for navigation and metadata. Drop caps, pull-quotes, italicized leads. Apartamento, Cereal, Kinfolk, parts of the New Yorker.
- **Newspaper-Discipline.** A serif for body, a condensed sans or slab for headlines, a third sans for navigation and labels. Higher information density. Bloomberg, NYT print-style features, FT.
- **Independent-Press Eclectic.** Multiple serifs and sans intentionally chosen for tonal contrast — a humanist serif for body, a modern serif for display headlines, a geometric sans for chapter markers, a monospace for bylines. Indie publishers (n+1, The Drift, Are.na editorial).

**Canonical examples.** Soho House journal pages, Apartamento, Cereal Magazine, Kinfolk, Aeon, NYT Style longform, The New Yorker site, Monocle.

**Internal logic.**
- Typographic moves are part of the system, not decorations. A drop cap is a recurring structural element, not a one-off flourish.
- Italicized lead-ins (the first one or two sentences set in italic) mark the start of a passage and reappear consistently.
- Pull-quotes are pulled from body copy and set in display type with attribution — they are editorial, not promotional.
- Small-caps for eyebrows and section labels (8–11px tracked-out is acceptable here, though restrained).
- Body type is set for actual reading: comfortable size (15–18px), generous line-height (1.55–1.75), measured line length (32–42rem).

**Registers it hosts.** Publishing, longform editorial, considered hospitality (Soho House and similar editorial-grid grammars), arts and culture, food and travel writing.

**Registers it resists.** Anything transactional. Anything requiring scannable information density. Tech products. Single-feature landing pages. Hospitality brands at the quiet-luxury end (Aman vocabulary, which is a Two-Hand or Single-Family discipline, not Editorial-Print).

**Failure mode.** AI imitates the surface of Editorial Print (drop caps, italics, pull-quotes) without the coordination — using them as decorations rather than a system. The result reads as "magazine cosplay" rather than as an actual editorial product.

---

## TYPE-4. Mono-Discipline (Terminal-Coded)

**Definition.** A typography system led by monospaced typefaces, often supported by a single sans or serif. The vocabulary borrows from terminals, code editors, and machine output — every character occupies the same horizontal space, creating a visible grid effect.

**Distinguishing edge.** Versus *Single-Family Discipline* — Mono-Discipline specifically uses monospace as primary; Single-Family is family-agnostic. Versus *Neo-Brutalist Typography* — Mono-Discipline is *quietly* terminal-coded; Neo-Brutalist treatment of monospace is loud and high-contrast.

**Substyles.**
- **Quiet Mono.** A modern monospace (Berkeley Mono, JetBrains Mono, IBM Plex Mono, Fira Code) used as the entire system. Often dark-mode. Restrained color palette. Tech-precision register.
- **Mono-Plus-Display.** Monospace handles body, navigation, and metadata; a single expressive display face (often a serif or geometric sans) handles hero headlines. The display face is the only break from machine register.
- **Command-Line Chic.** Mono is the entire system, often paired with terminal-style UI elements (cursors, prompt symbols, ASCII rules). Heavy in indie SaaS and developer tools.

**Canonical examples.** Linear's command-line-coded pages, Raycast, Arc browser (some sections), Berkeley Mono's own showcase site, many indie developer tools, parts of Anthropic's site (occasional mono usage), Stripe's API documentation pages.

**Internal logic.**
- Monospace's grid quality is treated as compositional material — text aligns to invisible character columns.
- Numerals (especially) feel native: prices, version numbers, dates, code fragments all live in the same character-cell space.
- Body monospace is set carefully — 14–15px is typical; mono at 12px or below becomes hostile, mono at 17px+ feels like code displayed in a presentation.
- The vocabulary signals "we are technical" or "we make things, not market them."

**Registers it hosts.** Developer tools, technical documentation, engineering-led products, code-adjacent SaaS, indie technical brands, anything signaling craft-through-precision.

**Registers it resists.** Hospitality, fashion, editorial, anything aimed at non-technical audiences, anywhere warmth or personality matters more than precision.

**Failure mode.** AI uses monospace as a one-off accent (a single line of mono in an otherwise normal page) which reads as a fragment rather than a system. Mono-Discipline only works when the whole system commits — half-mono is worse than no mono.

---

## TYPE-5. Geometric-Modernist (Tech-Sans Default)

**Definition.** A geometric sans-serif typeface (typically a single weight family or a tightly-coordinated weight set) does almost all the work. The vocabulary is contemporary, neutral, screen-native, and signal-of-product-design.

**Distinguishing edge.** Versus *Single-Family Discipline (Sans-Only)* — Geometric-Modernist specifically uses geometric or grotesque sans-serifs (Inter, Geist, Plus Jakarta, DM Sans, Manrope); Sans-Only Discipline can include humanist sans like Söhne. Versus *Mono-Discipline* — Geometric uses proportional letterforms; Mono uses fixed-width.

**Substyles.**
- **Inter-Default.** Inter or Inter-adjacent (Plus Jakarta, DM Sans, Geist) used at multiple weights. The most common AI default. Vercel, every YC company, default v0/Lovable output.
- **Custom-Geometric.** Brand-specific geometric sans (Stripe's Sohne customizations, Apple's San Francisco, Spotify's Circular) used as a proprietary system.
- **High-Style-Geometric.** Distinctive geometric sans with character (GT America, Söhne — when used as the primary sans rather than as half of a Two-Hand pairing, ABC Diatype, Untitled Sans). The choice of typeface itself is a brand statement.

**Canonical examples.** Vercel, Linear, Stripe (after their custom-Sohne move), Notion, virtually every modern SaaS startup, OpenAI, Anthropic, Arc, the entire YC landing page archive 2022–2026.

**Internal logic.**
- Hierarchy is created through weight (300–800 typical range) and size; italics are rare; small-caps are rarer.
- Letter-spacing is often tightened on display (-0.01 to -0.03em) to make headlines feel composed rather than spread.
- Body is set 14–16px with line-height 1.5–1.6.
- Often paired with Bento layout grammar — they're so commonly co-occurring that the combination is itself a recognizable pattern ("modern AI startup").

**Registers it hosts.** Tech products, SaaS, developer tools, AI products, fintech, modern consumer apps, anything where "trustworthy and contemporary" is the goal.

**Registers it resists.** Hospitality (Geometric-Modernist on a hotel site is the AI-slop signal). Heritage. Editorial. Anything wanting warmth or personality. Anything Mediterranean, Indian, or vernacular in cultural register.

**Failure mode.** This is the AI default for *everything*. The failure mode is applying it where it doesn't belong — which is most of the briefs Palate is designed to handle. The hospitality anti-patterns explicitly forbid Geometric-Modernist defaults (Inter, DM Sans, Geist, Manrope) because of how often AI reaches for them.

---

## TYPE-6. Maximalist-Expressive (Anti-Type-Hierarchy)

**Definition.** A typography system that deliberately violates conventional hierarchy and pairing rules — multiple typefaces from different classifications, extreme size contrasts, intentional clashes, decorative or hand-drawn faces alongside system fonts. The point is expressive impact, not readability.

**Distinguishing edge.** Versus *Editorial Print* — Editorial Print breaks the grid editorially within rules; Maximalist-Expressive breaks the rules. Versus *Neo-Brutalist Typography* — Neo-Brutalist is structurally rigid (large, bold, monospace, system); Maximalist-Expressive can be soft, decorative, or hand-drawn.

**Substyles.**
- **Collage Type.** Multiple typefaces with different cultural references (vintage, retro, hand-drawn, system) used as design elements rather than as a hierarchy. Posters and creative agency sites.
- **Anti-Design Type.** Intentionally clashing classifications, ugly-on-purpose pairings, oversized type juxtaposed with tiny text. Y2K-revival, dialup-delight, cute-alism.
- **Y2K Maximalist.** Decorative display faces (often retro or pixel-influenced) paired with multiple secondary types, vibrant color, layered effects. Lifestyle brands targeting Gen Z.
- **Handcrafted Type.** Hand-drawn or visibly-imperfect typefaces (sometimes custom-lettered) used alongside system fonts to signal authenticity. Brands wanting warmth in an AI-saturated field.

**Canonical examples.** La Palatine, much of Awwwards' Site of the Day winners, Creative agency portfolios (especially European), Lush, Headspace (some periods), Starface, fashion brands targeting Gen Z, art-direction-led publishing.

**Internal logic.**
- Rules of typographic harmony are deliberately broken — this is the entire point.
- Underlying compositional discipline must exist (otherwise it reads as accidentally bad), but the typographic surface violates conventional pairing rules.
- Often paired with broken-grid or collage layouts — the typography and the layout are co-conspirators.
- Color and typography are often intertwined: type is treated as a colored design element, not as text-with-color.

**Registers it hosts.** Creative agencies, fashion brands targeting Gen Z, lifestyle products, art-driven projects, music brands, experimental editorial.

**Registers it resists.** Anything requiring trust through familiarity. Financial services. Healthcare. Hospitality at any tier. Heritage brands. Enterprise B2B. Most commercial use cases where conversion or comprehension matters.

**Failure mode.** AI imitates this badly because the discipline is invisible — the "rules" being broken are sophisticated typographic conventions the model only partially understands. The result reads as accidentally chaotic rather than deliberately defiant. This grammar may be the hardest for AI to produce well, and the easiest to fake at first glance.

---

## TYPE-7. Kinetic-Variable (Type-as-Motion)

**Definition.** A typography system where type itself is a motion design element. Variable fonts shift weight, width, slant, or optical-size axes in response to scroll, hover, time, or user input. Letters morph, stretch, breathe, or animate as part of the design language.

**Distinguishing edge.** Versus all static grammars — Kinetic-Variable's defining property is *temporal*. The same typeface used statically would not be in this grammar. Versus *Maximalist-Expressive* — Kinetic-Variable is technologically-defined (variable fonts, scroll-driven animation, time-based behavior); Maximalist-Expressive can be entirely static.

**Substyles.**
- **Variable-Axis Kinetic.** A variable font's axes are tied to scroll position, mouse position, or time. Fraunces stretching its `SOFT` axis as you scroll. Recursive shifting weight on hover. Typically restrained — one or two axes animated.
- **Scroll-Driven Display.** Display headlines that animate in as the user scrolls past — letters appear, stretch, fade, or slide. Awwwards-tier portfolio sites, narrative-driven product pages.
- **Letter-as-Object Kinetic.** Individual letters or words behave as physics objects — they collide, scatter, settle. Often used in hero sections or chapter transitions.
- **Audio-Reactive Kinetic.** Type animates in response to audio input or playback. Music sites, podcast brands, some experimental editorial.

**Canonical examples.** Fraunces showcase site, Recursive showcase site, much of Awwwards Site of the Day in 2023–2026, Apple product reveal pages (occasional), some music and creative-tool brands, NYT scrollytelling features (when type animates), most of TYPE01's gallery.

**Internal logic.**
- Motion is precisely choreographed — never random. Random motion reads as broken, not as kinetic.
- Most kinetic moves happen on scroll position rather than on time-based loops, because time-based motion competes with the user's reading.
- Restraint is the discipline — kinetic-variable systems that animate everything fail; ones that animate one or two specific elements work.
- Performance matters significantly — kinetic typography that introduces jank or layout shift breaks immediately.

**Registers it hosts.** Creative portfolios, design agencies, type foundries, music and arts brands, narrative product launches, experimental editorial, anything where "we are makers and the medium is part of the message."

**Registers it resists.** Hospitality (kinetic type on a hotel site reads as gimmicky). Editorial publishing where reading is the goal. Anything content-dense. Anything mobile-first (kinetic type frequently degrades poorly on mobile). Most commercial use cases.

**Failure mode.** AI rarely produces this without explicit instruction — it requires JavaScript and animation logic that AI tools generate poorly without scaffolding. When forced, the result is often random or constant motion (animation-on-loop) rather than precisely-choreographed scroll-driven behavior. Kinetic typography without choreography is just movement, which is worse than no movement.

---

# AXIS 2 — COLOR GRAMMAR

Color grammar is the system of decisions about: palette structure (how many colors, in what relationships), saturation and value rules, accent discipline (when and how a primary color is used), background-foreground logic, dark/light mode behavior, and how color is deployed across UI elements.

It is distinct from layout grammar (color doesn't determine geometric structure) and from imagery grammar (which governs photography, not chromatic UI decisions). Color and typography do interact heavily — many color grammars presuppose specific typography grammars and vice versa — but they are independently specifiable.

There are eight color grammars worth distinguishing.

---

## COLOR-1. Three-Color Discipline (Paper / Ink / Stone)

**Definition.** A palette of three colors: a paper (warm off-white background), an ink (deep, near-black foreground), and a stone (single neutral mid-tone for secondary surfaces and dividers). Photography supplies all chromatic interest. No accent color permitted.

**Distinguishing edge.** Versus *Two-Color Monochrome* — Three-Color permits a tonal mid; Two-Color is strict ink-on-paper. Versus *Earth-Pulled Restraint* — Three-Color forbids accent color entirely; Earth-Pulled permits one earth-toned accent.

**Substyles.**
- **Cream-and-Ink.** Paper is warm cream (#FAF7F2 to #F5F1EA), ink is warm near-black (#1A1A1A to #222), stone is warm grey-brown (#A89B85 to #C0B5A0). The Aman default. Hospitality and luxury heritage.
- **Cool-Paper.** Paper is cooler off-white (#F8F9FA to #F4F5F7), ink is true near-black (#0F1115 to #1C1E21), stone is cool grey (#9098A0 to #C4CAD0). Editorial, modernist, more contemporary.
- **Black-Cream Inverse.** Background is deep ink, foreground is paper-cream. Same three-color logic, inverted. Often used for dining sections, evening pages, or product galleries where photography needs to dominate.

**Canonical examples.** Aman properties, Cheval Blanc, much of Hermès editorial, Amangiri's restaurant pages (Black-Cream Inverse), most considered hospitality brands.

**Internal logic.**
- Pure white (#FFFFFF) is forbidden. The paper must have some warmth or coolness; pure white reads as gallery-cold or tech-sterile.
- The three colors are *named semantically*, not numbered — referring to them as "primary, secondary, tertiary" misses the system. Paper is paper; ink is ink; stone is stone. Each has a job.
- Photography is the chromatic engine. Without rich, full-bleed photography, Three-Color Discipline reads as bland rather than restrained.
- The CSS comment `"3 colors. That's it. The discipline is the point."` is a real signal of internalization — Run B of the Devigarh experiment included almost exactly this comment without prompting.

**Registers it hosts.** Luxury hospitality, fashion houses, fine arts publishing, heritage brands, considered editorial, architecture practices.

**Registers it resists.** Anything where chromatic energy is part of the proposition. SaaS. Tech products. Consumer brands targeting younger audiences. Children's brands. Festival or events. Anything explicitly playful.

**Failure mode.** AI applies "three-color palette" but uses pure white, true black, and a generic grey — losing all the warmth and specificity. Or it adds a fourth color "for visual interest," which violates the entire discipline. Three-Color Discipline only works when followed strictly.

---

## COLOR-2. Earth-Pulled Restraint

**Definition.** A palette built from earth-toned neutrals (warm off-whites, warm browns and beiges, deep browns, warm greys) with exactly one accent color drawn from the earth-tone family — terracotta, oxblood, ochre, deep forest, sand, ink-blue. Photography supports but doesn't dominate.

**Distinguishing edge.** Versus *Three-Color Discipline* — Earth-Pulled permits an accent; Three-Color forbids one. Versus *Jewel-Tone Palette* — Earth-Pulled stays in matte, low-saturation territory; Jewel-Tone uses higher-saturation gem colors.

**Substyles.**
- **Mediterranean Earth.** Sun-warmed neutrals (sand, terracotta, deep olive) with a saturated red-orange or deep blue-green accent. Hospitality, food brands, North African and Mediterranean cultural register.
- **Deccan-Mughal.** Warm neutrals leaning toward sandstone and brass-yellow, with deep madder-red, indigo-blue, or peacock-green accents. Indian heritage, vernacular hospitality, cultural institutions. (This is what Mohammed's VIRSA brand vocabulary likely needs.)
- **Northern-European Earth.** Cooler off-whites, soft greiges, charcoal, with a single deep navy or bottle-green accent. Scandinavian design, Northern European hospitality, considered consumer brands.
- **American-Heritage Earth.** Warm cream, oxblood, deep brown, ochre, and a single accent (often saddle-tan or ink-blue). Heritage menswear, classic American hospitality, considered editorial.

**Canonical examples.** RAAS Jodhpur, Aman-i-Khás, Soho House (single-accent variant per property), Shinola, Filson, Aesop, many considered fashion and lifestyle brands.

**Internal logic.**
- The accent color is used *sparingly* — Run B of Devigarh used madder-red four times across the entire page, and that frequency is correct.
- Accent placement signals importance: brand mark, primary link hover, key inline emphasis, occasional pull-quote color.
- Saturations are kept low-to-medium. High-saturation versions of these colors (electric red, neon orange) read as different palette entirely.
- Often paired with serif typography and Vertical-Rhythm or Editorial-Grid layouts.

**Registers it hosts.** Considered hospitality (especially heritage and vernacular), editorial publishing, food and lifestyle brands, fashion houses with cultural rooting, cultural institutions.

**Registers it resists.** Tech products. SaaS. Anything explicitly contemporary or futurist. Anything signaling "global startup" rather than "rooted somewhere specific."

**Failure mode.** AI overuses the accent — applying it to multiple buttons, several headlines, and decorative elements — which destroys the "used four times" discipline. Or it pulls accents that aren't earth-toned (saturated blue or green), losing the palette's coherence.

---

## COLOR-3. Two-Color Monochrome

**Definition.** A strict palette of two values — a background and a foreground — usually with permitted variations of those two values (lighter and darker tints). No third color, no accent.

**Distinguishing edge.** Versus *Three-Color Discipline* — Two-Color forbids a mid-tone third color; Three-Color requires it. Versus *Single-Color Monochrome* — Two-Color uses different hues (paper and ink); Single-Color uses one hue at multiple values.

**Substyles.**
- **Pure Monochrome.** Off-white and near-black. The most common Two-Color expression. Editorial, fashion, design publishing.
- **Inverted Monochrome.** Deep ink background and warm cream foreground, used as a primary palette rather than as a section variant. Fashion editorial, product photography sites, cinema and music.
- **Tinted Monochrome.** Two values of a single hue (cream + warm-brown, or pale-blue + navy). Common in considered fashion and beauty.

**Canonical examples.** COS, Acne Studios, much of Calvin Klein, most considered fashion editorial, Stripe Press (Tinted with cream + warm-brown), Apartamento book pages (Pure).

**Internal logic.**
- Discipline is the entire point — the palette is constraint as design choice.
- Hierarchy comes from typography, scale, and spacing rather than from color.
- Often paired with strong photography that supplies all chromatic interest the page contains.
- Imagery and color do not blend — photography exists *inside* the two-color frame, not as part of it.

**Registers it hosts.** Fashion, editorial publishing, considered consumer brands, photography portfolios, fine art and gallery sites, anywhere reduction is the brand statement.

**Registers it resists.** Anything requiring color to teach UI logic. Most product UIs (success/error states need color). Anything explicitly playful. Children's brands.

**Failure mode.** AI applies Two-Color Monochrome but accidentally introduces a third color via shadows, hover states, or default link colors. Or it uses true black and pure white, losing the warmth that distinguishes Two-Color from sterile minimalism.

---

## COLOR-4. Dark-Mode Dominant (Tech-Coded)

**Definition.** A primary palette built around a deep dark background (typically not pure black — closer to #0A0A0F to #18181C) with high-contrast text in off-white or warm-grey, plus one to three accent colors used for UI signaling. The default register of contemporary tech product design.

**Distinguishing edge.** Versus *Inverted Monochrome* — Dark-Mode Dominant uses the dark palette as the primary system, including for UI states; Inverted Monochrome is fashion/editorial register. Versus *Neon-Brutalist* — Dark-Mode Dominant has restrained accent saturation; Neon-Brutalist uses high-contrast saturated colors.

**Substyles.**
- **Linear-Coded.** Deep blue-grey background, pure-white foreground, single saturated accent (often purple, blue, or green) used sparingly for UI emphasis. Contemporary B2B SaaS.
- **OpenAI-Coded.** Deep grey-black background, warm off-white foreground, no chromatic accent — relying on type weight and size for hierarchy. Restrained tech-product register.
- **Retro-Terminal Dark.** Deep black background, green or amber monochrome foreground (or near-monochrome). Terminal-coded products, deliberately retro.
- **Multi-Accent Dark.** Dark background with two or three accent colors used systematically — one for actions, one for alerts, one for highlights. Common in dashboard products.

**Canonical examples.** Linear, Vercel, Arc, Raycast, Anthropic's site (sometimes), most modern developer tools, OpenAI's product pages, Stripe Dashboard.

**Internal logic.**
- The dark background is rarely pure black — pure black creates excessive contrast with white text and visual fatigue. Real Dark-Mode Dominant uses values in the #0A–#18 range.
- Accents are used to teach UI: the same color always means the same thing (this color means action, this color means alert).
- Typography is typically Geometric-Modernist or Mono — Dark-Mode Dominant rarely hosts serif body text (it can, but it's notable when it does).
- Often co-occurs with Bento layout and Component-System component grammar.

**Registers it hosts.** Tech products, SaaS, developer tools, AI products, fintech, productivity software, modern consumer apps.

**Registers it resists.** Hospitality (dark mode on a hotel site reads as nightclub or speakeasy, not luxury). Editorial publishing. Heritage brands. Anything where warmth or light is part of the proposition.

**Failure mode.** AI applies Dark-Mode Dominant as a default for "modern-looking" without considering register — producing hotel sites, restaurant pages, and editorial briefs in dark mode where light would have been correct. The grammar is real and useful, but it's also an over-applied AI default.

---

## COLOR-5. Saturated-Primary (Neo-Brutalist)

**Definition.** A high-contrast palette of saturated primary or near-primary colors (electric red, cobalt blue, sunshine yellow, deep black) with stark white or cream backgrounds. Heavy borders define color regions. No gradients, no soft tones.

**Distinguishing edge.** Versus *Pastel-Vibrant* — Saturated-Primary uses high-saturation true-primary colors; Pastel-Vibrant uses low-saturation tints. Versus *Earth-Pulled Restraint* — Saturated-Primary is loud and high-contrast; Earth-Pulled is quiet and matte.

**Substyles.**
- **Pure Neo-Brutalist.** True primaries (red, yellow, blue) with thick black borders, white background, no shadows. The textbook neo-brutalism palette.
- **Pastel-Brutalist.** Lower-saturation versions of primaries (dusty pink instead of red, mustard instead of yellow, dusty teal instead of blue) with thick black borders. Softer expression of the same logic.
- **Monochrome-Brutalist.** Black, white, and a single saturated accent (often electric green, hot pink, or cobalt). Tighter palette discipline within the same compositional logic.

**Canonical examples.** Gumroad (post-2021), Figma's marketing pages (some), Around (video conferencing), Paddle, Linear's bolder pages, much of Awwwards' Brutalism category, indie SaaS launches 2023–2026.

**Internal logic.**
- Borders are 2–4px solid black. Without thick borders, the palette loses its compositional anchoring.
- Colors fill regions completely — no gradients, no opacity variations, no soft transitions.
- Photography (when present) is treated as another bordered element, not as a chromatic source for the palette.
- Often paired with Geometric-Modernist or Mono typography and Neo-Brutalist component grammar.

**Registers it hosts.** Indie SaaS, design tools, creative agencies, fashion brands targeting Gen Z, anti-corporate startups, design education, brands signaling "we're not like the others."

**Registers it resists.** Hospitality, banking, healthcare, enterprise B2B, heritage brands, luxury, anything requiring conventional polish.

**Failure mode.** AI uses saturated-primary colors but skips the thick borders, producing a soft-rounded "playful" page rather than neo-brutalism. The compositional structure is what makes the palette work; without it, the palette reads as childish.

---

## COLOR-6. Pastel-Vibrant (Y2K and Dopamine)

**Definition.** A palette of lower-saturation pastels (mint, blush, lavender, soft yellow) often combined with one or two higher-saturation pops (electric pink, neon green, bright orange). Warmth, optimism, and personality are explicit.

**Distinguishing edge.** Versus *Saturated-Primary* — Pastel-Vibrant softens the saturations; Saturated-Primary keeps them at full intensity. Versus *Earth-Pulled* — Pastel-Vibrant uses cooler, candy-coded colors; Earth-Pulled stays in warm matte territory.

**Substyles.**
- **Y2K-Pastel.** Lavender, baby blue, mint, blush, with chrome or holographic accents. Nostalgic 2000s register.
- **Dopamine-Bright.** Lower-saturation pastels alongside one or two saturated pops (electric pink, neon green). Wellness, beauty, lifestyle.
- **Cute-alism Pastel.** Pastels used in neo-brutalist compositions — soft colors with hard borders. Crossover register, often Gen Z.

**Canonical examples.** Headspace (some campaigns), Starface, Glossier, much of Lush, Bumble's site, lifestyle and beauty brands targeting younger audiences, parts of Anthropic's site (the warm-pastel section), parts of Notion's marketing.

**Internal logic.**
- Saturation is the variable being controlled — pastels cluster around 30–60% saturation; the bright pops sit at 80–100%.
- The contrast between pastel and pop is the design tension.
- Typography is often friendly geometric sans (Plus Jakarta, DM Sans) or playful display faces.
- Component grammar tends toward soft-rounded — sharp corners would clash.

**Registers it hosts.** Beauty, wellness, lifestyle brands, consumer apps targeting younger audiences, Gen Z and millennial consumer products, anything optimistic or celebratory.

**Registers it resists.** Luxury at any tier (this palette is anti-quiet). Heritage. Hospitality (with rare exceptions in resort contexts). B2B. Enterprise. Anything requiring perceived authority.

**Failure mode.** AI uses pastel without the saturated pop, producing a flat all-pastel page that reads as washed-out. Or uses too many saturated pops, producing chromatic chaos. Pastel-Vibrant requires the *contrast* between low and high saturation; missing either side of that contrast breaks it.

---

## COLOR-7. Iridescent / Gradient-Tech

**Definition.** A palette built around gradients, iridescence, and color transitions rather than solid color regions. Often features metallic-feeling colors, holographic effects, AI-generated chromatic relationships ("hyperreal" colors), or animated color shifts.

**Distinguishing edge.** Versus *Saturated-Primary* — Iridescent uses transitions between colors; Saturated-Primary uses solid regions. Versus *Pastel-Vibrant* — Iridescent's colors blend into each other; Pastel-Vibrant treats them as discrete.

**Substyles.**
- **Apple-Gradient.** Soft pastel gradients (often with metallic feel) used as backgrounds for product imagery. Apple's product pages, much of contemporary consumer tech.
- **AI-Iridescence.** Saturated, dynamic, holographic-feeling color relationships. AI startup branding, 2025–2026 design trend. Often signals "this product uses generative AI."
- **Cyberpunk-Neon.** High-saturation gradient overlays (often pink-to-blue, purple-to-cyan) on dark backgrounds. Crypto, web3, cyberpunk-coded brands.
- **Vapor-Wave Pastel.** Soft pink-purple-blue gradients with retro-futurist register. Music brands, creative tools.

**Canonical examples.** Apple product launch pages, Stripe's announcement pages (some), many AI startup landing pages (2024–2026), web3 and crypto brands, Linear's gradient hero treatments.

**Internal logic.**
- The gradient is the brand statement — color is *moving* across the page even when nothing else is.
- Often paired with kinetic typography and Bento or Hero-and-Stack layouts.
- Performance and rendering matter — bad gradients (banding, low-quality interpolation) read as worse than no gradient.
- Tends to be combined with restrained typography (Geometric-Modernist) so that the type doesn't compete with the gradient.

**Registers it hosts.** Tech products, AI products, music brands, creative tools, web3, contemporary consumer tech, anything signaling "this is computational."

**Registers it resists.** Hospitality (the explicit hospitality anti-pattern includes "any gradient"). Editorial publishing. Heritage brands. Document/prose contexts. Anything requiring trust through familiarity in conservative industries.

**Failure mode.** AI produces gradients as decoration without composition — backgrounds, button fills, hero overlays — creating gradient saturation that reads as 2018 SaaS rather than 2025 AI-iridescence. The substyles are real and distinct; AI tends to collapse them into "shiny gradient" without distinguishing.

---

## COLOR-8. Single-Accent System (UI-Gold-Standard)

**Definition.** A palette of mostly grays, near-blacks, and off-whites with exactly one strong accent color used systematically for actions, links, and emphasis. The most common interface palette in modern product design — closer to a system specification than to a design choice.

**Distinguishing edge.** Versus *Three-Color Discipline* — Single-Accent permits and requires an accent color; Three-Color forbids one. Versus *Dark-Mode Dominant* — Single-Accent can be light-mode primary; Dark-Mode Dominant is specifically dark.

**Substyles.**
- **Stripe-Coded Light.** Light-mode greys with a single saturated accent (often blue or purple) for actions. Default modern SaaS.
- **Linear-Coded Dark.** Dark-mode greys with a single accent for actions. The dark-mode counterpart.
- **GitHub-Coded.** Light-mode greys with a single accent that shifts contextually (green for success, blue for info, red for danger) — multiple accents, but each used systematically. Borderline between Single-Accent and Multi-Accent Dashboard.

**Canonical examples.** Stripe Dashboard, GitHub, Linear, virtually every modern dashboard, considered B2B SaaS, modern banking apps, productivity tools.

**Internal logic.**
- The accent has a job: it signals "you can act here." Body copy never uses the accent. Decorative elements never use the accent.
- Greys are not pure — they have slight warmth or coolness. Typically blue-grey, brown-grey, or warm-grey.
- Hierarchy in the palette is created through value (lightness) rather than hue.
- Often paired with Geometric-Modernist typography and SPA/Dashboard layout.

**Registers it hosts.** B2B SaaS, dashboards, productivity tools, banking apps, anywhere users *do work* and need clear UI signaling.

**Registers it resists.** Hospitality. Editorial. Heritage. Anything narrative. Anywhere the value proposition isn't "use this tool." Marketing-only sites for tools that don't have application UIs.

**Failure mode.** AI applies Single-Accent System to marketing pages where it should have been a different grammar entirely — producing tool-UI-coded marketing pages that feel cold. The grammar is correct for application UIs and incorrect as a default for everything that touches B2B.

---

# How these axes interact (preview of the Compatibility Model)

Each typography grammar has natural typography-color pairings. Some of the strongest co-occurrences observable in real production design:

- **Two-Hand System (Editorial)** + **Three-Color Discipline** = Aman, Cheval Blanc register
- **Two-Hand System (Editorial)** + **Earth-Pulled Restraint** = Soho House, RAAS Jodhpur register
- **Single-Family Discipline (Sans-Only, Variable)** + **Single-Accent System** = Linear, Stripe register
- **Single-Family Discipline (Sans-Only)** + **Dark-Mode Dominant** = Linear, Vercel register
- **Editorial Print Vocabulary** + **Earth-Pulled Restraint** = magazine and publishing register
- **Geometric-Modernist** + **Single-Accent System** = default modern SaaS
- **Geometric-Modernist** + **Dark-Mode Dominant** = default modern AI startup
- **Mono-Discipline** + **Dark-Mode Dominant** = developer tool register
- **Mono-Discipline** + **Single-Accent System** = quiet technical brands
- **Maximalist-Expressive** + **Saturated-Primary** = Y2K-revival, anti-design
- **Geometric-Modernist** + **Saturated-Primary** = neo-brutalist SaaS
- **Kinetic-Variable** + **Iridescent** = AI launch pages, music brands

Some combinations are *broken*:

- **Two-Hand System (Editorial)** + **Saturated-Primary** = the serif's quiet contradicts the palette's loudness
- **Mono-Discipline** + **Earth-Pulled Restraint** = mono's machine-coding conflicts with earth's organic warmth (though this is a *generative* combination — it might be exactly what an Indian heritage tech brand could use, and would require careful composition)
- **Maximalist-Expressive** + **Three-Color Discipline** = the discipline of the palette contradicts the chaos of the type

Some combinations are *novel-but-coherent* — exactly the territory Palate is designed to explore:

- **Single-Family Discipline (Variable Serif)** + **Earth-Pulled Restraint** = Run B's actual successful combination for Devigarh; not a common existing pattern but obviously coherent.
- **Editorial Print Vocabulary** + **Dark-Mode Dominant** = an editorial magazine in dark mode is uncommon but not broken (some music and film publications do this).
- **Mono-Discipline** + **Earth-Pulled Restraint** = the unusual combination flagged above. Currently rare, possibly the right answer for a brand that wants to feel both technical and culturally rooted.

The Compatibility Model in Turn 4 will formalize this. For now: each typography grammar has 3–5 color grammars it composes naturally with, 2–3 it's neutral toward, and 1–2 it's broken with. Same in reverse. The interesting space is the *novel-but-coherent* set — combinations that haven't been done much but should work.

---

# Open questions for v0.2

1. **Is *High-Contrast Modern Two-Hand* really a substyle of *Two-Hand System*, or is it sufficiently distinct to be its own grammar?** Didot/Bodoni-led fashion typography behaves differently enough from Tiempos-led editorial that this might warrant separation. Currently folded in; flagging for review.

2. **Mono-Discipline assumes Western Latin contexts.** Does this grammar generalize to non-Latin scripts (Devanagari, Arabic, Chinese)? Mohammed's VIRSA work may surface this — Deccan-Mughal vocabulary in Latin Mono-Discipline would be incongruous. The grammar may need a *Multi-Script Mono* substyle, or the question may belong in a separate *Script-System Grammar* axis we haven't yet considered.

3. **Earth-Pulled Restraint's substyles are geographically named** (Mediterranean, Deccan-Mughal, Northern-European, American-Heritage). Is this the right division, or should it be aesthetic (warm-saturated, warm-matte, cool-matte, cool-saturated)? Geographic naming is more legible to humans but less generalizable. Currently using geographic; reconsidering.

4. **Single-Accent System overlaps with several others** — it could be argued as a substyle of Dark-Mode Dominant, or as a layer on top of any other palette. It's currently positioned as a distinct grammar because of its specific UI-teaching role, but the boundary is fuzzy.

5. **Is *Kinetic-Variable* really a typography grammar, or is it actually a motion grammar that uses typography?** It might belong in Turn 2's Motion axis instead. Currently in Typography because the variable-font axes are a typography decision, but flagging for revision.

6. **Pastel-Vibrant's Cute-alism substyle crosses into Saturated-Primary's territory** — neo-brutalism with pastels rather than primaries. The boundary between Pastel-Brutalist (under Saturated-Primary) and Cute-alism Pastel (under Pastel-Vibrant) is not clean. May need to be reconciled.

---

*Turn 1 complete. Turn 2 will cover Component grammar and Motion grammar — the two axes that are most load-bearing for compositional integrity (since they govern how layout decisions actually render as interactive elements). Push back on any grammar definition, substyle distinction, or open question before I proceed.*

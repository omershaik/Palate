# Palate Grammar Survey v0.2 — Turn 4 (REVISED): Altname Retrofit with Authentic Voice

This document supersedes the original Turn 4 altname retrofit. The original was written in *designer-abstract voice* — phrases like *"the page should refuse to sell"* and *"reading-room layout"* that sound like things a working designer might say in a portfolio review, but that no actual vibe coder ever types into a prompt.

The revision is based on systematic research of how people actually describe what they want when prompting AI tools to build websites. Sources include:

- **Lovable's official prompting documentation**, which lists the buzzwords their model is tuned to recognize: *minimal, expressive, cinematic, playful, premium, developer-focused, bold and disruptive, calm and reassuring*
- **awesome-claude-design (formerly awesome-design-md)**, the open-source library of 68 brand-style files, which contains canonical one-line vibe descriptions in the language people actually use to invoke each brand
- **Vercel's official v0 prompting guide**, which documents the prompt patterns that work in practice
- **925Studios's AI Slop catalog** and Monet's anti-pattern guide, which name the specific AI tells in vibe-coder anti-vocabulary: *"Inter font everywhere," "purple-to-blue gradients," "default shadcn grays," "AI beige," "rounded corners galore"*

The altnames below are written in this authentic voice. Where the original Turn 4 had me writing *"interactive elements should read as text"* (designer abstract), the revision has *"no buttons, just underlined links"* (the actual phrase a vibe coder would type).

## What changed in the buckets themselves

The five-bucket structure is preserved (Vibes, Brand Exemplars, Vernacular Labels, Anti-vibes, Compositional Intent). But the *quality bar* for each bucket changed:

- **Vibes** must sound like things a non-designer types into a prompt. *"Premium and sleek"* is real; *"the design should refuse decoration"* is not.
- **Brand Exemplars** must use the casual phrasing people actually use. *"Make it like Stripe"* and *"styled like Apple's site"* are real; *"Aman style"* is real (people do invoke specific luxury brands); *"like a Como property"* is borderline and was kept only where the brand has prompt-recognition.
- **Vernacular Labels** are the working-designer shorthand. These overlap with the original Turn 4 because designer vocabulary IS legitimately part of the system; vibe coders learn these terms from looking at design Twitter and Reddit.
- **Anti-vibes** now use the *exact phrases* used in published anti-AI-slop critiques. *"Inter everywhere," "AI beige," "could belong to any startup"* — these are the real complaints.
- **Compositional Intent** is the bucket that changed most. Original Turn 4 had me writing in essay voice. Revision has phrases that sound like the start of an actual prompt: *"I'm a [profession] in [place], I need..."* or *"I want it to feel like X but Y"*.

## A note on what I'm explicitly NOT doing

I did not pad altnames to make every grammar look equally rich. Some grammars genuinely have more vocabulary surrounding them — anyone can describe a luxury hotel site in twenty different ways; almost no one has language for "side-scroll horizontal layouts." Where the vocabulary is thin, I keep the bucket short and honest.

I also did not invent brand exemplars beyond what canonical examples justify. If a brand isn't already named in the grammar's canonical examples, it doesn't appear as an altname.

---

# AXIS 1 — LAYOUT GRAMMAR ALTNAMES (REVISED)

## LAYOUT-1. Vertical-Rhythm Editorial

- **Vibes:** *premium* — *quiet luxury* — *expensive-feeling* — *like a luxury hotel site* — *unhurried* — *editorial* — *like a magazine essay* — *calm and confident* — *gallery-feel* — *the kind of site you trust*
- **Brand exemplars:** *like Aman* — *like Hermès* — *like Cheval Blanc* — *like Loewe* — *like a high-end fashion site*
- **Vernacular labels:** *editorial layout* — *long-form layout* — *single-column scroll* — *full-bleed photography layout* — *vertical rhythm*
- **Anti-vibes:** *not SaaS-y* — *not startup-coded* — *no Inter everywhere* — *no purple-to-blue gradients* — *not bento* — *not feature-grid* — *not pushy* — *no "Get started in 2 minutes"*
- **Compositional intent:** *I want it to feel expensive but not loud* — *I'm building for an audience that already trusts the brand* — *I don't want it to look like a startup landing page* — *I want stillness, not energy* — *make it feel like reading, not scanning*

## LAYOUT-2. Editorial-Grid Magazine

- **Vibes:** *magazine vibes* — *editorial with personality* — *art-directed* — *warm* — *member's club energy* — *that print magazine feel* — *cultured* — *considered*
- **Brand exemplars:** *like Soho House* — *like Apartamento* — *like Cereal Magazine* — *like Monocle* — *like Kinfolk* — *like NYT Style*
- **Vernacular labels:** *magazine layout* — *editorial grid* — *multi-column editorial* — *print-style web* — *art-directed grid*
- **Anti-vibes:** *not corporate* — *not too quiet* — *not minimalist-cold* — *not a content list* — *not a feed*
- **Compositional intent:** *I want it to have a voice* — *make it feel made by a person* — *I want copy to be a design element, not just text on a page* — *give it that print magazine feel but on the web*

## LAYOUT-3a. Marketing-Bento

- **Vibes:** *bento grid* — *like Apple's product pages* — *AI startup vibes* — *modular* — *2025-coded* — *clean tile grid* — *feature cards*
- **Brand exemplars:** *like Apple's iPhone page* — *like Stripe announcements* — *like an AI startup* — *like OpenAI's launch pages* — *like Linear marketing* — *like Vercel*
- **Vernacular labels:** *bento* — *bento grid* — *bento layout* — *tile grid* — *feature bento* — *modular cards*
- **Anti-vibes:** *not a generic feature grid* — *not centered everything* — *not card-based with rounded-2xl on everything* — *not editorial* — *not magazine-style*
- **Compositional intent:** *I have multiple features to show on one page* — *I want feature density without overwhelming* — *make it look like a modern AI startup* — *I want it to feel like Apple's product page*

## LAYOUT-3b. Dashboard-Bento

- **Vibes:** *dashboard* — *information-dense* — *power-user UI* — *operational* — *for serious work* — *KPI feel*
- **Brand exemplars:** *like Stripe Dashboard* — *like Linear* — *like GitHub* — *like AWS Console* — *like a Datadog dashboard*
- **Vernacular labels:** *dashboard* — *admin home* — *KPI grid* — *metrics dashboard* — *widget layout* — *ops dashboard*
- **Anti-vibes:** *not for marketing* — *no fluff* — *no marketing copy* — *not warm* — *not welcoming-coded*
- **Compositional intent:** *the user is doing work, not browsing* — *I need to show many metrics at once* — *I'm building an internal tool* — *every pixel needs to do work*

## LAYOUT-3c. Editorial-Bento

- **Vibes:** *modular magazine* — *content tiles* — *like Pinterest but considered* — *curated grid* — *modern editorial homepage*
- **Brand exemplars:** *like a modern Wired homepage* — *like Are.na* — *like Apartamento's homepage*
- **Vernacular labels:** *editorial bento* — *content tile grid* — *magazine homepage* — *masonry grid* — *modular content*
- **Anti-vibes:** *not a feature grid* — *not a dashboard* — *not transactional* — *not e-commerce*
- **Compositional intent:** *I have many editorial pieces to surface* — *the user should browse and discover* — *I want a homepage that's a curated selection, not a feed*

## LAYOUT-4a. Conversion-Stack

- **Vibes:** *startup landing page* — *SaaS landing page* — *typical YC company site* — *modern product page* — *the standard landing page* — *every startup site*
- **Brand exemplars:** *like a typical YC startup* — *like a Webflow template* — *standard SaaS marketing site*
- **Vernacular labels:** *landing page* — *hero and stack* — *SaaS landing* — *conversion page* — *product landing page* — *standard landing page layout*
- **Anti-vibes:** *not editorial* — *not luxury* — *not bento* — *not heritage*
- **Compositional intent:** *I need visitors to sign up* — *every section should drive toward the CTA* — *I'm running a startup and I need conversions* — *make it look like a typical SaaS landing page*

## LAYOUT-4b. Brand-Stack

- **Vibes:** *premium product page* — *Apple product page energy* — *brand showcase* — *expensive without selling hard* — *hardware-launch feel*
- **Brand exemplars:** *like an Apple product page* — *like a Tesla product page* — *like Bang & Olufsen* — *premium hardware site*
- **Vernacular labels:** *brand page* — *product detail page* — *premium landing* — *brand showcase*
- **Anti-vibes:** *not pushy* — *no aggressive CTAs* — *not feature-bullets* — *not conversion-focused*
- **Compositional intent:** *I want to communicate, not convert* — *the product deserves room to breathe* — *I'm building a premium brand experience* — *I want it to feel like Apple's product detail pages*

## LAYOUT-4c. Long-Form Stack

- **Vibes:** *essay style* — *long-form reading* — *Substack-coded* — *thoughtful blog* — *premium documentation* — *like a real article*
- **Brand exemplars:** *like Stripe Press* — *like a serious article on The Atlantic* — *premium Substack*
- **Vernacular labels:** *long-form* — *article page* — *essay layout* — *editorial article* — *long-read*
- **Anti-vibes:** *not a feature list* — *not scannable summaries* — *not a landing page* — *not fragmented*
- **Compositional intent:** *I'm publishing something to be read, not skimmed* — *I want the design to disappear into the writing* — *make it feel like a real publication*

## LAYOUT-5. Scrollytelling Longform

- **Vibes:** *NYT-style storytelling* — *cinematic scroll* — *immersive* — *interactive longform* — *museum-style*
- **Brand exemplars:** *like NYT special features* — *like Pudding* — *like Bloomberg longform* — *like a museum exhibition site*
- **Vernacular labels:** *scrollytelling* — *scroll narrative* — *sticky-media longform* — *interactive story*
- **Anti-vibes:** *not a normal article* — *not mobile-first* — *not a regular landing page*
- **Compositional intent:** *I have a story that unfolds, not a page that sits* — *the user should be walked through it* — *I want content to reveal as you scroll*

## LAYOUT-6. Broken-Grid / Anti-Grid

- **Vibes:** *Awwwards-style* — *agency portfolio* — *experimental* — *art-directed* — *creator-coded* — *not template-y* — *visibly designed*
- **Brand exemplars:** *like an Awwwards Site of the Day* — *agency portfolio style* — *like Locomotive's site*
- **Vernacular labels:** *broken grid* — *anti-grid* — *asymmetric layout* — *art-directed layout* — *agency site* — *portfolio layout*
- **Anti-vibes:** *not safe* — *not template-y* — *not corporate* — *not predictable* — *not SaaS*
- **Compositional intent:** *I want the layout itself to be a brand statement* — *make it feel art-directed, not generated* — *I'm signaling we are makers, not marketers*

## LAYOUT-7. Neo-Brutalism

- **Vibes:** *brutalist* — *neo-brutalist* — *anti-design* — *raw and bold* — *thick borders everywhere* — *indie energy* — *not-like-the-others* — *defiant*
- **Brand exemplars:** *like Gumroad* — *like Around* — *like Paddle* — *neo-brutalist indie SaaS*
- **Vernacular labels:** *neo-brutalism* — *brutalist UI* — *anti-design* — *thick-border design* — *neubrutalism* — *bordered-box style*
- **Anti-vibes:** *not corporate* — *not soft* — *not minimalist* — *not premium-feeling* — *not enterprise*
- **Compositional intent:** *I want to signal we're independent* — *I'm rejecting SaaS polish on purpose* — *make it provoke*

## LAYOUT-8. Document / Prose

- **Vibes:** *plain* — *minimal* — *content-first* — *Paul-Graham-style* — *like a book* — *no decoration* — *just text*
- **Brand exemplars:** *like Paul Graham's site* — *like Gwern* — *like Stripe Press* — *like Dan Luu's blog*
- **Vernacular labels:** *plain HTML* — *minimal blog* — *prose site* — *writer's site* — *technical documentation* — *content-first design*
- **Anti-vibes:** *not designed* — *not branded* — *not flashy* — *no marketing* — *no decoration*
- **Compositional intent:** *the writing should be the entire experience* — *I want the design to disappear* — *I trust the reader to read*

## LAYOUT-9. Catalog / Grid-of-Things

- **Vibes:** *e-commerce* — *Pinterest energy* — *grid of options* — *browsable* — *shopping feel* — *gallery view*
- **Brand exemplars:** *like Amazon* — *like Airbnb listings* — *like Pinterest* — *like Dribbble's grid* — *museum collection-style*
- **Vernacular labels:** *catalog* — *card grid* — *listings* — *gallery* — *product grid* — *grid layout*
- **Anti-vibes:** *not editorial* — *not narrative* — *not a single-feature page* — *not curated*
- **Compositional intent:** *the user is comparing options* — *I have many things of the same type to show* — *the page is for browsing, not deciding*

## LAYOUT-10. SPA / Dashboard

- **Vibes:** *application UI* — *workspace feel* — *productivity tool* — *power-user interface* — *for daily use*
- **Brand exemplars:** *like Notion* — *like Linear app* — *like Figma* — *like Slack* — *like Gmail* — *like a modern B2B app*
- **Vernacular labels:** *SPA* — *dashboard* — *application UI* — *workspace* — *admin panel* — *internal tool*
- **Anti-vibes:** *not a marketing page* — *not for first-time users* — *not narrative* — *not promotional*
- **Compositional intent:** *I'm building a tool, not a brochure* — *the user is doing work* — *persistent navigation matters*

## LAYOUT-11. Side-Scroll / Horizontal

- **Vibes:** *gallery scroll* — *horizontal browsing* — *Netflix-style rows* — *cinematic horizontal* — *unconventional*
- **Brand exemplars:** *like Netflix* — *like Apple TV interface* — *like Spotify's playlist rows* — *photographer portfolios with horizontal scroll*
- **Vernacular labels:** *horizontal scroll* — *side-scroll* — *row-based browsing* — *horizontal gallery* — *scroll-right*
- **Anti-vibes:** *not vertical-scroll-first* — *not mobile-native* — *not standard*
- **Compositional intent:** *I want to break vertical-scroll convention* — *content has a natural horizontal sequence* — *the user should swipe or pan*

---

# AXIS 2 — TYPOGRAPHY GRAMMAR ALTNAMES (REVISED)

## TYPE-1. Two-Hand System (Serif Display + Sans Body)

- **Vibes:** *editorial* — *premium type* — *magazine type* — *fashion-coded* — *grown-up type* — *expensive-feeling type*
- **Brand exemplars:** *like NYT Magazine* — *like an Aman site* — *like Soho House's type* — *like Hermès editorial type*
- **Vernacular labels:** *serif and sans pairing* — *display serif with sans body* — *editorial type pairing* — *two-typeface system*
- **Anti-vibes:** *no Inter everywhere* — *not all-sans* — *not tech-coded* — *not single-family*
- **Compositional intent:** *I want personality in the headlines and clarity in the body* — *I need the type to signal editorial register* — *make it feel like a real publication*

## TYPE-2. Single-Family Discipline

- **Vibes:** *clean* — *unified* — *modern type system* — *coordinated* — *one-voice* — *disciplined*
- **Brand exemplars:** *like Linear's type* — *like Apple's San Francisco* — *like Stripe Press (Tiempos throughout)*
  <!-- "like Stripe (Inter and Sohne)" removed in Phase 2.1b Task 4c per attestation: Stripe.com uses Söhne (Klim Type Foundry) as primary brand font, NOT Inter+Söhne. Sources: Fonts In Use ("Stripe website (2020)" — Söhne replacing Camphor); Stripe Elements documentation (Söhne primary); SaaS typography surveys distinguishing Söhne (Stripe) from Inter-default (Notion, Linear, Shopify). The original altname misnamed Stripe's typography stack AND its parenthetical "(Inter and Sohne)" listed two families inside a grammar called Single-Family Discipline — authorial error. Stripe-the-company's typography is Söhne single-family which IS still TYPE-2 territory in principle, but the (Inter and Sohne) parenthetical contradicts both the fact and the grammar name; "like Stripe" already in TYPE-5 (Geometric-Modernist) covers the brand's primary surface routing. "like Stripe Press (Tiempos throughout)" stays here — Stripe Press's editorial Tiempos use IS genuinely single-family. -->

- **Vernacular labels:** *single-family* — *one-typeface system* — *variable font* — *super family*
- **Anti-vibes:** *not mixed-typeface* — *not editorial-multi* — *not display-and-body-different*
- **Compositional intent:** *I want one coherent typographic voice* — *hierarchy through weight and size, not family change* — *I want the type system to disappear into the brand*

## TYPE-3. Editorial Print Vocabulary

- **Vibes:** *magazine* — *printed-page feel* — *editorial moves* — *drop caps and pull-quotes* — *typeset* — *like a real publication*
- **Brand exemplars:** *like Apartamento* — *like Cereal Magazine* — *like NYT Style longform* — *like The New Yorker site*
- **Vernacular labels:** *editorial typography* — *magazine type* — *print-style typesetting* — *typographic hierarchy*
- **Anti-vibes:** *not SaaS-coded* — *not minimalist-display* — *not all-sans*
- **Compositional intent:** *I want the page to behave like a magazine spread* — *typography needs to do real editorial work* — *I'm publishing, not posting*

## TYPE-4. Mono-Discipline (Terminal-Coded)

- **Vibes:** *terminal vibes* — *developer-coded* — *technical precision* — *code-adjacent* — *quiet engineering* — *that command-line feel*
- **Brand exemplars:** *like Linear's command pages* — *like Raycast* — *like Berkeley Mono showcase* — *like Stripe API docs*
- **Vernacular labels:** *monospace* — *mono type* — *terminal type* — *code-style typography*
- **Anti-vibes:** *not consumer-friendly* — *not warm* — *not editorial* — *not for non-technical users*
- **Compositional intent:** *I'm signaling we're technical* — *make it feel like the product is precise* — *I want a machine-coded register*

## TYPE-5. Geometric-Modernist (Tech-Sans Default)

- **Vibes:** *modern* — *clean* — *contemporary* — *startup-coded* — *Inter-default* — *trustworthy and current* — *standard SaaS type*
- **Brand exemplars:** *like Vercel* — *like Linear* — *like every YC company* — *like OpenAI* — *like Anthropic* — *like Stripe*
- **Vernacular labels:** *Inter* — *DM Sans* — *Geist* — *modern sans* — *geometric sans* — *tech sans*
- **Anti-vibes:** *not editorial* — *not luxury* — *not heritage* — *not personality-driven* — *no Inter everywhere* — *(but: this IS the AI default — the failure mode here is using it WHERE it doesn't belong, not using it well)*
  <!-- "no Inter everywhere" — well-attested as the canonical AI-default-typography rejection vocabulary. Sources: 925Studios "AI Slop Web Design: Complete Guide" ("Inter is the default font in nearly every AI design tool, component library, and website builder"); Monet "Escape AI Slop Landing Page Design"; prg.sh "Why Your AI Keeps Building the Same Purple Gradient Website" (lists Inter as part of the AI-default cluster); Jack Pearce notes; aiagentskills.ai "Why Every AI-Generated Website Looks Like It Was Made by the Same Bored Intern"; DEV Community "AI Purple Problem"; Medium/Kai Ni; Anthropic Claude Cookbook "Prompting for Frontend Aesthetics" (acknowledges Inter as AI-default). 6+ corroborating sources call out Inter-as-AI-default; the rejection form "no Inter everywhere" is the natural anti-vibe construction. Fires for TYPE-5 specifically because TYPE-5 IS the Geometric-Modernist tech-sans default that produces this homogenization. -->
- **Compositional intent:** *I want the type to read as contemporary and trustworthy* — *I want screen-native typography* — *I'm building a tech product*

## TYPE-6. Maximalist-Expressive (Anti-Type-Hierarchy)

- **Vibes:** *expressive* — *maximalist* — *type-as-art* — *creative agency feel* — *Y2K* — *anti-design* — *handcrafted*
- **Brand exemplars:** *like La Palatine* — *creative agency portfolio type* — *like a Y2K-revival lifestyle brand*
- **Vernacular labels:** *maximalist type* — *expressive typography* — *anti-design type* — *Y2K type* — *handcrafted type*
- **Anti-vibes:** *not minimal* — *not corporate* — *not safe* — *not template-y*
- **Compositional intent:** *I want the type itself to be a design element* — *I want visible craft* — *make typography signal we're makers*

---

# AXIS 3 — COLOR GRAMMAR ALTNAMES (REVISED)

## COLOR-1. Three-Color Discipline (Paper / Ink / Stone)

- **Vibes:** *quiet luxury palette* — *gallery feel* — *museum colors* — *paper and ink* — *no-color colors* — *expensive-without-color*
- **Brand exemplars:** *like Aman's colors* — *like Cheval Blanc* — *like Hermès editorial*
- **Vernacular labels:** *three-color palette* — *paper-ink-stone* — *cream and black* — *neutral palette* — *no-accent palette*
- **Anti-vibes:** *no accent color* — *not colorful* — *not pure black-and-white* — *not tech*
- **Compositional intent:** *photography supplies all the color* — *I want the palette to be the discipline* — *no accent at all*

## COLOR-2. Earth-Pulled Restraint

- **Vibes:** *warm and rooted* — *earthy* — *natural materials* — *heritage feel* — *organic but considered*
- **Brand exemplars:** *like Aesop* — *like Shinola* — *like Notion's warm minimalism*
- **Vernacular labels:** *earth tones* — *warm neutrals with accent* — *heritage palette* — *natural palette* — *terracotta-and-cream*
- **Anti-vibes:** *not tech-coded* — *not neon* — *not gradient* — *not cool-toned* — *no electric blue*
- **Compositional intent:** *I want it to feel rooted* — *the accent should be earned, not splashed everywhere* — *I need warmth without commercialism*

## COLOR-3. Two-Color Monochrome

- **Vibes:** *fashion editorial* — *gallery* — *strict* — *rigorous* — *restrained*
- **Brand exemplars:** *like COS* — *like Acne Studios* — *like Calvin Klein* — *fashion editorial style*
- **Vernacular labels:** *monochrome* — *two-color palette* — *black and cream* — *editorial monochrome*
- **Anti-vibes:** *not vibrant* — *not multicolor* — *not playful* — *no accent*
- **Compositional intent:** *I want reduction to be the brand statement* — *hierarchy from typography, not color*

## COLOR-4. Dark-Mode Dominant (Tech-Coded)

- **Vibes:** *dark mode* — *modern tech* — *night UI* — *premium digital* — *contemporary AI feel*
- **Brand exemplars:** *like Linear's dark mode* — *like Vercel* — *like Arc* — *like Raycast* — *like OpenAI* — *like Shopify's dark-first cinematic*
- **Vernacular labels:** *dark mode* — *dark theme* — *night palette* — *dark UI* — *dark-first*
- **Anti-vibes:** *not light-mode* — *not cream* — *not editorial* — *not warm*
- **Compositional intent:** *I need it to feel current and digital* — *contrast on dark is the brand register* — *the product is screen-native*

## COLOR-5. Saturated-Primary (Neo-Brutalist)

- **Vibes:** *bold and primary* — *neo-brutalist palette* — *high contrast* — *defiant* — *not-corporate*
- **Brand exemplars:** *like Gumroad* — *like Around* — *like Paddle* — *neo-brutalist indie SaaS*
- **Vernacular labels:** *neo-brutalist palette* — *primary colors* — *bordered-box colors* — *high-contrast palette*
- **Anti-vibes:** *not soft* — *not pastel* — *no purple-to-blue gradients* — *not premium-feeling* — *less aggressive*
  <!-- "less aggressive" — attested as critique vocabulary for neo-brutalist saturation. Sources: NN/G ("Neobrutalism: Definition and Best Practices"): "Without balance, neo-brutalism with bold colors, heavy typography, and sharp contrasts can overwhelm users and hinder accessibility"; Etienne Aubert Bonn ("Neobrutalism in Web Design: The Anti-Design Trend Explained"); GeekyAnts ("Exploring Anti-Design Through a Neo-Brutalist Product Experience"). The "aggressive" / "overwhelming" critique vocabulary is consistent across these sources; the rejection form "less aggressive" follows naturally and matches a fixture brief asking for softer NB indie-SaaS register. Fires for Saturated-Primary specifically because the saturation IS what the critiques target. -->
- **Compositional intent:** *I want the palette to provoke* — *colors should match the design's defiance*

## COLOR-6. Pastel-Vibrant (Y2K and Dopamine)

- **Vibes:** *playful* — *optimistic* — *Y2K* — *dopamine* — *friendly tech* — *young brand feel*
- **Brand exemplars:** *like Glossier* — *like Headspace* — *like Starface* — *like Lush* — *like Bumble*
- **Vernacular labels:** *pastel palette* — *dopamine colors* — *Y2K colors* — *cute-alism* — *vibrant pastel*
- **Anti-vibes:** *not luxury* — *not corporate* — *not heritage* — *not muted* — *no millennial pink* — *millennial pink is dead*
  <!-- "no millennial pink" — observed across design/beauty publications as a designer-and-writer-voiced rejection of the late-2010s Glossier-default palette. Sources: Glossy.co ("Millennial pink is dead: Unpacking Gen Z's imperfect, bright and unapologetic aesthetic", 2024); Business of Fashion ("Why Gen-Z Yellow Will Never Be Millennial Pink"); Substack/AjaSinger ("Moving on From Millennial Pink"); Substack/JessicaDeFino ("What Was Beauty in 2024?"). Phrase appears as both a positive declaration ("millennial pink is dead") and a brief-side rejection ("no millennial pink"). The publication-headline form is borderline as a vibe-coder prompt input but echoes in social commentary; both forms ship with this caveat. -->
- **Compositional intent:** *I want warmth and personality* — *the palette should feel optimistic* — *I'm targeting younger audiences*

## COLOR-7. Iridescent / Gradient-Tech

- **Vibes:** *iridescent* — *AI-coded* — *holographic* — *futuristic* — *generative* — *computational* — *Stripe purple gradients*
- **Brand exemplars:** *like Apple's gradient pages* — *like Stripe's announcements* — *AI startup branding* — *modern AI launches*
- **Vernacular labels:** *gradient* — *iridescent* — *holographic* — *AI-iridescent* — *aurora colors*
- **Anti-vibes:** *not flat* — *not solid color only* — *not heritage* — *not editorial* — *no purple-to-blue gradients* — *(but: purple-to-blue gradients are an AI default — use this grammar deliberately, not because gradients seem "modern")*
  <!-- "no purple-to-blue gradients" — well-attested as the canonical AI-default-color-treatment rejection vocabulary. Sources: 925Studios "AI Slop Web Design: Complete Guide" ("AI tools trained on thousands of SaaS landing pages have learned that purple-to-blue gradients are the most 'safe' choice"); prg.sh "Why Your AI Keeps Building the Same Purple Gradient Website" (entire post on the phenomenon); Jack Pearce "Where does that purple gradient come from?"; Medium/Kai Ni "Why Do AI-Generated Websites Always Favour Blue-Purple Gradients?"; DEV Community "AI Purple Problem: Make Your UI Unmistakable"; aiagentskills.ai "Why Every AI-Generated Website Looks Like It Was Made by the Same Bored Intern"; Anthropic Claude Cookbook "Prompting for Frontend Aesthetics". 6+ corroborating sources, including dedicated articles on the purple-gradient phenomenon. The rejection form "no purple-to-blue gradients" is the natural anti-vibe construction. Note: TYPE-5 already has the parenthetical commentary acknowledging this is an AI default; the explicit rejection altname enables the engine to honor user-stated rejection signals end-to-end. -->
- **Compositional intent:** *I want to signal computational sophistication* — *the colors themselves should feel generated*

## COLOR-8a. Marketing Single-Accent

- **Vibes:** *clean SaaS* — *modern marketing* — *startup palette* — *trustworthy contemporary* — *one-color-and-greys*
- **Brand exemplars:** *Stripe purple* — *like Linear's accent* — *like Vercel* — *Spotify's neon green* — *Wise's bright green* — *Airbnb's warm coral* — *like a Webflow template*
  <!-- "like a Webflow template" added in Phase 2.1b Task 6b per attestation. Webflow SaaS template color systems are explicitly described in design literature as "neutrals foundation + sparingly-used accent colors" pattern — exactly the COLOR-8a Marketing Single-Accent grammar. Sources: Merveilleux (color systems for SaaS — neutrals are the foundation, accent colors used sparingly); LandingPageFlow (best color combinations for landing pages — single-accent on neutral base); Webflow's own template style guides (neutral + injected brand color via CSS variables). The phrase already appears in LAYOUT-4a (line 77, "like a Webflow template" → Conversion-Stack) and COMP-2 (line 303, "typical Webflow template" → Soft-Container System); this Task 6b amendment closes the COLOR axis routing for SaaS-marketing briefs that invoke Webflow templates. The methodology refinement: "Webflow template" plausibly attests for IMG-7 too (Stock Photography), but search showed Webflow templates use diverse imagery (3D, illustration, custom photo, hero shots) — stock photography is not the most authentic imagery attestation for the phrase. Applied to COLOR-8a only. -->
- **Vernacular labels:** *brand accent* — *primary accent* — *single accent* — *CTA color* — *marketing palette*
- **Anti-vibes:** *not multi-accent* — *not editorial* — *not warm-toned* — *not for application UIs*
- **Compositional intent:** *I want one strong color for emphasis* — *the accent should signal the brand* — *the rest of the palette gets out of the way*

## COLOR-8b. Application Single-Accent

- **Vibes:** *dashboard palette* — *systematic* — *functional UI colors* — *for daily-use tools* — *workspace colors*
- **Brand exemplars:** *like Stripe Dashboard* — *like GitHub* — *like Linear app* — *like Notion app*
- **Vernacular labels:** *application palette* — *UI colors* — *status colors* — *functional palette* — *dashboard palette*
- **Anti-vibes:** *not for marketing* — *not decorative* — *not warm* — *not editorial*
- **Compositional intent:** *colors must teach UI* — *the same color should always mean the same thing* — *I'm building for users who work*

---

# AXIS 4 — COMPONENT GRAMMAR ALTNAMES (REVISED)

## COMP-1. Typographic-Discreet (Inline-as-Component)

- **Vibes:** *no buttons, just links* — *quiet luxury components* — *like a printed page* — *no urgency*
- **Brand exemplars:** *like Aman's components* — *like Cheval Blanc* — *like Soho House's quiet pages*
- **Vernacular labels:** *typographic links* — *underlined word as button* — *bordered-word button* — *no-container components*
- **Anti-vibes:** *no buttons* — *no shapes* — *no shadcn-default styling* — *not Material* — *not SaaS components*
- **Compositional intent:** *I want links instead of buttons* — *no visual urgency* — *make interactive elements read as text*

## COMP-2. Soft-Container System

- **Vibes:** *modern UI* — *SaaS components* — *standard product UI* — *clean rounded* — *Tailwind default* — *shadcn-style*
- **Brand exemplars:** *like Stripe* — *like Linear's marketing* — *standard SaaS* — *typical Webflow template*
- **Vernacular labels:** *Material* — *Tailwind* — *standard buttons* — *rounded UI* — *SaaS components* — *shadcn-style*
- **Anti-vibes:** *not bordered-hard* — *not pill-only* — *not typographic* — *not glass* — *(careful: rounded-2xl on everything is the AI default — use this grammar deliberately)*
- **Compositional intent:** *I need standard, trustworthy product UI* — *components should feel familiar and modern* — *I'm building a contemporary product*

## COMP-3. Hard-Bordered (Neo-Brutalist Components)

- **Vibes:** *thick borders everywhere* — *neo-brutalist* — *hard-edged* — *raw component design* — *sharp corners*
- **Brand exemplars:** *like Gumroad* — *like Around* — *like Paddle* — *neo-brutalist component libraries*
- **Vernacular labels:** *neo-brutalist components* — *thick-bordered UI* — *hard borders* — *brutalist components* — *bordered boxes*
- **Anti-vibes:** *not soft* — *not rounded* — *not Material* — *not premium-feeling*
- **Compositional intent:** *I want components that provoke* — *softness is wrong for this brand* — *I'm rejecting standard UI on purpose*

## COMP-4. Pill-and-Cushion

- **Vibes:** *friendly* — *cushioned* — *pill-shaped* — *consumer-friendly* — *wellness energy* — *soft and rounded*
- **Brand exemplars:** *like Glossier* — *like Headspace* — *like Calm* — *like Bumble* — *most beauty/wellness brands*
- **Vernacular labels:** *pill buttons* — *rounded-full* — *cushioned components* — *friendly buttons* — *wellness UI*
- **Anti-vibes:** *not enterprise* — *not premium-luxury* — *not editorial* — *not B2B* — *no decoration*
  <!-- "no decoration" — concept attested via the Brutalist Web Design Manifesto (brutalist-web.design): "Decoration for its own sake, often to satisfy the vanity of the designer, goes counter to Brutalist Web Design. Such needless decoration distracts the visitor from the reason for visiting and makes the content secondary." Echoed in Toptal ("Brutalist Web Design, Minimalist Web Design, and the Future of Web UX"), Designlab ("Examples of Brutalism in Web Design"), HubSpot ("11 Fascinating Examples of Brutalist Web Design"), and TodayMade ("Brutalism in Web Design"). The rejection-form phrasing "no decoration" is the natural anti-vibe construction of the attested concept (compositional with the existing "not for X" anti-vibe pattern); the verbatim manifesto form "decoration for its own sake" doesn't substring-match common rejection-form signals so isn't shipped here. Fires for Pill-and-Cushion because pill components are decorative softness — the most direct mapping target among COMP grammars given fixture phrasing. -->
- **Compositional intent:** *I want components to feel approachable* — *softness is the brand* — *I'm targeting users who want warmth*

## COMP-5. Sharp-Geometric (Editorial-Modernist)

- **Vibes:** *architectural* — *gallery* — *type-foundry feel* — *editorial precision* — *quiet rigor*
- **Brand exemplars:** *like Apartamento* — *like Cereal* — *like Stripe Press* — *like Klim Type Foundry*
- **Vernacular labels:** *hairline borders* — *sharp components* — *editorial UI* — *foundry-style components*
- **Anti-vibes:** *not soft* — *not rounded* — *not SaaS* — *not warm*
- **Compositional intent:** *components should feel architectural* — *typography should do the work* — *I want editorial discipline*

## COMP-6. Glass / Layered (Translucent-Atmospheric)

- **Vibes:** *Apple-coded* — *glassy* — *layered depth* — *premium consumer tech* — *atmospheric* — *frosted*
- **Brand exemplars:** *like Apple's product pages* — *like iOS interfaces* — *like Arc browser*
- **Vernacular labels:** *frosted glass* — *glassmorphism* — *backdrop blur* — *translucent UI* — *layered components*
- **Anti-vibes:** *not flat* — *not editorial* — *not heritage* — *not Material*
- **Compositional intent:** *I want depth and atmosphere* — *components should feel premium-digital* — *layering is part of the brand language*

## COMP-7. Maximalist-Decorative

- **Vibes:** *expressive components* — *creative agency* — *Y2K* — *handcrafted UI* — *sticker-style*
- **Brand exemplars:** *like Lush's components* — *like Starface* — *creative agency portfolio components*
- **Vernacular labels:** *custom components* — *decorative UI* — *sticker-style components* — *handcrafted UI* — *Y2K components*
- **Anti-vibes:** *not standard* — *not Material* — *not SaaS-coded* — *not template-y*
- **Compositional intent:** *components should be design elements* — *I want visible craft in every atom* — *the brand needs custom expression*

## COMP-8a. Application-Density (Mono-Density Application)

- **Vibes:** *dashboard components* — *information dense* — *power-user UI* — *workspace components*
- **Brand exemplars:** *like Stripe Dashboard* — *like Linear app* — *like GitHub* — *modern B2B applications*
- **Vernacular labels:** *dashboard components* — *dense UI* — *application UI* — *table-row components* — *grid-cell UI*
- **Anti-vibes:** *not for marketing* — *not generously-padded* — *not for casual users* — *not warm*
- **Compositional intent:** *the user is doing work* — *every pixel must serve information density* — *padding is wasted space*

## COMP-8b. Marketing-Density

- **Vibes:** *enterprise serious* — *technical-product marketing* — *dense but communicative* — *Bloomberg-coded*
- **Brand exemplars:** *like Bloomberg Terminal marketing* — *like Linear's developer-coded marketing pages* — *like Stripe's API page*
- **Vernacular labels:** *enterprise marketing* — *dense marketing* — *technical marketing*
- **Anti-vibes:** *not consumer-friendly* — *not warm* — *not airy* — *not application UI*
- **Compositional intent:** *I'm marketing to sophisticated users* — *density signals seriousness* — *the marketing surface should feel like the product*

---

# AXIS 5 — MOTION GRAMMAR ALTNAMES (REVISED)

## MOTION-1. Stillness as Discipline

- **Vibes:** *no animation* — *still* — *stillness* — *quiet luxury motion* — *unhurried* — *the page doesn't move*
- **Brand exemplars:** *like Aman's site* — *like Cheval Blanc* — *like Hermès editorial* — *gallery and museum sites*
- **Vernacular labels:** *no motion* — *static* — *stillness* — *no animations* — *no scroll triggers*
- **Anti-vibes:** *no fade-ins* — *no parallax* — *no spring animations* — *no scroll-jacking*
- **Compositional intent:** *I want stillness as the brand statement* — *no motion at all* — *the brand assumes the visitor will spend time*

## MOTION-2. Restrained-Atmospheric

- **Vibes:** *gentle motion* — *atmospheric* — *unhurried animation* — *editorial pacing* — *slow and considered*
- **Brand exemplars:** *like Soho House* — *like Apartamento* — *like Cereal* — *gallery sites with motion*
- **Vernacular labels:** *slow fade-ins* — *parallax hero* — *gentle motion* — *editorial motion* — *atmospheric scroll*
- **Anti-vibes:** *not punchy* — *not snappy* — *not SaaS-coded motion*
- **Compositional intent:** *the page should breathe but not perform* — *motion supports content, doesn't compete* — *I want elegance without energy*

## MOTION-3. Functional-Snappy

- **Vibes:** *fast feedback* — *modern product motion* — *Material-coded* — *responsive* — *snappy*
- **Brand exemplars:** *like Stripe* — *like Linear* — *every modern SaaS* — *Apple HIG-coded*
- **Vernacular labels:** *Material motion* — *200ms transitions* — *snappy hover* — *standard product motion* — *ease-out*
- **Anti-vibes:** *not slow* — *not editorial-paced* — *not punchy-discrete*
- **Compositional intent:** *motion should be invisible because it's correct* — *users feel responsiveness, not performance* — *I'm building a tool, motion is feedback*

## MOTION-4. Punchy-Discrete

- **Vibes:** *hard transitions* — *punchy* — *no easing* — *neo-brutalist motion* — *immediate state changes*
- **Brand exemplars:** *like Gumroad* — *like Around* — *neo-brutalist indie SaaS*
- **Vernacular labels:** *hard-cut motion* — *step animation* — *no easing* — *snap-to-position* — *brutalist motion*
- **Anti-vibes:** *not smooth* — *not eased* — *not premium-feeling motion*
- **Compositional intent:** *motion should announce itself* — *components should *jump*, not *glide** — *softness is wrong for this brand*

## MOTION-5. Scroll-Driven Cinematic

- **Vibes:** *cinematic* — *scroll-as-camera* — *Apple-launch energy* — *art-directed motion*
- **Brand exemplars:** *like Apple's product reveals* — *like an Awwwards Site of the Day* — *considered product launches*
- **Vernacular labels:** *scroll cinema* — *scroll-pinned sections* — *layered parallax* — *scroll-driven reveals* — *scrubbed animation*
- **Anti-vibes:** *not editorial* — *not standard scroll* — *not SaaS marketing*
- **Compositional intent:** *the launch is a moment, not a page* — *scroll is the playback control* — *each section deserves a directed reveal*

## MOTION-6. Scrollytelling Narrative

- **Vibes:** *journalism-coded* — *interactive story* — *NYT-style narrative* — *museum exhibition*
- **Brand exemplars:** *like NYT longform* — *like Pudding* — *like Bloomberg longform* — *museum digital exhibitions*
- **Vernacular labels:** *scrollytelling* — *sticky-media narrative* — *scroll-locked storytelling* — *narrative scroll*
- **Anti-vibes:** *not marketing* — *not a normal article* — *not a product launch*
- **Compositional intent:** *I have a story that unfolds* — *the user is being walked through, not scanning* — *content reveals are tied to narrative beats*

## MOTION-7. Kinetic-Expressive

- **Vibes:** *expressive motion* — *kinetic* — *type that moves* — *agency-coded motion* — *creator-coded*
- **Brand exemplars:** *like a type foundry showcase* — *like a creative agency portfolio* — *Awwwards Site of the Day*
- **Vernacular labels:** *kinetic typography* — *cursor-reactive* — *variable font animation* — *WebGL motion* — *expressive motion*
- **Anti-vibes:** *not standard* — *not SaaS-coded* — *not editorial-restrained*
- **Compositional intent:** *motion is the brand statement* — *I want visible craft in how things move* — *the medium is part of the message*

## MOTION-8. Atmospheric-Depth (NEW)

- **Vibes:** *Apple-depth* — *layered atmosphere* — *glass motion* — *subtle parallax depth*
- **Brand exemplars:** *like Apple's product pages* — *like iOS interfaces* — *like Arc browser*
- **Vernacular labels:** *depth motion* — *layered parallax* — *glass reveal* — *translucent depth* — *backdrop motion*
- **Anti-vibes:** *not flat* — *not editorial* — *not heritage*
- **Compositional intent:** *I want depth perception in the page* — *layered surfaces should feel atmospheric* — *translucency requires content underneath shifting*

## MOTION-9. Loading-and-Latency (NEW)

- **Vibes:** *loading states* — *waiting feedback* — *async UI* — *skeleton loaders*
- **Brand exemplars:** *like Linear's loading states* — *like GitHub's skeletons* — *like Stripe Dashboard's optimistic UI*
- **Vernacular labels:** *skeleton loaders* — *shimmer* — *loading states* — *progress indicators* — *optimistic UI* — *empty states*
- **Anti-vibes:** *not just spinners* — *not silent loading* — *not blocking UI*
- **Compositional intent:** *the user should never wonder if the page is broken* — *waiting is a designed state, not absence* — *feedback during latency is feedback during action*

---

# WHAT CHANGED, EXPLICITLY

The differences between Turn 4 (original) and Turn 4 (revised) are systematic:

**Brand exemplars** are now phrased as *"like [Brand]"* rather than *"[Brand] style"* — that's the actual phrasing people use in vibe-coding prompts. They reach for the comparison naturally; they don't use possessive-style.

**Vibe phrases** now include the working buzzwords from Lovable's documentation: *premium, sleek, cinematic, playful, calm and reassuring*. These are tested vocabulary that Lovable's model recognizes — by including them in the altnames, Palate routes through the same vocabulary the major vibe-coding tool already uses.

**Anti-vibes** now name the *exact AI defaults* called out in published critiques: *"Inter everywhere," "purple-to-blue gradients," "shadcn-default styling," "rounded-2xl on everything," "AI beige."* These are the specific complaints, not abstracted "not-X" formulations.

**Compositional intent** is now phrased as *"I want X"*, *"I'm building Y"*, *"make it feel Z"* — the actual sentence structures people use when starting a vibe-coding prompt. The previous version had me writing in essay voice; the new version sounds like the start of a real prompt.

**Some original altnames were removed** because they don't appear in real community vocabulary. For example, *"reading-room layout"* (which I had under Vertical-Rhythm Editorial in the original) is something I made up; nobody actually says that. *"Magazine-essay scroll"* same — designer-poetic, not user-real.

**Some new altnames were added** because the research surfaced phrases I hadn't included. *"AI beige"* is now in the spec as an anti-vibe. *"Shadcn-default styling"* is now an anti-vibe for Soft-Container System. *"Stripe purple gradients"* is now both a brand exemplar and a vernacular label, because it's used both ways.

---

*Turn 4 (revised) complete. The altnames are now grounded in authentic community vocabulary rather than designer abstraction. Routing-test discipline preserved.*

*Turn 5 next: Imagery and Density grammars, written with this revised altname voice from the start.*

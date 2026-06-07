# Phase 3 Integration Runbook

This runbook is the manual integration test for Phase 3 per PRD §7's done-criterion: "A real AI tool can call Palate via MCP and receive valid cards. Manual review of 5+ generated outputs confirms cards drive the AI tool away from default slop."

## Setup

1. Build the project: `npm run build`.
2. Register Palate as an MCP server in Claude Code (or Cursor) by adding to your client config:
   ```json
   "mcpServers": {
     "palate": {
       "command": "node",
       "args": ["/Users/omershaik/Desktop/Palate/dist/mcp/cli.js"]
     }
   }
   ```
   For development without the build, point at `tsx`:
   ```json
   "mcpServers": {
     "palate": {
       "command": "npx",
       "args": ["-y", "tsx", "/Users/omershaik/Desktop/Palate/src/mcp/cli.ts"]
     }
   }
   ```
3. Restart your MCP client.
4. Verify the server is reachable: in your client, ask the model to list available MCP tools; confirm `route`, `route_multi`, `validate`, `list_canonical`, `get_brand_fingerprint` appear under the `palate` server.

## How to run each brief

For each of the 6 briefs:

1. Open a fresh conversation in your MCP client.
2. Paste the brief text into a prompt asking the AI tool to build the described site.
3. The AI tool should call `palate.route(brief)` (or `palate.route_multi`). If it doesn't route on its own, prompt: "Use the palate MCP server to route this brief and use the returned card to guide the build."
4. After routing, ask the AI tool to generate one or more pages of HTML/CSS/JSX based on the card.
5. Inspect the AI tool's output against the per-brief pass criteria below.
6. Record the result (pass / fail / partial) with a short note on `docs/phase3-integration-results.md`.

## Pass / fail / partial framing

- **Pass:** AI tool's output observably differs from its default. Token values reflect the routed grammar (e.g., for canonical-1 Luxury Hospitality the output uses warm earth tones, serif display type, generous spacing — not the AI default of `bg-white` + `text-slate-900` + `rounded-md`). Components reflect the routed Component grammar (e.g., COMP-1 Typographic-Discreet renders text-as-affordance, not buttons). Voice reflects the routed Voice profile (e.g., VOICE-1 Quiet Authority avoids superlatives and exclamation points). Anti-patterns visibly avoided ("Build the future of" / "unlock" don't appear in conversion-coded output).
- **Fail:** Output looks indistinguishable from the AI tool's default for the same brief without Palate. The card was returned but the AI tool didn't act on it, or the card content was generic enough not to matter.
- **Partial:** Some card aspects visible (e.g., color tokens applied), others not (e.g., voice guidelines ignored). Likely common for v0.1; honest framing.

## Brief 1 — Canonical-aligned (happy path)

**Brief text** (paste this into the AI tool):

> Build me a luxury hotel website like Aman. Single brand site, hero / rooms / dining / spa / contact. The vibe is restrained — generous whitespace, serif display type, low-saturation warm-earth photography of interiors. The voice should sell by not selling — no "book now" urgency, just an enquiry CTA. Editorial photography of the property, no stock travel shots.

**Expected routing:**
- Canonical: `Luxury Hospitality` (canonical-1)
- Layout: LAYOUT-1 (Vertical-Rhythm Editorial) or LAYOUT-2 (Editorial-Grid Magazine)
- Typography: TYPE-1 (Two-Hand System) — serif display + sans body
- Color: COLOR-1 (Earth-Pulled Restraint, Warm-Matte Earth substyle)
- Component: COMP-1 (Typographic-Discreet)
- Motion: MOTION-1 (Stillness as Discipline) or MOTION-2 (Restrained-Atmospheric)
- Imagery: IMG-1 (Editorial Photography)
- Density: DEN-1 (Editorial-Spacious)
- Voice: VOICE-1 (Quiet Authority)
- Reading-Pattern: RP-1 (Gutenberg) or RP-3 (F-pattern with Gutenberg sections)

**What the card should contain:**
- `card.tokens.color["bg.canvas"]` ≈ warm off-white (#f5f0e6 or similar)
- `card.tokens.color["fg.body"]` ≈ deep brown / near-black (#2a1f15 or similar) — NOT pure black
- `card.tokens.typography.font_family.display` includes Tiempos / serif — NOT system-ui
- `card.tokens.spacing["lg"]` = 64px or 48px — generous
- `card.components.button.variants.primary.token_refs.bg` = "transparent" (Typographic-Discreet collapses primary onto tertiary text-link)
- `card.voice_guidelines.do_not_use` includes "superlatives" / "promotional framing"
- `card.anti_patterns` includes "Avoid promotional language entirely; luxury voice sells by NOT selling."

**Pass criteria for this brief:**
- AI tool's HTML/CSS uses serif display type for hero headings (NOT Inter)
- Background is warm off-white, body text is deep warm-grey/brown (NOT pure white + pure black)
- No "Book now" CTA; output uses "Enquire" / "Plan your stay" or a similar restrained framing
- Buttons are styled as text-with-underline or bordered-word, NOT filled rectangles
- Generous whitespace (sections are visually distant, not packed)

This is the cleanest happy-path test — Aman is canonical-1's primary brand exemplar; the brief speaks the canonical's vocabulary directly.

## Brief 2 — Sparse signal (low-signal handling)

**Brief text:**

> Build me a website. Make it nice.

**Expected routing:**
- Routing engine surfaces `brief_too_ambiguous` warning (signal density < 2)
- Canonical match suppressed (`canonical_match: null`) per the route signal-density gate
- Card returns AI defaults across most axes: LAYOUT-4a (Conversion-Stack), TYPE-5 (Geometric-Modernist), COLOR-8a (Marketing Single-Accent), COMP-2 (Soft-Container), MOTION-3 (Functional-Snappy), IMG-7 (Stock Photography), DEN-3 (Standard-Marketing), VOICE-7 (Conversion-Punchy), RP-2 (Z-Pattern)

**What the card should contain:**
- `result.canonical_match` = null
- `result.canonical_match_confidence` = 0
- `result.open_warnings` includes a `brief_too_ambiguous` conflict-severity warning
- `card.metadata.confidence` is at the AI-default floor (0.1)

**Pass criteria for this brief:**
- AI tool surfaces the `brief_too_ambiguous` warning to the user — asks for a clarifying question rather than committing to an arbitrary canonical
- If AI tool generates code anyway, the output should be the AI default (not pretending to a register the brief didn't invoke)
- The brief-too-ambiguous signal works as a UX feature, not a failure mode

This tests the route-level signal-density gate (Phase 2 / src/routing/route.ts MIN_SIGNAL_DENSITY_FOR_CONFIDENT_ROUTING = 2). A pass here means Palate refuses to fabricate confidence on sparse briefs; a fail means it commits silently to canonical-1 (Luxury Hospitality wins iteration order on all-AI-default routing per the architectural pattern entry 8 collapse).

## Brief 3 — Anti-vibe (rejection-driven routing)

**Brief text:**

> I'm building a personal essay site for long-form writing. The audience is engaged readers who'll spend 20+ minutes per piece. NO marketing-copy register — this is essays, not landing pages. NO "Build the future of" hero, NO conversion CTAs, NO Inter-everywhere typography, NO purple-blue gradients. The vibe is closer to Stripe Press or Substack than to a YC-startup landing page. Drop caps, generous spacing, restrained motion (no parallax). The reading experience IS the product.

**Expected routing:**
- Canonical: `Editorial Long-Form (Substack / Stripe Press)` (canonical-10) or possibly `Plain Document (Paul Graham Tier)` (canonical-15)
- Layout: LAYOUT-4c (Long-Form Stack) or LAYOUT-8 (Document/Prose)
- Typography: TYPE-1 (Two-Hand) or TYPE-3 (Editorial Print)
- Color: COLOR-3 (Restrained-Editorial-Earth)
- Component: COMP-5 (Sharp-Geometric) or COMP-1 (Typographic-Discreet)
- Motion: MOTION-1 (Stillness) or MOTION-2 (Restrained-Atmospheric)
- Imagery: IMG-1 (Editorial Photography) or no imagery
- Voice: VOICE-2 (Editorial Considered)
- Reading-Pattern: RP-3 (F-Pattern with Gutenberg) or RP-1

**Anti-vibe handling expected:**
- TYPE-5 (Geometric-Modernist Inter-coded) ELIMINATED via "no Inter everywhere"
- COLOR-7 (Iridescent purple-blue gradient) ELIMINATED via "no purple-blue gradients"
- MOTION-5 (Scroll-Driven Cinematic / parallax) ELIMINATED via "no parallax"
- VOICE-7 (Conversion-Punchy "Build the future of") ELIMINATED via the explicit anti-vibe phrase

**Pass criteria for this brief:**
- AI tool's output uses serif display + drops Inter ENTIRELY (verify in the generated CSS — no `font-family: Inter`)
- No purple-to-blue gradients in any backgrounds or hero sections
- No `transform: translateY(...)` parallax-coded scroll handlers
- Hero copy is editorial / essay-coded, NOT "Build the future of personal essays" or similar slop
- `card.anti_patterns` shows the routed grammars' anti-vibes transformed (per Phase 3 Task 4 transformation): "Avoid Inter across every level" / "Avoid purple-to-blue gradient backgrounds" / etc.

This tests Phase 2.1a Task 1's anti-vibe altname work end-to-end at the card level — the spec amendments shipping the right altnames, the engine eliminating correctly, the card surfacing the rejection as actionable directives.

## Brief 4 — Brand-fanout (multi-surface brand without surface qualifier)

**Brief text:**

> Build me a SaaS marketing landing page like Stripe. Modern, conversion-focused, single-accent palette, hero with three-column features and pricing CTA.

**Expected routing:**
- Brief invokes "Stripe" without surface qualifier — triggers brand-fanout pattern (architectural pattern entry 7)
- Stripe matches across multiple grammars per axis (TYPE-2 Stripe Press, TYPE-5 stripe.com marketing; COLOR-7 Stripe announcements, COLOR-8a Stripe purple; VOICE-2 Stripe Press, VOICE-3 Stripe support, VOICE-7 stripe.com marketing; etc.)
- Canonical match likely: canonical-4 (Standard SaaS Marketing) — Phase 2.1b Task 6b's "Webflow template" amendment + brief signals push toward canonical-4
- Per-axis picks may NOT all align with canonical-4's primaries due to fanout (the brand-fanout-in-card-output observation from coverage-notes entry 13)

**What to look for:**
- `result.canonical_match` = "Standard SaaS Marketing" (likely)
- `card.metadata.confidence` will reflect the per-axis variance (some axes route to canonical-3 or other Stripe-fanout targets, dropping min-of-axes)
- Voice may route to VOICE-3 (Friendly Expert via Stripe support altname) instead of VOICE-7 (Conversion-Punchy via stripe.com marketing) — coverage-notes entry 13's observation
- Or `routing_ambiguous: true` warning if top-1 vs top-2 tie at overlap+directMatch

**Pass criteria for this brief:**
- Card returns AND is internally coherent (the routed picks consistent with each other within whatever canonical the engine selects)
- AI tool's output differs from default — single-accent palette, conversion-focused copy
- If the canonical_match doesn't precisely match expected, the card's actual routed picks are still better than the AI default (this is a partial-pass case worth flagging)

This tests how the brand-fanout pattern manifests in real card output — confirms the architectural pattern entry 7 behavior is observable from the user's perspective (and properly documented as a v0.2 fix path, not a Phase 3 bug).

## Brief 5 — Tombstone hit (documented but not fingerprinted)

**Brief text:**

> Build me a brand site for an indie editorial publication, like Cereal Magazine. Editorial typography, generous spacing, considered photography, no SaaS-marketing chrome. The site is the product — readers come for the writing, not for newsletter signups.

**Expected routing:**
- Canonical: canonical-2 (Editorial Magazine) or canonical-10 (Editorial Long-Form)
- AI tool may also call `palate.get_brand_fingerprint("cereal")` if it tries to look up Cereal's actual visual fingerprint

**What the card should contain:**
- Editorial-canonical routing (typography, spacing, voice, etc.)
- If `get_brand_fingerprint("cereal")` is called: returns the tombstone with `fingerprint_status: "documented_unfingerprinted"` + `fallback_guidance: "Treat as editorial-canonical reference; routing-equivalent to canonical-2 (Editorial Magazine) or canonical-10 (Editorial Long-Form) defaults."`

**Pass criteria for this brief:**
- AI tool's output is editorial-coded (serif typography, generous spacing, considered photography)
- If the AI tool calls `get_brand_fingerprint("cereal")`, it correctly interprets the tombstone — uses the fallback_guidance to route, doesn't fabricate "Cereal magazine colors" data, doesn't error on the tombstone shape

This tests Phase 3 Task 9's tombstone path at the consumer level — confirms documented gaps don't fail silently or get fabricated around.

## Brief 6 — Free-form (real project work)

**Brief text:** *[fill in with a real brief from a project you're actually working on, before running the test]*

> [Your free-form description here]

**Expected routing:** *[determined after seeing the brief]*

**Pass criteria:**
- Card return drives observable improvement over the AI tool's default for THIS specific brief
- The improvement is meaningful enough that you'd choose to use Palate again on the next real project
- The brief's actual nature surfaces something that the synthetic Briefs 1-5 don't

This is the most diagnostic test — fixture-shaped briefs are easy to design for; real-project briefs surface what actually matters.

## Reporting

After running all 6 briefs, record results in `docs/phase3-integration-results.md` with this shape per brief:

```markdown
## Brief N — [name]

**Result:** Pass / Fail / Partial

**What was visible:**
- ...

**What wasn't:**
- ...

**Notes:**
- ...
```

Capture:
1. Whether the AI tool actually called `palate.route` (or had to be prompted to do so)
2. Which axes' guidance was visible in the output and which weren't
3. Whether the output observably differed from the AI tool's default-without-Palate
4. Any new issues discovered (NOT in the documented 32 v0.1 limitations) — these go to v0.2 backlog rather than getting fixed mid-Phase-3

## Outcome interpretation

- **6/6 pass:** Phase 3 ships with strong confidence; PRD §7 done-criterion met cleanly.
- **4-5/6 pass:** Phase 3 ships; partials documented as v0.1 known behavior. Common outcome for v0.1.
- **<4/6 pass:** Surface as scope question — Phase 3 needs another sub-task before close, OR re-evaluate done-criterion.

The expectation is "≥4/6 pass with honest partial-mode flagging on the rest"; 6/6 would be exceptional for a v0.1 of a system this complex.

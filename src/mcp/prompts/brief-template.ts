// src/mcp/prompts/brief-template.ts
//
// Phase 3 Task 8 — `brief-template` prompt content.
//
// The prompt teaches consuming AI tools to produce signals matching
// the engine's 8 ExtractedSignals categories (NOT just 5 altname
// buckets — Stage 1 also extracts domain / functional_context /
// audience_signals per Turn 8 §5.1.1). The signal-density guidance
// + brand-fanout flag turn the prompt from "input form" into "input
// form that helps users avoid known v0.1 limitations" (entry 7
// brand-surface conflation).
//
// The prompt uses a single argument {user_description}; the
// consuming AI tool fills it from the user's free-form site
// description before calling palate.route.

/**
 * Render the brief-template prompt body. Phase 3 Task 8: a single
 * `user_description` argument (per the manifest); the function
 * embeds the description inside the structural prompt the consuming
 * AI tool follows.
 *
 * Returns the rendered prompt as a string. The MCP server wraps
 * this in the GetPromptResult message shape at request time.
 */
export function renderBriefTemplatePrompt(userDescription: string): string {
  return `You're constructing a structured design brief for the Palate MCP server. Palate routes briefs to a coherent design grammar combination across 9 axes (layout, typography, color, component, motion, imagery, density, voice, reading-pattern).

User's free-form description:
${userDescription}

Reformulate this into the 8 signal categories Palate's routing engine consumes. Use 0-N short phrases per category — empty arrays are correct where the user didn't speak to that category. Don't invent signals to fill empty buckets.

- domain: vertical or industry. e.g., "luxury hospitality", "B2B SaaS", "editorial publishing", "consumer hardware", "wellness DTC".
- functional_context: page type or surface. e.g., "marketing landing page", "dashboard application", "long-form article", "product detail page".
- audience_signals: who the page is for. e.g., "first-time visitors", "engaged readers", "B2B technical buyers".
- vibes: short feeling phrases. e.g., "premium and restrained", "warm and inviting", "energetic and playful".
- brand_exemplars: specific brand references with surface qualifier where ambiguous. e.g., "like Stripe's marketing", "like Apple's iOS app", "like Aman's brand site". Brand exemplars carry the highest signal weight (0.9), but multi-surface brands without surface qualifiers can fan out across grammars — prefer surface-qualified mentions over bare brand names.
- vernacular: designer / builder shorthand the user invoked. e.g., "editorial typography", "bento grid", "single-accent palette", "frosted glass", "scrollytelling".
- anti_vibes: explicit rejections. e.g., "not SaaS-y", "no purple-blue gradients", "not corporate-feeling", "no Inter everywhere". Anti-vibes ELIMINATE grammars rather than weight against them; use sparingly and only where the user is genuinely rejecting something.
- compositional_intent: design problems and feel-statements in the user's own voice. Mix of feel-shaped ("expensive but not loud", "made by a person", "should feel like it matters") and problem-shaped ("homepage needs to load fast on slow connections", "editorial pieces should feel readable on a phone for 20+ minutes", "the brand site should sell membership without selling").

Signal-density guidance:
- 4-8 total signals across all categories tends to produce confident routing.
- Below 3 total signals: the engine has too little to differentiate; routing leans on AI defaults (Conversion-Stack layout, Geometric-Modernist typography, Marketing Single-Accent color, etc.). The card output will reflect this with low canonical_match_confidence.
- Above 12 total signals across multiple categories: risk of contradictory signals producing routing conflicts. The engine surfaces these via open_warnings (severity: conflict).
- Brand exemplars are the strongest signal type (weight 0.9). Prefer 1-2 well-chosen brands over many vague ones. Surface-qualify multi-surface brands (Stripe / Apple / Linear) to avoid the brand-fanout pattern documented in altname-coverage-notes entry 13.

Return the 8 categories as a JSON object matching this shape:

{
  "domain": [],
  "functional_context": [],
  "audience_signals": [],
  "vibes": [],
  "brand_exemplars": [],
  "vernacular": [],
  "anti_vibes": [],
  "compositional_intent": []
}

The MCP \`route\` tool accepts a free-form brief string; you can either pass the raw user description (deterministic Stage 1 will extract signals) or embed this structured object in the brief for higher routing accuracy. The structured form is preferred when the user's description is ambiguous or below the 3-signal floor.`;
}

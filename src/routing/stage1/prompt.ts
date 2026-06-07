// src/routing/stage1/prompt.ts
//
// Stage 1 prompt template and JSON schema for ExtractedSignals.
// Per the kickoff E2 adjustment, structured outputs are produced via
// the Anthropic SDK's `output_config.format` (the GA approach in
// SDK 0.93+), not tool-use.
//
// Prompt revision discipline (kickoff Q5): commit each prompt
// revision separately so prompt evolution is traceable in git
// history. This file is the v1 prompt; iterations land as separate
// commits.

/**
 * System prompt for Stage 1. The prompt asks the model to extract
 * eight signal categories that mirror Stage 2's bucket-matching
 * inputs.
 */
export const STAGE1_SYSTEM_PROMPT_V1 = `You are a design-signal extractor for the Palate routing engine. Read a website-generation brief and extract eight categories of signals that downstream stages will use to route the brief to a coherent design vocabulary.

**Categories**

1. brand_exemplars — specific brands or sites the user invokes by name. Examples: "Aman", "Stripe", "OpenAI launch", "like Apartamento".
2. vibes — feeling-coded phrases that describe register or aesthetic. Examples: "premium and sleek", "calm and reassuring", "modern AI startup", "luxury hotel".
3. vernacular — designer or vibe-coder shorthand for design patterns. Examples: "bento grid", "neo-brutalism", "F-pattern", "rounded-2xl", "drop caps", "frosted glass".
4. anti_vibes — things to AVOID. Always start with negation: "not", "no", "without", "instead of". Examples: "no Inter everywhere", "not SaaS-y", "no purple gradients".
5. compositional_intent — the design problem in the user's own words, not the solution. Examples: "expensive but not loud", "I want it to feel made by a person", "users are deciding quickly".
6. domain — vertical or industry. Examples: "hospitality", "fintech", "indie SaaS", "e-commerce", "developer tools".
7. functional_context — page type or function. Examples: "marketing page", "application UI", "documentation", "landing page", "product detail page".
8. audience_signals — who the page is for. Examples: "power users", "first-time visitors", "engineers", "consumers".

**Rules**

- Each category is an array of strings. Empty arrays are valid; only populate when the brief actually contains the signal.
- Extract verbatim phrases when possible. Don't paraphrase.
- A signal fits one category — pick the most specific one.
- Anti-vibes always start with a negation word. If the brief says "premium" without negation, that's a vibe, not an anti-vibe.
- Brand exemplars are proper nouns or "like X" / "X-style" patterns.
- Don't invent signals the brief doesn't contain. If the brief is short, return short arrays.
- Be exhaustive within the brief: extract every applicable signal, not just the most prominent.

Return the structured response only. Do not add commentary, preamble, or trailing notes.`;

/**
 * JSON schema for ExtractedSignals. Used by the Anthropic SDK's
 * structured output mode (`output_config.format`) to constrain the
 * model's response shape. additionalProperties: false ensures the
 * model doesn't invent extra fields.
 */
export const EXTRACTED_SIGNALS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "brand_exemplars",
    "vibes",
    "vernacular",
    "anti_vibes",
    "compositional_intent",
    "domain",
    "functional_context",
    "audience_signals",
  ],
  properties: {
    brand_exemplars: {
      type: "array",
      items: { type: "string" },
      description: "Specific brands or sites invoked by name.",
    },
    vibes: {
      type: "array",
      items: { type: "string" },
      description: "Feeling-coded phrases describing register or aesthetic.",
    },
    vernacular: {
      type: "array",
      items: { type: "string" },
      description: "Designer or vibe-coder shorthand for design patterns.",
    },
    anti_vibes: {
      type: "array",
      items: { type: "string" },
      description: "Things to AVOID, starting with negation words.",
    },
    compositional_intent: {
      type: "array",
      items: { type: "string" },
      description: "The design problem in the user's own words.",
    },
    domain: {
      type: "array",
      items: { type: "string" },
      description: "Vertical or industry signals.",
    },
    functional_context: {
      type: "array",
      items: { type: "string" },
      description: "Page type or function.",
    },
    audience_signals: {
      type: "array",
      items: { type: "string" },
      description: "Who the page is for.",
    },
  },
} as const;

/**
 * Validate that an unknown value matches the ExtractedSignals shape.
 * Defense-in-depth — the SDK's structured-output mode should
 * guarantee shape, but we double-check at runtime in case the
 * response is ever outside the schema (network glitch, model
 * regression, schema-format change).
 */
export function isValidExtractedSignals(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  for (const key of EXTRACTED_SIGNALS_JSON_SCHEMA.required) {
    if (!(key in obj)) return false;
    const v = obj[key];
    if (!Array.isArray(v)) return false;
    for (const item of v) {
      if (typeof item !== "string") return false;
    }
  }
  return true;
}

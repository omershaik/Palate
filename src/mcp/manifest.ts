// src/mcp/manifest.ts
//
// Phase 3 Task 6 — MCP server manifest. Locks the full tool +
// resource + prompt surface BEFORE per-tool implementations land.
// Per the Task 6 review: without a locked manifest, individual tool
// implementations risk inconsistent parameter shapes or return types,
// which surfaces when consuming AI tools try to use them.
//
// Tasks 7-9 implement against this manifest mechanically — the
// contract is fixed here.
//
// MCP convention: tool / resource / prompt definitions use JSON
// Schema for parameter types. We author JSON Schema literal objects
// directly rather than introducing Zod into our source code, since
// the SDK's lower-level Server class accepts JSON Schema directly
// and our codebase otherwise has no Zod usage.
//
// Tool naming: snake_case, no `palate.` prefix (the prefix was a
// turn-9-spec artifact — actual MCP tool names within a server don't
// need a server prefix because the server name itself disambiguates
// at the protocol level).
//
// Source: spec/turns/palate-grammar-survey-v0.2-turn9-synthesis.md
// §5.1 (server primitives) and turn8 §5.3 (routing-output schema).

// ---------------------------------------------------------------------------
// Tool manifest
// ---------------------------------------------------------------------------

/**
 * One tool's metadata + JSON Schema. Implementations live in
 * src/mcp/tools/*.ts (Task 7); this declares the contract.
 *
 * The `inputSchema` is a JSON Schema object the MCP client uses to
 * validate / structure tool calls. We use plain JSON Schema literals
 * here rather than Zod for dependency leanness; the SDK's Server class
 * accepts JSON Schema directly via the lower-level setRequestHandler
 * API.
 */
export interface ToolManifestEntry {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, JsonSchemaProp>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

interface JsonSchemaProp {
  type: "string" | "number" | "boolean" | "object" | "array" | "null";
  description?: string;
  enum?: string[];
  items?: JsonSchemaProp;
  properties?: Record<string, JsonSchemaProp>;
  required?: string[];
  additionalProperties?: boolean;
}

export const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: "route",
    description:
      "Route a natural-language brief to a single Palate Card. Returns the routed combination's design tokens, component recipes, voice guidelines, anti-patterns, and accessibility commitments. Use this as the primary entry point for vibe-coder briefs.",
    inputSchema: {
      type: "object",
      properties: {
        brief: {
          type: "string",
          description:
            "Natural-language brief describing the desired site or page (e.g., 'Build me a luxury hotel website like Aman, with restrained motion and editorial typography'). Brief should include at minimum a vibe or brand exemplar; very short briefs may produce low-confidence routing.",
        },
      },
      required: ["brief"],
      additionalProperties: false,
    },
  },
  {
    name: "route_multi",
    description:
      "Route a brief that may span multiple pages, returning one Card per page. v0.1 ships per-page card routing only — multi-page consistency (linked cards) is v0.2 work; this tool currently returns a single-card array for compatibility with the v0.2 contract.",
    inputSchema: {
      type: "object",
      properties: {
        brief: {
          type: "string",
          description: "Same brief format as `route`.",
        },
      },
      required: ["brief"],
      additionalProperties: false,
    },
  },
  {
    name: "validate",
    description:
      "Check an explicit per-axis grammar combination for coherence. Returns a verdict identifying broken-combination conflicts (e.g., a Cinematic-Motion + Hyper-Density pairing is broken per Turn 8 §2). Use this when a consuming AI tool wants to verify a hand-picked combination before generating against it.",
    inputSchema: {
      type: "object",
      properties: {
        combination: {
          type: "object",
          description:
            "An explicit axis combination as a record of axis → grammar id (e.g., { layout: 'LAYOUT-1', typography: 'TYPE-3', ... }). Must specify all 9 axes. Voice may be a profile id (e.g., 'VOICE-2') or a dimensional coordinate object.",
          properties: {
            layout: { type: "string", description: "Layout grammar id (e.g., LAYOUT-1)" },
            typography: { type: "string", description: "Typography grammar id" },
            color: { type: "string", description: "Color grammar id" },
            component: { type: "string", description: "Component grammar id" },
            motion: { type: "string", description: "Motion grammar id" },
            imagery: { type: "string", description: "Imagery grammar id" },
            density: { type: "string", description: "Density grammar id" },
            voice: { type: "string", description: "Voice profile id (e.g., VOICE-1)" },
            reading_pattern: { type: "string", description: "Reading-pattern grammar id" },
          },
          required: [
            "layout",
            "typography",
            "color",
            "component",
            "motion",
            "imagery",
            "density",
            "voice",
            "reading_pattern",
          ],
          additionalProperties: false,
        },
      },
      required: ["combination"],
      additionalProperties: false,
    },
  },
  {
    name: "list_canonical",
    description:
      "List the 15 canonical combinations Palate ships in v0.1. Each canonical names a recognizable register (Luxury Hospitality, Modern AI Startup, Editorial Long-Form, etc.) with its full per-axis grammar set. Use this for menu UIs that let users pick a starting register, or for documentation.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_brand_fingerprint",
    description:
      "Look up the current visual + voice fingerprint for a named brand exemplar. Returns hex codes, font families, voice dimensional coordinates, and a `last_verified` date. v0.1 ships ~15 brands hand-populated; the Phase 4 re-derivation worker keeps fingerprints fresh from v0.1.1+.",
    inputSchema: {
      type: "object",
      properties: {
        brand: {
          type: "string",
          description:
            "Brand identifier (lowercase slug, e.g., 'stripe', 'apple', 'soho-house'). Use list_brand_fingerprints (v0.2) for a directory; v0.1 callers should match against the corpus's known brand set.",
        },
      },
      required: ["brand"],
      additionalProperties: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Resource manifest
// ---------------------------------------------------------------------------

/**
 * One resource URI's metadata + handler binding. Implementations
 * (read callbacks) live in src/mcp/resources/*.ts (Task 8); this
 * declares the URI patterns and human-readable descriptions.
 *
 * For URI templates (e.g., `palate://spec/grammars/{axis}`), the
 * MCP server registers a ResourceTemplate; for fixed URIs, a static
 * Resource. This manifest documents both.
 */
export interface ResourceManifestEntry {
  /** Canonical URI or URI template (e.g., 'palate://spec/grammars/{axis}'). */
  uriPattern: string;
  /** Human-readable name shown in MCP client UIs. */
  name: string;
  /** Description shown in MCP client UIs. */
  description: string;
  /** MIME type the resource returns. v0.1 uses application/json everywhere. */
  mimeType: "application/json";
  /** Whether this is a template (with parameters) or a static URI. */
  templated: boolean;
}

export const RESOURCE_MANIFEST: ResourceManifestEntry[] = [
  {
    uriPattern: "palate://spec/grammars/{axis}",
    name: "Axis grammars",
    description:
      "Full grammar definitions for one axis (layout, typography, color, component, motion, imagery, density, voice, reading_pattern). Returns the spec's structural shape: each grammar's definition, distinguishing edge, substyles, canonical examples, internal logic, registers it hosts/resists, failure mode, and altname buckets.",
    mimeType: "application/json",
    templated: true,
  },
  {
    uriPattern: "palate://spec/compatibility-model",
    name: "Compatibility model",
    description:
      "The 22 broken-combinations table + routing rules (Turn 8 §2 + §5.1). Consuming AI tools use this to validate combinations they generate against the spec's coherence boundaries.",
    mimeType: "application/json",
    templated: false,
  },
  {
    uriPattern: "palate://spec/canonical-combinations",
    name: "Canonical combinations",
    description:
      "The 15 canonical combinations with full per-axis grammar sets (same data as the list_canonical tool, exposed as a resource for clients that prefer URI access).",
    mimeType: "application/json",
    templated: false,
  },
  {
    uriPattern: "palate://spec/brand-fingerprints",
    name: "Brand fingerprints",
    description:
      "Current visual + voice fingerprints for all named brand exemplars. v0.1 ships ~15 hand-populated brands; the Phase 4 worker maintains the file.",
    mimeType: "application/json",
    templated: false,
  },
  {
    uriPattern: "palate://spec/altnames/{bucket}",
    name: "Altname blocks",
    description:
      "Altname blocks per axis per bucket. Bucket can be: vibes, brand_exemplars, vernacular, anti_vibes, compositional_intent. Returns the cross-axis collection of altnames in that bucket — useful for AI tools that want to walk the entry vocabulary.",
    mimeType: "application/json",
    templated: true,
  },
];

// ---------------------------------------------------------------------------
// Prompt manifest
// ---------------------------------------------------------------------------

/**
 * Prompt template that helps consuming AI tools structure briefs
 * before passing them to `route`. The actual prompt text is rendered
 * at request time (Task 8).
 */
export interface PromptManifestEntry {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export const PROMPT_MANIFEST: PromptManifestEntry[] = [
  {
    name: "brief-template",
    description:
      "Structured prompt template that helps an AI tool extract clean signals (brand exemplars, vibes, vernacular labels, anti-vibes, compositional intent) from a user's free-form site description before passing it to the route tool. Yields better routing accuracy than raw natural-language briefs.",
    arguments: [
      {
        name: "user_description",
        description:
          "The user's free-form description of the site / page they want to build. The template will reformulate this into the five-bucket signal structure that Stage 1 expects.",
        required: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Server metadata
// ---------------------------------------------------------------------------

export const SERVER_METADATA = {
  /** Server name advertised to MCP clients. */
  name: "palate",
  /** Server version — synchronized with package.json on build. */
  version: "0.1.0-pre",
  /** Brief description shown in MCP client server-listing UIs. */
  description:
    "Palate gives AI coding tools a structured design vocabulary, so they generate sites in named registers (Luxury Hospitality, Modern AI Startup, Editorial Long-Form) instead of AI-default monoculture.",
} as const;

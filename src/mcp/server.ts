// src/mcp/server.ts
//
// Phase 3 Task 6 — MCP server scaffolding. Constructs the SDK Server,
// registers handlers for the locked manifest (src/mcp/manifest.ts),
// and connects via stdio transport (the v0.1 default per PRD §4.2).
// HTTP transport is stubbed but not productionized — auth, rate
// limiting, deployment stay v0.2+.
//
// Task 6 scope: server runs end-to-end, MCP clients can list tools /
// resources / prompts, and ONE stub tool (`list_canonical`) responds
// with real data. Tasks 7-9 fill the remaining tool implementations
// + resource read callbacks + the brief-template prompt.
//
// The lower-level Server class is used (rather than the higher-level
// McpServer class) because (a) JSON Schema authoring works directly
// with the protocol types, (b) avoids pulling Zod into our source
// files (it's a transitive dep already, but staying lean). Trade-off:
// slightly more boilerplate in dispatch code, gained predictability
// in our schema layer.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { Corpus } from "../types/corpus.js";
import {
  PROMPT_MANIFEST,
  RESOURCE_MANIFEST,
  SERVER_METADATA,
  TOOL_MANIFEST,
} from "./manifest.js";
import { callRoute } from "./tools/route.js";
import { callRouteMulti } from "./tools/route-multi.js";
import { callValidate } from "./tools/validate.js";
import { callGetBrandFingerprint } from "./tools/get-brand-fingerprint.js";
import { readResource } from "./resources/index.js";
import { renderPrompt } from "./prompts/index.js";

export interface PalateServerOptions {
  corpus: Corpus;
  /**
   * Server version string. Defaults to SERVER_METADATA.version.
   * The CLI populates this from package.json so npm publish + bin
   * invocations report a synchronized version to MCP clients.
   */
  version?: string;
}

/**
 * Build (but do not connect) a Palate MCP server. The caller
 * connects to a transport via `connectStdio(server)` or the future
 * `connectHttp(server, ...)` helper.
 *
 * Returns the Server instance so caller can attach additional
 * handlers if needed (e.g., test harnesses).
 */
export function createPalateServer(options: PalateServerOptions): Server {
  const version = options.version ?? SERVER_METADATA.version;
  const server = new Server(
    {
      name: SERVER_METADATA.name,
      version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      instructions: SERVER_METADATA.description,
    },
  );

  // -------------------------------------------------------------------------
  // Tools — list + call
  // -------------------------------------------------------------------------

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_MANIFEST.map((entry) => ({
      name: entry.name,
      description: entry.description,
      inputSchema: entry.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Phase 3 Task 7: all 5 tools implemented. Task 6's stub
    // `list_canonical` stays inline; the other 4 dispatch to
    // src/mcp/tools/*.ts modules.
    switch (name) {
      case "route":
        return await callRoute(options.corpus, args);

      case "route_multi":
        return await callRouteMulti(options.corpus, args);

      case "validate":
        return await callValidate(options.corpus, args);

      case "list_canonical":
        return await callListCanonical(options.corpus);

      case "get_brand_fingerprint":
        return await callGetBrandFingerprint(options.corpus, args);

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: '${name}'. Available tools: ${TOOL_MANIFEST.map((t) => t.name).join(", ")}.`,
            },
          ],
          isError: true,
        };
    }
  });

  // -------------------------------------------------------------------------
  // Resources — list, list-templates, read
  // -------------------------------------------------------------------------

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: RESOURCE_MANIFEST.filter((r) => !r.templated).map((entry) => ({
      uri: entry.uriPattern,
      name: entry.name,
      description: entry.description,
      mimeType: entry.mimeType,
    })),
  }));

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: RESOURCE_MANIFEST.filter((r) => r.templated).map(
      (entry) => ({
        uriTemplate: entry.uriPattern,
        name: entry.name,
        description: entry.description,
        mimeType: entry.mimeType,
      }),
    ),
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    // Cast widens to the SDK's ServerResult union (the SDK's strict
    // typing of new task-based protocol fields trips up plain
    // structural matches; the runtime shape is correct).
    return readResource(options.corpus, request.params.uri) as never;
  });

  // -------------------------------------------------------------------------
  // Prompts — list + get
  // -------------------------------------------------------------------------

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: PROMPT_MANIFEST.map((entry) => ({
      name: entry.name,
      description: entry.description,
      arguments: entry.arguments,
    })),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    return renderPrompt(request.params.name, request.params.arguments) as never;
  });

  return server;
}

// ---------------------------------------------------------------------------
// Stub tool implementation: list_canonical
// ---------------------------------------------------------------------------

/**
 * Phase 3 Task 6 stub tool. Verifies the server is end-to-end
 * reachable and that the corpus is accessible from the tool dispatch
 * layer. Real implementation: returns the 15 canonical combinations
 * with their per-axis grammar sets.
 *
 * The data is the corpus's `canonical_combinations` array, serialized
 * to a structured response. Tasks 7-9 follow this pattern for the
 * remaining tools / resources / prompts.
 */
async function callListCanonical(corpus: Corpus): Promise<{
  content: Array<{ type: "text"; text: string }>;
}> {
  const canonicals = corpus.canonical_combinations.map((c) => ({
    id: c.id,
    name: c.name,
    axis_mappings: c.axis_mappings,
    axis_alternatives: c.axis_alternatives ?? {},
    brand_exemplars: c.brand_exemplars,
  }));

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            count: canonicals.length,
            canonicals,
          },
          null,
          2,
        ),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Transport helpers
// ---------------------------------------------------------------------------

/**
 * Connect a Palate server to stdio transport — the v0.1 default for
 * local AI tools (Claude Code, Cursor running locally). Blocks until
 * the transport closes.
 */
export async function connectStdio(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * Phase 3 Task 6 / PRD §4.2 — HTTP transport stub. v0.1 ships this as
 * a placeholder per PRD guidance ("Build the stdio transport first.
 * HTTP transport gets stubbed but not productionized."). v0.2 work
 * productionizes auth, rate limiting, deployment.
 *
 * Calling this throws an explicit not-implemented error rather than
 * silently failing — the consumer sees the v0.1 limitation clearly.
 */
export async function connectHttp(_server: Server): Promise<never> {
  throw new Error(
    "HTTP transport is stubbed in v0.1 per PRD §4.2 — auth, rate limiting, " +
      "and deployment are v0.2 work items. Use stdio for v0.1 (the default " +
      "for local AI tools like Claude Code and Cursor). Track v0.2 HTTP " +
      "transport progress in docs/v0.2-backlog.md.",
  );
}

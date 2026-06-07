#!/usr/bin/env node
// src/mcp/cli.ts
//
// Phase 3 Task 6 — Palate MCP server CLI entry. Loads the corpus
// once, constructs the server, and connects via stdio.
//
// Invocation:
//   npx palate           — installed via `npm install -g palate`
//   palate               — binary in PATH after install
//   tsx src/mcp/cli.ts   — local dev (npm run mcp:dev)
//
// The CLI takes no arguments in v0.1. Configuration is via
// environment variables (PALATE_SPEC_ROOT, PALATE_LOG_LEVEL —
// default sensible behaviors land in v0.1.x as feedback comes in).
//
// MCP client registration (claude_desktop_config.json):
//
//   "mcpServers": {
//     "palate": {
//       "command": "npx",
//       "args": ["-y", "palate"]
//     }
//   }

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { loadCorpus } from "../corpus/load-corpus.js";
import { connectStdio, createPalateServer } from "./server.js";

async function main(): Promise<void> {
  // Resolve the spec root. By default, look for a `spec/` directory
  // next to this CLI's installed location (the typical npm bin
  // layout: `node_modules/palate/dist/mcp/cli.js` → spec/ at
  // `node_modules/palate/spec/`). Allow override via env for non-
  // standard installs.
  const specRoot =
    process.env.PALATE_SPEC_ROOT ?? defaultSpecRoot();

  // Load corpus synchronously at startup. Every tool call reads from
  // this in-memory corpus; reload on file change is v0.2 work.
  const corpus = loadCorpus({ specRoot });

  const server = createPalateServer({ corpus });

  // Stdio is the v0.1 default. HTTP transport stubbed (see
  // src/mcp/server.ts connectHttp). Block until the transport closes.
  await connectStdio(server);
}

/**
 * Resolve the spec/ directory's location relative to this CLI file.
 * In dev (tsx run), this is `.../src/mcp/cli.ts` → `.../spec`.
 * In published install, this is `.../dist/mcp/cli.js` → `.../spec`
 * (the package ships with spec/ at the root alongside dist/).
 */
function defaultSpecRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // Walk up from src/mcp/ or dist/mcp/ to the package root.
  return resolve(here, "..", "..", "spec");
}

main().catch((err) => {
  // CLI errors go to stderr — stdout is reserved for MCP protocol
  // traffic on stdio transport.
  console.error("[palate] fatal error:", err);
  process.exit(1);
});

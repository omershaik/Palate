# Palate

An open-source MCP server that gives AI coding tools (Cursor, Lovable, v0, Claude Code, Bolt) a structured design vocabulary to escape the AI-default visual monoculture — Inter font everywhere, purple-to-blue gradients, rounded-2xl on every card, the same three-column feature grid on every landing page.

Palate exposes nine axes of design decisions (layout, typography, color, component, motion, imagery, density, voice, reading-pattern) as queryable MCP context. AI tools call Palate during generation; Palate returns a card containing a coherent multi-axis combination — opinionated, internally consistent, and resistant to the AI-default failure modes. The AI tool uses the card to make better design decisions than it would default to.

## Status

**Pre-release.** The TypeScript build and type checks pass. The corpus loader, card generator, MCP server, and multi stage routing pipeline are implemented. Verification on September 7, 2026 recorded **458 passing tests and 32 open validation failures** across 490 tests. The remaining failures concern canonical classification, novel briefs and conflicting signals. They are not skipped or marked as expected passes. See [verification notes](docs/verification-2026-09-07.md).

The locked dependency tree reports no known vulnerabilities in `npm audit` as of that check. This is a dependency audit, not a claim of a complete security review or production readiness.

This repository ships:
- The curated spec (in [`spec/turns/`](./spec/turns/)) — 13 markdown documents, ~80,000 words, defining 77 grammars across 8 axes plus 6 voice dimensions, 15 canonical multi-axis combinations, 22 documented broken combinations, and ~1,500 altname entries.
- The PRD ([`docs/prd/v0.1.md`](./docs/prd/v0.1.md)) — implementation plan layered on top of the spec.
- The corpus loader, card generator, routing engine, and MCP server.

## Getting started (for contributors)

If you are picking this up to build, start with [`docs/orientation.md`](./docs/orientation.md), then review the PRD and the validation suite.

Use Node.js 20.19+ within the 20.x line, or 22.12+:

```sh
npm ci
npm run build
npm run typecheck
npm test
npm audit
```

`npm test` currently exits nonzero for the documented routing failures. To launch the local stdio MCP server after building, run `node dist/mcp/cli.js`. It requires no model API key. HTTP hosting is not productionized.

## Repository layout

```
palate/
├── README.md                    — this file
├── LICENSE                      — MIT
├── spec/
│   ├── turns/                   — canonical spec documents (source of truth)
│   └── derived/                 — machine-generated artifacts (brand-fingerprints.json)
├── src/                         — MCP server source (TypeScript)
│   ├── corpus/                  — spec loader and parser
│   ├── routing/                 — five-stage routing pipeline (Phase 2)
│   ├── cards/                   — card generation and design tokens
│   └── types/                   — shared TypeScript interfaces
├── tests/                       — vitest test suite
└── docs/
    ├── orientation.md           — reading order and file index
    └── prd/v0.1.md              — implementation plan
```

The spec stays organized by *conversation turn* — the form in which it was written and pressure-tested. The corpus loader builds an axis-keyed view in memory rather than splitting the canonical files.

## License

MIT. See [`LICENSE`](./LICENSE).

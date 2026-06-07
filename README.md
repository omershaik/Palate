# Palate

An open-source MCP server that gives AI coding tools (Cursor, Lovable, v0, Claude Code, Bolt) a structured design vocabulary to escape the AI-default visual monoculture — Inter font everywhere, purple-to-blue gradients, rounded-2xl on every card, the same three-column feature grid on every landing page.

Palate exposes eight axes of design decisions (layout, typography, color, component, motion, imagery, density, voice, reading-pattern) as queryable MCP context. AI tools call Palate during generation; Palate returns a card containing a coherent multi-axis combination — opinionated, internally consistent, and resistant to the AI-default failure modes. The AI tool uses the card to make better design decisions than it would default to.

## Status

**Pre-release.** Spec is complete and pressure-tested across nine architectural turns; implementation is in progress. The build phase tracker lives in [`CLAUDE.md`](./CLAUDE.md).

This repository ships:
- The curated spec (in [`spec/turns/`](./spec/turns/)) — 13 markdown documents, ~80,000 words, defining 77 grammars across 8 axes plus 6 voice dimensions, 15 canonical multi-axis combinations, 22 documented broken combinations, and ~1,500 altname entries.
- The PRD ([`docs/prd/v0.1.md`](./docs/prd/v0.1.md)) — implementation plan layered on top of the spec.
- The corpus loader, routing engine, MCP server, and re-derivation worker — under construction across phases 1–5 (see PRD §7).

## Getting started (for contributors)

If you're picking this up to build, start with [`docs/orientation.md`](./docs/orientation.md) for the recommended reading order, then [`CLAUDE.md`](./CLAUDE.md) for the working contract this codebase operates under.

## Repository layout

```
palate/
├── README.md                    — this file
├── CLAUDE.md                    — operating contract for Claude Code sessions
├── LICENSE                      — MIT
├── spec/
│   ├── turns/                   — canonical spec documents (source of truth)
│   └── derived/                 — machine-generated artifacts (brand-fingerprints.json)
├── src/                         — MCP server source (TypeScript)
│   ├── corpus/                  — spec loader and parser
│   ├── routing/                 — five-stage routing pipeline (Phase 2)
│   ├── card-generator/          — card schema population (Phase 3)
│   ├── validation/              — coherence checking (Phase 2)
│   └── types/                   — shared TypeScript interfaces
├── tests/                       — vitest test suite
├── tools/                       — re-derivation worker (Phase 4)
└── docs/
    ├── orientation.md           — reading order and file index
    └── prd/v0.1.md              — implementation plan
```

The spec stays organized by *conversation turn* — the form in which it was written and pressure-tested. The corpus loader builds an axis-keyed view in memory rather than splitting the canonical files.

## License

MIT. See [`LICENSE`](./LICENSE).

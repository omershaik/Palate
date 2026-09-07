# Verification checkpoint: September 7, 2026

## Results

Tested locally with Node.js 22.22.3.

* TypeScript build: passed.
* Type checking, including tests: passed.
* Full suite: 458 passing, 32 failing, 490 total.
* All 32 failures remain in the existing routing validation suite. No previously passing assertion was lost.
* Dependency audit: zero known vulnerabilities in the resolved dependency tree at verification time.

## Changes

Upgraded Vitest from 1.6.1 to the patched 3.2.7 line, refreshed compatible transitive dependencies and updated tsx/esbuild. The Node engine requirement now matches the resolved tooling. Both the test command and configuration fail when no tests are found.

The compatibility loader now preserves both layout references in a composite such as Editorial-Grid Magazine plus Vertical-Rhythm Editorial sections. Other axes retain their cross-axis annotations rather than treating those annotations as extra grammar alternatives.

Altname matching now respects word boundaries. A reference to art cannot match cart, and linear cannot match nonlinear. Complete phrases embedded in longer descriptions still match. The existing Stillness grammar's vocabulary explicitly includes stillness in its vibe bucket as well as its vernacular bucket; it no longer depends on a partial-word match against still.

Seven new regression/integration tests cover these changes and actual MCP client/server negotiation, tool discovery, corpus access, a routed card and empty-brief error handling. The MCP tests run in memory without external model calls.

## Remaining work

The parser and boundary corrections do not close the existing 32 routing assertions. Their root causes include ambiguous brand surfaces, sparse-signal defaults, adjacent canonical styles, incomplete vocabulary and conflicting or novel intent. The [v0.2 backlog](v0.2-backlog.md) retains the design discussion; its historical test totals predate this checkpoint.

Do not present this checkpoint as a fully passing test suite. A dependency audit also does not establish application security, model quality, accessibility compliance or production readiness.

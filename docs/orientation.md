# Palate v0.1 Spec Package

Complete specification and implementation plan for Palate — an open-source MCP server that gives AI coding tools a structured design vocabulary to avoid generating "AI slop" websites.

This package contains 14 documents totaling ~80,000 words. They were produced across an extended architectural conversation with progressive pressure-testing on each design decision.

## Recommended reading order

### For implementation handoff (Claude Code)

If you're picking this up to build the MCP server, read in this order:

1. **`palate-v0.1-prd.md`** — Start here. The implementation plan. Explicit Section 0 ("Handoff Guide") tells you what to read next and why.
2. **`palate-grammar-survey-v0.2-turn9-synthesis.md`** — The single ship-ready document that summarizes the entire system in 20 minutes of reading.
3. **`palate-grammar-survey-v0.2-turn8-compatibility-model.md`** — The integration logic. The 22 broken combinations, the 15 canonical combinations, the five-stage routing pipeline, the maintenance architecture, the card schema. This is the most load-bearing single document.
4. **The seven axis grammar documents (Turns 1-7)** — Reference material. Consult specific ones when implementing the corpus loader and the routing logic.

### For understanding the architectural reasoning

If you're picking this up to understand *why* the spec is shaped the way it is, read chronologically through Turns 0 through 9. Each turn shows the pressure-testing that produced the next decision.

## File index

### Implementation
| File | Purpose |
|---|---|
| `palate-v0.1-prd.md` | The PRD. Build plan, user stories, implementation decisions, build order. Written for Claude Code to execute against. |

### Synthesis
| File | Purpose |
|---|---|
| `palate-grammar-survey-v0.2-turn9-synthesis.md` | Ship-ready synthesis. Single document covering the entire spec. The most efficient entry point. |
| `palate-grammar-survey-v0.2-turn8-compatibility-model.md` | The integration layer. Broken combinations, canonical combinations, routing pipeline, maintenance architecture, card schema. |

### Per-axis grammar documents
| File | Axis | Grammars |
|---|---|---|
| `palate-grammar-survey-v0.1.md` | Layout | 14 grammars (initial survey, refined in Turn 3) |
| `palate-grammar-survey-v0.2-turn1-typography-color.md` | Typography + Color | 6 + 9 grammars |
| `palate-grammar-survey-v0.2-turn2-component-motion.md` | Component + Motion | 9 + 9 grammars |
| `palate-grammar-survey-v0.2-turn3-patches.md` | All retroactive subdivisions | Earth-Pulled aesthetic naming, Bento splits, Hero-Stack splits, more |
| `palate-grammar-survey-v0.2-turn4-revised-altnames.md` | All axes | ~1,130 altname entries in authentic vibe-coder vocabulary |
| `palate-grammar-survey-v0.2-turn5-imagery-density.md` | Imagery + Density | 9 + 6 grammars |
| `palate-grammar-survey-v0.2-turn6-voice.md` | Voice | 6 dimensions + 9 profiles (NN/G framework) |
| `palate-grammar-survey-v0.2-turn7-reading-pattern.md` | Reading-Pattern | 6 grammars |

### Superseded (kept for reference)
| File | Status |
|---|---|
| `palate-grammar-survey-v0.2-turn4-altnames.md` | Superseded by Turn 4 revised. Original altname retrofit was in designer-coded voice; revised version uses authentic vibe-coder vocabulary. |
| `palate-experiment-run-A-control.md` | Early validation experiment. Control case (no Palate context) showing AI-default slop output. |
| `palate-experiment-run-B-loaded.md` | Early validation experiment. Loaded case (with Palate context) showing the difference. |

## What's in the package, by the numbers

- **8 axes** of website design vocabulary
- **77 grammars** total (Layout 14, Typography 6, Color 9, Component 9, Motion 9, Imagery 9, Density 6, Voice 9, Reading-Pattern 6)
- **6 voice dimensions** as a separate continuous representational layer
- **15 canonical multi-axis combinations** covering common briefs
- **22 documented broken combinations** the routing engine must detect
- **~1,500 altname entries** across 5 buckets (vibes, brand exemplars, vernacular labels, anti-vibes, compositional intent)
- **27 open questions resolved** across the architectural conversation
- **5 phases** of v0.1 implementation, estimated 9-13 working days
- **80-120 validation tests** to write before the MCP server itself

## What v0.1 ships

A working MCP server that AI coding tools (Cursor, Lovable, v0, Claude Code, Bolt) can register and call during generation. The server returns design context cards that drive the AI tool away from default AI-slop patterns toward the right register for the brief.

## What v0.2 defers

Embedding-based altname retrieval, RTL language variants, multi-page composition, the brand observatory dashboard, per-vertical extension grammars, hosted Palate-as-a-service, OAuth. The PRD's Section 6 lists these explicitly.

## Recommended next step

Switch to Claude Code with this entire package in the working directory. Open `palate-v0.1-prd.md` and follow Section 0 (the Handoff Guide). Start Phase 1 (Repository scaffolding and corpus loader).

The first artifact the build produces should be the routing-test validation suite — the executable form of the spec.

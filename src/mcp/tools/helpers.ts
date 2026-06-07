// src/mcp/tools/helpers.ts
//
// Phase 3 Task 7 — shared helpers for tool implementations.
// Establishes the error-response pattern and JSON-stringify
// conventions so all 4 tool files have a uniform shape.
//
// Error-as-response (not thrown errors): per the Task 6 convention,
// tool errors return `{ content: [...], isError: true }` rather than
// throwing. AI clients see clean error UX — they know the call ran,
// the server responded, but the input was rejected for a stated
// reason. Throws would surface as protocol-level failures with
// less actionable context.

export type ToolResponseContent =
  | { type: "text"; text: string };

export interface ToolResponse {
  content: ToolResponseContent[];
  isError?: boolean;
}

/**
 * Build a successful tool response with structured JSON content.
 * The JSON gets pretty-printed for human-readable debugging and
 * easier copy/paste into AI client conversations.
 */
export function jsonResponse(payload: unknown): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

/**
 * Build an error tool response. The diagnostic message becomes the
 * primary content; AI clients render it directly to the user. When
 * a list of alternatives is meaningful (e.g., available brand names
 * after a not-found), pass `alternatives` for the helper to format
 * uniformly.
 */
export function errorResponse(
  diagnostic: string,
  alternatives?: { label: string; values: readonly string[] },
): ToolResponse {
  let text = diagnostic;
  if (alternatives !== undefined && alternatives.values.length > 0) {
    text += `\n\n${alternatives.label} (${alternatives.values.length}): ${alternatives.values.join(", ")}`;
  }
  return {
    content: [{ type: "text", text }],
    isError: true,
  };
}

/**
 * Lightweight Levenshtein-style suggestion for "did you mean X?"
 * style hints. v0.1 uses a simple substring + first-N-chars match;
 * a full edit-distance implementation is overkill for the brand-
 * lookup case.
 *
 * Returns up to 3 candidates from `pool` that approximately match
 * `query`. Empty pool or no candidates → empty array.
 */
export function suggestSimilar(
  query: string,
  pool: readonly string[],
): string[] {
  const needle = query.toLowerCase().trim();
  if (needle.length === 0) return [];
  const matches: Array<{ value: string; score: number }> = [];
  for (const candidate of pool) {
    const hay = candidate.toLowerCase();
    if (hay.includes(needle) || needle.includes(hay)) {
      matches.push({ value: candidate, score: 100 });
      continue;
    }
    // Prefix overlap as the cheap approximation.
    const prefixLen = commonPrefixLength(needle, hay);
    if (prefixLen >= 3) {
      matches.push({ value: candidate, score: prefixLen });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3).map((m) => m.value);
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a.charAt(i) === b.charAt(i)) i++;
  return i;
}

/**
 * Validate that a string argument is non-empty after trim. Returns
 * the trimmed value or null if the argument is missing / empty.
 * Tools use this to enforce the "non-empty brief" / "non-empty
 * brand id" precondition before passing user input downstream.
 */
export function requireNonEmptyString(
  args: Record<string, unknown> | undefined,
  field: string,
): string | null {
  const raw = args?.[field];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  return trimmed;
}

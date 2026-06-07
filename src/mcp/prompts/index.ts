// src/mcp/prompts/index.ts
//
// Phase 3 Task 8 — prompt dispatcher. Resolves prompt names from
// the manifest to rendered template text + argument substitution.

import { PROMPT_MANIFEST } from "../manifest.js";
import { renderBriefTemplatePrompt } from "./brief-template.js";

export interface RenderedPrompt {
  description: string;
  messages: Array<{
    role: "user" | "assistant";
    content: { type: "text"; text: string };
  }>;
}

export function renderPrompt(
  name: string,
  args: Record<string, unknown> | undefined,
): RenderedPrompt {
  switch (name) {
    case "brief-template": {
      const userDescription =
        typeof args?.["user_description"] === "string"
          ? (args["user_description"] as string).trim()
          : "";
      // Empty user_description is acceptable — the prompt template
      // still renders, just with an empty placeholder for the
      // consuming AI tool to fill at use time.
      return {
        description:
          "Structured prompt template that helps an AI tool extract clean signals from a user's free-form site description before passing to the route tool.",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: renderBriefTemplatePrompt(userDescription),
            },
          },
        ],
      };
    }
    default:
      return {
        description: `Unknown prompt: '${name}'.`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Unknown prompt name '${name}'. Available prompts: ${PROMPT_MANIFEST.map((p) => p.name).join(", ")}.`,
            },
          },
        ],
      };
  }
}

// src/cards/voice/index.ts
//
// Phase 3 Task 4 — voice guidelines entry point. Combines the routed
// voice profile's specific directives with the universal anti-LLM-
// default directives that apply regardless of profile.
//
// The merge produces a single VoiceGuidelines object the consuming AI
// tool reads — no need for the consumer to apply universal rules
// separately.

import type { VoiceGuidelines } from "../../types/card.js";
import {
  EMPTY_GUIDELINES,
  UNIVERSAL_ANTI_LLM_DIRECTIVES,
} from "./conventions.js";
import { VOICE_PROFILES } from "./profiles.js";

/**
 * Build voice guidelines from a routed voice profile id. Merges the
 * profile-specific do_use / do_not_use lists with universal anti-LLM-
 * default directives that apply to every profile.
 *
 * Unknown profile ids fall through to EMPTY_GUIDELINES + universal
 * directives (defensive against future profile additions).
 */
export function buildVoiceGuidelines(
  profileId: string | null,
): VoiceGuidelines {
  const profileGuidelines =
    profileId !== null && VOICE_PROFILES[profileId] !== undefined
      ? VOICE_PROFILES[profileId]
      : EMPTY_GUIDELINES;

  return {
    do_use: [...profileGuidelines.do_use],
    do_not_use: [
      ...profileGuidelines.do_not_use,
      ...UNIVERSAL_ANTI_LLM_DIRECTIVES,
    ],
  };
}

export { VOICE_PROFILES, EMPTY_GUIDELINES, UNIVERSAL_ANTI_LLM_DIRECTIVES };

// src/cards/voice/profiles.ts
//
// Phase 3 Task 4 — per-voice-profile do_use / do_not_use guidance.
// Each profile's directives are grounded in the spec's voice profile
// definitions (internal_logic, brand_exemplars, anti_vibes from
// spec/turns/palate-grammar-survey-v0.2-turn6-voice.md).
//
// Format: each entry is a directive sentence. AI tools follow these
// when generating copy in the routed voice. The do_not_use list does
// NOT include UNIVERSAL_ANTI_LLM_DIRECTIVES (delve/unleash/etc.) —
// those are merged in by the entry-point (index.ts) so every profile's
// guidelines include them without duplicated copy.

import type { VoiceGuidelines } from "../../types/card.js";
import { buildGuidelines } from "./conventions.js";

// ---------------------------------------------------------------------------
// VOICE-1: Quiet Authority (Aman, Cheval Blanc, considered hospitality)
// ---------------------------------------------------------------------------

const VOICE_1: VoiceGuidelines = buildGuidelines(
  [
    "Use short declarative sentences. Restraint is the discipline.",
    "Lead with concrete specifics: a place, a date, a name. Abstractions weaken authority.",
    "Address the reader as a peer — assume sophistication, don't explain it.",
    "Let prose breathe — generous whitespace in copy mirrors the visual register.",
  ],
  [
    "Avoid superlatives ('the finest', 'the world's best', 'unparalleled').",
    "Avoid promotional framing — Quiet Authority sells by NOT selling.",
    "Avoid exclamation points and emoji.",
    "Avoid second-person urgency ('discover', 'experience the magic of').",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-2: Editorial Considered (Apartamento, Cereal, NYT, Stripe Press)
// ---------------------------------------------------------------------------

const VOICE_2: VoiceGuidelines = buildGuidelines(
  [
    "Use varied sentence structure — short and long sentences create rhythm.",
    "Reference specific cultural details: a person, a year, a quotation, a place.",
    "Lead with the subject, not the brand — editorial voice is about WHAT, not who.",
    "Trust the reader to follow long-form structure; don't pre-summarize.",
  ],
  [
    "Avoid SEO-coded phrasing ('the ultimate guide to', '10 things you need to know').",
    "Avoid listicle hooks and bullet-heavy structure when prose would carry better.",
    "Avoid corporate first-person plural — editorial voice is third-person about subjects.",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-3: Friendly Expert (Mailchimp, Notion, Stripe support, Linear marketing)
// ---------------------------------------------------------------------------

const VOICE_3: VoiceGuidelines = buildGuidelines(
  [
    "Be helpful and direct — 'Here's what to do' beats 'You may wish to consider'.",
    "Use contractions naturally ('we're', 'you'll', 'don't').",
    "Address the reader as a colleague — capable but glad for the assist.",
    "Show your work briefly when explaining tradeoffs — competence without showing off.",
  ],
  [
    "Avoid corporate jargon ('synergize', 'circle back', 'leverage').",
    "Avoid hedging that obscures recommendations ('it depends', 'there are many factors').",
    "Avoid bullet-point-everything structure — prose paragraphs hold attention better for explanation.",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-4: Direct Professional (Linear app, dashboard UI labels)
// ---------------------------------------------------------------------------

const VOICE_4: VoiceGuidelines = buildGuidelines(
  [
    "Use action verbs first: 'Save', 'Continue', 'Cancel', 'Delete'.",
    "Keep UI labels under 4 words. Tooltips can run longer when explanation matters.",
    "Use sentence case for buttons and labels (not Title Case, not ALL CAPS).",
    "Pattern for issues / tasks: [Verb] [What] [Context]. 'Add validation to email field'.",
  ],
  [
    "Avoid marketing-coded phrases in app surfaces ('Power up your workflow').",
    "Avoid exclamation points in UI labels — application UI is matter-of-fact.",
    "Avoid 'please' in error messages — it reads condescending in dense UI.",
    "Avoid emoji in UI labels (different rule from marketing pages where some grammars allow emoji).",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-5: Premium Confident (Anthropic, Apple marketing, Vercel, premium hardware)
// ---------------------------------------------------------------------------

const VOICE_5: VoiceGuidelines = buildGuidelines(
  [
    "State capabilities directly. 'We built X to do Y' beats 'X may help with Y'.",
    "Use first-person plural ('we') when describing decisions and choices.",
    "Lead with what's new or distinct — premium voice doesn't bury the lede.",
    "Pair confidence with specificity — claims need at least one concrete proof point per paragraph.",
  ],
  [
    "Avoid hedging language: 'might', 'may be able to', 'we hope'.",
    "Avoid excessive qualifiers and disclaimers in marketing copy (legal copy is separate).",
    "Avoid 'industry-leading', 'world-class', 'best-in-class' — premium voice shows, doesn't proclaim.",
    "Avoid stacking superlatives ('the most powerful, most flexible, most...').",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-6: Casual Playful (DTC, friendly consumer — Glossier, Gumroad, Mejuri)
// ---------------------------------------------------------------------------

const VOICE_6: VoiceGuidelines = buildGuidelines(
  [
    "Use contractions and conversational openings ('Hey there', 'Quick one').",
    "Humor that doesn't punch down — self-aware over snide.",
    "First-person plural that feels like a small team, not a corporation.",
    "Concrete, specific details: real names, real situations, real outcomes.",
  ],
  [
    "Avoid corporate distance — 'our valued customers' reads as a brand wall.",
    "Avoid formal sentence structures that don't match the visual playfulness.",
    "Avoid trying-too-hard humor that distracts from the product.",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-7: Conversion-Punchy (typical YC SaaS, Vercel, Stripe marketing — AI default)
// ---------------------------------------------------------------------------

const VOICE_7: VoiceGuidelines = buildGuidelines(
  [
    "Lead headlines with a benefit verb: 'Ship faster', 'Scale safely', 'Build with confidence'.",
    "One value claim per section — don't stack three propositions on a hero.",
    "Specific outcome promises with numbers when available: '40% faster builds', '99.99% uptime'.",
    "Use customer-voice testimonials with specific situations, not generic praise.",
  ],
  [
    "Avoid the 'Build the future of [vertical]' template hero — it's the AI-default tell.",
    "Avoid 'all-in-one platform' — say what specific things, in what specific way.",
    "Avoid 'scale without limits' — every system has limits; specifics build trust.",
    "Avoid stacking buzzwords: 'AI-powered, machine-learning-enabled, cloud-native'.",
    "Avoid 'unlock', 'unleash', 'supercharge' — these are AI-default conversion verbs.",
    "Avoid 'revolutionize the way you X' — claim a specific improvement instead.",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-8: Irreverent Bold (Cards Against Humanity-coded indie, Liquid Death)
// ---------------------------------------------------------------------------

const VOICE_8: VoiceGuidelines = buildGuidelines(
  [
    "Deadpan humor — say it straight, let the absurdity speak.",
    "Subvert expected category language deliberately — 'water that doesn't suck' for a water brand.",
    "Confident enough to opt out of category cliches.",
    "Specifics that feel handwritten by a real person, not a brand voice committee.",
  ],
  [
    "Avoid customer-service tone ('we're sorry to hear that', 'we appreciate your patience').",
    "Avoid corporate apology language — irreverent bold doesn't preemptively apologize.",
    "Avoid trying-to-be-cool tone that reads as forced rather than confident.",
  ],
);

// ---------------------------------------------------------------------------
// VOICE-9: Technical Precise (developer tools, API docs, Berkeley Mono showcase)
// ---------------------------------------------------------------------------

const VOICE_9: VoiceGuidelines = buildGuidelines(
  [
    "Use precise technical vocabulary — name the actual mechanism, not a metaphor for it.",
    "Include specifics: latency in ms, throughput in req/s, sizes in bytes.",
    "Show code examples and request/response shapes; don't describe them in prose.",
    "Pattern for API copy: [Verb] [Object] returns [Result] in [Time].",
  ],
  [
    "Avoid marketing fluff: 'fast', 'easy', 'powerful' without specifics.",
    "Avoid analogies that simplify away the mechanism (technical readers want the mechanism).",
    "Avoid 'developers love X' framing — let the docs and API speak for themselves.",
    "Avoid casual register in error messages — precision matters more than friendliness.",
  ],
);

// ---------------------------------------------------------------------------
// Lookup table
// ---------------------------------------------------------------------------

export const VOICE_PROFILES: Record<string, VoiceGuidelines> = {
  "VOICE-1": VOICE_1,
  "VOICE-2": VOICE_2,
  "VOICE-3": VOICE_3,
  "VOICE-4": VOICE_4,
  "VOICE-5": VOICE_5,
  "VOICE-6": VOICE_6,
  "VOICE-7": VOICE_7,
  "VOICE-8": VOICE_8,
  "VOICE-9": VOICE_9,
};

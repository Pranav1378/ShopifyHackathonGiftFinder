import { GachaIntent } from '../types/quickPicker'

export type FalRequestPayload = {
  route: 'fal-ai/any-llm'
  input: {
    prompt: string
    system_prompt?: string
    model?: string
  }
  metadata: {
    gachaIntent: GachaIntent
    createdAt: string
    version: string
  }
}

// Minimal prompt that downstream hooks can swap out as needed
export function buildFalRequest(intent: GachaIntent, opts?: { model?: string; systemPrompt?: string }): FalRequestPayload {
  const systemPrompt =
    opts?.systemPrompt ??
    'You are a gift recommendation engine. Given the user intent, propose 3-6 gift bundle ideas with concise rationales and total price near the target budget. Respond with strictly valid JSON.'

  const prompt = [
    'USER_INTENT_JSON:',
    JSON.stringify(intent, null, 2),
    '',
    'Return JSON with this TypeScript shape:',
    '{ "bundles": Array<{"title": string; "total": number; "items": Array<{"title": string; "price": number}>; "rationale": string }> }',
  ].join('\n')

  return {
    route: 'fal-ai/any-llm',
    input: {
      prompt,
      system_prompt: systemPrompt,
      model: opts?.model ?? 'google/gemini-2.0-flash-001',
    },
    metadata: {
      gachaIntent: intent,
      createdAt: new Date().toISOString(),
      version: '0.1.0',
    },
  }
}


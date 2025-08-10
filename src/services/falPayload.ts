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
    [
      'You are a product query planner for a Shopify Shop Mini called Gift Gacha.',
      'Given a budget, occasion, and optional high-level categories, return three short search queries (one per category).',
      '',
      'Rules:',
      '- Output only JSON, no extra text/markdown.',
      '- Keep text concise; lowercase unless proper nouns.',
      '- Each query must include { "text": string, "category": string }.',
      '- Include the budget as a price hint in “text” (e.g., “$20” or “under $50”).',
      '- If categories are provided, use them verbatim. Otherwise choose three sensible, distinct high-level categories.',
      '- Return exactly three keys: queryone, querytwo, querythree.',
    ].join('\n')

  const inputJson = {
    budget: intent.budget,
    occasion: intent.occasion ?? null,
    hints: {
      vibes: intent.vibes ?? [],
      dislikes: intent.dislikes ?? [],
      colors: intent.colors ?? [],
    },
  }

  const promptLines: string[] = []
  promptLines.push('INPUT_JSON:')
  promptLines.push(JSON.stringify(inputJson, null, 2))
  promptLines.push('')
  promptLines.push('Generate ONLY valid JSON matching this exact shape:')
  promptLines.push('{')
  promptLines.push('  "queryone": { "text": string, "category": string },')
  promptLines.push('  "querytwo": { "text": string, "category": string },')
  promptLines.push('  "querythree": { "text": string, "category": string }')
  promptLines.push('}')
  promptLines.push('')
  promptLines.push('Output JSON only.')

  const prompt = promptLines.join('\n')

  return {
    route: 'fal-ai/any-llm',
    input: {
      prompt,
      system_prompt: systemPrompt,
      model: opts?.model ?? 'openai/gpt-5-chat',
    },
    metadata: {
      gachaIntent: intent,
      createdAt: new Date().toISOString(),
      version: '0.1.0',
    },
  }
}


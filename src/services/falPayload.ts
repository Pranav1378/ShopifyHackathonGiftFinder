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
      'You are a product keywording engine for a Shopify Shop Mini called Gift Gacha.',
      'Given a recipient profile, budget, and a novelty (spice) level, you will return',
      "a compact JSON object with search terms and filters for Shopify's product search.",
      '',
      'Rules:',
      '- Output only JSON, no extra text, markdown, or explanations.',
      '- Keep arrays small (max 6 items each), lowercase words unless proper nouns.',
      '- "query" is a short free-text search term.',
      '- "must" = product attributes/tags that MUST be present.',
      '- "must_not" = tags to avoid.',
      '- "nice_to_have" = helpful but optional tags.',
      '- "categories" = high-level categories like "gift", "home", "tech", "apparel".',
    ].join('\n')

  const promptLines: string[] = []
  promptLines.push('USER_INTENT_JSON:')
  promptLines.push(JSON.stringify(intent, null, 2))
  promptLines.push('')
  promptLines.push('Generate ONLY valid JSON matching this schema:')
  promptLines.push('{')
  promptLines.push('  "query": string,')
  promptLines.push('  "must": string[],')
  promptLines.push('  "must_not": string[],')
  promptLines.push('  "nice_to_have": string[],')
  promptLines.push('  "categories": string[]')
  promptLines.push('}')
  promptLines.push('')
  promptLines.push(`Include a price constraint like "under $${intent.budget}" inside "must".`)
  promptLines.push('If the intent includes dislikes, map them to "must_not". Colors go to "nice_to_have".')
  promptLines.push('Use occasion and vibes to inform "query" and tags. Limit arrays to at most 6 items.')

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


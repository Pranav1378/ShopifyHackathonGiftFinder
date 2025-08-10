import { fal } from '@fal-ai/client'
import { FalRequestPayload } from './falPayload'

// Key resolution order per Fal docs:
// 1) process.env.FAL_KEY (injected at build via Vite define)
// 2) window.FAL_KEY (local/dev override)
const FAL_KEY: string | undefined = (
  (typeof process !== 'undefined' && (process as any)?.env?.FAL_KEY) ||
  (typeof window !== 'undefined' ? (window as any)?.FAL_KEY : undefined)
) as string | undefined

export async function callFal(payload: FalRequestPayload): Promise<string> {
  if (!FAL_KEY) {
    throw new Error('Missing FAL_KEY (or window.FAL_KEY)')
  }

  fal.config({ credentials: FAL_KEY })

  const result = await fal.subscribe(payload.route, {
    input: payload.input,
    logs: true,
  })

  const output = (result as any)?.data?.output ?? (result as any)?.output
  if (typeof output !== 'string') {
    throw new Error('Fal response missing output')
  }
  return output
}


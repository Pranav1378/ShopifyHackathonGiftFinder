import { fal } from '@fal-ai/client'
import { FalRequestPayload } from './falPayload'

// Reads from Vite env var. In Minis WebView, ensure this is injected or proxied server-side.
const FAL_KEY = import.meta.env.VITE_FAL_KEY as string | undefined

export async function callFal(payload: FalRequestPayload): Promise<string> {
  if (!FAL_KEY) {
    throw new Error('Missing VITE_FAL_KEY')
  }

  fal.config({ credentials: FAL_KEY })

  const result = await fal.subscribe(payload.route, {
    input: payload.input,
    logs: false,
  } as any)

  const output = (result as any)?.data?.output ?? (result as any)?.output
  if (typeof output !== 'string') {
    throw new Error('Fal response missing output')
  }
  return output
}


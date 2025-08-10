import {useMemo} from 'react'
import {useProfiles} from '../../services/useProfiles'
import type {RecipientProfile as QuickRecipient} from '../../types/quickPicker'

export type UiProfile = QuickRecipient & {
  initials: string
}

function computeInitials(nameOrDisplay: string | undefined): string {
  const source = (nameOrDisplay || '').trim()
  if (!source) return '🙂'
  const parts = source.split(/\s+/)
  const letters = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).filter(Boolean)
  return letters.join('') || source[0]?.toUpperCase() || '🙂'
}

export function useProfilesAdapter() {
  const {listProfiles, getLastUsed, setLastUsed, upsertProfiles} = useProfiles()

  async function listUiProfiles(): Promise<UiProfile[]> {
    const raw = await listProfiles()
    return raw.map(p => ({...p, initials: computeInitials(p.displayName)}))
  }

  return useMemo(() => ({
    listUiProfiles,
    getLastUsed,
    setLastUsed,
    upsertProfiles,
  }), [])
}

// Lightweight product adapter for swipe discovery (UI-only; reads from mocks)
export type UiProduct = {
  id: string
  title: string
  price: number
  image: string
  tags: string[]
}

export async function getSwipeProductsForIntent(intent: { budget: number; occasion?: string; vibes?: string[]; profile?: { styleTags?: string[]; favColors?: string[]; dislikedTags?: string[] } }): Promise<UiProduct[]> {
  const { mockShopifyProducts } = await import('../../mocks/shopifyMockData')
  const maxItemPrice = Math.max(5, Math.min(intent.budget, intent.budget * 0.8))
  const vibes = (intent.vibes || []).map(v => v.toLowerCase())
  const styleTags = (intent.profile?.styleTags || []).map(s => s.toLowerCase())
  const dislikes = (intent.profile?.dislikedTags || []).map(s => s.toLowerCase())
  // Simple filter: under budget and matches at least one vibe/tag if any vibes provided
  const products = mockShopifyProducts.filter(p => {
    const variant = p.variants.nodes[0]
    const price = parseFloat(variant?.price?.amount || '0')
    const priceOk = price <= maxItemPrice
    const tagsLower = p.tags.map(t => t.toLowerCase())
    const vibeOk = vibes.length === 0 || tagsLower.some(t => vibes.some(v => t.includes(v)))
    const styleOk = styleTags.length === 0 || tagsLower.some(t => styleTags.some(s => t.includes(s)))
    const dislikeOk = dislikes.length === 0 || (!tagsLower.some(t => dislikes.some(d => t.includes(d))) && !p.title.toLowerCase().split(/\s+/).some(w => dislikes.includes(w)))
    return priceOk && (vibeOk || styleOk) && dislikeOk
  })
  // Map to UI products
  return products.map(p => {
    const variant = p.variants.nodes[0]
    const price = parseFloat(variant?.price?.amount || '0')
    const image = variant?.image?.url || p.featuredImage?.url || 'https://via.placeholder.com/400x500?text=Product'
    return { id: p.id, title: p.title, price, image, tags: p.tags }
  })
}



import React, { useEffect, useMemo, useState } from 'react'
import { QuickGiftPicker } from '../components/QuickGiftPicker'
import type { GachaIntent } from '../types/quickPicker'
import { getSwipeProductsForIntent } from '../ui/adapters/dataAdapters'
import SwipeDeck from '../components/ui/SwipeDeck'
import { shopifyUtils } from '../services/shopifyClient'
import { useProfiles } from '../services/useProfiles'

type Props = {
  onBack?: () => void
}

export function DiscoverQuick({ onBack }: Props) {
  const [intent, setIntent] = useState<GachaIntent | null>(null)
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<{ id: string; title: string; price: string; image: string }[]>([])
  const { listProfiles } = useProfiles()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!intent) return
      setLoading(true)
      try {
        // get profile traits for personalization if available
        let profileData: any = undefined
        try {
          const all = await listProfiles()
          profileData = all?.find(p => p.id === intent.profileId)
        } catch {}
        const products = await getSwipeProductsForIntent({ budget: intent.budget, occasion: intent.occasion, vibes: intent.vibes, profile: profileData })
        if (!mounted) return
        setCards(products.map(p => ({ id: p.id, title: p.title, price: shopifyUtils.formatPrice(p.price), image: p.image })))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [intent])

  if (!intent) {
    return (
      <div className="pt-16 px-4">
        <QuickGiftPicker onSubmit={(i) => setIntent(i)} />
      </div>
    )
  }

  return (
    <div className="pt-16 px-4">
      {loading ? (
        <div className="text-center py-24 text-gray-600">Loading suggestions…</div>
      ) : (
        <SwipeDeck
          cards={cards}
          onLike={(id) => console.info('like', id)}
          onDislike={(id) => console.info('dislike', id)}
          onBuy={(id) => alert(`Buy flow for ${id}`)}
        />
      )}
      {onBack && (
        <div className="mt-16 text-center">
          <button className="text-sm text-blue-600" onClick={onBack}>Back to start</button>
        </div>
      )}
    </div>
  )
}

export default DiscoverQuick



/**
 * Bundle Grid Component
 * Displays gift bundles in a mobile-optimized grid layout
 */

import React from 'react'
import { GiftBundle } from '../types/giftFinder'
import { BundleCard } from './BundleCard'

interface BundleGridProps {
  bundles: GiftBundle[]
  onViewDetails: (bundle: GiftBundle) => void
  onAddToCart: (bundle: GiftBundle) => void
}

export function BundleGrid({ bundles, onViewDetails, onAddToCart }: BundleGridProps) {
  if (bundles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bundles found</p>
      </div>
    )
  }

  return (
    <div className="bundle-grid">
      <div className="grid grid-cols-1 gap-6">
        {bundles.map((bundle, index) => (
          <BundleCard
            key={bundle.id}
            bundle={bundle}
            onViewDetails={onViewDetails}
            onAddToCart={onAddToCart}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  )
}

export default BundleGrid

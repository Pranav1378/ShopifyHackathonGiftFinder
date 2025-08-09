/**
 * Bundle Card Component
 * Individual bundle display with image collage, pricing, and actions
 */

import React from 'react'
import { GiftBundle } from '../types/giftFinder'
import { shopifyUtils } from '../services/shopifyClient'

interface BundleCardProps {
  bundle: GiftBundle
  onViewDetails: (bundle: GiftBundle) => void
  onAddToCart: (bundle: GiftBundle) => void
  rank?: number
}

export function BundleCard({ bundle, onViewDetails, onAddToCart, rank }: BundleCardProps) {
  const { title, rationale, price, items, themeTags, diversityScore, safetyFlags } = bundle

  // Create image collage (max 4 images)
  const displayImages = items.slice(0, 4).map(item => item.image)

  // Format price
  const formattedPrice = shopifyUtils.formatPrice(price.total)
  const isNearBudget = price.nearBudget
  const savings = price.estimatedDiscounts

  return (
    <div className="bundle-card bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header with rank and title */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {rank && (
              <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2 mb-1">
                {rank}
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 font-['Suisse_Intl']">
              {title}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {formattedPrice}
            </div>
            {isNearBudget && (
              <div className="text-xs text-orange-600 font-medium">
                Slightly over budget
              </div>
            )}
            {savings && savings > 0 && (
              <div className="text-xs text-green-600 font-medium">
                Save ${savings.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Theme tags */}
        {themeTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {themeTags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag.replace(/^(theme:|style:|interest:)/, '')}
              </span>
            ))}
          </div>
        )}

        {/* Rationale */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {rationale}
        </p>
      </div>

      {/* Image collage */}
      <div className="px-4 pb-4">
        <div className={`grid gap-2 ${getGridClass(displayImages.length)}`}>
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                src={image}
                alt={`Bundle item ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {items.length > 4 && (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-sm font-medium">
              +{items.length - 4} more
            </div>
          )}
        </div>
      </div>

      {/* Item summary */}
      <div className="px-4 pb-4">
        <div className="text-sm text-gray-500 mb-3">
          {items.length} items • Diversity: {Math.round(diversityScore * 100)}%
        </div>

        {/* Safety flags */}
        {safetyFlags && safetyFlags.length > 0 && (
          <div className="mb-3">
            {safetyFlags.map(flag => (
              <div
                key={flag}
                className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1 inline-block mr-2 mb-1"
              >
                ⚠ {flag}
              </div>
            ))}
          </div>
        )}

        {/* Item list preview */}
        <div className="text-sm text-gray-600 mb-4">
          {items.slice(0, 3).map((item, index) => (
            <div key={item.variantId} className="flex justify-between py-1">
              <span className="truncate flex-1 mr-2">{item.title}</span>
              <span className="font-medium">
                {shopifyUtils.formatPrice(item.unitPrice)}
              </span>
            </div>
          ))}
          {items.length > 3 && (
            <div className="text-xs text-gray-400 pt-1">
              ...and {items.length - 3} more items
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-3">
        <button
          onClick={() => onViewDetails(bundle)}
          className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onAddToCart(bundle)}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

/**
 * Get CSS grid class based on number of images
 */
function getGridClass(imageCount: number): string {
  switch (imageCount) {
    case 1:
      return 'grid-cols-1'
    case 2:
      return 'grid-cols-2'
    case 3:
      return 'grid-cols-3'
    case 4:
    default:
      return 'grid-cols-2'
  }
}

export default BundleCard

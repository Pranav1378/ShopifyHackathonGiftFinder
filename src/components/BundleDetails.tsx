/**
 * Bundle Details Modal Component
 * Detailed view of a gift bundle with item breakdown and swap functionality
 */

import React from 'react'
import { BundleDetailsProps } from '../types/giftFinder'
import { shopifyUtils } from '../services/shopifyClient'

export function BundleDetails({ bundle, onClose, onSwapItem, onAddToCart }: BundleDetailsProps) {
  const { title, rationale, price, items, themeTags, diversityScore, safetyFlags } = bundle

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold font-['Suisse_Intl']">
            Bundle Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-4">
            {/* Bundle header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
              
              {/* Theme tags */}
              {themeTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {themeTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag.replace(/^(theme:|style:|interest:)/, '')}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-600 leading-relaxed">
                {rationale}
              </p>
            </div>

            {/* Safety flags */}
            {safetyFlags && safetyFlags.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">⚠️ Important Notes</h4>
                {safetyFlags.map(flag => (
                  <div
                    key={flag}
                    className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2"
                  >
                    {flag}
                  </div>
                ))}
              </div>
            )}

            {/* Items list */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">
                📦 Bundle Contents ({items.length} items)
              </h4>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.variantId}
                    className="flex gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {/* Item image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item details */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Qty: {item.quantity}
                      </p>
                      {item.reasons && (
                        <p className="text-xs text-blue-600 mb-2">
                          💭 {item.reasons}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price and actions */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-medium text-gray-900 mb-2">
                        {shopifyUtils.formatPrice(item.unitPrice)}
                      </div>
                      <button
                        onClick={() => onSwapItem(index)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Find Similar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">💰 Price Breakdown</h4>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{shopifyUtils.formatPrice(price.subtotal)}</span>
                </div>
                
                {price.estimatedDiscounts && price.estimatedDiscounts > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Estimated savings:</span>
                    <span>-{shopifyUtils.formatPrice(price.estimatedDiscounts)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{shopifyUtils.formatPrice(price.total)}</span>
                </div>
                
                {price.nearBudget && (
                  <div className="text-xs text-orange-600 text-center">
                    ⚠ Slightly over your budget
                  </div>
                )}
              </div>
            </div>

            {/* Bundle stats */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">📊 Bundle Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(diversityScore * 100)}%
                  </div>
                  <div className="text-xs text-blue-700">Diversity Score</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {items.length}
                  </div>
                  <div className="text-xs text-green-700">Items Included</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Keep Looking
            </button>
            <button
              onClick={() => onAddToCart(bundle)}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add to Cart • {shopifyUtils.formatPrice(price.total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BundleDetails

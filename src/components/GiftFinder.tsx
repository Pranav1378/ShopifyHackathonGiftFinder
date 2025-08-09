/**
 * Main GiftFinder Component
 * Orchestrates the entire gift finding flow from input to results
 */

import React, { useState, useCallback } from 'react'
import { GiftFinderProps, RecipientProfile, GiftBundle, GiftFinderResult } from '../types/giftFinder'
import { ProfileForm } from './ProfileForm'
import { BundleGrid } from './BundleGrid'
import { BundleDetails } from './BundleDetails'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { generateGiftBundles } from '../api/giftFinderApi'

type ViewState = 'input' | 'loading' | 'results' | 'empty'

export function GiftFinder({ onAddBundleToCart, shopDomain, storefrontAccessToken }: GiftFinderProps) {
  // State management
  const [viewState, setViewState] = useState<ViewState>('input')
  const [profile, setProfile] = useState<RecipientProfile>({})
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState<number>(75)
  const [results, setResults] = useState<GiftFinderResult | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<GiftBundle | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Handler for generating gift bundles
  const handleGenerateBundles = useCallback(async () => {
    if (!prompt.trim() || budget <= 0) {
      setError('Please provide a gift description and budget')
      return
    }

    setViewState('loading')
    setError(null)

    try {
      const result = await generateGiftBundles({
        profile,
        prompt: prompt.trim(),
        budget,
        maxBundles: 6,
      })

      setResults(result)
      setViewState(result.bundles.length > 0 ? 'results' : 'empty')
    } catch (err) {
      console.error('Gift generation error:', err)
      setError('Failed to generate gift bundles. Please try again.')
      setViewState('input')
    }
  }, [profile, prompt, budget])

  // Handler for retrying with relaxed constraints
  const handleRetry = useCallback(() => {
    setViewState('input')
    setResults(null)
    setError(null)
    // Suggest removing some constraints
    if (profile.dislikes?.length) {
      setProfile(prev => ({ ...prev, dislikes: prev.dislikes?.slice(0, -1) }))
    }
  }, [profile.dislikes])

  // Handler for viewing bundle details
  const handleViewDetails = useCallback((bundle: GiftBundle) => {
    setSelectedBundle(bundle)
  }, [])

  // Handler for closing bundle details
  const handleCloseDetails = useCallback(() => {
    setSelectedBundle(null)
  }, [])

  // Handler for adding bundle to cart
  const handleAddToCart = useCallback((bundle: GiftBundle) => {
    onAddBundleToCart(bundle)
    setSelectedBundle(null)
  }, [onAddBundleToCart])

  // Handler for swapping items (placeholder)
  const handleSwapItem = useCallback((itemIndex: number) => {
    console.log('Swap item at index:', itemIndex)
    // TODO: Implement item swapping functionality
  }, [])

  return (
    <div className="gift-finder w-full max-w-4xl mx-auto">
      {/* Input Panel */}
      {viewState === 'input' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 font-['Suisse_Intl']">
            🎁 Find the Perfect Gift
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <ProfileForm profile={profile} onChange={setProfile} />

          {/* Gift Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gift Description *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Cozy birthday gift for my girlfriend who loves tea and reading; avoid strong fragrances"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe the occasion, recipient, and any specific preferences
            </p>
          </div>

          {/* Budget Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="500"
                step="5"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total budget for the entire gift bundle
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateBundles}
            disabled={!prompt.trim() || budget <= 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate Gift Bundles
          </button>
        </div>
      )}

      {/* Loading State */}
      {viewState === 'loading' && <LoadingState />}

      {/* Results Grid */}
      {viewState === 'results' && results && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-['Suisse_Intl']">
              🎁 Gift Bundle Options
            </h2>
            <button
              onClick={() => setViewState('input')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Edit Preferences
            </button>
          </div>

          {/* Diagnostics (if available) */}
          {results.diagnostics && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Search Insights</h3>
              {results.diagnostics.matchedSignals?.length > 0 && (
                <p className="text-sm text-blue-700 mb-1">
                  ✓ Matched: {results.diagnostics.matchedSignals.join(', ')}
                </p>
              )}
              {results.diagnostics.unmetConstraints?.length > 0 && (
                <p className="text-sm text-orange-700">
                  ⚠ Unmet: {results.diagnostics.unmetConstraints.join(', ')}
                </p>
              )}
            </div>
          )}

          <BundleGrid
            bundles={results.bundles}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}

      {/* Empty State */}
      {viewState === 'empty' && (
        <EmptyState
          onRetry={handleRetry}
          onEditPreferences={() => setViewState('input')}
          budget={budget}
        />
      )}

      {/* Bundle Details Modal */}
      {selectedBundle && (
        <BundleDetails
          bundle={selectedBundle}
          onClose={handleCloseDetails}
          onSwapItem={handleSwapItem}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

export default GiftFinder

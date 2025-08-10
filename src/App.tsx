import { SearchInput, SearchProvider } from '@shopify/shop-minis-react'
import { GiftBundle } from './types/giftFinder'
import { QuickGiftPicker } from './components/QuickGiftPicker'
import { GachaIntent } from './types/quickPicker'
import React, { useState } from 'react'
import { ResultsStub } from './components/ResultsStub'
import { AppShell } from './ui/AppShell'

// Import demo for browser console testing
import './examples/giftFinderDemo'

export function App() {
  const NEW_UI = true
  const [intent, setIntent] = useState<GachaIntent | null>(null)

  const handleAddBundleToCart = async (bundle: GiftBundle) => {
    console.log('Adding bundle to cart:', bundle)
    // TODO: Implement actual cart functionality
    alert(`Added "${bundle.title}" to cart!`)
  }

  return (
    <SearchProvider>
      {NEW_UI ? (
        <AppShell />
      ) : (
        <div className="pb-6">
          {/* Search bar with shop minis font and styling */}
          <div className="fixed top-0 left-0 right-0 p-4 w-full z-20 bg-background">
            <SearchInput 
              placeholder="Search for gifts..." 
              className="font-['Suisse_Intl']"
            />
          </div>
          
          {/* Content with top spacing to account for fixed search bar */}
          <div className="pt-20 px-4">
            <h1 className="text-2xl font-bold mb-2 text-center">
              Welcome to GiftFinder!
            </h1>
            <div className="mb-8">
              {intent ? (
                <ResultsStub intent={intent} onBack={() => setIntent(null)} />
              ) : (
                <QuickGiftPicker onSubmit={(i: GachaIntent) => setIntent(i)} />
              )}
            </div>
          </div>
        </div>
      )}
    </SearchProvider>
  )
}

import { SearchInput, SearchProvider } from '@shopify/shop-minis-react'
import { GiftBundle } from './types/giftFinder'
import { QuickGiftPicker } from './components/QuickGiftPicker'
import { GachaIntent } from './types/quickPicker'
import React, { useState, useEffect } from 'react'
import { ResultsStub } from './components/ResultsStub'

// Import demo for browser console testing
import './examples/giftFinderDemo'
import { quickCacheTest } from './utils/cacheTester'

export function App() {
  const [intent, setIntent] = useState<GachaIntent | null>(null)

  const handleAddBundleToCart = async (bundle: GiftBundle) => {
    console.log('Adding bundle to cart:', bundle)
    // TODO: Implement actual cart functionality
    alert(`Added "${bundle.title}" to cart!`)
  }

  const [cacheTestResults, setCacheTestResults] = useState<string[]>([])
  const [isRunningCacheTest, setIsRunningCacheTest] = useState(false)

  // Temporary cache test - runs automatically when app loads
  useEffect(() => {
    const runCacheTest = async () => {
      setIsRunningCacheTest(true)
      setCacheTestResults(['🧪 Starting cache test...'])
      
      try {
        const results = await quickCacheTest()
        setCacheTestResults(results)
        console.log('📋 Cache Test Results:', results)
      } catch (error) {
        const errorMessage = `❌ Cache test failed: ${error.message}`
        setCacheTestResults([errorMessage])
        console.error(errorMessage)
      } finally {
        setIsRunningCacheTest(false)
      }
    }

    // Run test after a short delay to ensure app is fully loaded
    const timer = setTimeout(runCacheTest, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <SearchProvider>
      <div className="pb-6">
        {/* Search bar with shop minis font and styling */}
        <div className="fixed top-0 left-0 right-0 p-4 w-full z-20 bg-background">
          <SearchInput 
            placeholder="Search for gifts..." 
            className="font-['Suisse_Intl']" // Using shop minis font
          />
        </div>
        
        {/* Content with top spacing to account for fixed search bar */}
        <div className="pt-20 px-4">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Welcome to GiftFinder!
          </h1>
          
          {/* Temporary cache test results display */}
          {isRunningCacheTest && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">🔄 Running cache test...</div>
            </div>
          )}
          
          {cacheTestResults.length > 0 && !isRunningCacheTest && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">🧪 Cache Test Results:</div>
              <div className="text-xs space-y-1">
                {cacheTestResults.map((result, index) => (
                  <div key={index} className="text-gray-700">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-8">
            {intent ? (
              <ResultsStub intent={intent} onBack={() => setIntent(null)} />
            ) : (
              <QuickGiftPicker onSubmit={(i: GachaIntent) => setIntent(i)} />
            )}
          </div>
        </div>
      </div>
    </SearchProvider>
  )
}

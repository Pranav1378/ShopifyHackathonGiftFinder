import { SearchInput, SearchProvider } from '@shopify/shop-minis-react'
import { GiftBundle } from './types/giftFinder'
import { QuickGiftPicker } from './components/QuickGiftPicker'
import { GachaIntent } from './types/quickPicker'

// Import demo for browser console testing
import './examples/giftFinderDemo'

export function App() {
  

  const handleAddBundleToCart = async (bundle: GiftBundle) => {
    console.log('Adding bundle to cart:', bundle)
    // TODO: Implement actual cart functionality
    alert(`Added "${bundle.title}" to cart!`)
  }

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
          <div className="mb-8">
            <QuickGiftPicker onSubmit={(intent: GachaIntent) => {
              // Navigate to results with params; for now, just log
              console.log('GachaIntent', intent)
            }} />
          </div>
        </div>
      </div>
    </SearchProvider>
  )
}

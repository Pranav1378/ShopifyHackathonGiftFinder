import {usePopularProducts, ProductCard, SearchInput, SearchProvider} from '@shopify/shop-minis-react'
import { GiftFinder } from './components/GiftFinder'
import { useState } from 'react'
import { GiftBundle } from './types/giftFinder'

// Import demo for browser console testing
import './examples/giftFinderDemo'

export function App() {
  const {products} = usePopularProducts()
  const [showGiftFinder, setShowGiftFinder] = useState(false)

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
          
          {/* Gift Finder Toggle */}
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowGiftFinder(!showGiftFinder)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {showGiftFinder ? 'Hide Gift Finder' : 'Find Perfect Gifts'}
            </button>
          </div>

          {/* Gift Finder Component */}
          {showGiftFinder && (
            <div className="mb-8">
              <GiftFinder
                onAddBundleToCart={handleAddBundleToCart}
                shopDomain="your-shop.myshopify.com"
                storefrontAccessToken="your-storefront-token"
              />
            </div>
          )}

          <p className="text-base text-gray-600 mb-6 text-center">
            {showGiftFinder ? 'Use the Gift Finder above or browse popular products below' : 'Popular products today'}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </SearchProvider>
  )
}

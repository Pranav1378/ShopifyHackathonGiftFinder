import {usePopularProducts, ProductCard, SearchInput, SearchProvider} from '@shopify/shop-minis-react'

export function App() {
  const {products} = usePopularProducts()

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
            Welcome to Shop Minis!
          </h1>
      <p className="text-xs text-blue-600 mb-4 text-center bg-blue-50 py-2 px-4 rounded border border-blue-200">
        🛠️ Edit <b>src/App.tsx</b> to change this screen and come back to see
        your edits!
      </p>
      <p className="text-base text-gray-600 mb-6 text-center">
        These are the popular products today
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

# 🎁 GiftFinder - Budget-Aware Gift Bundle Generator

A Shopify Mini that creates personalized gift bundles based on recipient profiles and budget constraints. Built with React, TypeScript, and the Shopify Storefront API.

## 🌟 Features

- **Intelligent Bundle Generation**: Creates 3-7 gift bundles tailored to recipient profiles
- **Budget Optimization**: Ensures bundles stay within budget or clearly mark near-budget options
- **Diversity Scoring**: Balances variety across categories, price ranges, and styles
- **LLM-Powered Insights**: Uses AI to extract intent and generate compelling descriptions
- **Mobile-First Design**: Optimized for touch interactions using Shopify Polaris components
- **Real-time Search**: Integrates with Shopify's product catalog via GraphQL
- **Graceful Degradation**: Handles errors and sparse data elegantly

## 🏗️ Architecture

### Core Components

```
src/
├── types/giftFinder.ts         # TypeScript definitions
├── services/
│   ├── shopifyClient.ts        # Shopify GraphQL integration
│   ├── bundleGenerator.ts      # Bundle assembly logic
│   ├── llmService.ts          # AI intent extraction
│   └── cacheService.ts        # In-memory caching
├── components/
│   ├── GiftFinder.tsx         # Main orchestrator
│   ├── ProfileForm.tsx        # Recipient profile input
│   ├── BundleGrid.tsx         # Results display
│   └── BundleCard.tsx         # Individual bundle cards
├── api/giftFinderApi.ts       # Main API orchestration
├── mocks/shopifyMockData.ts   # Development fixtures
└── examples/giftFinderDemo.ts # Demo scenarios
```

### Data Flow

1. **Profile & Intent** → User fills profile form and gift prompt
2. **LLM Extraction** → Extract structured intent from unstructured input
3. **Product Search** → Query Shopify catalog with filters
4. **Bundle Assembly** → Greedy algorithm creates optimal combinations
5. **Scoring & Ranking** → Multi-factor scoring (relevance, budget fit, diversity)
6. **LLM Enrichment** → Generate titles and rationales
7. **Results Display** → Mobile-optimized bundle cards with actions

## 🚀 Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser and navigate to the app
# GiftFinder will be available via the toggle button
```

### Testing the Demo

```bash
# Run all demo scenarios
npm run demo

# Or test in browser console:
giftFinderDemo.runDemo("Cozy Birthday Gift")
giftFinderDemo.runAllDemos()
giftFinderDemo.benchmark()
```

### Production Setup

1. **Configure Shopify Integration**:
   ```typescript
   initializeServices({
     shopDomain: 'your-shop.myshopify.com',
     storefrontAccessToken: 'your-storefront-access-token',
     llmApiKey: 'your-openai-api-key' // optional
   })
   ```

2. **Set up product tagging** in Shopify Admin:
   ```
   # Interest tags
   interest:tea, interest:coffee, interest:reading

   # Style tags  
   style:minimal, style:boho, style:luxe

   # Theme tags
   theme:cozy, theme:birthday, theme:wellness

   # Constraint tags
   allergen_free:fragrance, vegan-only, no:glass
   ```

## 📊 Bundle Generation Algorithm

### Intent Extraction
Converts natural language into structured signals:
```typescript
{
  hardConstraints: ["no:fragrance", "vegan-only"],
  softPrefs: ["interest:tea", "style:minimal"],
  targetCategories: ["tea accessories", "home textiles"],
  budgetStrategy: "balanced" | "hero" | "stocking"
}
```

### Assembly Strategies

- **Balanced**: 3-4 items of similar price ranges
- **Hero**: 1 premium item (30-60% budget) + companions  
- **Stocking**: 4-6 smaller items (max 25% each)

### Scoring Formula
```
score = 0.45 × relevance + 0.25 × budgetFit + 0.15 × diversity + 0.10 × novelty + 0.05 × inventory
```

## 🎯 Example Usage

### Basic Profile
```typescript
const profile: RecipientProfile = {
  relationship: "partner",
  ageRange: "30s", 
  interests: ["tea", "reading"],
  style: ["minimal"],
  dislikes: ["strong fragrance"],
  budget: 75
}
```

### Generated Bundle
```typescript
{
  title: "Cozy Tea Evening Kit",
  rationale: "Perfect for quiet evenings with warm tea and a good book...",
  price: { total: 72.00 },
  items: [
    { title: "Organic Tea Sampler", price: 28.00 },
    { title: "Ceramic Mug with Infuser", price: 24.00 },
    { title: "Chunky Knit Throw", price: 20.00 }
  ],
  diversityScore: 0.78
}
```

## 🧪 Testing Scenarios

### Included Demo Profiles
- **Tea Lover**: Cozy, minimal, fragrance-sensitive
- **Tech Enthusiast**: Modern, practical, on-the-go
- **Fashionista**: Luxury, style-focused, accessories
- **Health-Conscious Parent**: Vegan, home-focused, allergen-aware
- **Minimalist**: Quality over quantity, wellness-oriented

### Budget Test Cases
- **Low Budget** ($25): Stocking stuffer approach
- **Medium Budget** ($75): Balanced 3-item bundles
- **High Budget** ($200): Premium hero items + complements

## ⚡ Performance & Caching

- **Intent Caching**: 30min TTL on LLM extractions
- **Catalog Caching**: 5min TTL on product searches  
- **Graceful Degradation**: Fallback bundles on API failures
- **Batch Processing**: Groups GraphQL requests efficiently

## 🔧 Configuration

### Environment Variables
```bash
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
OPENAI_API_KEY=your-openai-key  # optional
```

### Bundle Generator Config
```typescript
const config: BundleConfig = {
  minItems: 2,
  maxItems: 6, 
  diversityThreshold: 0.6,
  budgetTolerance: 0.1  // 10% over budget allowed
}
```

## 🚨 Error Handling

### Graceful Degradation
- **No Products Found** → Suggests budget/constraint relaxation
- **LLM Failure** → Falls back to rule-based extraction  
- **API Timeout** → Returns cached/simplified results
- **Budget Too Low** → Shows single items + near-budget options

### Validation
- Profile validation before processing
- Budget bounds checking ($5 - $500)
- Constraint conflict detection
- Product availability verification

## 📱 Mobile UI Features

- **Touch-Optimized**: Large tap targets, swipe gestures
- **Progressive Enhancement**: Works offline with cached data
- **Fast Loading**: Skeleton states, optimistic updates
- **Accessibility**: Screen reader support, keyboard navigation

## 🔮 Future Enhancements

- **Item Swapping**: Replace individual items in bundles
- **Save/Share**: Wishlist functionality  
- **Price Tracking**: Monitor bundle price changes
- **Gift Wrapping**: Add-on services integration
- **Recommendations**: ML-based similarity engine
- **A/B Testing**: Bundle presentation optimization

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)  
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ for Shopify Merchants**

/**
 * Mock Shopify Data for Development and Testing
 * Realistic product data for gift finder testing
 */

import { ShopifyProduct, ShopifyVariant } from '../types/giftFinder'

export const mockShopifyProducts: ShopifyProduct[] = [
  // Tea & Coffee Products
  {
    id: 'gid://shopify/Product/1',
    title: 'Organic Tea Sampler Set',
    productType: 'Tea',
    tags: ['interest:tea', 'organic', 'theme:cozy', 'allergen_free:fragrance', 'gift-ready'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Default Title',
          price: { amount: '28.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/2',
    title: 'Ceramic Tea Mug with Infuser',
    productType: 'Tea Accessories',
    tags: ['interest:tea', 'style:minimal', 'home', 'ceramic'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/2',
          title: 'White',
          price: { amount: '24.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Home & Cozy Items
  {
    id: 'gid://shopify/Product/3',
    title: 'Chunky Knit Throw Blanket',
    productType: 'Home Textiles',
    tags: ['theme:cozy', 'home', 'comfort', 'style:minimal'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/3',
          title: 'Cream',
          price: { amount: '45.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/4',
    title: 'Essential Oil Diffuser',
    productType: 'Wellness',
    tags: ['wellness', 'aromatherapy', 'home', 'relaxation'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/4',
          title: 'White',
          price: { amount: '35.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Reading & Books
  {
    id: 'gid://shopify/Product/5',
    title: 'Reading Light & Book Stand',
    productType: 'Reading Accessories',
    tags: ['interest:reading', 'books', 'study', 'lighting'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/5',
          title: 'Default',
          price: { amount: '22.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/6',
    title: 'Leather Bookmark Set',
    productType: 'Stationery',
    tags: ['interest:reading', 'books', 'leather', 'style:classic'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/6',
          title: 'Brown Leather',
          price: { amount: '18.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Skincare & Wellness
  {
    id: 'gid://shopify/Product/7',
    title: 'Natural Face Moisturizer',
    productType: 'Skincare',
    tags: ['skincare', 'natural', 'wellness', 'allergen_free:fragrance'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/7',
          title: 'Unscented',
          price: { amount: '32.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Fashion & Accessories
  {
    id: 'gid://shopify/Product/8',
    title: 'Minimalist Silver Earrings',
    productType: 'Jewelry',
    tags: ['jewelry', 'style:minimal', 'silver', 'accessories'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/8',
          title: 'Silver',
          price: { amount: '29.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Tech & Gadgets
  {
    id: 'gid://shopify/Product/9',
    title: 'Wireless Phone Charger',
    productType: 'Tech Accessories',
    tags: ['tech gadgets', 'wireless', 'convenience', 'modern'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/9',
          title: 'Black',
          price: { amount: '26.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Coffee Items
  {
    id: 'gid://shopify/Product/10',
    title: 'French Press Coffee Maker',
    productType: 'Coffee Accessories',
    tags: ['interest:coffee', 'brewing', 'home', 'glass'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/10',
          title: '34oz',
          price: { amount: '38.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Premium Items
  {
    id: 'gid://shopify/Product/11',
    title: 'Cashmere Scarf',
    productType: 'Fashion Accessories',
    tags: ['fashion', 'luxury', 'cashmere', 'style:classic', 'winter'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/11',
          title: 'Beige',
          price: { amount: '85.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },

  // Small Items for Stocking Stuffers
  {
    id: 'gid://shopify/Product/12',
    title: 'Artisan Chocolate Bar',
    productType: 'Food & Snacks',
    tags: ['chocolate', 'artisan', 'treats', 'gift-ready'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/12',
          title: 'Dark 70%',
          price: { amount: '12.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/13',
    title: 'Succulent Plant in Pot',
    productType: 'Plants',
    tags: ['plants', 'home', 'low-maintenance', 'green'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop'
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/13',
          title: 'Small Pot',
          price: { amount: '15.00', currencyCode: 'USD' },
          availableForSale: true,
          image: {
            url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop'
          }
        }
      ]
    }
  }
]

/**
 * Mock function to simulate Shopify GraphQL API responses
 */
export function mockShopifyGraphQLResponse(query: string, variables: any) {
  console.log('🎭 Mock Shopify GraphQL called with:', { query: query.substring(0, 100) + '...', variables })
  
  // Simulate search filtering
  let filteredProducts = [...mockShopifyProducts]
  
  if (variables.query) {
    const queryLower = variables.query.toLowerCase()
    
    // Simple tag-based filtering
    if (queryLower.includes('tea')) {
      filteredProducts = filteredProducts.filter(p => 
        p.tags.includes('interest:tea') || p.productType === 'Tea'
      )
    }
    
    if (queryLower.includes('cozy')) {
      filteredProducts = filteredProducts.filter(p => 
        p.tags.includes('theme:cozy')
      )
    }
    
    if (queryLower.includes('minimal')) {
      filteredProducts = filteredProducts.filter(p => 
        p.tags.includes('style:minimal')
      )
    }
    
    // Price filtering
    if (queryLower.includes('variants.price:<=')) {
      const priceMatch = queryLower.match(/variants\.price:<=(\d+)/)
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[1])
        filteredProducts = filteredProducts.filter(p => 
          parseFloat(p.variants.nodes[0].price.amount) <= maxPrice
        )
      }
    }
  }
  
  // Limit results
  const first = variables.first || 20
  filteredProducts = filteredProducts.slice(0, first)
  
  return {
    data: {
      products: {
        nodes: filteredProducts
      }
    }
  }
}

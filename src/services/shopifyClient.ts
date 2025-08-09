/**
 * Shopify Storefront GraphQL Client
 * Handles product search and data retrieval for gift bundle generation
 */

import {
  ShopifyProduct,
  ProductSearchConfig,
  GiftIntent,
  CandidateVariant,
  GIFT_FINDER_CONFIG
} from '../types/giftFinder';

// GraphQL queries
const GIFT_FINDER_PRODUCTS_QUERY = `
  query GiftFinderProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      nodes {
        id
        title
        productType
        tags
        variants(first: 5) {
          nodes {
            id
            price { 
              amount 
              currencyCode 
            }
            availableForSale
            title
            image { 
              url 
            }
          }
        }
        featuredImage { 
          url 
        }
      }
    }
  }
`;

const ADD_BUNDLE_TO_CART_MUTATION = `
  mutation AddBundleToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export class ShopifyClient {
  private storefrontAccessToken: string;
  private shopDomain: string;
  private apiVersion: string = '2024-01';

  constructor(shopDomain: string, storefrontAccessToken: string) {
    this.shopDomain = shopDomain;
    this.storefrontAccessToken = storefrontAccessToken;
  }

  private get endpoint(): string {
    return `https://${this.shopDomain}/api/${this.apiVersion}/graphql.json`;
  }

  private async makeRequest(query: string, variables: Record<string, any> = {}) {
    // Use mock data in development
    if (this.shopDomain === 'mock-shop.myshopify.com' || this.storefrontAccessToken === 'mock-token') {
      const { mockShopifyGraphQLResponse } = await import('../mocks/shopifyMockData');
      console.log('🎭 Using mock Shopify data');
      return mockShopifyGraphQLResponse(query, variables).data;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  /**
   * Build search query string from gift intent
   */
  private buildSearchQuery(intent: GiftIntent, budget: number): string {
    const queries: string[] = [];
    
    // Include soft preferences as OR conditions
    if (intent.softPrefs.length > 0) {
      const prefQuery = intent.softPrefs
        .map(pref => `tag:'${pref}'`)
        .join(' OR ');
      queries.push(`(${prefQuery})`);
    }

    // Include target categories
    if (intent.targetCategories.length > 0) {
      const categoryQuery = intent.targetCategories
        .map(cat => `product_type:'${cat}'`)
        .join(' OR ');
      queries.push(`(${categoryQuery})`);
    }

    // Exclude hard constraints
    intent.hardConstraints.forEach(constraint => {
      if (constraint.startsWith('no:')) {
        const tag = constraint.replace('no:', '');
        queries.push(`-tag:'${tag}'`);
      } else if (constraint.startsWith('allergen:no:')) {
        const allergen = constraint.replace('allergen:no:', '');
        queries.push(`-tag:'allergen:${allergen}'`);
      }
    });

    // Add basic filters
    queries.push('available_for_sale:true');
    
    // Price filter (individual items should be reasonable portion of budget)
    const maxItemPrice = Math.min(budget * 0.8, budget - 10); // Leave room for other items
    if (maxItemPrice > 0) {
      queries.push(`variants.price:<=${maxItemPrice}`);
    }

    return queries.join(' ');
  }

  /**
   * Search for candidate products based on gift intent
   */
  async searchCandidateProducts(intent: GiftIntent, budget: number): Promise<ShopifyProduct[]> {
    const searchQuery = this.buildSearchQuery(intent, budget);
    
    console.log('🔍 Shopify search query:', searchQuery);

    const config: ProductSearchConfig = {
      query: searchQuery,
      first: Math.min(GIFT_FINDER_CONFIG.MAX_CANDIDATES, 80),
      maxPrice: budget,
      inStock: true,
    };

    try {
      const data = await this.makeRequest(GIFT_FINDER_PRODUCTS_QUERY, {
        query: config.query,
        first: config.first,
      });

      const products = data.products?.nodes || [];
      console.log(`📦 Found ${products.length} candidate products`);
      
      return products;
    } catch (error) {
      console.error('❌ Shopify search error:', error);
      throw new Error(`Product search failed: ${error.message}`);
    }
  }

  /**
   * Filter and score variants for bundle assembly
   */
  filterAndScoreVariants(
    products: ShopifyProduct[], 
    intent: GiftIntent, 
    budget: number
  ): CandidateVariant[] {
    const candidates: CandidateVariant[] = [];

    for (const product of products) {
      // Get best variant (first available, or first if none available)
      const availableVariants = product.variants.nodes.filter(v => v.availableForSale);
      const bestVariant = availableVariants[0] || product.variants.nodes[0];
      
      if (!bestVariant) continue;

      const priceValue = parseFloat(bestVariant.price.amount);
      if (priceValue > budget * 0.9) continue; // Skip if too expensive

      // Calculate relevance score
      let relevanceScore = 0;
      const matchedSignals: string[] = [];

      // Hard constraints boost (must-haves)
      intent.softPrefs.forEach(pref => {
        if (product.tags.includes(pref)) {
          relevanceScore += 0.3;
          matchedSignals.push(pref);
        }
      });

      // Category match
      const categoryMatch = intent.targetCategories.some(cat => 
        product.productType.toLowerCase().includes(cat.toLowerCase()) ||
        product.title.toLowerCase().includes(cat.toLowerCase())
      );
      if (categoryMatch) {
        relevanceScore += 0.2;
        matchedSignals.push('category_match');
      }

      // Price-value scoring (prefer mid-range items)
      const priceRatio = priceValue / budget;
      if (priceRatio > 0.1 && priceRatio < 0.6) {
        relevanceScore += 0.1;
      }

      // Determine category for diversity scoring
      let category = product.productType || 'general';
      if (product.tags.includes('interest:tea') || product.title.toLowerCase().includes('tea')) {
        category = 'beverages';
      } else if (product.tags.includes('theme:cozy') || product.tags.includes('home')) {
        category = 'home';
      } else if (product.tags.includes('style:minimal') || product.tags.includes('style:')) {
        category = 'style';
      }

      candidates.push({
        product,
        variant: bestVariant,
        relevanceScore,
        category,
        priceValue,
        matchedSignals,
      });
    }

    // Sort by relevance score (highest first)
    return candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Add bundle to cart via Storefront API
   */
  async addBundleToCart(cartId: string, bundleItems: Array<{variantId: string, quantity: number}>) {
    const lines = bundleItems.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity,
    }));

    try {
      const data = await this.makeRequest(ADD_BUNDLE_TO_CART_MUTATION, {
        cartId,
        lines,
      });

      if (data.cartLinesAdd?.userErrors?.length > 0) {
        throw new Error(`Cart errors: ${JSON.stringify(data.cartLinesAdd.userErrors)}`);
      }

      return data.cartLinesAdd.cart;
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw new Error(`Failed to add bundle to cart: ${error.message}`);
    }
  }

  /**
   * Get similar products for item swapping
   */
  async findSimilarProducts(
    originalProduct: ShopifyProduct, 
    intent: GiftIntent, 
    maxPrice: number
  ): Promise<ShopifyProduct[]> {
    // Build query for similar items
    const similarQuery = [
      `product_type:'${originalProduct.productType}'`,
      `variants.price:<=${maxPrice}`,
      'available_for_sale:true',
      `-id:'${originalProduct.id}'`, // Exclude original
    ].join(' ');

    try {
      const data = await this.makeRequest(GIFT_FINDER_PRODUCTS_QUERY, {
        query: similarQuery,
        first: 10,
      });

      return data.products?.nodes || [];
    } catch (error) {
      console.error('❌ Similar products search error:', error);
      return [];
    }
  }
}

/**
 * Utility functions for working with Shopify data
 */
export const shopifyUtils = {
  /**
   * Extract numeric price from Shopify price object
   */
  extractPrice: (priceObj: { amount: string; currencyCode: string }): number => {
    return parseFloat(priceObj.amount);
  },

  /**
   * Get best image URL from product or variant
   */
  getBestImageUrl: (product: ShopifyProduct, variant?: any): string => {
    return variant?.image?.url || 
           product.featuredImage?.url || 
           'https://via.placeholder.com/300x300?text=No+Image';
  },

  /**
   * Format price for display
   */
  formatPrice: (amount: number, currencyCode: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  },

  /**
   * Generate stable bundle ID from variant IDs and budget
   */
  generateBundleId: (variantIds: string[], budget: number): string => {
    const sortedIds = [...variantIds].sort();
    const baseString = `${sortedIds.join('-')}-${budget}`;
    
    // Simple hash function (for real implementation, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `bundle_${Math.abs(hash)}`;
  }
};

export default ShopifyClient;

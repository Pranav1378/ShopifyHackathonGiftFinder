/**
 * Gift Finder API Client
 * Main orchestration function for gift bundle generation
 */

import {
  GiftFinderRequest,
  GiftFinderResult,
  GiftBundle,
  RecipientProfile,
  GiftIntent,
  CandidateVariant,
  GIFT_FINDER_CONFIG,
} from '../types/giftFinder'
import ShopifyClient from '../services/shopifyClient'
import BundleGenerator from '../services/bundleGenerator'
import LLMService, { llmUtils } from '../services/llmService'
import { CacheService } from '../services/cacheService'

// Service instances (will be configured in real implementation)
let shopifyClient: ShopifyClient
let llmService: LLMService
let bundleGenerator: BundleGenerator
let cacheService: CacheService

/**
 * Initialize services with configuration
 */
export function initializeServices(config: {
  shopDomain: string
  storefrontAccessToken: string
  llmApiKey?: string
}) {
  shopifyClient = new ShopifyClient(config.shopDomain, config.storefrontAccessToken)
  llmService = new LLMService(config.llmApiKey)
  bundleGenerator = new BundleGenerator()
  cacheService = new CacheService()
}

/**
 * Main gift bundle generation function
 * Orchestrates the entire pipeline from intent extraction to enrichment
 */
export async function generateGiftBundles(request: GiftFinderRequest): Promise<GiftFinderResult> {
  console.log('🎁 Starting gift bundle generation...', { 
    budget: request.budget, 
    prompt: request.prompt.substring(0, 50) + '...' 
  })

  try {
    // Step 1: Extract gift intent using LLM
    const intent = await extractGiftIntentWithCache(request)
    console.log('🎯 Extracted intent:', intent)

    // Step 2: Search for candidate products
    const products = await searchCandidateProducts(intent, request.budget)
    console.log(`📦 Found ${products.length} candidate products`)

    // Step 3: Filter and score variants
    const candidates = shopifyClient.filterAndScoreVariants(products, intent, request.budget)
    console.log(`⭐ Scored ${candidates.length} candidate variants`)

    // Step 4: Assemble bundles
    const partialBundles = bundleGenerator.assembleBundles(
      candidates,
      request.budget,
      intent,
      request.maxBundles || GIFT_FINDER_CONFIG.DEFAULT_MAX_BUNDLES
    )
    console.log(`📋 Assembled ${partialBundles.length} partial bundles`)

    // Step 5: Enrich with LLM-generated titles and rationales
    const enrichedBundles = await enrichBundlesWithCache(partialBundles, request)
    console.log(`✨ Enriched ${enrichedBundles.length} final bundles`)

    // Step 6: Build diagnostics
    const diagnostics = buildDiagnostics(intent, candidates, enrichedBundles)

    const result: GiftFinderResult = {
      bundles: enrichedBundles,
      diagnostics,
    }

    console.log('🎉 Gift bundle generation complete!')
    return result

  } catch (error) {
    console.error('❌ Gift bundle generation failed:', error)
    
    // Graceful degradation - return fallback bundles if possible
    return handleGenerationError(error, request)
  }
}

/**
 * Extract gift intent with caching
 */
async function extractGiftIntentWithCache(request: GiftFinderRequest): Promise<GiftIntent> {
  const cacheKey = llmUtils.createPromptHash(request.profile, request.prompt)
  
  // Try cache first
  const cached = cacheService?.get<GiftIntent>(cacheKey)
  if (cached) {
    console.log('💾 Using cached intent')
    return cached
  }

  // Extract intent using LLM
  const intent = await llmService.extractGiftIntent({
    profile: request.profile,
    prompt: request.prompt,
    budget: request.budget,
  })

  // Cache result
  cacheService?.set(cacheKey, intent, GIFT_FINDER_CONFIG.CACHE_TTL_INTENT)

  return intent
}

/**
 * Search for candidate products with caching
 */
async function searchCandidateProducts(intent: GiftIntent, budget: number) {
  // Create cache key based on intent and budget
  const intentKey = JSON.stringify(intent) + budget
  const cacheKey = `products_${btoa(intentKey).substring(0, 16)}`
  
  // Try cache first
  const cached = cacheService?.get(cacheKey)
  if (cached) {
    console.log('💾 Using cached products')
    return cached
  }

  // Search products
  const products = await shopifyClient.searchCandidateProducts(intent, budget)

  // Cache results
  cacheService?.set(cacheKey, products, GIFT_FINDER_CONFIG.CACHE_TTL_CATALOG)

  return products
}

/**
 * Enrich bundles with caching
 */
async function enrichBundlesWithCache(
  partialBundles: Partial<GiftBundle>[],
  request: GiftFinderRequest
): Promise<GiftBundle[]> {
  // For development, skip caching of enrichment as it's relatively fast
  return await llmService.enrichBundles({
    bundles: partialBundles,
    profile: request.profile,
    prompt: request.prompt,
  })
}

/**
 * Build diagnostic information
 */
function buildDiagnostics(
  intent: GiftIntent,
  candidates: CandidateVariant[],
  bundles: GiftBundle[]
) {
  const matchedSignals = new Set<string>()
  const unmetConstraints: string[] = []
  const inventoryNotes: string[] = []

  // Collect matched signals from candidates
  candidates.forEach(candidate => {
    candidate.matchedSignals.forEach(signal => matchedSignals.add(signal))
  })

  // Check for unmet soft preferences
  intent.softPrefs.forEach(pref => {
    if (!matchedSignals.has(pref)) {
      unmetConstraints.push(pref)
    }
  })

  // Check inventory notes
  if (candidates.length < 20) {
    inventoryNotes.push('Limited product selection available')
  }

  return {
    matchedSignals: Array.from(matchedSignals),
    unmetConstraints: unmetConstraints.length > 0 ? unmetConstraints : undefined,
    inventoryNotes: inventoryNotes.length > 0 ? inventoryNotes : undefined,
  }
}

/**
 * Handle generation errors with graceful degradation
 */
async function handleGenerationError(error: any, request: GiftFinderRequest): Promise<GiftFinderResult> {
  console.log('🔄 Attempting graceful degradation...')

  try {
    // Try with simplified/fallback approach
    const fallbackIntent: GiftIntent = {
      hardConstraints: [],
      softPrefs: request.profile.interests?.map(i => `interest:${i}`) || [],
      targetCategories: ['general'],
      budgetStrategy: 'balanced',
    }

    const products = await shopifyClient.searchCandidateProducts(fallbackIntent, request.budget)
    
    if (products.length > 0) {
      const candidates = shopifyClient.filterAndScoreVariants(products, fallbackIntent, request.budget)
      const partialBundles = bundleGenerator.assembleBundles(candidates, request.budget, fallbackIntent, 3)
      
      // Simple enrichment for fallback
      const fallbackBundles: GiftBundle[] = partialBundles.map((bundle, index) => ({
        ...bundle,
        title: `Gift Bundle ${index + 1}`,
        rationale: 'A thoughtfully curated selection of items that fit your budget.',
      })) as GiftBundle[]

      return {
        bundles: fallbackBundles,
        diagnostics: {
          matchedSignals: [],
          unmetConstraints: ['Using simplified search due to technical issue'],
          inventoryNotes: ['Fallback results - try again for better matches'],
        },
      }
    }
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError)
  }

  // Ultimate fallback - empty result with helpful message
  return {
    bundles: [],
    diagnostics: {
      matchedSignals: [],
      unmetConstraints: ['Unable to generate bundles - please try different criteria'],
      inventoryNotes: ['Consider increasing budget or broadening preferences'],
    },
  }
}

/**
 * Search for similar products (for item swapping)
 */
export async function findSimilarProducts(
  originalProductId: string,
  intent: GiftIntent,
  maxPrice: number
) {
  if (!shopifyClient) {
    throw new Error('Shopify client not initialized')
  }

  // This would require fetching the original product first
  // For now, return empty array (to be implemented)
  console.log('🔄 Finding similar products for:', originalProductId)
  return []
}

/**
 * Add bundle to cart
 */
export async function addBundleToCart(cartId: string, bundle: GiftBundle) {
  if (!shopifyClient) {
    throw new Error('Shopify client not initialized')
  }

  const cartLines = bundle.items.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }))

  return await shopifyClient.addBundleToCart(cartId, cartLines)
}

// Initialize with mock data for development
if (typeof window !== 'undefined') {
  // Browser environment - initialize with mock data
  initializeServices({
    shopDomain: 'mock-shop.myshopify.com',
    storefrontAccessToken: 'mock-token',
    llmApiKey: 'mock-llm-key',
  })
}

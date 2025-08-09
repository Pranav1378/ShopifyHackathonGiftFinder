/**
 * GiftFinder TypeScript Models
 * Comprehensive types for the budget-aware gift bundle system
 */

// Core recipient profile structure
export type RecipientProfile = {
  name?: string;
  relationship?: "partner" | "parent" | "sibling" | "friend" | "coworker" | "other";
  ageRange?: "teen" | "20s" | "30s" | "40s" | "50s" | "60plus";
  genderPresentation?: "masc" | "fem" | "neutral" | "unknown";
  interests?: string[];
  dislikes?: string[];
  sizes?: {
    top?: string;
    bottom?: string;
    shoe?: string;
    general?: string;
  };
  style?: string[];
  allergies?: string[];
  constraints?: string[];
  locationClimate?: "cold" | "temperate" | "hot" | "mixed" | "unknown";
  notes?: string;
};

// LLM-extracted intent structure
export type GiftIntent = {
  hardConstraints: string[];   // ["no:fragrance","vegan-only"]
  softPrefs: string[];         // ["style:minimal","theme:cozy"]
  targetCategories: string[];  // ["tea accessories","home textiles","stationery"]
  budgetStrategy: "hero" | "balanced" | "stocking";
};

// Shopify product/variant data structure
export type ShopifyProduct = {
  id: string;
  title: string;
  productType: string;
  tags: string[];
  featuredImage?: {
    url: string;
  };
  variants: {
    nodes: ShopifyVariant[];
  };
};

export type ShopifyVariant = {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  image?: {
    url: string;
  };
};

// Bundle item structure
export type BundleItem = {
  productId: string;
  variantId: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
  tags?: string[];
  reasons?: string;
};

// Core gift bundle structure
export type GiftBundle = {
  id: string;
  title: string;
  themeTags: string[];
  rationale: string;
  price: {
    subtotal: number;
    estimatedDiscounts?: number;
    total: number;
    nearBudget?: boolean;
  };
  items: BundleItem[];
  diversityScore: number;
  safetyFlags?: string[];
};

// API response structure
export type GiftFinderResult = {
  bundles: GiftBundle[];
  diagnostics?: {
    matchedSignals: string[];
    unmetConstraints?: string[];
    inventoryNotes?: string[];
  };
};

// API request structure
export type GiftFinderRequest = {
  profile: RecipientProfile;
  prompt: string;
  budget: number;
  maxBundles?: number;
};

// Processed candidate for bundle assembly
export type CandidateVariant = {
  product: ShopifyProduct;
  variant: ShopifyVariant;
  relevanceScore: number;
  category: string;
  priceValue: number;
  matchedSignals: string[];
};

// Bundle assembly configuration
export type BundleConfig = {
  minItems: number;
  maxItems: number;
  diversityThreshold: number;
  budgetTolerance: number;
};

// LLM service interfaces
export type LLMIntentRequest = {
  profile: RecipientProfile;
  prompt: string;
  budget: number;
};

export type LLMEnrichmentRequest = {
  bundles: Partial<GiftBundle>[];
  profile: RecipientProfile;
  prompt: string;
};

// GraphQL query configuration
export type ProductSearchConfig = {
  query: string;
  first: number;
  maxPrice?: number;
  inStock?: boolean;
};

// Cache key structures
export type CatalogCacheKey = {
  shopId: string;
  tagQuery: string;
  priceCeil: number;
};

export type IntentCacheKey = {
  profileHash: string;
  promptHash: string;
};

// Error types for graceful degradation
export type GiftFinderError = {
  code: 'BUDGET_TOO_LOW' | 'NO_PRODUCTS_FOUND' | 'API_ERROR' | 'CONSTRAINT_CONFLICT';
  message: string;
  suggestions?: string[];
  fallbackBundles?: GiftBundle[];
};

// Component prop interfaces
export interface GiftFinderProps {
  onAddBundleToCart: (bundle: GiftBundle) => void;
  initialProfile?: Partial<RecipientProfile>;
  shopDomain: string;
  storefrontAccessToken: string;
}

export interface BundleCardProps {
  bundle: GiftBundle;
  onViewDetails: (bundle: GiftBundle) => void;
  onAddToCart: (bundle: GiftBundle) => void;
}

export interface ProfileFormProps {
  profile: RecipientProfile;
  onChange: (profile: RecipientProfile) => void;
}

export interface BundleDetailsProps {
  bundle: GiftBundle;
  onClose: () => void;
  onSwapItem: (itemIndex: number) => void;
  onAddToCart: (bundle: GiftBundle) => void;
}

// Utility types
export type Branded<T, Brand> = T & { __brand: Brand };
export type ProductId = Branded<string, 'ProductId'>;
export type VariantId = Branded<string, 'VariantId'>;
export type BundleId = Branded<string, 'BundleId'>;

// Constants for configuration
export const GIFT_FINDER_CONFIG = {
  DEFAULT_MAX_BUNDLES: 6,
  MIN_BUNDLE_ITEMS: 2,
  MAX_BUNDLE_ITEMS: 6,
  BUDGET_TOLERANCE: 0.1, // 10%
  DIVERSITY_THRESHOLD: 0.6,
  CACHE_TTL_CATALOG: 300000, // 5 minutes
  CACHE_TTL_INTENT: 1800000, // 30 minutes
  MAX_CANDIDATES: 80,
  GRAPHQL_BATCH_SIZE: 20,
} as const;

// Helper type guards
export const isValidBudget = (budget: number): boolean => 
  typeof budget === 'number' && budget > 0 && budget < 10000;

export const isValidProfile = (profile: RecipientProfile): boolean =>
  typeof profile === 'object' && profile !== null;

export const hasRequiredVariantData = (variant: ShopifyVariant): boolean =>
  Boolean(variant.id && variant.price?.amount && variant.availableForSale);

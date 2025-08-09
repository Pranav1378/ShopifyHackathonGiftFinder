/**
 * Gift Bundle Generation Engine
 * Core logic for assembling budget-aware gift bundles with diversity scoring
 */

import {
  GiftBundle,
  BundleItem,
  CandidateVariant,
  GiftIntent,
  RecipientProfile,
  BundleConfig,
  GIFT_FINDER_CONFIG,
} from '../types/giftFinder';
import { shopifyUtils } from './shopifyClient';

export class BundleGenerator {
  private config: BundleConfig;

  constructor(config?: Partial<BundleConfig>) {
    this.config = {
      minItems: config?.minItems ?? GIFT_FINDER_CONFIG.MIN_BUNDLE_ITEMS,
      maxItems: config?.maxItems ?? GIFT_FINDER_CONFIG.MAX_BUNDLE_ITEMS,
      diversityThreshold: config?.diversityThreshold ?? GIFT_FINDER_CONFIG.DIVERSITY_THRESHOLD,
      budgetTolerance: config?.budgetTolerance ?? GIFT_FINDER_CONFIG.BUDGET_TOLERANCE,
    };
  }

  /**
   * Main bundle assembly function using greedy packing algorithm
   */
  assembleBundles(
    candidates: CandidateVariant[],
    budget: number,
    intent: GiftIntent,
    maxBundles: number = GIFT_FINDER_CONFIG.DEFAULT_MAX_BUNDLES
  ): Partial<GiftBundle>[] {
    const bundles: Partial<GiftBundle>[] = [];

    // Strategy 1: Balanced bundles (3-4 items)
    if (intent.budgetStrategy === 'balanced') {
      bundles.push(...this.createBalancedBundles(candidates, budget, 3));
    }

    // Strategy 2: Hero bundles (1 premium + 1-2 small items)
    if (intent.budgetStrategy === 'hero' || bundles.length < 2) {
      bundles.push(...this.createHeroBundles(candidates, budget, 2));
    }

    // Strategy 3: Stocking stuffer approach (4-6 smaller items)
    if (intent.budgetStrategy === 'stocking' || bundles.length < 1) {
      bundles.push(...this.createStockingBundles(candidates, budget, 1));
    }

    // Fallback: Single item bundles if nothing else works
    if (bundles.length === 0) {
      bundles.push(...this.createSingleItemBundles(candidates, budget));
    }

    // Score and rank bundles
    const scoredBundles = this.scoreAndRankBundles(bundles, intent, budget);

    return scoredBundles.slice(0, maxBundles);
  }

  /**
   * Create balanced bundles with 3-4 items of similar price ranges
   */
  private createBalancedBundles(
    candidates: CandidateVariant[],
    budget: number,
    targetCount: number
  ): Partial<GiftBundle>[] {
    const bundles: Partial<GiftBundle>[] = [];
    const targetItemCount = 3;
    const targetPricePerItem = budget / targetItemCount;

    // Group candidates by price tier
    const tiers = this.groupByPriceTier(candidates, targetPricePerItem);

    for (let attempt = 0; attempt < targetCount && bundles.length < targetCount; attempt++) {
      const bundle = this.greedyPackBundle(
        candidates,
        budget,
        targetItemCount,
        targetItemCount + 1,
        bundles
      );

      if (bundle) {
        bundles.push(bundle);
      }
    }

    return bundles;
  }

  /**
   * Create hero bundles with 1 premium item + smaller companions
   */
  private createHeroBundles(
    candidates: CandidateVariant[],
    budget: number,
    targetCount: number
  ): Partial<GiftBundle>[] {
    const bundles: Partial<GiftBundle>[] = [];

    // Find hero items (30-60% of budget)
    const heroItems = candidates.filter(
      c => c.priceValue >= budget * 0.3 && c.priceValue <= budget * 0.6
    );

    for (const hero of heroItems.slice(0, targetCount * 2)) {
      const remainingBudget = budget - hero.priceValue;
      const companions = candidates.filter(
        c => c.variant.id !== hero.variant.id && 
            c.priceValue <= remainingBudget &&
            c.priceValue >= 5 // Minimum meaningful price
      );

      const bundle = this.buildHeroBundle(hero, companions, remainingBudget);
      if (bundle && this.isValidBundle(bundle, budget)) {
        bundles.push(bundle);
      }

      if (bundles.length >= targetCount) break;
    }

    return bundles;
  }

  /**
   * Create stocking stuffer bundles with 4-6 smaller items
   */
  private createStockingBundles(
    candidates: CandidateVariant[],
    budget: number,
    targetCount: number
  ): Partial<GiftBundle>[] {
    const bundles: Partial<GiftBundle>[] = [];
    const maxItemPrice = budget * 0.25; // Each item max 25% of budget

    const smallItems = candidates.filter(c => c.priceValue <= maxItemPrice);

    for (let attempt = 0; attempt < targetCount; attempt++) {
      const bundle = this.greedyPackBundle(
        smallItems,
        budget,
        4,
        6,
        bundles
      );

      if (bundle) {
        bundles.push(bundle);
      }
    }

    return bundles;
  }

  /**
   * Create single item bundles as fallback
   */
  private createSingleItemBundles(
    candidates: CandidateVariant[],
    budget: number
  ): Partial<GiftBundle>[] {
    const bundles: Partial<GiftBundle>[] = [];

    // Find items that are 80-100% of budget (premium single items)
    const premiumItems = candidates.filter(
      c => c.priceValue >= budget * 0.8 && c.priceValue <= budget
    );

    // Also include near-budget items (within tolerance)
    const nearBudgetItems = candidates.filter(
      c => c.priceValue > budget && c.priceValue <= budget * (1 + this.config.budgetTolerance)
    );

    [...premiumItems, ...nearBudgetItems].slice(0, 3).forEach(item => {
      const bundleItem: BundleItem = {
        productId: item.product.id,
        variantId: item.variant.id,
        title: item.product.title,
        image: shopifyUtils.getBestImageUrl(item.product, item.variant),
        quantity: 1,
        unitPrice: item.priceValue,
        tags: item.product.tags,
        reasons: `Premium ${item.category} item that matches the gift intent`,
      };

      bundles.push({
        id: shopifyUtils.generateBundleId([item.variant.id], budget),
        items: [bundleItem],
        price: {
          subtotal: item.priceValue,
          total: item.priceValue,
          nearBudget: item.priceValue > budget,
        },
        diversityScore: 0.2, // Low diversity for single items
        themeTags: this.extractThemeTags([item]),
      });
    });

    return bundles;
  }

  /**
   * Greedy bundle packing algorithm
   */
  private greedyPackBundle(
    candidates: CandidateVariant[],
    budget: number,
    minItems: number,
    maxItems: number,
    existingBundles: Partial<GiftBundle>[]
  ): Partial<GiftBundle> | null {
    const usedVariantIds = new Set(
      existingBundles.flatMap(b => b.items?.map(i => i.variantId) || [])
    );

    const availableCandidates = candidates.filter(
      c => !usedVariantIds.has(c.variant.id)
    );

    const selectedItems: CandidateVariant[] = [];
    let currentTotal = 0;

    // Greedy selection
    for (const candidate of availableCandidates) {
      const wouldExceedBudget = currentTotal + candidate.priceValue > budget;
      const wouldExceedMaxItems = selectedItems.length >= maxItems;

      if (wouldExceedBudget || wouldExceedMaxItems) {
        continue;
      }

      // Check diversity (avoid too many items from same category)
      const categoryCount = selectedItems.filter(
        item => item.category === candidate.category
      ).length;

      if (categoryCount >= 2) continue; // Max 2 items per category

      selectedItems.push(candidate);
      currentTotal += candidate.priceValue;

      // Early exit if we have enough items and good budget utilization
      if (selectedItems.length >= minItems && currentTotal >= budget * 0.7) {
        break;
      }
    }

    // Validate bundle
    if (selectedItems.length < minItems || currentTotal < budget * 0.3) {
      return null;
    }

    return this.buildBundleFromItems(selectedItems, budget);
  }

  /**
   * Build hero bundle with one main item + companions
   */
  private buildHeroBundle(
    hero: CandidateVariant,
    companions: CandidateVariant[],
    remainingBudget: number
  ): Partial<GiftBundle> | null {
    const selectedItems = [hero];
    let currentTotal = hero.priceValue;

    // Add 1-2 companions
    for (const companion of companions) {
      if (currentTotal + companion.priceValue <= remainingBudget + (remainingBudget * 0.05)) {
        // Allow 5% over remaining budget
        selectedItems.push(companion);
        currentTotal += companion.priceValue;

        if (selectedItems.length >= 3) break; // Max 3 items for hero bundle
      }
    }

    if (selectedItems.length < 2) return null;

    return this.buildBundleFromItems(selectedItems, hero.priceValue + remainingBudget);
  }

  /**
   * Build bundle object from selected items
   */
  private buildBundleFromItems(
    items: CandidateVariant[],
    budget: number
  ): Partial<GiftBundle> {
    const bundleItems: BundleItem[] = items.map(item => ({
      productId: item.product.id,
      variantId: item.variant.id,
      title: item.product.title,
      image: shopifyUtils.getBestImageUrl(item.product, item.variant),
      quantity: 1,
      unitPrice: item.priceValue,
      tags: item.product.tags,
      reasons: `Matches ${item.matchedSignals.join(', ')} preferences`,
    }));

    const subtotal = bundleItems.reduce((sum, item) => sum + item.unitPrice, 0);
    const variantIds = bundleItems.map(item => item.variantId);

    return {
      id: shopifyUtils.generateBundleId(variantIds, budget),
      items: bundleItems,
      price: {
        subtotal,
        total: subtotal,
        nearBudget: subtotal > budget,
      },
      diversityScore: this.calculateDiversityScore(items),
      themeTags: this.extractThemeTags(items),
    };
  }

  /**
   * Calculate diversity score based on categories and attributes
   */
  private calculateDiversityScore(items: CandidateVariant[]): number {
    if (items.length <= 1) return 0.2;

    const categories = new Set(items.map(item => item.category));
    const priceRanges = new Set(items.map(item => this.getPriceRange(item.priceValue)));
    const tags = new Set(items.flatMap(item => item.product.tags));

    const categoryDiversity = categories.size / items.length;
    const priceRangeDiversity = priceRanges.size / items.length;
    const tagDiversity = Math.min(tags.size / (items.length * 3), 1); // Normalize tag diversity

    return (categoryDiversity * 0.5 + priceRangeDiversity * 0.3 + tagDiversity * 0.2);
  }

  /**
   * Extract theme tags from items
   */
  private extractThemeTags(items: CandidateVariant[]): string[] {
    const allTags = items.flatMap(item => item.product.tags);
    const themeTags = allTags.filter(tag => 
      tag.startsWith('theme:') || 
      tag.startsWith('style:') || 
      tag.startsWith('interest:')
    );

    return [...new Set(themeTags)].slice(0, 5); // Max 5 theme tags
  }

  /**
   * Score and rank bundles using weighted criteria
   */
  private scoreAndRankBundles(
    bundles: Partial<GiftBundle>[],
    intent: GiftIntent,
    budget: number
  ): Partial<GiftBundle>[] {
    return bundles
      .map(bundle => ({
        ...bundle,
        score: this.calculateBundleScore(bundle, intent, budget),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(({ score, ...bundle }) => bundle); // Remove score from final result
  }

  /**
   * Calculate comprehensive bundle score
   */
  private calculateBundleScore(
    bundle: Partial<GiftBundle>,
    intent: GiftIntent,
    budget: number
  ): number {
    if (!bundle.items || !bundle.price) return 0;

    // Relevance score (45%)
    const relevanceScore = this.calculateRelevanceScore(bundle, intent);

    // Budget fit score (25%)
    const budgetFitScore = this.calculateBudgetFitScore(bundle.price.total, budget);

    // Diversity score (15%) - already calculated
    const diversityScore = bundle.diversityScore || 0;

    // Novelty score (10%) - prefer varied combinations
    const noveltyScore = Math.min(bundle.items.length / 4, 1);

    // Inventory health score (5%) - all items available
    const inventoryScore = bundle.items.every(item => 
      // Assume all items are available if we got this far
      true
    ) ? 1 : 0.5;

    return (
      relevanceScore * 0.45 +
      budgetFitScore * 0.25 +
      diversityScore * 0.15 +
      noveltyScore * 0.10 +
      inventoryScore * 0.05
    );
  }

  /**
   * Calculate how well bundle matches the intent
   */
  private calculateRelevanceScore(bundle: Partial<GiftBundle>, intent: GiftIntent): number {
    if (!bundle.items) return 0;

    let score = 0;
    const allTags = bundle.items.flatMap(item => item.tags || []);
    const totalPossibleMatches = intent.softPrefs.length + intent.targetCategories.length;

    if (totalPossibleMatches === 0) return 0.5; // Neutral score if no preferences

    // Soft preferences matching
    intent.softPrefs.forEach(pref => {
      if (allTags.includes(pref)) {
        score += 1;
      }
    });

    // Category matching (check product types and tags)
    intent.targetCategories.forEach(category => {
      const hasMatch = bundle.items!.some(item => 
        item.title.toLowerCase().includes(category.toLowerCase()) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(category.toLowerCase()))
      );
      if (hasMatch) {
        score += 1;
      }
    });

    return Math.min(score / totalPossibleMatches, 1);
  }

  /**
   * Calculate how well the price fits the budget
   */
  private calculateBudgetFitScore(total: number, budget: number): number {
    const ratio = total / budget;

    if (ratio <= 1) {
      // Perfect fit at 90-100% of budget
      return ratio >= 0.9 ? 1 : ratio * 0.8;
    } else {
      // Penalty for exceeding budget
      const excess = ratio - 1;
      return Math.max(0, 1 - (excess * 3)); // Heavy penalty for going over
    }
  }

  /**
   * Group candidates by price tier for balanced selection
   */
  private groupByPriceTier(candidates: CandidateVariant[], targetPrice: number) {
    return {
      low: candidates.filter(c => c.priceValue < targetPrice * 0.7),
      mid: candidates.filter(c => c.priceValue >= targetPrice * 0.7 && c.priceValue <= targetPrice * 1.3),
      high: candidates.filter(c => c.priceValue > targetPrice * 1.3),
    };
  }

  /**
   * Get price range category for diversity calculation
   */
  private getPriceRange(price: number): string {
    if (price < 15) return 'low';
    if (price < 40) return 'mid';
    if (price < 80) return 'high';
    return 'premium';
  }

  /**
   * Validate bundle meets minimum requirements
   */
  private isValidBundle(bundle: Partial<GiftBundle>, budget: number): boolean {
    if (!bundle.items || bundle.items.length < this.config.minItems) {
      return false;
    }

    if (!bundle.price) return false;

    const withinBudget = bundle.price.total <= budget * (1 + this.config.budgetTolerance);
    const meetsMinimum = bundle.price.total >= budget * 0.3; // At least 30% of budget

    return withinBudget && meetsMinimum;
  }
}

export default BundleGenerator;

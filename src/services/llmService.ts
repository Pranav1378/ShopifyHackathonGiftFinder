/**
 * LLM Service for Gift Intent Extraction and Bundle Enrichment
 * Handles structured LLM calls for gift finder functionality
 */

import {
  RecipientProfile,
  GiftIntent,
  GiftBundle,
  LLMIntentRequest,
  LLMEnrichmentRequest,
} from '../types/giftFinder';

// Mock LLM responses for development (replace with actual LLM service)
const MOCK_MODE = true;

/**
 * LLM Service class handling intent extraction and bundle enrichment
 */
export class LLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = 'mock-key', baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Extract structured gift intent from profile and prompt
   */
  async extractGiftIntent(request: LLMIntentRequest): Promise<GiftIntent> {
    if (MOCK_MODE) {
      return this.mockExtractGiftIntent(request);
    }

    const systemPrompt = this.buildIntentExtractionSystemPrompt();
    const userPrompt = this.buildIntentExtractionUserPrompt(request);

    try {
      const response = await this.callLLM({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty LLM response for intent extraction');
      }

      return this.parseGiftIntent(content);
    } catch (error) {
      console.error('❌ LLM intent extraction error:', error);
      // Fallback to rule-based extraction
      return this.fallbackIntentExtraction(request);
    }
  }

  /**
   * Enrich bundles with titles and rationales
   */
  async enrichBundles(request: LLMEnrichmentRequest): Promise<GiftBundle[]> {
    if (MOCK_MODE) {
      return this.mockEnrichBundles(request);
    }

    const systemPrompt = this.buildEnrichmentSystemPrompt();
    const userPrompt = this.buildEnrichmentUserPrompt(request);

    try {
      const response = await this.callLLM({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty LLM response for bundle enrichment');
      }

      return this.parseEnrichedBundles(content, request.bundles);
    } catch (error) {
      console.error('❌ LLM bundle enrichment error:', error);
      // Fallback to simple enrichment
      return this.fallbackBundleEnrichment(request);
    }
  }

  /**
   * Build system prompt for intent extraction
   */
  private buildIntentExtractionSystemPrompt(): string {
    return `You extract normalized gift-buying signals from a recipient profile and a short prompt.
Return strict JSON GiftIntent with hardConstraints, softPrefs, targetCategories, budgetStrategy.
Do not invent facts; infer conservatively from provided inputs.

Rules:
- hardConstraints: "no:" prefix for dislikes, "allergen:no:" for allergies, exact constraints from profile
- softPrefs: "style:" for style preferences, "interest:" for interests, "theme:" for themes
- targetCategories: derive from interests and prompt nouns (mugs, blankets, books, etc.)
- budgetStrategy: "hero" if budget suggests one standout item, "balanced" for multiple mid-range items, "stocking" for many small items

Return only valid JSON, no explanations.`;
  }

  /**
   * Build user prompt for intent extraction
   */
  private buildIntentExtractionUserPrompt(request: LLMIntentRequest): string {
    const profileSummary = this.summarizeProfile(request.profile);
    
    return `PROFILE:
${JSON.stringify(request.profile, null, 2)}

PROMPT:
"${request.prompt}"

BUDGET: ${request.budget}

Profile Summary: ${profileSummary}

Extract GiftIntent JSON:`;
  }

  /**
   * Build system prompt for bundle enrichment
   */
  private buildEnrichmentSystemPrompt(): string {
    return `You generate concise titles and rationales for gift bundles. Do not change items or prices.
Create titles that are 3-5 words, catchy and descriptive.
Write rationales that are 1-3 sentences tying the bundle to the recipient profile and gift prompt.
Focus on how the items work together and why they fit the recipient.`;
  }

  /**
   * Build user prompt for bundle enrichment
   */
  private buildEnrichmentUserPrompt(request: LLMEnrichmentRequest): string {
    const profileSummary = this.summarizeProfile(request.profile);
    const bundlesJson = JSON.stringify(request.bundles, null, 2);

    return `PROFILE (summary): ${profileSummary}
PROMPT: "${request.prompt}"

BUNDLES (JSON):
${bundlesJson}

For each bundle, add "title" (3-5 words) and "rationale" (1-3 sentences).
Return the same bundle array with title/rationale filled.`;
  }

  /**
   * Make LLM API call
   */
  private async callLLM(payload: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Parse gift intent from LLM response
   */
  private parseGiftIntent(content: string): GiftIntent {
    try {
      // Clean up response (remove markdown code blocks if present)
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);

      // Validate structure
      if (!Array.isArray(parsed.hardConstraints) || 
          !Array.isArray(parsed.softPrefs) || 
          !Array.isArray(parsed.targetCategories) ||
          !parsed.budgetStrategy) {
        throw new Error('Invalid GiftIntent structure');
      }

      return parsed as GiftIntent;
    } catch (error) {
      console.error('❌ Failed to parse gift intent:', error);
      throw new Error(`Invalid JSON response from LLM: ${error.message}`);
    }
  }

  /**
   * Parse enriched bundles from LLM response
   */
  private parseEnrichedBundles(content: string, originalBundles: Partial<GiftBundle>[]): GiftBundle[] {
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);

      if (!Array.isArray(parsed)) {
        throw new Error('Expected array of bundles');
      }

      return parsed.map((bundle: any, index: number) => ({
        ...originalBundles[index],
        ...bundle,
        title: bundle.title || `Gift Bundle ${index + 1}`,
        rationale: bundle.rationale || 'A thoughtfully curated selection of items.',
      })) as GiftBundle[];
    } catch (error) {
      console.error('❌ Failed to parse enriched bundles:', error);
      return this.fallbackBundleEnrichment({ bundles: originalBundles } as LLMEnrichmentRequest);
    }
  }

  /**
   * Summarize profile for prompts
   */
  private summarizeProfile(profile: RecipientProfile): string {
    const parts: string[] = [];

    if (profile.relationship) parts.push(`${profile.relationship}`);
    if (profile.ageRange) parts.push(`${profile.ageRange}`);
    if (profile.interests?.length) parts.push(`interests: ${profile.interests.join(', ')}`);
    if (profile.style?.length) parts.push(`style: ${profile.style.join(', ')}`);
    if (profile.dislikes?.length) parts.push(`dislikes: ${profile.dislikes.join(', ')}`);
    if (profile.allergies?.length) parts.push(`allergies: ${profile.allergies.join(', ')}`);

    return parts.join('; ') || 'No specific profile details provided';
  }

  /**
   * Mock intent extraction for development
   */
  private mockExtractGiftIntent(request: LLMIntentRequest): GiftIntent {
    const { profile, prompt, budget } = request;
    
    console.log('🤖 Mock LLM: Extracting gift intent...');

    // Extract constraints from profile
    const hardConstraints: string[] = [];
    if (profile.dislikes) {
      hardConstraints.push(...profile.dislikes.map(dislike => `no:${dislike}`));
    }
    if (profile.allergies) {
      hardConstraints.push(...profile.allergies.map(allergy => `allergen:no:${allergy}`));
    }
    if (profile.constraints) {
      hardConstraints.push(...profile.constraints);
    }

    // Extract soft preferences
    const softPrefs: string[] = [];
    if (profile.interests) {
      softPrefs.push(...profile.interests.map(interest => `interest:${interest}`));
    }
    if (profile.style) {
      softPrefs.push(...profile.style.map(style => `style:${style}`));
    }

    // Extract themes from prompt
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('cozy')) softPrefs.push('theme:cozy');
    if (lowerPrompt.includes('birthday')) softPrefs.push('theme:birthday');
    if (lowerPrompt.includes('tea')) softPrefs.push('interest:tea');
    if (lowerPrompt.includes('reading')) softPrefs.push('interest:reading');

    // Determine target categories
    const targetCategories: string[] = [];
    if (profile.interests?.includes('tea') || lowerPrompt.includes('tea')) {
      targetCategories.push('tea accessories', 'mugs');
    }
    if (profile.interests?.includes('reading') || lowerPrompt.includes('reading')) {
      targetCategories.push('books', 'stationery');
    }
    if (lowerPrompt.includes('cozy')) {
      targetCategories.push('home textiles', 'blankets');
    }

    // Determine budget strategy
    let budgetStrategy: 'hero' | 'balanced' | 'stocking' = 'balanced';
    if (budget < 30) budgetStrategy = 'stocking';
    else if (budget > 100) budgetStrategy = 'hero';

    return {
      hardConstraints,
      softPrefs,
      targetCategories,
      budgetStrategy,
    };
  }

  /**
   * Mock bundle enrichment for development
   */
  private mockEnrichBundles(request: LLMEnrichmentRequest): GiftBundle[] {
    console.log('🤖 Mock LLM: Enriching bundles...');

    return request.bundles.map((bundle, index) => {
      const itemCount = bundle.items?.length || 0;
      const hasTeaItems = bundle.items?.some(item => 
        item.title.toLowerCase().includes('tea') || 
        item.tags?.includes('interest:tea')
      );
      const hasCozyItems = bundle.items?.some(item => 
        item.title.toLowerCase().includes('blanket') || 
        item.title.toLowerCase().includes('throw') ||
        item.tags?.includes('theme:cozy')
      );

      let title = `Gift Bundle ${index + 1}`;
      let rationale = 'A thoughtfully curated selection of items.';

      // Generate contextual titles and rationales
      if (hasTeaItems && hasCozyItems) {
        title = 'Cozy Tea Evening Kit';
        rationale = 'Perfect for quiet evenings with a warm cup of tea and relaxation. The combination creates a complete cozy experience.';
      } else if (hasTeaItems) {
        title = 'Tea Lover\'s Collection';
        rationale = 'Curated for the tea enthusiast, featuring quality accessories and blends for the perfect brewing experience.';
      } else if (hasCozyItems) {
        title = 'Comfort & Coziness Set';
        rationale = 'Designed to create a warm, comfortable atmosphere for relaxation and unwinding at home.';
      } else if (itemCount >= 4) {
        title = 'Delightful Surprise Bundle';
        rationale = 'A diverse collection of thoughtful items that cater to multiple interests and occasions.';
      } else if (itemCount === 1) {
        title = 'Premium Single Gift';
        rationale = 'A carefully selected high-quality item that makes a meaningful statement on its own.';
      }

      return {
        ...bundle,
        title,
        rationale,
      } as GiftBundle;
    });
  }

  /**
   * Fallback intent extraction using rule-based approach
   */
  private fallbackIntentExtraction(request: LLMIntentRequest): GiftIntent {
    console.log('🔄 Using fallback intent extraction...');
    return this.mockExtractGiftIntent(request);
  }

  /**
   * Fallback bundle enrichment using templates
   */
  private fallbackBundleEnrichment(request: LLMEnrichmentRequest): GiftBundle[] {
    console.log('🔄 Using fallback bundle enrichment...');
    return this.mockEnrichBundles(request);
  }
}

/**
 * Utility functions for LLM service
 */
export const llmUtils = {
  /**
   * Create normalized hash for caching
   */
  createPromptHash: (profile: RecipientProfile, prompt: string): string => {
    const normalizedProfile = {
      interests: profile.interests?.sort(),
      style: profile.style?.sort(),
      dislikes: profile.dislikes?.sort(),
      allergies: profile.allergies?.sort(),
      relationship: profile.relationship,
      ageRange: profile.ageRange,
    };
    
    const baseString = JSON.stringify(normalizedProfile) + prompt.toLowerCase().trim();
    
    // Simple hash (replace with proper crypto hash in production)
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `intent_${Math.abs(hash)}`;
  },

  /**
   * Validate gift intent structure
   */
  validateGiftIntent: (intent: any): intent is GiftIntent => {
    return (
      typeof intent === 'object' &&
      Array.isArray(intent.hardConstraints) &&
      Array.isArray(intent.softPrefs) &&
      Array.isArray(intent.targetCategories) &&
      ['hero', 'balanced', 'stocking'].includes(intent.budgetStrategy)
    );
  },

  /**
   * Sanitize LLM input to prevent injection
   */
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .slice(0, 500) // Limit length
      .trim();
  },
};

export default LLMService;

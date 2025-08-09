/**
 * Gift Finder Demo & Test Examples
 * Demonstrates the complete gift finder functionality with realistic scenarios
 */

import { RecipientProfile, GiftFinderRequest } from '../types/giftFinder'
import { generateGiftBundles, initializeServices } from '../api/giftFinderApi'

// Initialize mock services for demo
initializeServices({
  shopDomain: 'mock-shop.myshopify.com',
  storefrontAccessToken: 'mock-token',
  llmApiKey: 'mock-llm-key',
})

/**
 * Example profiles for testing different scenarios
 */
export const exampleProfiles: { [key: string]: RecipientProfile } = {
  teaLover: {
    name: 'Sarah',
    relationship: 'partner',
    ageRange: '30s',
    genderPresentation: 'fem',
    interests: ['tea', 'reading', 'wellness'],
    style: ['minimal', 'earthy'],
    dislikes: ['strong fragrance'],
    locationClimate: 'cold',
    notes: 'Loves quiet evenings at home'
  },

  techEnthusiast: {
    relationship: 'friend',
    ageRange: '20s',
    genderPresentation: 'masc',
    interests: ['tech gadgets', 'gaming', 'coffee'],
    style: ['modern', 'minimal'],
    constraints: ['no glass'],
    notes: 'Always on the go, loves efficiency'
  },

  fashionista: {
    relationship: 'sibling',
    ageRange: '20s',
    genderPresentation: 'fem',
    interests: ['fashion', 'jewelry', 'skincare'],
    style: ['luxe', 'romantic'],
    sizes: { general: 'M' },
    locationClimate: 'temperate'
  },

  parent: {
    relationship: 'parent',
    ageRange: '50s',
    interests: ['cooking', 'home decor', 'plants'],
    style: ['classic', 'earthy'],
    allergies: ['fragrance'],
    constraints: ['vegan-only'],
    locationClimate: 'hot'
  },

  minimalist: {
    relationship: 'coworker',
    ageRange: '30s',
    interests: ['wellness', 'yoga', 'minimalism'],
    style: ['minimal', 'neutral'],
    dislikes: ['clutter', 'bright colors'],
    notes: 'Values quality over quantity'
  }
}

/**
 * Example gift scenarios for testing
 */
export const exampleScenarios = [
  {
    name: 'Cozy Birthday Gift',
    profile: exampleProfiles.teaLover,
    prompt: 'Cozy birthday gift for my girlfriend who loves tea and reading; avoid strong fragrances',
    budget: 75
  },
  {
    name: 'Tech Lover Stocking Stuffers',
    profile: exampleProfiles.techEnthusiast,
    prompt: 'Practical tech accessories for my friend who is always on the go',
    budget: 50
  },
  {
    name: 'Luxury Fashion Gift',
    profile: exampleProfiles.fashionista,
    prompt: 'Elegant fashion and beauty items for my stylish sister',
    budget: 120
  },
  {
    name: 'Parent Appreciation',
    profile: exampleProfiles.parent,
    prompt: 'Thoughtful gifts for my health-conscious parent who loves their home',
    budget: 90
  },
  {
    name: 'Minimalist Wellness',
    profile: exampleProfiles.minimalist,
    prompt: 'Simple, high-quality wellness items for a minimalist colleague',
    budget: 60
  },
  {
    name: 'Low Budget Challenge',
    profile: exampleProfiles.teaLover,
    prompt: 'Small but meaningful tea-related gifts',
    budget: 25
  },
  {
    name: 'High Budget Luxury',
    profile: exampleProfiles.fashionista,
    prompt: 'Premium luxury items for someone who has everything',
    budget: 200
  }
]

/**
 * Run a single demo scenario
 */
export async function runGiftFinderDemo(scenarioName: string) {
  const scenario = exampleScenarios.find(s => s.name === scenarioName)
  if (!scenario) {
    throw new Error(`Scenario '${scenarioName}' not found`)
  }

  console.log(`\n🎁 === ${scenario.name} Demo ===`)
  console.log(`Profile: ${scenario.profile.name || 'Anonymous'} (${scenario.profile.relationship})`)
  console.log(`Prompt: ${scenario.prompt}`)
  console.log(`Budget: $${scenario.budget}`)
  console.log(`Interests: ${scenario.profile.interests?.join(', ') || 'None specified'}`)
  console.log('─'.repeat(50))

  try {
    const request: GiftFinderRequest = {
      profile: scenario.profile,
      prompt: scenario.prompt,
      budget: scenario.budget,
      maxBundles: 6
    }

    const result = await generateGiftBundles(request)

    console.log(`\n✨ Generated ${result.bundles.length} gift bundles:`)
    
    result.bundles.forEach((bundle, index) => {
      console.log(`\n${index + 1}. ${bundle.title} - $${bundle.price.total.toFixed(2)}`)
      console.log(`   ${bundle.rationale}`)
      console.log(`   Items (${bundle.items.length}):`)
      bundle.items.forEach(item => {
        console.log(`   • ${item.title} - $${item.unitPrice.toFixed(2)}`)
      })
      console.log(`   Diversity: ${Math.round(bundle.diversityScore * 100)}%`)
      if (bundle.price.nearBudget) {
        console.log(`   ⚠ Slightly over budget`)
      }
    })

    if (result.diagnostics) {
      console.log(`\n📊 Diagnostics:`)
      if (result.diagnostics.matchedSignals?.length) {
        console.log(`   ✓ Matched: ${result.diagnostics.matchedSignals.join(', ')}`)
      }
      if (result.diagnostics.unmetConstraints?.length) {
        console.log(`   ⚠ Unmet: ${result.diagnostics.unmetConstraints.join(', ')}`)
      }
      if (result.diagnostics.inventoryNotes?.length) {
        console.log(`   ℹ Notes: ${result.diagnostics.inventoryNotes.join(', ')}`)
      }
    }

    return result

  } catch (error) {
    console.error(`❌ Demo failed:`, error)
    throw error
  }
}

/**
 * Run all demo scenarios
 */
export async function runAllDemos() {
  console.log('🎁 Running all Gift Finder demos...\n')
  
  const results = []
  
  for (const scenario of exampleScenarios) {
    try {
      const result = await runGiftFinderDemo(scenario.name)
      results.push({ scenario: scenario.name, success: true, bundles: result.bundles.length })
    } catch (error) {
      results.push({ scenario: scenario.name, success: false, error: error.message })
    }
    
    // Small delay between demos
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n🎉 Demo Summary:')
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.scenario}: ${result.bundles} bundles generated`)
    } else {
      console.log(`❌ ${result.scenario}: ${result.error}`)
    }
  })

  return results
}

/**
 * Benchmark performance
 */
export async function benchmarkGiftFinder() {
  console.log('⏱️ Benchmarking Gift Finder performance...')

  const scenario = exampleScenarios[0] // Use first scenario
  const iterations = 5

  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = Date.now()
    
    try {
      await generateGiftBundles({
        profile: scenario.profile,
        prompt: scenario.prompt,
        budget: scenario.budget,
      })
      
      const duration = Date.now() - start
      times.push(duration)
      console.log(`  Run ${i + 1}: ${duration}ms`)
    } catch (error) {
      console.log(`  Run ${i + 1}: Failed - ${error.message}`)
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)

    console.log(`\n📈 Performance Summary:`)
    console.log(`  Average: ${avgTime.toFixed(0)}ms`)
    console.log(`  Min: ${minTime}ms`)
    console.log(`  Max: ${maxTime}ms`)
    console.log(`  Successful runs: ${times.length}/${iterations}`)
  }

  return times
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).giftFinderDemo = {
    runDemo: runGiftFinderDemo,
    runAllDemos,
    benchmark: benchmarkGiftFinder,
    scenarios: exampleScenarios,
    profiles: exampleProfiles,
  }
  
  console.log('🎁 Gift Finder Demo loaded! Try:')
  console.log('  giftFinderDemo.runDemo("Cozy Birthday Gift")')
  console.log('  giftFinderDemo.runAllDemos()')
  console.log('  giftFinderDemo.benchmark()')
}

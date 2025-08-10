/**
 * Cache Testing Utility
 * Standalone testing for cache functionality without UI integration
 */

import { generateGiftBundles } from '../api/giftFinderApi'
import { RecipientProfile } from '../types/giftFinder'

// Test data
const testProfiles: { [key: string]: RecipientProfile } = {
  teaLover: {
    interests: ['tea', 'reading'],
    style: ['minimal', 'cozy'],
    relationship: 'partner',
    ageRange: '30s'
  },
  techEnthusiast: {
    interests: ['tech', 'gaming'],
    style: ['modern'],
    relationship: 'friend',
    ageRange: '20s'
  },
  fashionista: {
    interests: ['fashion', 'jewelry'],
    style: ['luxe'],
    relationship: 'sibling',
    ageRange: '20s'
  }
}

/**
 * Basic cache test - same request twice
 */
export async function testBasicCaching(): Promise<{
  success: boolean
  firstRequestTime: number
  secondRequestTime: number
  speedImprovement: number
  details: string[]
}> {
  const details: string[] = []
  details.push('🧪 Starting basic cache test...')
  
  const testRequest = {
    profile: testProfiles.teaLover,
    prompt: 'cozy birthday gift for tea-loving partner',
    budget: 75
  }
  
  try {
    // First request
    details.push('📝 Making first request...')
    const start1 = Date.now()
    const result1 = await generateGiftBundles(testRequest)
    const time1 = Date.now() - start1
    details.push(`⏱️ First request took: ${time1}ms`)
    
    // Second request (should be cached)
    details.push('📝 Making identical second request...')
    const start2 = Date.now()
    const result2 = await generateGiftBundles(testRequest)
    const time2 = Date.now() - start2
    details.push(`⏱️ Second request took: ${time2}ms`)
    
    const speedImprovement = Math.round((time1 - time2) / time1 * 100)
    details.push(`🚀 Speed improvement: ${speedImprovement}%`)
    
    const success = time2 < time1 * 0.5 // Second request should be at least 50% faster
    
    if (success) {
      details.push('✅ CACHE WORKING - Second request was significantly faster!')
    } else {
      details.push('❌ CACHE NOT WORKING - Second request was not faster')
    }
    
    return {
      success,
      firstRequestTime: time1,
      secondRequestTime: time2,
      speedImprovement,
      details
    }
    
  } catch (error) {
    details.push(`❌ Test failed: ${error.message}`)
    return {
      success: false,
      firstRequestTime: 0,
      secondRequestTime: 0,
      speedImprovement: 0,
      details
    }
  }
}

/**
 * Test different inputs don't interfere
 */
export async function testDifferentInputs(): Promise<{
  success: boolean
  details: string[]
}> {
  const details: string[] = []
  details.push('🧪 Testing different inputs...')
  
  try {
    const requests = [
      {
        profile: testProfiles.teaLover,
        prompt: 'cozy birthday gift',
        budget: 75
      },
      {
        profile: testProfiles.techEnthusiast,
        prompt: 'tech gift for friend',
        budget: 100
      },
      {
        profile: testProfiles.fashionista,
        prompt: 'luxury gift for sibling',
        budget: 150
      }
    ]
    
    const times: number[] = []
    
    for (let i = 0; i < requests.length; i++) {
      details.push(`📝 Request ${i + 1}: ${requests[i].prompt}`)
      const start = Date.now()
      await generateGiftBundles(requests[i])
      const time = Date.now() - start
      times.push(time)
      details.push(`⏱️ Request ${i + 1} took: ${time}ms`)
    }
    
    // All requests should be similar in time (all cache misses)
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const variance = times.every(time => Math.abs(time - avgTime) < avgTime * 0.5)
    
    if (variance) {
      details.push('✅ Different inputs working correctly - all requests took similar time')
      return { success: true, details }
    } else {
      details.push('❌ Unexpected timing variance between different requests')
      return { success: false, details }
    }
    
  } catch (error) {
    details.push(`❌ Test failed: ${error.message}`)
    return { success: false, details }
  }
}

/**
 * Test cache with same input multiple times
 */
export async function testCacheHitRate(): Promise<{
  success: boolean
  hitRate: number
  details: string[]
}> {
  const details: string[] = []
  details.push('🧪 Testing cache hit rate...')
  
  const testRequest = {
    profile: testProfiles.teaLover,
    prompt: 'repeated test request',
    budget: 50
  }
  
  const times: number[] = []
  
  try {
    // Make the same request 5 times
    for (let i = 0; i < 5; i++) {
      details.push(`📝 Request ${i + 1}/5...`)
      const start = Date.now()
      await generateGiftBundles(testRequest)
      const time = Date.now() - start
      times.push(time)
      details.push(`⏱️ Request ${i + 1} took: ${time}ms`)
    }
    
    // First request should be slowest, others should be faster
    const firstTime = times[0]
    const subsequentTimes = times.slice(1)
    const avgSubsequentTime = subsequentTimes.reduce((a, b) => a + b, 0) / subsequentTimes.length
    
    const hitRate = Math.round((firstTime - avgSubsequentTime) / firstTime * 100)
    details.push(`📊 Average subsequent request time: ${Math.round(avgSubsequentTime)}ms`)
    details.push(`📊 Cache hit rate: ${hitRate}%`)
    
    const success = hitRate > 50 // Should have significant speed improvement
    
    if (success) {
      details.push('✅ Good cache hit rate - subsequent requests were faster!')
    } else {
      details.push('❌ Poor cache hit rate - subsequent requests were not significantly faster')
    }
    
    return { success, hitRate, details }
    
  } catch (error) {
    details.push(`❌ Test failed: ${error.message}`)
    return { success: false, hitRate: 0, details }
  }
}

/**
 * Comprehensive cache test
 */
export async function runAllCacheTests(): Promise<{
  overallSuccess: boolean
  tests: {
    basic: { success: boolean; details: string[] }
    differentInputs: { success: boolean; details: string[] }
    hitRate: { success: boolean; details: string[] }
  }
  summary: string[]
}> {
  const summary: string[] = []
  summary.push('🚀 === CACHE TESTING SUITE ===')
  
  // Run all tests
  const basic = await testBasicCaching()
  const differentInputs = await testDifferentInputs()
  const hitRate = await testCacheHitRate()
  
  // Compile results
  const overallSuccess = basic.success && differentInputs.success && hitRate.success
  
  summary.push('')
  summary.push('📋 TEST RESULTS:')
  summary.push(`Basic Caching: ${basic.success ? '✅ PASS' : '❌ FAIL'}`)
  summary.push(`Different Inputs: ${differentInputs.success ? '✅ PASS' : '❌ FAIL'}`)
  summary.push(`Cache Hit Rate: ${hitRate.success ? '✅ PASS' : '❌ FAIL'}`)
  summary.push('')
  summary.push(`Overall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  
  if (basic.success) {
    summary.push(`Speed Improvement: ${basic.speedImprovement}%`)
  }
  if (hitRate.success) {
    summary.push(`Cache Hit Rate: ${hitRate.hitRate}%`)
  }
  
  return {
    overallSuccess,
    tests: {
      basic,
      differentInputs,
      hitRate
    },
    summary
  }
}

/**
 * Quick cache test for development
 */
export async function quickCacheTest(): Promise<string[]> {
  const results = await runAllCacheTests()
  return results.summary
}

// Export for easy access
export default {
  testBasicCaching,
  testDifferentInputs,
  testCacheHitRate,
  runAllCacheTests,
  quickCacheTest
}

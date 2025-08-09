/**
 * Cache Service
 * In-memory caching for API responses and LLM results
 */

interface CacheEntry<T> {
  data: T
  expires: number
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    // Clean up expired entries if we're at capacity
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expires = Date.now() + ttlMs
    this.cache.set(key, { data, expires })
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    
    for (const entry of this.cache.values()) {
      if (now > entry.expires) {
        expired++
      }
    }

    return {
      total: this.cache.size,
      expired,
      active: this.cache.size - expired,
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    // If still at capacity, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].expires - b[1].expires)
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.1))
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }
}

export default CacheService

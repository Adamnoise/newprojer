import NodeCache from "node-cache"

/**
 * CacheService provides a centralized caching mechanism for the application
 * to improve performance by reducing database and computation load.
 */
export class CacheService {
  private cache: NodeCache

  /**
   * Creates a new CacheService instance
   * @param stdTTL Standard time-to-live in seconds for cache items (default: 10 minutes)
   * @param checkperiod Period in seconds to check for expired keys (default: 1 minute)
   */
  constructor(stdTTL = 600, checkperiod = 60) {
    this.cache = new NodeCache({
      stdTTL,
      checkperiod,
      useClones: false, // For better performance with large objects
    })
  }

  /**
   * Gets a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key)
  }

  /**
   * Sets a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time-to-live in seconds (optional, uses default if not specified)
   * @returns true if the value was set successfully
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl)
  }

  /**
   * Deletes a value from the cache
   * @param key The cache key
   * @returns true if the value was deleted successfully
   */
  delete(key: string): boolean {
    return this.cache.del(key) > 0
  }

  /**
   * Deletes all values from the cache that match a pattern
   * @param pattern The pattern to match (e.g., "matches:*")
   */
  deleteByPattern(pattern: string): void {
    const keys = this.cache.keys()
    const regex = new RegExp(pattern.replace("*", ".*"))

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.del(key)
      }
    })
  }

  /**
   * Clears the entire cache
   */
  clear(): void {
    this.cache.flushAll()
  }

  /**
   * Gets a value from the cache or computes it if not found
   * @param key The cache key
   * @param fn The function to compute the value if not in cache
   * @param ttl Time-to-live in seconds (optional)
   * @returns The cached or computed value
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = this.get<T>(key)

    if (cachedValue !== undefined) {
      return cachedValue
    }

    const value = await fn()
    this.set(key, value, ttl)
    return value
  }

  /**
   * Gets cache statistics
   * @returns Object with cache statistics
   */
  getStats() {
    return this.cache.getStats()
  }
}

// Create a singleton instance for the application
export const cacheService = new CacheService()


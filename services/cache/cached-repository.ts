import { type CacheService, cacheService } from "./cache-service"
import type { DataRepository } from "../data/data-repository"
import type { Match, LeagueData } from "../../types"

/**
 * CachedDataRepository wraps a DataRepository implementation and adds caching
 * to improve performance for frequently accessed data.
 */
export class CachedDataRepository implements DataRepository {
  private repository: DataRepository
  private cache: CacheService
  private keyPrefix: string

  /**
   * Creates a new CachedDataRepository
   * @param repository The underlying repository to cache
   * @param cache The cache service to use
   * @param keyPrefix Prefix for cache keys to avoid collisions
   */
  constructor(repository: DataRepository, cache: CacheService = cacheService, keyPrefix = "data") {
    this.repository = repository
    this.cache = cache
    this.keyPrefix = keyPrefix
  }

  /**
   * Gets all leagues with caching
   */
  async getLeagues(): Promise<LeagueData[]> {
    const cacheKey = `${this.keyPrefix}:leagues`
    return this.cache.getOrSet(cacheKey, () => this.repository.getLeagues(), 300) // 5 minutes TTL
  }

  /**
   * Gets a league by ID with caching
   */
  async getLeagueById(id: string): Promise<LeagueData | null> {
    const cacheKey = `${this.keyPrefix}:league:${id}`
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const league = await this.repository.getLeagueById(id)
        return league || null
      },
      300,
    ) // 5 minutes TTL
  }

  /**
   * Creates a new league and invalidates relevant cache entries
   */
  async createLeague(league: LeagueData): Promise<LeagueData> {
    const result = await this.repository.createLeague(league)
    // Invalidate cache
    this.cache.delete(`${this.keyPrefix}:leagues`)
    return result
  }

  /**
   * Updates a league and invalidates relevant cache entries
   */
  async updateLeague(league: LeagueData): Promise<LeagueData> {
    const result = await this.repository.updateLeague(league)
    // Invalidate cache
    this.cache.delete(`${this.keyPrefix}:leagues`)
    this.cache.delete(`${this.keyPrefix}:league:${league.id}`)
    return result
  }

  /**
   * Deletes a league and invalidates relevant cache entries
   */
  async deleteLeague(id: string): Promise<boolean> {
    const result = await this.repository.deleteLeague(id)
    // Invalidate cache
    this.cache.delete(`${this.keyPrefix}:leagues`)
    this.cache.delete(`${this.keyPrefix}:league:${id}`)
    this.cache.deleteByPattern(`${this.keyPrefix}:matches:${id}:*`)
    return result
  }

  /**
   * Gets matches for a league with caching
   */
  async getMatches(leagueId: string): Promise<Match[]> {
    const cacheKey = `${this.keyPrefix}:matches:${leagueId}`
    return this.cache.getOrSet(cacheKey, () => this.repository.getMatches(leagueId), 300) // 5 minutes TTL
  }

  /**
   * Updates matches for a league and invalidates relevant cache entries
   */
  async updateMatches(leagueId: string, matches: Match[]): Promise<Match[]> {
    const result = await this.repository.updateMatches(leagueId, matches)
    // Invalidate cache
    this.cache.delete(`${this.keyPrefix}:matches:${leagueId}`)
    // Also invalidate any analysis results that depend on this data
    this.cache.deleteByPattern(`${this.keyPrefix}:analysis:${leagueId}:*`)
    return result
  }
}


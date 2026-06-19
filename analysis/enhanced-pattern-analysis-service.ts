import type { Match, LeagueData } from "../types"
import type { PatternDefinition, PatternAnalysisResult, AnalysisFilter } from "./types"
import { RuleEngine } from "./rule-engine/rule-engine"
import { MLService } from "./ml/ml-service"
import { cacheService } from "../services/cache/cache-service"
import { StatisticalAnalysis } from "./statistical-analysis"

/**
 * EnhancedPatternAnalysisService provides advanced pattern analysis capabilities
 * using rule engine and machine learning
 */
export class EnhancedPatternAnalysisService {
  private ruleEngine: RuleEngine
  private mlService: MLService
  private statsAnalysis: StatisticalAnalysis

  constructor() {
    this.ruleEngine = new RuleEngine()
    this.mlService = new MLService()
    this.statsAnalysis = new StatisticalAnalysis()
  }

  /**
   * Analyzes match data to detect occurrences of a specific pattern
   */
  public async analyzePattern(
    pattern: PatternDefinition,
    matches: Match[],
    leagues: LeagueData[],
    filters?: AnalysisFilter,
  ): Promise<PatternAnalysisResult> {
    // Generate cache key based on pattern ID, match count, and filter hash
    const cacheKey = `analysis:pattern:${pattern.id}:${matches.length}:${this.hashFilters(filters)}`

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        // Apply filters if provided
        const filteredMatches = this.applyFilters(matches, filters)

        // Find pattern occurrences using rule engine
        const occurrences = this.ruleEngine.findPatternOccurrences(pattern, filteredMatches)

        // Calculate statistics
        const totalMatches = filteredMatches.length
        const frequency = totalMatches > 0 ? occurrences.length / totalMatches : 0

        // Calculate team frequencies
        const homeTeamFrequency: Record<string, number> = {}
        const awayTeamFrequency: Record<string, number> = {}
        const matchupFrequency: Record<string, number> = {}

        // Calculate seasonal trends
        const seasonalTrends: Record<string, number> = {}

        // Process occurrences to calculate frequencies
        occurrences.forEach((occurrence) => {
          // Home team frequency
          homeTeamFrequency[occurrence.homeTeam] = (homeTeamFrequency[occurrence.homeTeam] || 0) + 1

          // Away team frequency
          awayTeamFrequency[occurrence.awayTeam] = (awayTeamFrequency[occurrence.awayTeam] || 0) + 1

          // Matchup frequency (considering home-away context)
          const matchupKey = `${occurrence.homeTeam} vs ${occurrence.awayTeam}`
          matchupFrequency[matchupKey] = (matchupFrequency[matchupKey] || 0) + 1

          // Find league and season for this match
          const matchLeague = leagues.find((l) =>
            filteredMatches.some(
              (m) =>
                m.home_team === occurrence.homeTeam &&
                m.away_team === occurrence.awayTeam &&
                m.date === occurrence.date,
            ),
          )

          if (matchLeague) {
            seasonalTrends[matchLeague.season] = (seasonalTrends[matchLeague.season] || 0) + 1
          }
        })

        // Calculate confidence interval using statistical analysis
        const confidenceInterval = this.statsAnalysis.calculateConfidenceInterval(occurrences.length, totalMatches)

        // Calculate statistical significance
        const pValue = this.statsAnalysis.calculatePValue(
          occurrences.length,
          totalMatches,
          0.5, // Expected frequency under null hypothesis
        )

        return {
          patternId: pattern.id,
          patternName: pattern.name,
          totalMatches,
          occurrences: occurrences.length,
          frequency,
          homeTeamFrequency,
          awayTeamFrequency,
          matchupFrequency,
          seasonalTrends,
          confidenceInterval,
          occurrenceDetails: occurrences,
          statisticalSignificance: {
            pValue,
            isSignificant: pValue < 0.05,
          },
        }
      },
      1800,
    ) // Cache for 30 minutes
  }

  /**
   * Discovers patterns in match data using machine learning
   */
  public async discoverPatterns(
    matches: Match[],
    leagues: LeagueData[],
    filters?: AnalysisFilter,
  ): Promise<PatternDefinition[]> {
    // Apply filters if provided
    const filteredMatches = this.applyFilters(matches, filters)

    // Use ML service to discover patterns
    const discoveredPatterns = await this.mlService.discoverPatterns(filteredMatches)

    // Convert discovered patterns to pattern definitions
    return discoveredPatterns.map((discovered) => ({
      id: discovered.id,
      name: discovered.name,
      description: discovered.description,
      conditions: [
        {
          id: `${discovered.id}-condition-1`,
          type: "custom",
          operator: "=",
          value: true,
          customFormula: this.generateFormulaFromPattern(discovered),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDiscovered: true,
      confidence: discovered.confidence,
    }))
  }

  /**
   * Predicts match outcomes based on historical data
   */
  public async predictMatchOutcome(homeTeam: string, awayTeam: string, matches: Match[]) {
    return this.mlService.predictMatchOutcome(homeTeam, awayTeam, matches)
  }

  /**
   * Applies filters to match data
   */
  private applyFilters(matches: Match[], filters?: AnalysisFilter): Match[] {
    if (!filters) return matches

    return matches.filter((match) => {
      // Filter by leagues
      if (filters.leagues && filters.leagues.length > 0) {
        if (!match.league || !filters.leagues.includes(match.league)) {
          return false
        }
      }

      // Filter by teams
      if (filters.teams && filters.teams.length > 0) {
        if (!filters.teams.includes(match.home_team) && !filters.teams.includes(match.away_team)) {
          return false
        }
      }

      // Filter by date range
      if (filters.dateRange && filters.dateRange.length === 2) {
        const matchDate = new Date(match.date)
        const startDate = new Date(filters.dateRange[0])
        const endDate = new Date(filters.dateRange[1])

        if (matchDate < startDate || matchDate > endDate) {
          return false
        }
      }

      // Filter by minimum confidence (would need to be pre-calculated)
      // This is a placeholder for future implementation

      return true
    })
  }

  /**
   * Generates a formula from a discovered pattern
   */
  private generateFormulaFromPattern(pattern: any): string {
    // This is a placeholder for a more sophisticated formula generation
    // In a real implementation, this would analyze the pattern and generate a formula

    if (pattern.id === "discovered-high-scoring") {
      return "(ft_home + ft_away) >= 4"
    }

    if (pattern.id === "discovered-comeback") {
      return "(ht_home < ht_away && ft_home > ft_away) || (ht_away < ht_home && ft_away > ft_home)"
    }

    if (pattern.id === "discovered-home-advantage") {
      return "ft_home > ft_away"
    }

    return "true" // Default formula
  }

  /**
   * Creates a hash of filters for cache key generation
   */
  private hashFilters(filters?: AnalysisFilter): string {
    if (!filters) return "none"

    return JSON.stringify({
      l: filters.leagues?.join(",") || "",
      t: filters.teams?.join(",") || "",
      d: filters.dateRange?.join(",") || "",
      s: filters.seasons?.join(",") || "",
      c: filters.minConfidence || 0,
    })
  }
}

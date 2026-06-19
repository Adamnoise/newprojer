import type { Match, LeagueData } from "../types"
import type { PatternDefinition, PatternOccurrence, PatternAnalysisResult, AnalysisFilter } from "./types"

export class PatternAnalysisService {
  /**
   * Analyzes match data to detect occurrences of a specific pattern
   */
  public analyzePattern(
    pattern: PatternDefinition,
    matches: Match[],
    leagues: LeagueData[],
    filters?: AnalysisFilter,
  ): PatternAnalysisResult {
    // Apply filters if provided
    const filteredMatches = this.applyFilters(matches, filters)

    // Find pattern occurrences
    const occurrences = this.findPatternOccurrences(pattern, filteredMatches)

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
            m.home_team === occurrence.homeTeam && m.away_team === occurrence.awayTeam && m.date === occurrence.date,
        ),
      )

      if (matchLeague) {
        seasonalTrends[matchLeague.season] = (seasonalTrends[matchLeague.season] || 0) + 1
      }
    })

    // Calculate confidence interval (using Wilson score interval)
    const confidenceInterval = this.calculateConfidenceInterval(occurrences.length, totalMatches)

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
    }
  }

  /**
   * Finds occurrences of a pattern in match data
   */
  private findPatternOccurrences(pattern: PatternDefinition, matches: Match[]): PatternOccurrence[] {
    const occurrences: PatternOccurrence[] = []

    matches.forEach((match) => {
      // Check if match satisfies all pattern conditions
      const matchesPattern = pattern.conditions.every((condition) => {
        switch (condition.type) {
          case "halftime_score":
            return this.evaluateScoreCondition(condition, match.ht_home_score, match.ht_away_score)

          case "fulltime_score":
            return this.evaluateScoreCondition(condition, match.home_score, match.away_score)

          case "score_change":
            // Check for score change between halftime and fulltime
            const homeScoreChange = match.home_score - match.ht_home_score
            const awayScoreChange = match.away_score - match.ht_away_score

            // For turnaround patterns
            if (condition.value === "turnaround") {
              // Home team was losing/drawing at HT but won at FT
              if (condition.target === "home" || condition.target === "both") {
                if (
                  (match.ht_home_score < match.ht_away_score && match.home_score > match.away_score) ||
                  (match.ht_home_score === match.ht_away_score && match.home_score > match.away_score)
                ) {
                  return true
                }
              }

              // Away team was losing/drawing at HT but won at FT
              if (condition.target === "away" || condition.target === "both") {
                if (
                  (match.ht_away_score < match.ht_home_score && match.away_score > match.home_score) ||
                  (match.ht_away_score === match.ht_home_score && match.away_score > match.home_score)
                ) {
                  return true
                }
              }

              return false
            }

            // For specific score change values
            if (condition.target === "home" || condition.target === "both") {
              if (!this.evaluateValueCondition(condition, homeScoreChange)) {
                return false
              }
            }

            if (condition.target === "away" || condition.target === "both") {
              if (!this.evaluateValueCondition(condition, awayScoreChange)) {
                return false
              }
            }

            return true

          case "team_performance":
            // Implement team performance conditions
            return true

          case "custom":
            // Evaluate custom formula if provided
            if (condition.customFormula) {
              try {
                // Create a safe evaluation context with match data
                const context = {
                  ht_home: match.ht_home_score,
                  ht_away: match.ht_away_score,
                  ft_home: match.home_score,
                  ft_away: match.away_score,
                  home_change: match.home_score - match.ht_home_score,
                  away_change: match.away_score - match.ht_away_score,
                }

                // Use Function constructor to evaluate the formula with the context
                // Note: This should be replaced with a safer evaluation method in production
                const formula = new Function(...Object.keys(context), `return ${condition.customFormula}`)
                return formula(...Object.values(context))
              } catch (error) {
                console.error("Error evaluating custom formula:", error)
                return false
              }
            }
            return false
        }
      })

      if (matchesPattern) {
        // Calculate confidence based on historical data or other factors
        const confidence = this.calculateConfidence(match, pattern)

        occurrences.push({
          patternId: pattern.id,
          matchId: `${match.date}_${match.home_team}_${match.away_team}`,
          date: match.date,
          homeTeam: match.home_team,
          awayTeam: match.away_team,
          htHomeScore: match.ht_home_score,
          htAwayScore: match.ht_away_score,
          ftHomeScore: match.home_score,
          ftAwayScore: match.away_score,
          confidence,
          metadata: {
            round: match.round,
            league: match.league,
          },
        })
      }
    })

    return occurrences
  }

  /**
   * Evaluates a score condition against actual scores
   */
  private evaluateScoreCondition(condition: any, homeScore: number, awayScore: number): boolean {
    // Handle different condition formats
    if (typeof condition.value === "object" && condition.value !== null) {
      // If value is an object with home and away properties
      if ("home" in condition.value && "away" in condition.value) {
        const homeResult = this.evaluateValueCondition({ ...condition, value: condition.value.home }, homeScore)

        const awayResult = this.evaluateValueCondition({ ...condition, value: condition.value.away }, awayScore)

        return homeResult && awayResult
      }

      // If value is a specific score like "1-1"
      if (typeof condition.value === "string" && condition.value.includes("-")) {
        const [expectedHome, expectedAway] = condition.value.split("-").map(Number)
        return homeScore === expectedHome && awayScore === expectedAway
      }
    }

    // For simple conditions
    return true
  }

  /**
   * Evaluates a condition against a specific value
   */
  private evaluateValueCondition(condition: any, actualValue: number): boolean {
    switch (condition.operator) {
      case "=":
        return actualValue === condition.value
      case "!=":
        return actualValue !== condition.value
      case ">":
        return actualValue > condition.value
      case "<":
        return actualValue < condition.value
      case ">=":
        return actualValue >= condition.value
      case "<=":
        return actualValue <= condition.value
      case "between":
        return actualValue >= condition.value[0] && actualValue <= condition.value[1]
      case "contains":
        return String(actualValue).includes(String(condition.value))
      default:
        return false
    }
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
   * Calculates confidence for a pattern occurrence
   */
  private calculateConfidence(match: Match, pattern: PatternDefinition): number {
    // This is a placeholder for a more sophisticated confidence calculation
    // In a real implementation, this would consider historical data, team strength, etc.
    return 0.75
  }

  /**
   * Calculates Wilson score confidence interval
   */
  private calculateConfidenceInterval(occurrences: number, total: number): [number, number] {
    if (total === 0) return [0, 0]

    const z = 1.96 // 95% confidence
    const p = occurrences / total

    const numerator = p + (z * z) / (2 * total)
    const denominator = 1 + (z * z) / total

    const center = numerator / denominator
    const halfWidth = (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)) / denominator

    return [Math.max(0, center - halfWidth), Math.min(1, center + halfWidth)]
  }
}

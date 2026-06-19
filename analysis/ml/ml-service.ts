import type { Match } from "../../types"
import { cacheService } from "../../services/cache/cache-service"

/**
 * MLService provides machine learning capabilities for pattern analysis
 */
export class MLService {
  /**
   * Predicts match outcomes based on historical data
   * @param homeTeam The home team
   * @param awayTeam The away team
   * @param matches Historical match data for training
   * @returns Predicted outcome with probabilities
   */
  async predictMatchOutcome(homeTeam: string, awayTeam: string, matches: Match[]): Promise<MatchPrediction> {
    // Cache key based on teams and match count (as a proxy for data freshness)
    const cacheKey = `ml:prediction:${homeTeam}:${awayTeam}:${matches.length}`

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        // In a real implementation, this would use a trained ML model
        // For this example, we'll use a simple heuristic based on historical performance

        // Filter relevant matches
        const homeTeamMatches = matches.filter((m) => m.home_team === homeTeam || m.away_team === homeTeam)

        const awayTeamMatches = matches.filter((m) => m.home_team === awayTeam || m.away_team === awayTeam)

        const directMatches = matches.filter(
          (m) =>
            (m.home_team === homeTeam && m.away_team === awayTeam) ||
            (m.home_team === awayTeam && m.away_team === homeTeam),
        )

        // Calculate team strengths
        const homeTeamStrength = this.calculateTeamStrength(homeTeam, homeTeamMatches)
        const awayTeamStrength = this.calculateTeamStrength(awayTeam, awayTeamMatches)

        // Calculate head-to-head advantage
        const h2hAdvantage = this.calculateHeadToHeadAdvantage(homeTeam, directMatches)

        // Calculate home advantage (typically around 0.1-0.2)
        const homeAdvantage = 0.15

        // Calculate win probabilities
        const homeWinProb = Math.min(
          0.95,
          Math.max(0.05, 0.5 + (homeTeamStrength - awayTeamStrength) + h2hAdvantage + homeAdvantage),
        )

        const awayWinProb = Math.min(
          0.95,
          Math.max(0.05, 0.5 + (awayTeamStrength - homeTeamStrength) - h2hAdvantage - homeAdvantage),
        )

        // Normalize probabilities
        const totalProb = homeWinProb + awayWinProb
        const normalizedHomeWinProb = homeWinProb / totalProb
        const normalizedAwayWinProb = awayWinProb / totalProb
        const drawProb = Math.max(0, 1 - normalizedHomeWinProb - normalizedAwayWinProb)

        // Predict scores (simplified)
        const predictedHomeGoals = Math.round(normalizedHomeWinProb * 3)
        const predictedAwayGoals = Math.round(normalizedAwayWinProb * 3)

        return {
          homeTeam,
          awayTeam,
          probabilities: {
            homeWin: normalizedHomeWinProb,
            draw: drawProb,
            awayWin: normalizedAwayWinProb,
          },
          predictedScore: {
            home: predictedHomeGoals,
            away: predictedAwayGoals,
          },
          confidence: 0.7, // Placeholder confidence score
        }
      },
      3600,
    ) // Cache for 1 hour
  }

  /**
   * Identifies patterns in match data using clustering
   * @param matches Match data to analyze
   * @returns Discovered patterns
   */
  async discoverPatterns(matches: Match[]): Promise<DiscoveredPattern[]> {
    // Cache key based on match count and a hash of the first few matches
    const cacheKey = `ml:patterns:${matches.length}:${this.hashMatches(matches.slice(0, 5))}`

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        // In a real implementation, this would use clustering algorithms
        // For this example, we'll use simple heuristics to identify common patterns

        const patterns: DiscoveredPattern[] = []

        // Check for high-scoring matches
        const highScoringMatches = matches.filter((m) => m.home_score + m.away_score >= 4)

        if (highScoringMatches.length >= matches.length * 0.1) {
          patterns.push({
            id: "discovered-high-scoring",
            name: "High Scoring Matches",
            description: "Matches with 4 or more total goals",
            confidence: highScoringMatches.length / matches.length,
            occurrences: highScoringMatches.length,
            matches: highScoringMatches.slice(0, 10), // Limit to 10 examples
          })
        }

        // Check for comeback wins
        const comebackMatches = matches.filter(
          (m) =>
            (m.ht_home_score < m.ht_away_score && m.home_score > m.away_score) ||
            (m.ht_away_score < m.ht_home_score && m.away_score > m.home_score),
        )

        if (comebackMatches.length >= matches.length * 0.05) {
          patterns.push({
            id: "discovered-comeback",
            name: "Comeback Wins",
            description: "Teams that were losing at half-time but won the match",
            confidence: (comebackMatches.length / matches.length) * 1.5, // Adjust confidence
            occurrences: comebackMatches.length,
            matches: comebackMatches.slice(0, 10), // Limit to 10 examples
          })
        }

        // Check for late goals
        // In a real implementation, we would need minute-by-minute data

        // Check for home dominance
        const homeWins = matches.filter((m) => m.home_score > m.away_score)
        if (homeWins.length >= matches.length * 0.6) {
          patterns.push({
            id: "discovered-home-advantage",
            name: "Strong Home Advantage",
            description: "Home teams win significantly more often than away teams",
            confidence: (homeWins.length / matches.length) * 1.2, // Adjust confidence
            occurrences: homeWins.length,
            matches: homeWins.slice(0, 10), // Limit to 10 examples
          })
        }

        return patterns
      },
      86400,
    ) // Cache for 24 hours
  }

  /**
   * Calculates team strength based on historical performance
   * @param team The team to calculate strength for
   * @param matches Historical match data
   * @returns A strength score between -0.5 and 0.5
   */
  private calculateTeamStrength(team: string, matches: Match[]): number {
    if (matches.length === 0) return 0

    let wins = 0
    let draws = 0
    let losses = 0
    let goalsFor = 0
    let goalsAgainst = 0

    matches.forEach((match) => {
      if (match.home_team === team) {
        goalsFor += match.home_score
        goalsAgainst += match.away_score

        if (match.home_score > match.away_score) wins++
        else if (match.home_score === match.away_score) draws++
        else losses++
      } else {
        goalsFor += match.away_score
        goalsAgainst += match.home_score

        if (match.away_score > match.home_score) wins++
        else if (match.away_score === match.home_score) draws++
        else losses++
      }
    })

    const winRate = wins / matches.length
    const goalDiff = (goalsFor - goalsAgainst) / matches.length

    // Combine win rate and goal difference for a strength score
    return (winRate - 0.5) * 0.7 + goalDiff * 0.1
  }

  /**
   * Calculates head-to-head advantage
   * @param team The team to calculate advantage for
   * @param directMatches Head-to-head match data
   * @returns An advantage score between -0.2 and 0.2
   */
  private calculateHeadToHeadAdvantage(team: string, directMatches: Match[]): number {
    if (directMatches.length === 0) return 0

    let wins = 0
    let losses = 0

    directMatches.forEach((match) => {
      if (match.home_team === team) {
        if (match.home_score > match.away_score) wins++
        else if (match.home_score < match.away_score) losses++
      } else {
        if (match.away_score > match.home_score) wins++
        else if (match.away_score < match.home_score) losses++
      }
    })

    // Calculate advantage based on win-loss record
    return ((wins - losses) / directMatches.length) * 0.2
  }

  /**
   * Creates a simple hash of matches for cache key generation
   * @param matches Matches to hash
   * @returns A string hash
   */
  private hashMatches(matches: Match[]): string {
    return matches
      .map((m) => `${m.home_team.substring(0, 3)}${m.away_team.substring(0, 3)}${m.home_score}${m.away_score}`)
      .join("")
  }
}

/**
 * MatchPrediction represents a predicted match outcome
 */
export interface MatchPrediction {
  homeTeam: string
  awayTeam: string
  probabilities: {
    homeWin: number
    draw: number
    awayWin: number
  }
  predictedScore: {
    home: number
    away: number
  }
  confidence: number
}

/**
 * DiscoveredPattern represents a pattern discovered through ML analysis
 */
export interface DiscoveredPattern {
  id: string
  name: string
  description: string
  confidence: number
  occurrences: number
  matches: Match[]
}


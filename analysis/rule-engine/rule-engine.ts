import type { Match } from "../../types"
import type { PatternDefinition, PatternCondition, PatternOccurrence } from "../types"

/**
 * Rule represents a single condition to be evaluated
 */
export interface Rule {
  evaluate(match: Match, context?: any): boolean
}

/**
 * RuleFactory creates Rule instances from PatternCondition definitions
 */
export class RuleFactory {
  /**
   * Creates a Rule from a PatternCondition
   */
  static createRule(condition: PatternCondition): Rule {
    switch (condition.type) {
      case "halftime_score":
        return new HalftimeScoreRule(condition)
      case "fulltime_score":
        return new FulltimeScoreRule(condition)
      case "score_change":
        return new ScoreChangeRule(condition)
      case "team_performance":
        return new TeamPerformanceRule(condition)
      case "custom":
        return new CustomRule(condition)
      default:
        throw new Error(`Unsupported condition type: ${condition.type}`)
    }
  }
}

/**
 * HalftimeScoreRule evaluates halftime score conditions
 */
class HalftimeScoreRule implements Rule {
  private condition: PatternCondition

  constructor(condition: PatternCondition) {
    this.condition = condition
  }

  evaluate(match: Match): boolean {
    const { operator, value, target } = this.condition

    // Handle different target teams
    if (target === "home" || target === "both") {
      if (!this.evaluateScore(match.ht_home_score, operator, value)) {
        if (target === "home") return false
      } else if (target === "home") {
        return true
      }
    }

    if (target === "away" || target === "both") {
      if (!this.evaluateScore(match.ht_away_score, operator, value)) {
        return false
      }
    }

    return true
  }

  private evaluateScore(score: number, operator: string, value: any): boolean {
    switch (operator) {
      case "=":
        return score === Number(value)
      case "!=":
        return score !== Number(value)
      case ">":
        return score > Number(value)
      case "<":
        return score < Number(value)
      case ">=":
        return score >= Number(value)
      case "<=":
        return score <= Number(value)
      case "between":
        const [min, max] = Array.isArray(value) ? value : value.split(",").map(Number)
        return score >= min && score <= max
      default:
        return false
    }
  }
}

/**
 * FulltimeScoreRule evaluates fulltime score conditions
 */
class FulltimeScoreRule implements Rule {
  private condition: PatternCondition

  constructor(condition: PatternCondition) {
    this.condition = condition
  }

  evaluate(match: Match): boolean {
    const { operator, value, target } = this.condition

    // Handle different target teams
    if (target === "home" || target === "both") {
      if (!this.evaluateScore(match.home_score, operator, value)) {
        if (target === "home") return false
      } else if (target === "home") {
        return true
      }
    }

    if (target === "away" || target === "both") {
      if (!this.evaluateScore(match.away_score, operator, value)) {
        return false
      }
    }

    return true
  }

  private evaluateScore(score: number, operator: string, value: any): boolean {
    switch (operator) {
      case "=":
        return score === Number(value)
      case "!=":
        return score !== Number(value)
      case ">":
        return score > Number(value)
      case "<":
        return score < Number(value)
      case ">=":
        return score >= Number(value)
      case "<=":
        return score <= Number(value)
      case "between":
        const [min, max] = Array.isArray(value) ? value : value.split(",").map(Number)
        return score >= min && score <= max
      default:
        return false
    }
  }
}

/**
 * ScoreChangeRule evaluates score change conditions
 */
class ScoreChangeRule implements Rule {
  private condition: PatternCondition

  constructor(condition: PatternCondition) {
    this.condition = condition
  }

  evaluate(match: Match): boolean {
    const { value, target } = this.condition

    // For turnaround patterns
    if (value === "turnaround") {
      // Home team was losing/drawing at HT but won at FT
      if (target === "home" || target === "both") {
        if (
          (match.ht_home_score < match.ht_away_score && match.home_score > match.away_score) ||
          (match.ht_home_score === match.ht_away_score && match.home_score > match.away_score)
        ) {
          return true
        } else if (target === "home") {
          return false
        }
      }

      // Away team was losing/drawing at HT but won at FT
      if (target === "away" || target === "both") {
        if (
          (match.ht_away_score < match.ht_home_score && match.away_score > match.home_score) ||
          (match.ht_away_score === match.ht_home_score && match.away_score > match.home_score)
        ) {
          return true
        }
      }

      return false
    }

    // For comeback patterns
    if (value === "comeback") {
      // Home team was losing at HT but won or drew at FT
      if (target === "home" || target === "both") {
        if (match.ht_home_score < match.ht_away_score && match.home_score >= match.away_score) {
          return true
        } else if (target === "home") {
          return false
        }
      }

      // Away team was losing at HT but won or drew at FT
      if (target === "away" || target === "both") {
        if (match.ht_away_score < match.ht_home_score && match.away_score >= match.home_score) {
          return true
        }
      }

      return false
    }

    // For blowout patterns (win by 3+ goals)
    if (value === "blowout") {
      if (target === "home" || target === "both") {
        if (match.home_score >= match.away_score + 3) {
          return true
        } else if (target === "home") {
          return false
        }
      }

      if (target === "away" || target === "both") {
        if (match.away_score >= match.home_score + 3) {
          return true
        }
      }

      return false
    }

    // For specific score change values
    const homeScoreChange = match.home_score - match.ht_home_score
    const awayScoreChange = match.away_score - match.ht_away_score

    if (target === "home" || target === "both") {
      if (!this.evaluateScoreChange(homeScoreChange)) {
        if (target === "home") return false
      } else if (target === "home") {
        return true
      }
    }

    if (target === "away" || target === "both") {
      if (!this.evaluateScoreChange(awayScoreChange)) {
        return false
      }
    }

    return true
  }

  private evaluateScoreChange(change: number): boolean {
    const { operator, value } = this.condition

    // Skip special values that are handled separately
    if (["turnaround", "comeback", "blowout", "late_winner"].includes(value as string)) {
      return true
    }

    switch (operator) {
      case "=":
        return change === Number(value)
      case "!=":
        return change !== Number(value)
      case ">":
        return change > Number(value)
      case "<":
        return change < Number(value)
      case ">=":
        return change >= Number(value)
      case "<=":
        return change <= Number(value)
      default:
        return false
    }
  }
}

/**
 * TeamPerformanceRule evaluates team performance conditions
 */
class TeamPerformanceRule implements Rule {
  private condition: PatternCondition

  constructor(condition: PatternCondition) {
    this.condition = condition
  }

  evaluate(match: Match): boolean {
    // This is a placeholder for more complex team performance rules
    // In a real implementation, this would consider historical data, team strength, etc.
    return true
  }
}

/**
 * CustomRule evaluates custom formula conditions
 */
class CustomRule implements Rule {
  private condition: PatternCondition

  constructor(condition: PatternCondition) {
    this.condition = condition
  }

  evaluate(match: Match): boolean {
    if (!this.condition.customFormula) return false

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
      const formula = new Function(...Object.keys(context), `return ${this.condition.customFormula}`)
      return formula(...Object.values(context))
    } catch (error) {
      console.error("Error evaluating custom formula:", error)
      return false
    }
  }
}

/**
 * RuleEngine evaluates pattern definitions against match data
 */
export class RuleEngine {
  /**
   * Evaluates a pattern against a match
   * @param pattern The pattern definition to evaluate
   * @param match The match data to evaluate against
   * @returns true if the match satisfies the pattern, false otherwise
   */
  evaluatePattern(pattern: PatternDefinition, match: Match): boolean {
    // Create rules from pattern conditions
    const rules = pattern.conditions.map((condition) => RuleFactory.createRule(condition))

    // A pattern matches if all conditions are satisfied
    return rules.every((rule) => rule.evaluate(match))
  }

  /**
   * Finds all matches that satisfy a pattern
   * @param pattern The pattern definition to evaluate
   * @param matches The matches to evaluate against
   * @returns An array of pattern occurrences
   */
  findPatternOccurrences(pattern: PatternDefinition, matches: Match[]): PatternOccurrence[] {
    const occurrences: PatternOccurrence[] = []

    matches.forEach((match) => {
      if (this.evaluatePattern(pattern, match)) {
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
   * Calculates confidence for a pattern occurrence
   * @param match The match data
   * @param pattern The pattern definition
   * @returns A confidence score between 0 and 1
   */
  private calculateConfidence(match: Match, pattern: PatternDefinition): number {
    // This is a placeholder for a more sophisticated confidence calculation
    // In a real implementation, this would consider historical data, statistical significance, etc.
    return 0.75 + Math.random() * 0.2 // Random value between 0.75 and 0.95
  }
}

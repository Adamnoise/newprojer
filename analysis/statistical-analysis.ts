/**
 * StatisticalAnalysis provides statistical methods for pattern analysis
 */
export class StatisticalAnalysis {
  /**
   * Calculates Wilson score confidence interval
   * @param occurrences Number of pattern occurrences
   * @param total Total number of matches
   * @param z Z-score for confidence level (default: 1.96 for 95% confidence)
   * @returns Confidence interval as [lower, upper]
   */
  calculateConfidenceInterval(occurrences: number, total: number, z = 1.96): [number, number] {
    if (total === 0) return [0, 0]

    const p = occurrences / total

    const numerator = p + (z * z) / (2 * total)
    const denominator = 1 + (z * z) / total

    const center = numerator / denominator
    const halfWidth = (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)) / denominator

    return [Math.max(0, center - halfWidth), Math.min(1, center + halfWidth)]
  }

  /**
   * Calculates p-value for a binomial test
   * @param occurrences Number of pattern occurrences
   * @param total Total number of matches
   * @param expectedFrequency Expected frequency under null hypothesis
   * @returns p-value
   */
  calculatePValue(occurrences: number, total: number, expectedFrequency: number): number {
    if (total === 0) return 1

    const observedFrequency = occurrences / total

    // Calculate standard error
    const standardError = Math.sqrt((expectedFrequency * (1 - expectedFrequency)) / total)

    // Calculate z-score
    const zScore = Math.abs(observedFrequency - expectedFrequency) / standardError

    // Convert z-score to p-value (approximation)
    return this.zScoreToPValue(zScore)
  }

  /**
   * Converts z-score to p-value
   * @param z Z-score
   * @returns p-value
   */
  private zScoreToPValue(z: number): number {
    // This is an approximation of the cumulative distribution function
    // In a real implementation, use a more accurate method

    if (z < 0) z = -z

    const b0 = 0.2316419
    const b1 = 0.31938153
    const b2 = -0.356563782
    const b3 = 1.781477937
    const b4 = -1.821255978
    const b5 = 1.330274429

    const t = 1 / (1 + b0 * z)
    const pdf = Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)

    const cdf = 1 - pdf * (b1 * t + b2 * t * t + b3 * t * t * t + b4 * t * t * t * t + b5 * t * t * t * t * t)

    return 2 * (1 - cdf) // Two-tailed test
  }

  /**
   * Performs chi-square test for independence
   * @param observed Observed frequencies
   * @param expected Expected frequencies
   * @returns Chi-square test result
   */
  chiSquareTest(
    observed: number[],
    expected: number[],
  ): { chiSquare: number; pValue: number; degreesOfFreedom: number } {
    if (observed.length !== expected.length || observed.length === 0) {
      throw new Error("Observed and expected arrays must have the same non-zero length")
    }

    // Calculate chi-square statistic
    let chiSquare = 0
    for (let i = 0; i < observed.length; i++) {
      chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i]
    }

    // Degrees of freedom
    const df = observed.length - 1

    // Calculate p-value (approximation)
    const pValue = this.chiSquareToPValue(chiSquare, df)

    return {
      chiSquare,
      pValue,
      degreesOfFreedom: df,
    }
  }

  /**
   * Converts chi-square statistic to p-value
   * @param chiSquare Chi-square statistic
   * @param df Degrees of freedom
   * @returns p-value
   */
  private chiSquareToPValue(chiSquare: number, df: number): number {
    // This is a simplified approximation
    // In a real implementation, use a more accurate method

    // For df = 1, chi-square is approximately the square of a standard normal
    if (df === 1) {
      return this.zScoreToPValue(Math.sqrt(chiSquare))
    }

    // For df > 1, use Wilson-Hilferty approximation
    const z = Math.sqrt(2 * chiSquare) - Math.sqrt(2 * df - 1)
    return this.zScoreToPValue(z)
  }
}

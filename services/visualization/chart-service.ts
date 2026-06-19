import type { PatternAnalysisResult, PatternOccurrence } from "../../analysis/types"

export class ChartService {
  /**
   * Generates data for a frequency chart (e.g., Pie or Bar)
   * @param result Pattern analysis result
   * @returns Chart data object
   */
  public generateFrequencyChartData(result: PatternAnalysisResult) {
    return {
      labels: ["Occurrences", "Non-Occurrences"],
      datasets: [
        {
          data: [result.occurrences, result.totalMatches - result.occurrences],
          backgroundColor: ["hsl(var(--chart-1))", "hsl(var(--chart-2))"],
          hoverBackgroundColor: ["hsl(var(--chart-1) / 0.8)", "hsl(var(--chart-2) / 0.8)"],
        },
      ],
    }
  }

  /**
   * Generates data for a team frequency bar chart
   * @param result Pattern analysis result
   * @returns Chart data object for home and away teams
   */
  public generateTeamFrequencyChartData(result: PatternAnalysisResult) {
    const homeTeams = Object.keys(result.homeTeamFrequency).sort()
    const homeData = homeTeams.map((team) => result.homeTeamFrequency[team])

    const awayTeams = Object.keys(result.awayTeamFrequency).sort()
    const awayData = awayTeams.map((team) => result.awayTeamFrequency[team])

    return {
      homeTeam: {
        labels: homeTeams,
        datasets: [
          {
            label: "Home Team Occurrences",
            data: homeData,
            backgroundColor: "hsl(var(--chart-3))",
            borderColor: "hsl(var(--chart-3))",
            borderWidth: 1,
          },
        ],
      },
      awayTeam: {
        labels: awayTeams,
        datasets: [
          {
            label: "Away Team Occurrences",
            data: awayData,
            backgroundColor: "hsl(var(--chart-4))",
            borderColor: "hsl(var(--chart-4))",
            borderWidth: 1,
          },
        ],
      },
    }
  }

  /**
   * Generates data for a matchup frequency bar chart
   * @param result Pattern analysis result
   * @returns Chart data object
   */
  public generateMatchupFrequencyChartData(result: PatternAnalysisResult) {
    const matchups = Object.keys(result.matchupFrequency).sort()
    const data = matchups.map((matchup) => result.matchupFrequency[matchup])

    return {
      labels: matchups,
      datasets: [
        {
          label: "Matchup Occurrences",
          data: data,
          backgroundColor: "hsl(var(--chart-5))",
          borderColor: "hsl(var(--chart-5))",
          borderWidth: 1,
        },
      ],
    }
  }

  /**
   * Generates data for a seasonal trend line chart
   * @param result Pattern analysis result
   * @returns Chart data object
   */
  public generateSeasonalTrendChartData(result: PatternAnalysisResult) {
    const seasons = Object.keys(result.seasonalTrends).sort()
    const data = seasons.map((season) => result.seasonalTrends[season])

    return {
      labels: seasons,
      datasets: [
        {
          label: "Seasonal Occurrences",
          data: data,
          fill: false,
          borderColor: "hsl(var(--chart-6))",
          tension: 0.1,
        },
      ],
    }
  }

  /**
   * Generates data for a timeline chart of occurrences over time
   * @param occurrences Array of pattern occurrences
   * @returns Chart data object
   */
  public generateTimelineChartData(occurrences: PatternOccurrence[]) {
    const sortedOccurrences = [...occurrences].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const occurrencesByMonth: Record<string, number> = {}
    sortedOccurrences.forEach((occurrence) => {
      const date = new Date(occurrence.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      occurrencesByMonth[monthKey] = (occurrencesByMonth[monthKey] || 0) + 1
    })

    const monthLabels = Object.keys(occurrencesByMonth)
    const monthData = monthLabels.map((month) => occurrencesByMonth[month])

    return {
      labels: monthLabels,
      datasets: [
        {
          label: "Occurrences Over Time",
          data: monthData,
          fill: true,
          borderColor: "hsl(var(--chart-1))",
          backgroundColor: "hsl(var(--chart-1) / 0.2)",
          tension: 0.4,
        },
      ],
    }
  }

  /**
   * Generates data for a heatmap (e.g., for matchup occurrences)
   * This would typically require a specialized heatmap chart library.
   * For now, it returns raw data suitable for custom rendering.
   * @param result Pattern analysis result
   * @returns Heatmap data object
   */
  public generateHeatmapData(result: PatternAnalysisResult) {
    const homeTeams = Array.from(new Set(result.occurrenceDetails.map((o) => o.homeTeam))).sort()
    const awayTeams = Array.from(new Set(result.occurrenceDetails.map((o) => o.awayTeam))).sort()

    const matrix: { x: string; y: string; value: number }[] = []
    homeTeams.forEach((homeTeam, xIndex) => {
      awayTeams.forEach((awayTeam, yIndex) => {
        const matchupKey = `${homeTeam} vs ${awayTeam}`
        const value = result.matchupFrequency[matchupKey] || 0
        matrix.push({ x: homeTeam, y: awayTeam, value })
      })
    })

    return {
      xLabels: homeTeams,
      yLabels: awayTeams,
      data: matrix,
    }
  }
}

import type { PatternAnalysisResult, PatternOccurrence } from "./types"

export class VisualizationService {
  /**
   * Generates data for a frequency chart
   */
  public generateFrequencyChartData(result: PatternAnalysisResult) {
    return {
      labels: ["Pattern Occurrences", "Non-Occurrences"],
      datasets: [
        {
          data: [result.occurrences, result.totalMatches - result.occurrences],
          backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    }
  }

  /**
   * Generates data for a team frequency chart
   */
  public generateTeamFrequencyChartData(result: PatternAnalysisResult) {
    // Process home team frequency
    const homeTeamLabels = Object.keys(result.homeTeamFrequency)
    const homeTeamData = homeTeamLabels.map((team) => result.homeTeamFrequency[team])

    // Process away team frequency
    const awayTeamLabels = Object.keys(result.awayTeamFrequency)
    const awayTeamData = awayTeamLabels.map((team) => result.awayTeamFrequency[team])

    return {
      homeTeam: {
        labels: homeTeamLabels,
        datasets: [
          {
            label: "Home Team Occurrences",
            data: homeTeamData,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      awayTeam: {
        labels: awayTeamLabels,
        datasets: [
          {
            label: "Away Team Occurrences",
            data: awayTeamData,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
    }
  }

  /**
   * Generates data for a matchup frequency chart
   */
  public generateMatchupFrequencyChartData(result: PatternAnalysisResult) {
    const matchupLabels = Object.keys(result.matchupFrequency)
    const matchupData = matchupLabels.map((matchup) => result.matchupFrequency[matchup])

    return {
      labels: matchupLabels,
      datasets: [
        {
          label: "Matchup Occurrences",
          data: matchupData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  /**
   * Generates data for a seasonal trend chart
   */
  public generateSeasonalTrendChartData(result: PatternAnalysisResult) {
    const seasonLabels = Object.keys(result.seasonalTrends)
    const seasonData = seasonLabels.map((season) => result.seasonalTrends[season])

    return {
      labels: seasonLabels,
      datasets: [
        {
          label: "Seasonal Occurrences",
          data: seasonData,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  /**
   * Generates data for a timeline chart
   */
  public generateTimelineChartData(occurrences: PatternOccurrence[]) {
    // Sort occurrences by date
    const sortedOccurrences = [...occurrences].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Group occurrences by month
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
          label: "Pattern Occurrences Over Time",
          data: monthData,
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    }
  }

  /**
   * Generates data for a heatmap
   */
  public generateHeatmapData(result: PatternAnalysisResult) {
    // Extract unique home and away teams
    const homeTeams = Object.keys(result.homeTeamFrequency)
    const awayTeams = Object.keys(result.awayTeamFrequency)

    // Create a matrix of occurrences
    const matrix: number[][] = []

    homeTeams.forEach((homeTeam) => {
      const row: number[] = []

      awayTeams.forEach((awayTeam) => {
        const matchupKey = `${homeTeam} vs ${awayTeam}`
        row.push(result.matchupFrequency[matchupKey] || 0)
      })

      matrix.push(row)
    })

    return {
      homeTeams,
      awayTeams,
      matrix,
    }
  }
}

import type { PatternAnalysisResult } from "../../analysis/types"

/**
 * ChartService provides methods to generate chart configurations for visualization
 */
export class ChartService {
  /**
   * Generates configuration for a frequency pie chart
   */
  generateFrequencyPieChart(result: PatternAnalysisResult) {
    return {
      type: "pie",
      data: {
        labels: ["Pattern Occurrences", "Non-Occurrences"],
        datasets: [
          {
            data: [result.occurrences, result.totalMatches - result.occurrences],
            backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
            borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "white",
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || ""
                const value = context.raw || 0
                const percentage = ((value / result.totalMatches) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
          title: {
            display: true,
            text: "Pattern Frequency",
            color: "white",
            font: {
              size: 16,
            },
          },
        },
      },
    }
  }

  /**
   * Generates configuration for a team frequency bar chart
   */
  generateTeamFrequencyBarChart(result: PatternAnalysisResult, type: "home" | "away") {
    const frequencyData = type === "home" ? result.homeTeamFrequency : result.awayTeamFrequency

    // Sort teams by frequency
    const sortedEntries = Object.entries(frequencyData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Limit to top 10 teams

    const labels = sortedEntries.map(([team]) => team)
    const data = sortedEntries.map(([, count]) => count)

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: `${type === "home" ? "Home" : "Away"} Team Occurrences`,
            data,
            backgroundColor: type === "home" ? "rgba(54, 162, 235, 0.6)" : "rgba(255, 99, 132, 0.6)",
            borderColor: type === "home" ? "rgba(54, 162, 235, 1)" : "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "white",
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || ""
                const value = context.raw || 0
                const percentage = ((value / result.occurrences) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
          title: {
            display: true,
            text: `${type === "home" ? "Home" : "Away"} Team Analysis`,
            color: "white",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    }
  }

  /**
   * Generates configuration for a seasonal trend line chart
   */
  generateSeasonalTrendLineChart(result: PatternAnalysisResult) {
    const seasons = Object.keys(result.seasonalTrends)
    const data = seasons.map((season) => result.seasonalTrends[season])

    return {
      type: "line",
      data: {
        labels: seasons,
        datasets: [
          {
            label: "Pattern Occurrences",
            data,
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "white",
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || ""
                const value = context.raw || 0
                return `${label}: ${value}`
              },
            },
          },
          title: {
            display: true,
            text: "Seasonal Trends",
            color: "white",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    }
  }

  /**
   * Generates configuration for a confidence interval chart
   */
  generateConfidenceIntervalChart(result: PatternAnalysisResult) {
    const frequency = result.frequency
    const [lowerBound, upperBound] = result.confidenceInterval

    return {
      type: "bar",
      data: {
        labels: ["Frequency with 95% Confidence Interval"],
        datasets: [
          {
            label: "Frequency",
            data: [frequency],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "white",
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                return `Frequency: ${(frequency * 100).toFixed(1)}%`
              },
              afterLabel: () => {
                return `95% CI: [${(lowerBound * 100).toFixed(1)}%, ${(upperBound * 100).toFixed(1)}%]`
              },
            },
          },
          title: {
            display: true,
            text: "Pattern Frequency with Confidence Interval",
            color: "white",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            min: 0,
            max: 1,
            ticks: {
              color: "white",
              callback: (value: any) => `${(value * 100).toFixed(0)}%`,
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    }
  }

  /**
   * Generates configuration for a heatmap
   */
  generateHeatmapChart(result: PatternAnalysisResult) {
    // Extract top teams for home and away
    const topHomeTeams = Object.entries(result.homeTeamFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([team]) => team)

    const topAwayTeams = Object.entries(result.awayTeamFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([team]) => team)

    // Create data for heatmap
    const data = []
    for (const homeTeam of topHomeTeams) {
      const row = []
      for (const awayTeam of topAwayTeams) {
        const matchupKey = `${homeTeam} vs ${awayTeam}`
        row.push(result.matchupFrequency[matchupKey] || 0)
      }
      data.push(row)
    }

    return {
      type: "heatmap",
      data: {
        labels: topAwayTeams,
        datasets: topHomeTeams.map((team, index) => ({
          label: team,
          data: data[index],
          backgroundColor: (context: any) => {
            const value = context.dataset.data[context.dataIndex]
            const alpha = Math.min(0.8, Math.max(0.1, value / 5))
            return `rgba(54, 162, 235, ${alpha})`
          },
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "white",
            },
          },
          tooltip: {
            callbacks: {
              title: (context: any) => {
                const homeTeam = context[0].dataset.label
                const awayTeam = context[0].label
                return `${homeTeam} vs ${awayTeam}`
              },
              label: (context: any) => {
                const value = context.raw || 0
                return `Occurrences: ${value}`
              },
            },
          },
          title: {
            display: true,
            text: "Pattern Occurrences by Matchup",
            color: "white",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Away Teams",
              color: "white",
            },
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Home Teams",
              color: "white",
            },
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    }
  }
}


import type { PatternAnalysisResult, PatternOccurrence } from "../../analysis/types"
import type { LeagueData, Match } from "../../types"

/**
 * ReportService provides functionality to generate various reports
 * from analysis results and raw data.
 */
export class ReportService {
  /**
   * Generates a summary report for a pattern analysis result.
   * @param result The pattern analysis result.
   * @returns A string containing the summary report.
   */
  public generatePatternSummaryReport(result: PatternAnalysisResult): string {
    let report = `--- Pattern Analysis Report: ${result.patternName} ---\n\n`
    report += `Total Matches Analyzed: ${result.totalMatches}\n`
    report += `Occurrences Found: ${result.occurrences}\n`
    report += `Frequency: ${(result.frequency * 100).toFixed(2)}%\n`
    report += `95% Confidence Interval: [${(result.confidenceInterval[0] * 100).toFixed(2)}%, ${(
      result.confidenceInterval[1] * 100
    ).toFixed(2)}%]\n`
    report += `Statistical Significance (p-value): ${result.statisticalSignificance?.pValue.toFixed(4)} (${
      result.statisticalSignificance?.isSignificant ? "Significant" : "Not Significant"
    })\n\n`

    report += "--- Top Home Teams by Occurrence ---\n"
    const sortedHomeTeams = Object.entries(result.homeTeamFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    if (sortedHomeTeams.length > 0) {
      sortedHomeTeams.forEach(([team, count]) => {
        report += `- ${team}: ${count} occurrences\n`
      })
    } else {
      report += "No home team occurrences.\n"
    }
    report += "\n"

    report += "--- Top Away Teams by Occurrence ---\n"
    const sortedAwayTeams = Object.entries(result.awayTeamFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    if (sortedAwayTeams.length > 0) {
      sortedAwayTeams.forEach(([team, count]) => {
        report += `- ${team}: ${count} occurrences\n`
      })
    } else {
      report += "No away team occurrences.\n"
    }
    report += "\n"

    report += "--- Recent Occurrences ---\n"
    const recentOccurrences = [...result.occurrenceDetails]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    if (recentOccurrences.length > 0) {
      recentOccurrences.forEach((occurrence) => {
        report += `- ${occurrence.date.split("T")[0]}: ${occurrence.homeTeam} ${occurrence.ftHomeScore}-${
          occurrence.ftAwayScore
        } ${occurrence.awayTeam} (Confidence: ${(occurrence.confidence * 100).toFixed(2)}%)\n`
      })
    } else {
      report += "No recent occurrences.\n"
    }
    report += "\n"

    return report
  }

  /**
   * Generates a CSV report of all pattern occurrences.
   * @param occurrences An array of pattern occurrences.
   * @returns A CSV string.
   */
  public generateOccurrencesCsv(occurrences: PatternOccurrence[]): string {
    if (occurrences.length === 0) {
      return "patternId,matchId,date,homeTeam,awayTeam,htHomeScore,htAwayScore,ftHomeScore,ftAwayScore,confidence,metadata\n"
    }

    const headers = Object.keys(occurrences[0])
    const csvRows = [
      headers.join(","), // CSV Header
      ...occurrences.map((row) =>
        headers
          .map((header) => {
            let value = row[header as keyof PatternOccurrence]
            if (typeof value === "string") {
              value = `"${value.replace(/"/g, '""')}"` // Escape double quotes
            } else if (typeof value === "object" && value !== null) {
              value = `"${JSON.stringify(value).replace(/"/g, '""')}"` // Stringify and escape objects
            }
            return value
          })
          .join(","),
      ),
    ]

    return csvRows.join("\n")
  }

  /**
   * Generates a comprehensive league report.
   * @param league The league data.
   * @param matches The matches for the league.
   * @param standings The league standings.
   * @param teamForms The team form data.
   * @returns A string containing the comprehensive league report.
   */
  public generateLeagueReport(
    league: LeagueData,
    matches: Match[],
    standings: any[], // Using any[] for simplicity, should be StandingsEntry[]
    teamForms: any[], // Using any[] for simplicity, should be TeamForm[]
  ): string {
    let report = `--- League Report: ${league.name} (${league.season}) ---\n\n`
    report += `Status: ${league.status}\n`
    report += `Winner: ${league.winner || "N/A"}\n`
    report += `Second Place: ${league.secondPlace || "N/A"}\n`
    report += `Third Place: ${league.thirdPlace || "N/A"}\n\n`

    report += "--- Standings ---\n"
    if (standings.length > 0) {
      report += "Pos | Team             | P | W | D | L | GF | GA | GD | Pts\n"
      report += "----|------------------|---|---|---|---|----|----|----|----\n"
      standings.forEach((s) => {
        report += `${String(s.position).padEnd(3)} | ${String(s.team).padEnd(16)} | ${String(s.played).padEnd(1)} | ${String(
          s.won,
        ).padEnd(
          1,
        )} | ${String(s.drawn).padEnd(1)} | ${String(s.lost).padEnd(1)} | ${String(s.goalsFor).padEnd(2)} | ${String(
          s.goalsAgainst,
        ).padEnd(2)} | ${String(s.goalDifference).padEnd(2)} | ${String(s.points).padEnd(3)}\n`
      })
    } else {
      report += "No standings data available.\n"
    }
    report += "\n"

    report += "--- Recent Matches ---\n"
    const recentMatches = [...matches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
    if (recentMatches.length > 0) {
      recentMatches.forEach((match) => {
        report += `- ${match.date.split("T")[0]}: ${match.home_team} ${match.home_score}-${match.away_score} ${
          match.away_team
        }\n`
      })
    } else {
      report += "No match data available.\n"
    }
    report += "\n"

    return report
  }
}

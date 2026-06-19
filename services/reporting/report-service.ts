import type { PatternAnalysisResult } from "../../analysis/types"
import type { LeagueData } from "../../types"
import { ChartService } from "../visualization/chart-service"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

/**
 * ReportService provides methods to generate reports in various formats
 */
export class ReportService {
  private chartService: ChartService

  constructor() {
    this.chartService = new ChartService()
  }

  /**
   * Generates a PDF report for a pattern analysis result
   * @param result The pattern analysis result
   * @param league The league data
   * @returns PDF document as a Blob
   */
  async generatePdfReport(result: PatternAnalysisResult, league: LeagueData): Promise<Blob> {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Add title
    doc.setFontSize(20)
    doc.text("Pattern Analysis Report", 105, 20, { align: "center" })

    // Add pattern and league info
    doc.setFontSize(14)
    doc.text(`Pattern: ${result.patternName}`, 20, 35)
    doc.text(`League: ${league.name} (${league.season})`, 20, 45)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55)

    // Add summary
    doc.setFontSize(16)
    doc.text("Summary", 20, 70)

    doc.setFontSize(12)
    doc.text(`Total Matches: ${result.totalMatches}`, 25, 80)
    doc.text(`Pattern Occurrences: ${result.occurrences}`, 25, 87)
    doc.text(`Frequency: ${(result.frequency * 100).toFixed(2)}%`, 25, 94)
    doc.text(
      `Confidence Interval: ${(result.confidenceInterval[0] * 100).toFixed(2)}% - ${(result.confidenceInterval[1] * 100).toFixed(2)}%`,
      25,
      101,
    )

    if (result.statisticalSignificance) {
      doc.text(`P-Value: ${result.statisticalSignificance.pValue.toFixed(4)}`, 25, 108)
      doc.text(`Statistically Significant: ${result.statisticalSignificance.isSignificant ? "Yes" : "No"}`, 25, 115)
    }

    // Add match details table
    doc.setFontSize(16)
    doc.text("Match Details", 20, 130)

    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 135,
      head: [["Date", "Home Team", "Away Team", "HT", "FT", "Confidence"]],
      body: result.occurrenceDetails.map((occurrence) => [
        new Date(occurrence.date).toLocaleDateString(),
        occurrence.homeTeam,
        occurrence.awayTeam,
        `${occurrence.htHomeScore} - ${occurrence.htAwayScore}`,
        `${occurrence.ftHomeScore} - ${occurrence.ftAwayScore}`,
        `${(occurrence.confidence * 100).toFixed(0)}%`,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [54, 162, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    })

    // Add team analysis
    const pageHeight = doc.internal.pageSize.height

    // Check if we need a new page
    if (doc.lastAutoTable.finalY > pageHeight - 40) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text("Team Analysis", 20, 20)

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: 25,
        head: [["Team", "Occurrences", "Percentage"]],
        body: [
          ...Object.entries(result.homeTeamFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([team, count]) => [`${team} (Home)`, count, `${((count / result.occurrences) * 100).toFixed(1)}%`]),
          ...Object.entries(result.awayTeamFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([team, count]) => [`${team} (Away)`, count, `${((count / result.occurrences) * 100).toFixed(1)}%`]),
        ],
        theme: "grid",
        headStyles: {
          fillColor: [54, 162, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      })
    } else {
      doc.setFontSize(16)
      doc.text("Team Analysis", 20, doc.lastAutoTable.finalY + 20)

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Team", "Occurrences", "Percentage"]],
        body: [
          ...Object.entries(result.homeTeamFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([team, count]) => [`${team} (Home)`, count, `${((count / result.occurrences) * 100).toFixed(1)}%`]),
          ...Object.entries(result.awayTeamFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([team, count]) => [`${team} (Away)`, count, `${((count / result.occurrences) * 100).toFixed(1)}%`]),
        ],
        theme: "grid",
        headStyles: {
          fillColor: [54, 162, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      })
    }

    // Return the PDF as a blob
    return doc.output("blob")
  }

  /**
   * Generates a CSV report for a pattern analysis result
   * @param result The pattern analysis result
   * @returns CSV content as a string
   */
  generateCsvReport(result: PatternAnalysisResult): string {
    // Create CSV header
    let csv = "Date,Home Team,Away Team,HT Home,HT Away,FT Home,FT Away,Confidence\n"

    // Add match details
    result.occurrenceDetails.forEach((occurrence) => {
      csv +=
        [
          new Date(occurrence.date).toLocaleDateString(),
          occurrence.homeTeam,
          occurrence.awayTeam,
          occurrence.htHomeScore,
          occurrence.htAwayScore,
          occurrence.ftHomeScore,
          occurrence.ftAwayScore,
          (occurrence.confidence * 100).toFixed(0) + "%",
        ].join(",") + "\n"
    })

    return csv
  }

  /**
   * Generates an HTML report for a pattern analysis result
   * @param result The pattern analysis result
   * @param league The league data
   * @returns HTML content as a string
   */
  generateHtmlReport(result: PatternAnalysisResult, league: LeagueData): string {
    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pattern Analysis Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #3498db;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .summary-box {
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin-bottom: 20px;
          }
          .chart-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
          }
        </style>
      </head>
      <body>
        <h1>Pattern Analysis Report</h1>
        
        <div class="summary-box">
          <h2>Summary</h2>
          <p><strong>Pattern:</strong> ${result.patternName}</p>
          <p><strong>League:</strong> ${league.name} (${league.season})</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Matches:</strong> ${result.totalMatches}</p>
          <p><strong>Pattern Occurrences:</strong> ${result.occurrences}</p>
          <p><strong>Frequency:</strong> ${(result.frequency * 100).toFixed(2)}%</p>
          <p><strong>Confidence Interval:</strong> ${(result.confidenceInterval[0] * 100).toFixed(2)}% - ${(result.confidenceInterval[1] * 100).toFixed(2)}%</p>
          ${
            result.statisticalSignificance
              ? `
          <p><strong>P-Value:</strong> ${result.statisticalSignificance.pValue.toFixed(4)}</p>
          <p><strong>Statistically Significant:</strong> ${result.statisticalSignificance.isSignificant ? "Yes" : "No"}</p>
          `
              : ""
          }
        </div>
        
        <h2>Match Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Home Team</th>
              <th>Away Team</th>
              <th>HT</th>
              <th>FT</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
    `

    // Add match details
    result.occurrenceDetails.forEach((occurrence) => {
      html += `
            <tr>
              <td>${new Date(occurrence.date).toLocaleDateString()}</td>
              <td>${occurrence.homeTeam}</td>
              <td>${occurrence.awayTeam}</td>
              <td>${occurrence.htHomeScore} - ${occurrence.htAwayScore}</td>
              <td>${occurrence.ftHomeScore} - ${occurrence.ftAwayScore}</td>
              <td>${(occurrence.confidence * 100).toFixed(0)}%</td>
            </tr>
      `
    })

    html += `
          </tbody>
        </table>
        
        <h2>Team Analysis</h2>
        <h3>Top Home Teams</h3>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Occurrences</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
    `

    // Add home team analysis
    Object.entries(result.homeTeamFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([team, count]) => {
        html += `
            <tr>
              <td>${team}</td>
              <td>${count}</td>
              <td>${((count / result.occurrences) * 100).toFixed(1)}%</td>
            </tr>
        `
      })

    html += `
          </tbody>
        </table>
        
        <h3>Top Away Teams</h3>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Occurrences</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
    `

    // Add away team analysis
    Object.entries(result.awayTeamFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([team, count]) => {
        html += `
            <tr>
              <td>${team}</td>
              <td>${count}</td>
              <td>${((count / result.occurrences) * 100).toFixed(1)}%</td>
            </tr>
        `
      })

    html += `
          </tbody>
        </table>
        
        <h2>Seasonal Trends</h2>
        <table>
          <thead>
            <tr>
              <th>Season</th>
              <th>Occurrences</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
    `

    // Add seasonal trends
    Object.entries(result.seasonalTrends).forEach(([season, count]) => {
      html += `
            <tr>
              <td>${season}</td>
              <td>${count}</td>
              <td>${((count / result.occurrences) * 100).toFixed(1)}%</td>
            </tr>
        `
    })

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `

    return html
  }
}


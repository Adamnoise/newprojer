"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2, RefreshCw, FileText, FileSpreadsheet, FileCode } from "lucide-react"
import type { PatternDefinition, PatternAnalysisResult } from "../analysis/types"
import { ChartService } from "../services/visualization/chart-service"
import { ReportService } from "../services/reporting/report-service"
import { MLService } from "../analysis/ml/ml-service"
import type { LeagueData } from "../types"
import Chart from "chart.js/auto"

interface AnalysisResultsPanelProps {
  results: Record<string, PatternAnalysisResult>
  patterns: PatternDefinition[]
  leagues: LeagueData[]
  isLoading: boolean
  onRunAnalysis: () => void
}

export function AnalysisResultsPanel({
  results,
  patterns,
  leagues,
  isLoading,
  onRunAnalysis,
}: AnalysisResultsPanelProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(patterns.length > 0 ? patterns[0].id : null)
  const [chartType, setChartType] = useState<string>("frequency")
  const [activeTab, setActiveTab] = useState<string>("charts")

  // Chart references
  const frequencyChartRef = useRef<HTMLCanvasElement>(null)
  const teamChartRef = useRef<HTMLCanvasElement>(null)
  const seasonalChartRef = useRef<HTMLCanvasElement>(null)
  const confidenceChartRef = useRef<HTMLCanvasElement>(null)

  // Chart instances
  const [frequencyChart, setFrequencyChart] = useState<Chart | null>(null)
  const [teamChart, setTeamChart] = useState<Chart | null>(null)
  const [seasonalChart, setSeasonalChart] = useState<Chart | null>(null)
  const [confidenceChart, setConfidenceChart] = useState<Chart | null>(null)

  // Services
  const chartService = new ChartService()
  const reportService = new ReportService()
  const mlService = new MLService()

  // Get the selected pattern result
  const selectedResult = selectedPatternId ? results[selectedPatternId] : null

  // Get the selected pattern definition
  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId)

  // Get the league for the selected pattern
  const selectedLeague = leagues.length > 0 ? leagues[0] : null

  // Update charts when selected pattern or chart type changes
  useEffect(() => {
    if (!selectedResult) return

    // Destroy existing charts
    if (frequencyChart) frequencyChart.destroy()
    if (teamChart) teamChart.destroy()
    if (seasonalChart) seasonalChart.destroy()
    if (confidenceChart) confidenceChart.destroy()

    // Create new charts
    if (frequencyChartRef.current) {
      const ctx = frequencyChartRef.current.getContext("2d")
      if (ctx) {
        const config = chartService.generateFrequencyPieChart(selectedResult)
        setFrequencyChart(new Chart(ctx, config as any))
      }
    }

    if (teamChartRef.current) {
      const ctx = teamChartRef.current.getContext("2d")
      if (ctx) {
        const config = chartService.generateTeamFrequencyBarChart(selectedResult, "home")
        setTeamChart(new Chart(ctx, config as any))
      }
    }

    if (seasonalChartRef.current) {
      const ctx = seasonalChartRef.current.getContext("2d")
      if (ctx) {
        const config = chartService.generateSeasonalTrendLineChart(selectedResult)
        setSeasonalChart(new Chart(ctx, config as any))
      }
    }

    if (confidenceChartRef.current) {
      const ctx = confidenceChartRef.current.getContext("2d")
      if (ctx) {
        const config = chartService.generateConfidenceIntervalChart(selectedResult)
        setConfidenceChart(new Chart(ctx, config as any))
      }
    }

    // Cleanup function
    return () => {
      if (frequencyChart) frequencyChart.destroy()
      if (teamChart) teamChart.destroy()
      if (seasonalChart) seasonalChart.destroy()
      if (confidenceChart) confidenceChart.destroy()
    }
  }, [selectedResult, chartType])

  // Handle report generation
  const handleGenerateReport = async (format: "pdf" | "csv" | "html") => {
    if (!selectedResult || !selectedLeague) return

    try {
      if (format === "pdf") {
        const blob = await reportService.generatePdfReport(selectedResult, selectedLeague)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedResult.patternName.replace(/\s+/g, "_")}_report.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "csv") {
        const csv = reportService.generateCsvReport(selectedResult)
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedResult.patternName.replace(/\s+/g, "_")}_report.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "html") {
        const html = reportService.generateHtmlReport(selectedResult, selectedLeague)
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedResult.patternName.replace(/\s+/g, "_")}_report.html`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analysis Results</h2>
        <div className="flex gap-2">
          <Button onClick={onRunAnalysis} disabled={isLoading || patterns.length === 0} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Analysis
          </Button>

          <Select
            value={selectedPatternId || ""}
            onValueChange={(value) => setSelectedPatternId(value)}
            disabled={patterns.length === 0}
          >
            <SelectTrigger className="bg-black/30 border-white/10 w-[200px]">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f14] border-white/10">
              {patterns.map((pattern) => (
                <SelectItem key={pattern.id} value={pattern.id}>
                  {pattern.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2">No Patterns Defined</h3>
          <p className="text-gray-400">Create patterns in the Patterns tab to run analysis</p>
        </div>
      ) : Object.keys(results).length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
          <p className="text-gray-400 mb-4">Run analysis to see results for your patterns</p>
          <Button onClick={onRunAnalysis} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Analysis
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedResult && selectedPattern ? (
            <>
              <Card className="bg-black/20 border border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{selectedPattern.name} - Summary</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport("pdf")}
                      className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport("csv")}
                      className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport("html")}
                      className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <FileCode className="w-4 h-4" />
                      HTML
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">Occurrences</div>
                      <div className="text-2xl font-bold">{selectedResult.occurrences}</div>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">Frequency</div>
                      <div className="text-2xl font-bold">{(selectedResult.frequency * 100).toFixed(2)}%</div>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">Confidence Interval</div>
                      <div className="text-2xl font-bold">
                        {(selectedResult.confidenceInterval[0] * 100).toFixed(2)}% -{" "}
                        {(selectedResult.confidenceInterval[1] * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {selectedResult.statisticalSignificance && (
                    <div className="mt-4 p-4 rounded-lg bg-black/30">
                      <div className="text-sm text-gray-400">Statistical Significance</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold">
                          p-value: {selectedResult.statisticalSignificance.pValue.toFixed(4)}
                        </div>
                        <div
                          className={`text-sm px-2 py-1 rounded ${
                            selectedResult.statisticalSignificance.isSignificant
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {selectedResult.statisticalSignificance.isSignificant ? "Significant" : "Not Significant"}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-black/20 w-full">
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="details">Match Details</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-black/20 border border-white/10">
                      <CardHeader>
                        <CardTitle>Pattern Frequency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <canvas ref={frequencyChartRef} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 border border-white/10">
                      <CardHeader>
                        <CardTitle>Confidence Interval</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <canvas ref={confidenceChartRef} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 border border-white/10">
                      <CardHeader>
                        <CardTitle>Team Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <canvas ref={teamChartRef} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 border border-white/10">
                      <CardHeader>
                        <CardTitle>Seasonal Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <canvas ref={seasonalChartRef} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-6">
                  <Card className="bg-black/20 border border-white/10">
                    <CardHeader>
                      <CardTitle>Match Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Home Team</th>
                              <th className="px-4 py-2 text-left">Away Team</th>
                              <th className="px-4 py-2 text-center">HT</th>
                              <th className="px-4 py-2 text-center">FT</th>
                              <th className="px-4 py-2 text-center">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedResult.occurrenceDetails.length > 0 ? (
                              selectedResult.occurrenceDetails.map((occurrence) => (
                                <tr key={occurrence.matchId} className="border-b border-white/10 hover:bg-white/5">
                                  <td className="px-4 py-2">{new Date(occurrence.date).toLocaleDateString()}</td>
                                  <td className="px-4 py-2">{occurrence.homeTeam}</td>
                                  <td className="px-4 py-2">{occurrence.awayTeam}</td>
                                  <td className="px-4 py-2 text-center">
                                    {occurrence.htHomeScore} - {occurrence.htAwayScore}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {occurrence.ftHomeScore} - {occurrence.ftAwayScore}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                                      {(occurrence.confidence * 100).toFixed(0)}%
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                  No matches found matching this pattern
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="predictions" className="mt-6">
                  <Card className="bg-black/20 border border-white/10">
                    <CardHeader>
                      <CardTitle>Pattern Predictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 mb-4">
                        Based on the analysis of this pattern, here are some predictions for future matches:
                      </p>

                      <div className="space-y-4">
                        {selectedResult.occurrenceDetails.length > 0 ? (
                          <>
                            <div className="p-4 bg-black/30 rounded-lg">
                              <h3 className="text-lg font-medium mb-2">Teams Most Likely to Exhibit This Pattern</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm text-gray-400 mb-2">Home Teams</h4>
                                  <ul className="space-y-2">
                                    {Object.entries(selectedResult.homeTeamFrequency)
                                      .sort(([, a], [, b]) => b - a)
                                      .slice(0, 5)
                                      .map(([team, count]) => (
                                        <li key={team} className="flex justify-between">
                                          <span>{team}</span>
                                          <span className="text-blue-400">
                                            {((count / selectedResult.occurrences) * 100).toFixed(1)}%
                                          </span>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm text-gray-400 mb-2">Away Teams</h4>
                                  <ul className="space-y-2">
                                    {Object.entries(selectedResult.awayTeamFrequency)
                                      .sort(([, a], [, b]) => b - a)
                                      .slice(0, 5)
                                      .map(([team, count]) => (
                                        <li key={team} className="flex justify-between">
                                          <span>{team}</span>
                                          <span className="text-red-400">
                                            {((count / selectedResult.occurrences) * 100).toFixed(1)}%
                                          </span>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-black/30 rounded-lg">
                              <h3 className="text-lg font-medium mb-2">Seasonal Trend Prediction</h3>
                              <p className="text-gray-400 mb-2">
                                Based on historical data, this pattern is expected to occur with the following frequency
                                in upcoming matches:
                              </p>
                              <div className="text-2xl font-bold">
                                {(selectedResult.frequency * 100).toFixed(1)}% ±{" "}
                                {(
                                  (selectedResult.confidenceInterval[1] - selectedResult.confidenceInterval[0]) *
                                  50
                                ).toFixed(1)}
                                %
                              </div>
                            </div>

                            <div className="p-4 bg-black/30 rounded-lg">
                              <h3 className="text-lg font-medium mb-2">Matchup Predictions</h3>
                              <p className="text-gray-400 mb-2">
                                The following matchups are most likely to exhibit this pattern:
                              </p>
                              <ul className="space-y-2">
                                {Object.entries(selectedResult.matchupFrequency)
                                  .sort(([, a], [, b]) => b - a)
                                  .slice(0, 5)
                                  .map(([matchup, count]) => (
                                    <li key={matchup} className="flex justify-between">
                                      <span>{matchup}</span>
                                      <span className="text-purple-400">
                                        {((count / selectedResult.occurrences) * 100).toFixed(1)}%
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            No prediction data available. Run analysis with more matches to generate predictions.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg font-medium mb-2">No Results Available</h3>
              <p className="text-gray-400">Select a pattern and run analysis to see results</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


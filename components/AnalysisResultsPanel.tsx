"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, LineChart, PieChart } from "lucide-react" // Placeholder icons for charts
import type { PatternAnalysisResult, AnalysisJob } from "../analysis/types"
import { ChartService } from "../services/visualization/chart-service"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ReportService } from "../services/reporting/report-service"
import { useToast } from "@/hooks/use-toast"

interface AnalysisResultsPanelProps {
  analysisResults: PatternAnalysisResult[]
  analysisJobs: AnalysisJob[]
}

const chartService = new ChartService()
const reportService = new ReportService()

export function AnalysisResultsPanel({ analysisResults, analysisJobs }: AnalysisResultsPanelProps) {
  const { toast } = useToast()
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null)

  const latestCompletedJob = useMemo(() => {
    return analysisJobs
      .filter((job) => job.status === "completed" && job.results)
      .sort((a, b) => new Date(b.endTime || 0).getTime() - new Date(a.endTime || 0).getTime())[0]
  }, [analysisJobs])

  const latestRunningJob = useMemo(() => {
    return analysisJobs
      .filter((job) => job.status === "running")
      .sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime())[0]
  }, [analysisJobs])

  const displayResults = useMemo(() => {
    if (expandedResultId) {
      return analysisResults.filter((r) => r.patternId === expandedResultId)
    }
    // If no specific result is expanded, show the results from the latest completed job
    if (latestCompletedJob && latestCompletedJob.results) {
      return Object.values(latestCompletedJob.results)
    }
    return []
  }, [analysisResults, expandedResultId, latestCompletedJob])

  const handleDownloadReport = (result: PatternAnalysisResult, format: "txt" | "csv") => {
    let content = ""
    let filename = ""

    if (format === "txt") {
      content = reportService.generatePatternSummaryReport(result)
      filename = `${result.patternName.replace(/\s/g, "_")}_summary.txt`
    } else if (format === "csv") {
      content = reportService.generateOccurrencesCsv(result.occurrenceDetails)
      filename = `${result.patternName.replace(/\s/g, "_")}_occurrences.csv`
    }

    const blob = new Blob([content], { type: `text/${format};charset=utf-8;` })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Report Downloaded",
      description: `"${filename}" has been downloaded.`,
    })
  }

  if (!latestCompletedJob && !latestRunningJob && analysisJobs.length === 0) {
    return (
      <Card className="bg-black/20 border-white/5">
        <CardContent className="p-8 text-center">
          <div className="text-white opacity-70">No analysis results yet. Run an analysis job to see results.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {latestRunningJob && (
        <Card className="bg-black/20 border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Running Analysis Job</CardTitle>
            <CardDescription className="text-gray-400">
              {latestRunningJob.patternIds
                .map((id) => analysisResults.find((r) => r.patternId === id)?.patternName || id)
                .join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress
                value={latestRunningJob.progress}
                className="w-full h-3 bg-black/50"
                indicatorClassName="bg-blue-500"
              />
              <span className="text-white font-medium">{latestRunningJob.progress}%</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Status: {latestRunningJob.status}</p>
          </CardContent>
        </Card>
      )}

      {displayResults.length === 0 && !latestRunningJob && (
        <Card className="bg-black/20 border-white/5">
          <CardContent className="p-8 text-center">
            <div className="text-white opacity-70">No completed analysis results to display.</div>
          </CardContent>
        </Card>
      )}

      {displayResults.map((result) => (
        <Card key={result.patternId} className="bg-black/20 border-white/5">
          <CardHeader>
            <CardTitle className="text-white">{result.patternName} Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Total Matches: {result.totalMatches} | Occurrences: {result.occurrences}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-black/30 rounded-md border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Frequency</h3>
                <p className="text-3xl font-bold text-blue-400">{(result.frequency * 100).toFixed(2)}%</p>
                <p className="text-sm text-gray-400">of matches contain this pattern</p>
              </div>
              <div className="p-4 bg-black/30 rounded-md border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Confidence Interval (95%)</h3>
                <p className="text-xl font-bold text-emerald-400">
                  [{(result.confidenceInterval[0] * 100).toFixed(2)}% -{" "}
                  {(result.confidenceInterval[1] * 100).toFixed(2)}%]
                </p>
                <p className="text-sm text-gray-400">Range of true frequency</p>
              </div>
              <div className="p-4 bg-black/30 rounded-md border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Statistical Significance</h3>
                <p className="text-xl font-bold text-purple-400">
                  p = {result.statisticalSignificance?.pValue.toFixed(4)}
                </p>
                <p className="text-sm text-gray-400">
                  {result.statisticalSignificance?.isSignificant ? "Statistically Significant" : "Not Significant"}
                </p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placeholder for actual charts */}
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-400" /> Occurrence Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-gray-400">
                  Chart Placeholder
                </CardContent>
              </Card>
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-emerald-400" /> Team Frequencies
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-gray-400">
                  Chart Placeholder
                </CardContent>
              </Card>
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-amber-400" /> Seasonal Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-gray-400">
                  Chart Placeholder
                </CardContent>
              </Card>
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-purple-400" /> Matchup Frequencies
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-gray-400">
                  Chart Placeholder
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-white/10" />

            <h3 className="text-lg font-semibold text-white">Recent Occurrences</h3>
            <div className="overflow-x-auto rounded-md border border-white/5 bg-black/30">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-gray-400 font-normal">Date</TableHead>
                    <TableHead className="text-gray-400 font-normal">Home Team</TableHead>
                    <TableHead className="text-gray-400 font-normal">Away Team</TableHead>
                    <TableHead className="text-gray-400 font-normal text-center">Score (HT)</TableHead>
                    <TableHead className="text-gray-400 font-normal text-center">Score (FT)</TableHead>
                    <TableHead className="text-gray-400 font-normal text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.occurrenceDetails.slice(0, 10).map((occurrence, index) => (
                    <TableRow key={index} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        {new Date(occurrence.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-white">{occurrence.homeTeam}</TableCell>
                      <TableCell className="text-white">{occurrence.awayTeam}</TableCell>
                      <TableCell className="text-center text-gray-300">
                        {occurrence.htHomeScore}-{occurrence.htAwayScore}
                      </TableCell>
                      <TableCell className="text-center font-bold text-white">
                        {occurrence.ftHomeScore}-{occurrence.ftAwayScore}
                      </TableCell>
                      <TableCell className="text-right text-blue-400">
                        {(occurrence.confidence * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {result.occurrenceDetails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                        No occurrences found for this pattern.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownloadReport(result, "txt")}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2"
              >
                <Download className="h-4 w-4" /> Download Summary (.txt)
              </Button>
              <Button
                onClick={() => handleDownloadReport(result, "csv")}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2"
              >
                <Download className="h-4 w-4" /> Download Occurrences (.csv)
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

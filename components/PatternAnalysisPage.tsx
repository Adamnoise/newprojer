"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { PatternDefinitionPanel } from "./PatternDefinitionPanel"
import { DataSourcePanel } from "./DataSourcePanel"
import { AnalysisResultsPanel } from "./AnalysisResultsPanel"
import { AlertsPanel } from "./AlertsPanel"
import { PatternAnalysisService } from "../analysis/pattern-analysis-service"
import { DataImportService } from "../analysis/data-import-service"
import { VisualizationService } from "../analysis/visualization-service"
import { AlertService } from "../analysis/alert-service"
import type { PatternDefinition, DataSource, AnalysisJob, Alert, PatternAnalysisResult } from "../analysis/types"
import type { Match, LeagueData } from "../types"

interface PatternAnalysisPageProps {
  leagues: LeagueData[]
  initialMatches?: Match[]
  onBack: () => void
}

export function PatternAnalysisPage({ leagues, initialMatches = [], onBack }: PatternAnalysisPageProps) {
  // Services
  const [analysisService] = useState(() => new PatternAnalysisService())
  const [dataImportService] = useState(() => new DataImportService())
  const [visualizationService] = useState(() => new VisualizationService())
  const [alertService] = useState(() => new AlertService())

  // State
  const [activeTab, setActiveTab] = useState("patterns")
  const [patterns, setPatterns] = useState<PatternDefinition[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [analysisResults, setAnalysisResults] = useState<Record<string, PatternAnalysisResult>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with default patterns
  useEffect(() => {
    // Add default "Half-Time / Full-Time Turnaround" pattern
    const defaultPattern: PatternDefinition = {
      id: "pattern-turnaround-1",
      name: "Half-Time / Full-Time Turnaround",
      description: "Detects matches where a team was losing or drawing at half-time but won at full-time",
      conditions: [
        {
          id: "condition-1",
          type: "score_change",
          operator: "=",
          value: "turnaround",
          target: "both",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setPatterns([defaultPattern])
  }, [])

  // Run analysis when patterns or matches change
  useEffect(() => {
    if (patterns.length > 0 && matches.length > 0) {
      runAnalysis()
    }
  }, [patterns, matches])

  // Add a new pattern
  const handleAddPattern = (pattern: PatternDefinition) => {
    setPatterns((prev) => [...prev, pattern])
  }

  // Update an existing pattern
  const handleUpdatePattern = (updatedPattern: PatternDefinition) => {
    setPatterns((prev) => prev.map((pattern) => (pattern.id === updatedPattern.id ? updatedPattern : pattern)))
  }

  // Delete a pattern
  const handleDeletePattern = (patternId: string) => {
    setPatterns((prev) => prev.filter((pattern) => pattern.id !== patternId))
  }

  // Add a new data source
  const handleAddDataSource = (dataSource: DataSource) => {
    setDataSources((prev) => [...prev, dataSource])
  }

  // Import data from a data source
  const handleImportData = async (dataSource: DataSource) => {
    setIsLoading(true)

    try {
      const importedMatches = await dataImportService.importFromDataSource(dataSource)
      setMatches((prev) => [...prev, ...importedMatches])

      // Update data source with last synced timestamp
      const updatedDataSource = {
        ...dataSource,
        lastSynced: new Date().toISOString(),
      }

      setDataSources((prev) => prev.map((ds) => (ds.id === dataSource.id ? updatedDataSource : ds)))
    } catch (error) {
      console.error("Error importing data:", error)
      // Handle error (show notification, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  // Run analysis on all patterns
  const runAnalysis = async () => {
    setIsLoading(true)

    try {
      const results: Record<string, PatternAnalysisResult> = {}

      // Create analysis job
      const job: AnalysisJob = {
        id: `job-${Date.now()}`,
        dataSourceId: "all",
        patternIds: patterns.map((pattern) => pattern.id),
        status: "running",
        progress: 0,
        startTime: new Date().toISOString(),
      }

      setAnalysisJobs((prev) => [...prev, job])

      // Run analysis for each pattern
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i]
        const result = analysisService.analyzePattern(pattern, matches, leagues)
        results[pattern.id] = result

        // Update job progress
        const updatedJob = {
          ...job,
          progress: ((i + 1) / patterns.length) * 100,
        }

        setAnalysisJobs((prev) => prev.map((j) => (j.id === job.id ? updatedJob : j)))
      }

      // Complete job
      const completedJob = {
        ...job,
        status: "completed",
        progress: 100,
        endTime: new Date().toISOString(),
        results,
      }

      setAnalysisJobs((prev) => prev.map((j) => (j.id === job.id ? completedJob : j)))

      // Update analysis results
      setAnalysisResults(results)

      // Check alerts
      const triggeredAlerts = alertService.checkAlerts(results)
      if (triggeredAlerts.length > 0) {
        // Update alerts with triggered timestamp
        setAlerts((prev) =>
          prev.map((alert) => {
            const triggered = triggeredAlerts.find((a) => a.id === alert.id)
            return triggered ? { ...alert, lastTriggered: triggered.lastTriggered } : alert
          }),
        )
      }
    } catch (error) {
      console.error("Error running analysis:", error)
      // Handle error (show notification, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new alert
  const handleAddAlert = (alert: Alert) => {
    setAlerts((prev) => [...prev, alert])
    alertService.addAlert(alert)
  }

  // Update an existing alert
  const handleUpdateAlert = (updatedAlert: Alert) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === updatedAlert.id ? updatedAlert : alert)))
    alertService.updateAlert(updatedAlert)
  }

  // Delete an alert
  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    alertService.removeAlert(alertId)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to League
        </Button>
        <h1 className="text-2xl font-bold">Pattern Analysis</h1>
      </div>

      <Card className="bg-black/20 border border-white/5">
        <CardHeader>
          <CardTitle>Pattern Analysis Dashboard</CardTitle>
          <CardDescription>Analyze match data to detect patterns and gain insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 bg-black/20 w-full rounded-xl">
              <TabsTrigger
                value="patterns"
                className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
              >
                Patterns
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
              >
                Data Sources
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
              >
                Analysis Results
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
              >
                Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="p-0 mt-6">
              <PatternDefinitionPanel
                patterns={patterns}
                onAddPattern={handleAddPattern}
                onUpdatePattern={handleUpdatePattern}
                onDeletePattern={handleDeletePattern}
              />
            </TabsContent>

            <TabsContent value="data" className="p-0 mt-6">
              <DataSourcePanel
                dataSources={dataSources}
                onAddDataSource={handleAddDataSource}
                onImportData={handleImportData}
                isLoading={isLoading}
                matchCount={matches.length}
              />
            </TabsContent>

            <TabsContent value="results" className="p-0 mt-6">
              <AnalysisResultsPanel
                results={analysisResults}
                visualizationService={visualizationService}
                patterns={patterns}
                isLoading={isLoading}
                onRunAnalysis={runAnalysis}
              />
            </TabsContent>

            <TabsContent value="alerts" className="p-0 mt-6">
              <AlertsPanel
                alerts={alerts}
                patterns={patterns}
                onAddAlert={handleAddAlert}
                onUpdateAlert={handleUpdateAlert}
                onDeleteAlert={handleDeleteAlert}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


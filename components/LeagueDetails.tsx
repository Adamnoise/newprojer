"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ArrowLeft, Upload, BarChart, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeagueData, Match } from "../types"
import { calculateStandings, calculateTeamForms } from "../utils/calculations"
import { StandingsTable } from "./StandingsTable"
import { FormTable } from "./FormTable"
import { MatchesTable } from "./MatchesTable"
import { CSVUpload } from "./CSVUpload"
import { PatternAnalysisPage } from "./PatternAnalysisPage"
import { AlertsPanel } from "./AlertsPanel"
import type { DataRepository } from "../services/data/data-repository"
import type { EnhancedPatternAnalysisService } from "../analysis/enhanced-pattern-analysis-service"
import type { AlertService } from "../analysis/alert-service"
import type { DataImportService } from "../analysis/data-import-service"
import type { PatternDefinition, AnalysisJob, Alert } from "../analysis/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface LeagueDetailsProps {
  leagueId: string
  onBack: () => void
  dataRepository: DataRepository
  onUpdateMatches: (leagueId: string, matches: Match[]) => void
  patternAnalysisService: EnhancedPatternAnalysisService
  alertService: AlertService
  dataImportService: DataImportService
  patternDefinitions: PatternDefinition[]
  analysisJobs: AnalysisJob[]
  alerts: Alert[]
  onAddPattern: (pattern: PatternDefinition) => void
  onUpdatePattern: (pattern: PatternDefinition) => void
  onDeletePattern: (patternId: string) => void
  onRunAnalysisJob: (job: AnalysisJob) => void
  onAddAlert: (alert: Alert) => void
  onUpdateAlert: (alert: Alert) => void
  onDeleteAlert: (alertId: string) => void
}

export function LeagueDetails({
  leagueId,
  onBack,
  dataRepository,
  onUpdateMatches,
  patternAnalysisService,
  alertService,
  dataImportService,
  patternDefinitions,
  analysisJobs,
  alerts,
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
  onRunAnalysisJob,
  onAddAlert,
  onUpdateAlert,
  onDeleteAlert,
}: LeagueDetailsProps) {
  const { toast } = useToast()
  const [league, setLeague] = useState<LeagueData | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("standings")

  useEffect(() => {
    const loadLeagueData = async () => {
      const fetchedLeague = await dataRepository.getLeagueById(leagueId)
      setLeague(fetchedLeague)
      const fetchedMatches = await dataRepository.getMatches(leagueId)
      setMatches(fetchedMatches)
    }
    loadLeagueData()
  }, [leagueId, dataRepository])

  const standings = useMemo(() => calculateStandings(matches), [matches])
  const teamForms = useMemo(() => calculateTeamForms(matches), [matches])

  const handleMatchesImported = useCallback(
    async (importedMatches: Match[]) => {
      // Here you would typically merge or replace existing matches
      // For simplicity, we'll replace them for now.
      await onUpdateMatches(leagueId, importedMatches)
      setMatches(importedMatches)
      setIsUploadModalOpen(false)
      toast({
        title: "Matches Imported",
        description: `${importedMatches.length} matches successfully imported.`,
      })
    },
    [leagueId, onUpdateMatches, toast],
  )

  if (!league) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading league details...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leagues
        </Button>
        <h1 className="text-3xl font-bold text-white">
          {league.name} ({league.season})
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Matches
          </Button>
          {/* Add other league actions here if needed */}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/20 border border-white/10">
          <TabsTrigger value="standings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" />
            Standings
          </TabsTrigger>
          <TabsTrigger value="form" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" />
            Form
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="mt-6">
          <StandingsTable standings={standings} />
        </TabsContent>

        <TabsContent value="form" className="mt-6">
          <FormTable teamForms={teamForms} />
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          <MatchesTable matches={matches} />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <PatternAnalysisPage
            matches={matches}
            leagues={[league]} // Pass current league for context
            patternAnalysisService={patternAnalysisService}
            patternDefinitions={patternDefinitions}
            analysisJobs={analysisJobs}
            onAddPattern={onAddPattern}
            onUpdatePattern={onUpdatePattern}
            onDeletePattern={onDeletePattern}
            onRunAnalysisJob={onRunAnalysisJob}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <AlertsPanel
            alerts={alerts}
            patterns={patternDefinitions}
            onAddAlert={onAddAlert}
            onUpdateAlert={onUpdateAlert}
            onDeleteAlert={onDeleteAlert}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[800px] bg-[#0a0f14] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Upload Matches CSV</DialogTitle>
          </DialogHeader>
          <CSVUpload onMatchesImported={handleMatchesImported} dataImportService={dataImportService} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

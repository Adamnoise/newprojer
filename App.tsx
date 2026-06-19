"use client"

import { useState, useEffect } from "react"
import { Header } from "./components/Header"
import { LeagueDetails } from "./components/LeagueDetails"
import type { LeagueData, Match } from "./types"
import { NewLeagueModal } from "./components/NewLeagueModal"
import { LeagueTable } from "./components/LeagueTable"
import type { PatternDefinition, AnalysisJob, Alert } from "./analysis/types"
import { EnhancedPatternAnalysisService } from "./analysis/enhanced-pattern-analysis-service"
import { AlertService } from "./analysis/alert-service"
import { DataImportService } from "./analysis/data-import-service"
import type { DataRepository } from "./services/data/data-repository"
import { CachedDataRepository } from "./services/cache/cached-repository"
import { cacheService } from "./services/cache/cache-service"

// Mock Data Repository (replace with actual backend integration)
class MockDataRepository implements DataRepository {
  private leagues: LeagueData[] = []
  private matches: Map<string, Match[]> = new Map()

  constructor() {
    // Initialize with some mock data
    this.leagues = [
      {
        id: "premier-league-2023",
        name: "Premier League",
        season: "2023-2024",
        winner: "Manchester City",
        secondPlace: "Arsenal",
        thirdPlace: "Liverpool",
        status: "Completed",
      },
      {
        id: "la-liga-2023",
        name: "La Liga",
        season: "2023-2024",
        winner: "",
        secondPlace: "",
        thirdPlace: "",
        status: "In Progress",
      },
    ]

    this.matches.set("premier-league-2023", [
      {
        date: "2023-08-11T19:00:00Z",
        home_team: "Burnley",
        away_team: "Manchester City",
        ht_home_score: 0,
        ht_away_score: 2,
        home_score: 0,
        away_score: 3,
        round: "1",
        league: "Premier League",
      },
      {
        date: "2023-08-12T11:30:00Z",
        home_team: "Arsenal",
        away_team: "Nottingham Forest",
        ht_home_score: 2,
        ht_away_score: 0,
        home_score: 2,
        away_score: 1,
        round: "1",
        league: "Premier League",
      },
      {
        date: "2023-08-13T15:30:00Z",
        home_team: "Chelsea",
        away_team: "Liverpool",
        ht_home_score: 1,
        ht_away_score: 1,
        home_score: 1,
        away_score: 1,
        round: "1",
        league: "Premier League",
      },
      {
        date: "2023-08-19T14:00:00Z",
        home_team: "Manchester City",
        away_team: "Newcastle United",
        ht_home_score: 1,
        ht_away_score: 0,
        home_score: 1,
        away_score: 0,
        round: "2",
        league: "Premier League",
      },
      {
        date: "2023-08-20T13:00:00Z",
        home_team: "West Ham United",
        away_team: "Chelsea",
        ht_home_score: 1,
        ht_away_score: 1,
        home_score: 3,
        away_score: 1,
        round: "2",
        league: "Premier League",
      },
    ])

    this.matches.set("la-liga-2023", [
      {
        date: "2023-08-12T17:30:00Z",
        home_team: "Athletic Bilbao",
        away_team: "Real Madrid",
        ht_home_score: 0,
        ht_away_score: 2,
        home_score: 0,
        away_score: 2,
        round: "1",
        league: "La Liga",
      },
      {
        date: "2023-08-13T19:30:00Z",
        home_team: "Getafe",
        away_team: "Barcelona",
        ht_home_score: 0,
        ht_away_score: 0,
        home_score: 0,
        away_score: 0,
        round: "1",
        league: "La Liga",
      },
    ])
  }

  async getLeagues(): Promise<LeagueData[]> {
    return Promise.resolve(this.leagues)
  }

  async getLeagueById(id: string): Promise<LeagueData | null> {
    return Promise.resolve(this.leagues.find((l) => l.id === id) || null)
  }

  async createLeague(league: LeagueData): Promise<LeagueData> {
    this.leagues.push(league)
    this.matches.set(league.id, []) // Initialize empty matches for new league
    return Promise.resolve(league)
  }

  async updateLeague(league: LeagueData): Promise<LeagueData> {
    this.leagues = this.leagues.map((l) => (l.id === league.id ? league : l))
    return Promise.resolve(league)
  }

  async deleteLeague(id: string): Promise<boolean> {
    const initialLength = this.leagues.length
    this.leagues = this.leagues.filter((l) => l.id !== id)
    this.matches.delete(id)
    return Promise.resolve(this.leagues.length < initialLength)
  }

  async getMatches(leagueId: string): Promise<Match[]> {
    return Promise.resolve(this.matches.get(leagueId) || [])
  }

  async updateMatches(leagueId: string, matches: Match[]): Promise<Match[]> {
    this.matches.set(leagueId, matches)
    return Promise.resolve(matches)
  }
}

const mockDataRepository = new MockDataRepository()
const cachedDataRepository = new CachedDataRepository(mockDataRepository, cacheService)
const patternAnalysisService = new EnhancedPatternAnalysisService()
const alertService = new AlertService()
const dataImportService = new DataImportService()

export default function App() {
  const [leagues, setLeagues] = useState<LeagueData[]>([])
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)
  const [isNewLeagueModalOpen, setIsNewLeagueModalOpen] = useState(false)
  const [allMatches, setAllMatches] = useState<Match[]>([]) // All matches across all leagues
  const [patternDefinitions, setPatternDefinitions] = useState<PatternDefinition[]>([])
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const loadInitialData = async () => {
      const loadedLeagues = await cachedDataRepository.getLeagues()
      setLeagues(loadedLeagues)

      // Load all matches for analysis
      const allLoadedMatches: Match[] = []
      for (const league of loadedLeagues) {
        const matches = await cachedDataRepository.getMatches(league.id)
        allLoadedMatches.push(...matches)
      }
      setAllMatches(allLoadedMatches)

      // Initialize mock patterns and alerts
      setPatternDefinitions([
        {
          id: "pattern-1",
          name: "Home Team Comeback",
          description: "Home team was losing at HT but won at FT.",
          conditions: [
            {
              id: "cond-1",
              type: "score_change",
              operator: ">",
              value: "turnaround",
              target: "home",
              timeFrame: "full_match",
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "pattern-2",
          name: "High Scoring Match (4+ goals)",
          description: "Total goals in the match is 4 or more.",
          conditions: [
            {
              id: "cond-2",
              type: "custom",
              operator: "=",
              value: true,
              customFormula: "(ft_home + ft_away) >= 4",
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])

      setAlerts(alertService.getAlerts())
    }
    loadInitialData()
  }, [])

  const handleCreateLeague = async (leagueId: string) => {
    const newLeague: LeagueData = {
      id: leagueId,
      name: leagueId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), // Simple name generation
      season: "2024-2025", // Default season
      winner: "",
      secondPlace: "",
      thirdPlace: "",
      status: "In Progress",
    }
    await cachedDataRepository.createLeague(newLeague)
    setLeagues(await cachedDataRepository.getLeagues())
  }

  const handleLeagueAction = async (leagueId: string, action: "view" | "edit" | "complete" | "delete") => {
    if (action === "view") {
      setSelectedLeagueId(leagueId)
    } else if (action === "delete") {
      await cachedDataRepository.deleteLeague(leagueId)
      setLeagues(await cachedDataRepository.getLeagues())
      if (selectedLeagueId === leagueId) {
        setSelectedLeagueId(null)
      }
    } else if (action === "complete") {
      const leagueToComplete = leagues.find((l) => l.id === leagueId)
      if (leagueToComplete) {
        const updatedLeague = { ...leagueToComplete, status: "Completed" as const }
        await cachedDataRepository.updateLeague(updatedLeague)
        setLeagues(await cachedDataRepository.getLeagues())
      }
    }
    // Edit action would typically open a modal or navigate to an edit page
  }

  const handleBackToLeagues = () => {
    setSelectedLeagueId(null)
  }

  const handleUpdateLeagueMatches = async (leagueId: string, updatedMatches: Match[]) => {
    await cachedDataRepository.updateMatches(leagueId, updatedMatches)
    setAllMatches((prevMatches) => {
      const otherMatches = prevMatches.filter((m) => m.league !== leagueId)
      return [...otherMatches, ...updatedMatches]
    })
  }

  const handleAddPattern = (pattern: PatternDefinition) => {
    setPatternDefinitions((prev) => [...prev, pattern])
  }

  const handleUpdatePattern = (updatedPattern: PatternDefinition) => {
    setPatternDefinitions((prev) => prev.map((p) => (p.id === updatedPattern.id ? updatedPattern : p)))
  }

  const handleDeletePattern = (patternId: string) => {
    setPatternDefinitions((prev) => prev.filter((p) => p.id !== patternId))
  }

  const handleRunAnalysisJob = async (job: AnalysisJob) => {
    setAnalysisJobs((prev) => [
      ...prev,
      { ...job, status: "running", progress: 0, startTime: new Date().toISOString() },
    ])

    const pattern = patternDefinitions.find((p) => p.id === job.patternIds[0]) // Assuming one pattern per job for simplicity
    if (!pattern) {
      console.error("Pattern not found for analysis job:", job.patternIds[0])
      setAnalysisJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "failed", error: "Pattern not found" } : j)),
      )
      return
    }

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setAnalysisJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, progress: i } : j)))
      }

      const result = await patternAnalysisService.analyzePattern(pattern, allMatches, leagues)
      setAnalysisJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                status: "completed",
                progress: 100,
                endTime: new Date().toISOString(),
                results: { [pattern.id]: result },
              }
            : j,
        ),
      )
      // Check alerts after analysis
      alertService.checkAlerts({ [pattern.id]: result })
    } catch (error) {
      console.error("Analysis job failed:", error)
      setAnalysisJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? { ...j, status: "failed", error: error instanceof Error ? error.message : "Unknown error" }
            : j,
        ),
      )
    }
  }

  const handleAddAlert = (alert: Alert) => {
    alertService.addAlert(alert)
    setAlerts(alertService.getAlerts())
  }

  const handleUpdateAlert = (alert: Alert) => {
    alertService.updateAlert(alert)
    setAlerts(alertService.getAlerts())
  }

  const handleDeleteAlert = (alertId: string) => {
    alertService.removeAlert(alertId)
    setAlerts(alertService.getAlerts())
  }

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-8 md:px-6">
        {selectedLeagueId ? (
          <LeagueDetails
            leagueId={selectedLeagueId}
            onBack={handleBackToLeagues}
            dataRepository={cachedDataRepository}
            onUpdateMatches={handleUpdateLeagueMatches}
            patternAnalysisService={patternAnalysisService}
            alertService={alertService}
            dataImportService={dataImportService}
            patternDefinitions={patternDefinitions}
            analysisJobs={analysisJobs}
            alerts={alerts}
            onAddPattern={handleAddPattern}
            onUpdatePattern={handleUpdatePattern}
            onDeletePattern={handleDeletePattern}
            onRunAnalysisJob={handleRunAnalysisJob}
            onAddAlert={handleAddAlert}
            onUpdateAlert={handleUpdateAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        ) : (
          <LeagueTable
            leagues={leagues}
            onLeagueAction={handleLeagueAction}
            onSearch={() => {}} // Placeholder for search
            onNewLeague={() => setIsNewLeagueModalOpen(true)}
          />
        )}
      </main>

      <NewLeagueModal
        isOpen={isNewLeagueModalOpen}
        onClose={() => setIsNewLeagueModalOpen(false)}
        onCreateLeague={handleCreateLeague}
      />
    </div>
  )
}

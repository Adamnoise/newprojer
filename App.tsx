"use client"

import { useState, useMemo, useCallback } from "react"
import { Header } from "./components/Header"
import { LeagueTable } from "./components/LeagueTable"
import { LeagueDetails } from "./components/LeagueDetails"
import { NewLeagueModal } from "./components/NewLeagueModal"
import { calculateStandings } from "./utils/calculations"
import type { LeagueData, Match } from "./types"
import { useToast } from "@/components/ui/use-toast"

interface AppState {
  selectedLeagueId: string | null
  leaguesList: LeagueData[]
  matches: Match[]
  searchTerm: string
  isNewLeagueModalOpen: boolean
}

const initialLeagues: LeagueData[] = [
  {
    id: "19861",
    name: "Premier League",
    season: "2023-2024",
    winner: "-",
    secondPlace: "-",
    thirdPlace: "-",
    status: "In Progress",
  },
  {
    id: "19862",
    name: "La Liga",
    season: "2023-2024",
    winner: "-",
    secondPlace: "-",
    thirdPlace: "-",
    status: "In Progress",
  },
]

export default function App() {
  const { toast } = useToast()
  const [state, setState] = useState<AppState>({
    selectedLeagueId: null,
    leaguesList: initialLeagues,
    matches: [],
    searchTerm: "",
    isNewLeagueModalOpen: false,
  })

  const filteredLeagues = useMemo(() => {
    const searchLower = state.searchTerm.toLowerCase()
    return state.leaguesList.filter((league) =>
      Object.values(league).some((value) => value?.toString().toLowerCase().includes(searchLower)),
    )
  }, [state.leaguesList, state.searchTerm])

  const currentStandings = useMemo(() => {
    return calculateStandings(state.matches)
  }, [state.matches])

  const selectedLeague = useMemo(
    () => (state.selectedLeagueId ? state.leaguesList.find((league) => league.id === state.selectedLeagueId) : null),
    [state.selectedLeagueId, state.leaguesList],
  )

  const handleLeagueAction = useCallback(
    (leagueId: string, action: "view" | "edit" | "complete" | "delete") => {
      switch (action) {
        case "view":
        case "edit":
          setState((prev) => ({ ...prev, selectedLeagueId: leagueId }))
          break
        case "complete":
          setState((prev) => ({
            ...prev,
            leaguesList: prev.leaguesList.map((league) =>
              league.id === leagueId
                ? {
                    ...league,
                    status: "Completed",
                    winner: currentStandings[0]?.team ?? "-",
                    secondPlace: currentStandings[1]?.team ?? "-",
                    thirdPlace: currentStandings[2]?.team ?? "-",
                  }
                : league,
            ),
          }))
          toast({
            title: "League Completed",
            description: "The league has been marked as completed.",
          })
          break
        case "delete":
          setState((prev) => ({
            ...prev,
            leaguesList: prev.leaguesList.filter((league) => league.id !== leagueId),
          }))
          toast({
            title: "League Deleted",
            description: "The league has been permanently deleted.",
            variant: "destructive",
          })
          break
      }
    },
    [currentStandings, toast],
  )

  const handleCreateLeague = useCallback(
    (leagueId: string) => {
      const newLeague: LeagueData = {
        id: leagueId,
        name: `League ${leagueId}`,
        season: `2023-2024`,
        winner: "-",
        secondPlace: "-",
        thirdPlace: "-",
        status: "In Progress",
      }
      setState((prev) => ({
        ...prev,
        leaguesList: [...prev.leaguesList, newLeague],
        isNewLeagueModalOpen: false,
      }))
      toast({
        title: "League Created",
        description: `New league "${leagueId}" has been created successfully.`,
      })
    },
    [toast],
  )

  const handleUpdateLeague = useCallback(
    (updatedLeague: LeagueData) => {
      setState((prev) => ({
        ...prev,
        leaguesList: prev.leaguesList.map((league) => (league.id === updatedLeague.id ? updatedLeague : league)),
      }))
      toast({
        title: "League Updated",
        description: "The league details have been updated successfully.",
      })
    },
    [toast],
  )

  const handleUpdateMatches = useCallback((updatedMatches: Match[]) => {
    setState((prev) => ({ ...prev, matches: updatedMatches }))
  }, [])

  return (
    <div className="min-h-screen bg-[#101820] text-white">
      <Header currentSeason="2023-2024" />

      <main className="container mx-auto p-4 md:p-8">
        <div className="relative overflow-hidden rounded-xl bg-[#0a0f14] border border-white/5 shadow-lg">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative p-6">
            {selectedLeague ? (
              <LeagueDetails
                league={selectedLeague}
                matches={state.matches}
                onBack={() => setState((prev) => ({ ...prev, selectedLeagueId: null }))}
                onUpdateLeague={handleUpdateLeague}
                onUpdateMatches={handleUpdateMatches}
              />
            ) : (
              <LeagueTable
                leagues={filteredLeagues}
                onLeagueAction={handleLeagueAction}
                onSearch={(term) => setState((prev) => ({ ...prev, searchTerm: term }))}
                onNewLeague={() => setState((prev) => ({ ...prev, isNewLeagueModalOpen: true }))}
              />
            )}

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </main>

      <NewLeagueModal
        isOpen={state.isNewLeagueModalOpen}
        onClose={() => setState((prev) => ({ ...prev, isNewLeagueModalOpen: false }))}
        onCreateLeague={handleCreateLeague}
      />
    </div>
  )
}


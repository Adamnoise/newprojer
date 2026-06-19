"use client"

import { LeagueTable } from "@/components/LeagueTable"
import { LeagueData } from "@/types"

const MOCK_LEAGUES: LeagueData[] = [
  {
    id: "1",
    name: "Premier League",
    season: "2023-2024",
    winner: "Manchester City",
    secondPlace: "Arsenal",
    thirdPlace: "Liverpool",
    status: "Completed",
    matches: []
  },
  {
    id: "2",
    name: "La Liga",
    season: "2023-2024",
    winner: null,
    secondPlace: null,
    thirdPlace: null,
    status: "In Progress",
    matches: []
  }
]

export function LeagueTablePreview() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-4">
            Powerful League Management
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Experience our intuitive interface for managing seasons, tracking results, and analyzing performance.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <LeagueTable 
            leagues={MOCK_LEAGUES}
            onLeagueAction={() => {}}
            onSearch={() => {}}
            onNewLeague={() => {}}
          />
        </div>
      </div>
    </section>
  )
}

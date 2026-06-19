"use client"

import { memo } from "react"
import { Search, Plus, Eye, Edit2, CheckCircle, Trash2, Trophy, Clock } from "lucide-react"
import type React from "react"
import type { LeagueData } from "../types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LeagueTableProps {
  leagues: LeagueData[]
  onLeagueAction: (leagueId: string, action: "view" | "edit" | "complete" | "delete") => void
  onSearch: (term: string) => void
  onNewLeague: () => void
}

const ActionButton = memo(
  ({
    onClick,
    icon,
    label,
    variant,
  }: {
    onClick: () => void
    icon: React.ReactNode
    label: string
    variant: "blue" | "yellow" | "green" | "red"
  }) => {
    const colors = {
      blue: "text-blue-400 hover:bg-blue-500/20",
      yellow: "text-amber-400 hover:bg-amber-500/20",
      green: "text-emerald-400 hover:bg-emerald-500/20",
      red: "text-red-400 hover:bg-red-500/20",
    }

    return (
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className={`w-8 h-8 bg-white/5 border-white/10 hover:bg-white/10 ${colors[variant]}`}
        aria-label={label}
      >
        {icon}
      </Button>
    )
  },
)

ActionButton.displayName = "ActionButton"

const SearchBar = memo(({ onSearch }: { onSearch: (term: string) => void }) => (
  <div className="relative w-full sm:w-80">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search leagues..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full bg-black/30 text-white border border-white/10 rounded-lg pl-10 pr-4 py-2.5
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200 placeholder:text-gray-500"
      aria-label="Search leagues"
    />
  </div>
))

SearchBar.displayName = "SearchBar"

const StatusBadge = memo(({ status }: { status: string }) => (
  <span
    className={`
      px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5
      ${status === "In Progress" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}
    `}
  >
    {status === "In Progress" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
    {status}
  </span>
))

StatusBadge.displayName = "StatusBadge"

export const LeagueTable = memo(({ leagues, onLeagueAction, onSearch, onNewLeague }: LeagueTableProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden border border-white/5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-6 bg-black/20">
          <SearchBar onSearch={onSearch} />
          <Button
            onClick={onNewLeague}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            New League
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="text-gray-400 font-normal">Season</TableHead>
                <TableHead className="text-gray-400 font-normal">Winner</TableHead>
                <TableHead className="text-gray-400 font-normal">Second Place</TableHead>
                <TableHead className="text-gray-400 font-normal">Third Place</TableHead>
                <TableHead className="text-gray-400 font-normal">Status</TableHead>
                <TableHead className="text-gray-400 font-normal text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => (
                <TableRow key={league.id} className="border-b border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">{league.season}</TableCell>
                  <TableCell>{league.winner || "—"}</TableCell>
                  <TableCell>{league.secondPlace || "—"}</TableCell>
                  <TableCell>{league.thirdPlace || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={league.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionButton
                        onClick={() => onLeagueAction(league.id, "view")}
                        icon={<Eye className="w-4 h-4" />}
                        label={`View ${league.season}`}
                        variant="blue"
                      />
                      <ActionButton
                        onClick={() => onLeagueAction(league.id, "edit")}
                        icon={<Edit2 className="w-4 h-4" />}
                        label={`Edit ${league.season}`}
                        variant="yellow"
                      />
                      {league.status === "In Progress" && (
                        <ActionButton
                          onClick={() => onLeagueAction(league.id, "complete")}
                          icon={<CheckCircle className="w-4 h-4" />}
                          label={`Complete ${league.season}`}
                          variant="green"
                        />
                      )}
                      <ActionButton
                        onClick={() => onLeagueAction(league.id, "delete")}
                        icon={<Trash2 className="w-4 h-4" />}
                        label={`Delete ${league.season}`}
                        variant="red"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {leagues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="w-8 h-8 text-gray-500" />
                      <p className="text-gray-400">No leagues found. Create your first league to get started!</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
})

LeagueTable.displayName = "LeagueTable"


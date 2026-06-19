"use client"

import { memo, useState, useMemo } from "react"
import { ArrowDown, ArrowUp, Minus, BarChart3, Filter, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import type { TeamForm } from "../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface FormTableProps {
  teamForms: TeamForm[]
  className?: string
}

const FORM_COLORS = {
  W: "bg-emerald-500 hover:bg-emerald-600",
  D: "bg-amber-500 hover:bg-amber-600",
  L: "bg-red-500 hover:bg-red-600",
} as const

const FormResult = memo(({ result }: { result: string }) => (
  <span
    className={`w-6 h-6 flex items-center justify-center text-xs font-semibold text-white rounded transition-colors ${
      FORM_COLORS[result as keyof typeof FORM_COLORS] ?? "bg-gray-500 hover:bg-gray-600"
    }`}
    title={result === "W" ? "Win" : result === "D" ? "Draw" : result === "L" ? "Loss" : "Unknown"}
  >
    {result}
  </span>
))

FormResult.displayName = "FormResult"

const PositionIndicator = memo(({ position, prevPosition }: { position: number; prevPosition?: number }) => {
  if (!prevPosition) return <span>{position}</span>

  const diff = prevPosition - position
  if (diff === 0)
    return (
      <span className="flex items-center gap-1">
        {position} <Minus className="w-3 h-3 text-gray-400" />
      </span>
    )

  return (
    <span className="flex items-center gap-1">
      {position}
      {diff > 0 ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-red-500" />}
    </span>
  )
})

PositionIndicator.displayName = "PositionIndicator"

const TeamFormCard = ({ team }: { team: TeamForm }) => {
  const formArray = Array.isArray(team.form) ? team.form : typeof team.form === "string" ? team.form.split("") : []

  const winCount = formArray.filter((result) => result === "W").length
  const drawCount = formArray.filter((result) => result === "D").length
  const lossCount = formArray.filter((result) => result === "L").length

  const totalMatches = formArray.length
  const winPercentage = totalMatches > 0 ? (winCount / totalMatches) * 100 : 0
  const drawPercentage = totalMatches > 0 ? (drawCount / totalMatches) * 100 : 0
  const lossPercentage = totalMatches > 0 ? (lossCount / totalMatches) * 100 : 0

  return (
    <Card className="bg-black/30 border-white/5 overflow-hidden">
      <div className="relative">
        <Progress
          value={winPercentage}
          className="h-1 w-full bg-black/50 rounded-none"
          indicatorClassName="bg-emerald-500"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {team.position}
            </div>
            <h3 className="font-bold text-white">{team.team}</h3>
          </div>
          <div className="text-2xl font-bold text-white">{team.points}</div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-white opacity-80">
            <span>Played: {team.played}</span>
          </div>
          <div className="text-xs text-white opacity-80">
            <span>GF: {team.goalsFor}</span> | <span>GA: {team.goalsAgainst}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white">Recent Form</span>
            <div className="flex gap-1">
              {formArray.slice(0, 5).map((result, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 flex items-center justify-center text-xs font-semibold text-white rounded-full ${
                    FORM_COLORS[result as keyof typeof FORM_COLORS] ?? "bg-gray-500"
                  }`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>

          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${winPercentage}%` }}></div>
            <div className="bg-amber-500 h-full" style={{ width: `${drawPercentage}%` }}></div>
            <div className="bg-red-500 h-full" style={{ width: `${lossPercentage}%` }}></div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs text-white">
            <div>
              <span className="text-emerald-400">{winCount}</span> Wins
            </div>
            <div>
              <span className="text-amber-400">{drawCount}</span> Draws
            </div>
            <div>
              <span className="text-red-400">{lossCount}</span> Losses
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const FormTable = memo(({ teamForms = [], className = "" }: FormTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [viewType, setViewType] = useState<"table" | "cards">("table")
  const [filter, setFilter] = useState("")

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  const filteredTeams = useMemo(() => {
    return teamForms.filter((team) => filter === "" || team.team.toLowerCase().includes(filter.toLowerCase()))
  }, [teamForms, filter])

  const sortedTeams = useMemo(() => {
    if (!sortConfig) return filteredTeams

    return [...filteredTeams].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof TeamForm]
      const bValue = b[sortConfig.key as keyof TeamForm]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })
  }, [filteredTeams, sortConfig])

  if (teamForms.length === 0) {
    return (
      <Card className="bg-black/20 border-white/5">
        <CardContent className="p-8 text-center">
          <div className="text-white opacity-70">No form data available.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-black/20 border-white/5 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-white">Team Form Analysis</CardTitle>
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Filter by team..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-auto bg-black/30 border-white/10 text-white"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0f14] border-white/10 text-white">
                <DropdownMenuItem
                  onClick={() => requestSort("position")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Position {getSortIcon("position")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("team")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Team {getSortIcon("team")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("points")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Points {getSortIcon("points")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("goalsFor")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Goals For {getSortIcon("goalsFor")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={viewType} onValueChange={(value) => setViewType(value as "table" | "cards")}>
              <SelectTrigger className="w-[120px] bg-black/30 border-white/10 text-white">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="cards">Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {viewType === "table" ? (
          <div className="overflow-x-auto rounded-lg bg-black/20 border border-white/5">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-normal">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("position")}
                      className="text-gray-400 font-normal p-0 hover:text-white flex items-center"
                    >
                      Pos {getSortIcon("position")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400 font-normal">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("team")}
                      className="text-gray-400 font-normal p-0 hover:text-white flex items-center"
                    >
                      Team {getSortIcon("team")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400 font-normal text-center">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("played")}
                      className="text-gray-400 font-normal p-0 hover:text-white flex items-center justify-center"
                    >
                      P {getSortIcon("played")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400 font-normal text-center">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("goalsFor")}
                      className="text-gray-400 font-normal p-0 hover:text-white flex items-center justify-center"
                    >
                      GF {getSortIcon("goalsFor")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400 font-normal text-center">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("goalsAgainst")}
                      className="text-gray-400 font-normal p-0 hover:text-white flex items-center justify-center"
                    >
                      GA {getSortIcon("goalsAgainst")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400 font-normal text-center">GD</TableHead>
                  <TableHead className="text-gray-400 font-normal text-center">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("points")}
                      className="text-gray-400 font-normal p-0 hover:text-white flex items-center justify-center"
                    >
                      Pts {getSortIcon("points")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-400 font-normal text-center">Form</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeams.map((team, index) => (
                  <TableRow key={`${team.team}-${index}`} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell>
                      <PositionIndicator
                        position={team.position}
                        prevPosition={index > 0 ? sortedTeams[index - 1].position : undefined}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">{team.team}</TableCell>
                    <TableCell className="text-center text-white">{team.played}</TableCell>
                    <TableCell className="text-center text-white">{team.goalsFor}</TableCell>
                    <TableCell className="text-center text-white">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          team.goalsFor - team.goalsAgainst > 0
                            ? "text-emerald-400"
                            : team.goalsFor - team.goalsAgainst < 0
                              ? "text-red-400"
                              : ""
                        }
                      >
                        {team.goalsFor - team.goalsAgainst > 0 && "+"}
                        {team.goalsFor - team.goalsAgainst}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold">{team.points}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1.5">
                        {Array.isArray(team.form)
                          ? team.form.map((result, i) => <FormResult key={i} result={result} />)
                          : typeof team.form === "string"
                            ? team.form.split("").map((result, i) => <FormResult key={i} result={result} />)
                            : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTeams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-white opacity-70">
                      No teams found with the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTeams.map((team) => (
              <TeamFormCard key={team.team} team={team} />
            ))}
            {sortedTeams.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                No teams found with the current filter.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

FormTable.displayName = "FormTable"


"use client"

import { useMemo, useState } from "react"
import {
  Medal,
  TrendingDown,
  TrendingUp,
  Info,
  BarChart3,
  Shield,
  Trophy,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

export interface StandingsEntry {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form?: ("W" | "D" | "L")[]
  previousPosition?: number
}

interface StandingsTableProps {
  standings: StandingsEntry[]
  className?: string
}

const COLUMNS = [
  { key: "position", label: "Pos", align: "left" as const, sortable: true },
  { key: "team", label: "Team", align: "left" as const, sortable: true },
  { key: "played", label: "P", align: "center" as const, sortable: true },
  { key: "won", label: "W", align: "center" as const, sortable: true },
  { key: "drawn", label: "D", align: "center" as const, sortable: true },
  { key: "lost", label: "L", align: "center" as const, sortable: true },
  { key: "goalsFor", label: "GF", align: "center" as const, sortable: true },
  { key: "goalsAgainst", label: "GA", align: "center" as const, sortable: true },
  { key: "goalDifference", label: "GD", align: "center" as const, sortable: true },
  { key: "points", label: "Pts", align: "center" as const, sortable: true },
] as const

const FormBadge = ({ result }: { result: "W" | "D" | "L" }) => {
  const bgColor = result === "W" ? "bg-emerald-500" : result === "D" ? "bg-amber-500" : "bg-red-500"

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${bgColor} text-white text-xs font-medium`}
    >
      {result}
    </span>
  )
}

const TeamCard = ({ entry, maxPoints }: { entry: StandingsEntry; maxPoints: number }) => {
  const winPercentage = entry.played > 0 ? (entry.won / entry.played) * 100 : 0
  const drawPercentage = entry.played > 0 ? (entry.drawn / entry.played) * 100 : 0
  const lossPercentage = entry.played > 0 ? (entry.lost / entry.played) * 100 : 0
  const pointsPercentage = maxPoints > 0 ? (entry.points / maxPoints) * 100 : 0

  return (
    <Card className="bg-black/30 border-white/5 overflow-hidden">
      <div className="relative">
        <Progress
          value={pointsPercentage}
          className="h-1 w-full bg-black/50 rounded-none"
          indicatorClassName="bg-blue-500"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {entry.position}
            </div>
            <h3 className="font-bold text-white">{entry.team}</h3>
          </div>
          <div className="text-2xl font-bold text-white">{entry.points}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-black/20 p-2 rounded text-center">
            <div className="text-emerald-400 font-bold">{entry.won}</div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-black/20 p-2 rounded text-center">
            <div className="text-amber-400 font-bold">{entry.drawn}</div>
            <div className="text-xs text-gray-400">Draws</div>
          </div>
          <div className="bg-black/20 p-2 rounded text-center">
            <div className="text-red-400 font-bold">{entry.lost}</div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white opacity-80">
            <span>Goals</span>
            <span>
              {entry.goalsFor} - {entry.goalsAgainst} ({entry.goalDifference > 0 ? "+" : ""}
              {entry.goalDifference})
            </span>
          </div>

          <div className="flex justify-between text-xs text-white opacity-80">
            <span>Form</span>
            <div className="flex gap-1">
              {entry.form?.slice(0, 5).map((result, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex h-2 w-2 rounded-full",
                    result === "W" && "bg-emerald-500",
                    result === "D" && "bg-amber-500",
                    result === "L" && "bg-red-500",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="h-2 w-full bg-black/20 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${winPercentage}%` }}></div>
            <div className="bg-amber-500 h-full" style={{ width: `${drawPercentage}%` }}></div>
            <div className="bg-red-500 h-full" style={{ width: `${lossPercentage}%` }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StandingsTable({ standings = [], className }: StandingsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [viewType, setViewType] = useState<"table" | "cards">("table")

  const zones = useMemo(() => {
    if (standings.length === 0) return null
    return {
      champions: standings.length >= 1 ? 1 : 0,
      championsLeague: standings.length >= 4 ? 4 : 0,
      europaLeague: standings.length >= 6 ? 6 : 0,
      relegation: standings.length >= 3 ? standings.length - 3 : 0,
    }
  }, [standings])

  const sortedStandings = useMemo(() => {
    if (!sortConfig) return standings

    return [...standings].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof StandingsEntry]
      const bValue = b[sortConfig.key as keyof StandingsEntry]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })
  }, [standings, sortConfig])

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

  const maxPoints = useMemo(() => {
    if (standings.length === 0) return 0
    return Math.max(...standings.map((entry) => entry.points))
  }, [standings])

  if (standings.length === 0) {
    return (
      <Card className={cn("animate-in fade-in-50 bg-black/20 border-white/5", className)}>
        <CardHeader>
          <CardTitle className="text-white">Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white opacity-70">No standings available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("animate-in fade-in-50 bg-black/20 border-white/5", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-white">League Standings</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="sr-only">Standings information</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a0f14] border-white/10 text-white">
                  <div className="space-y-2 max-w-xs">
                    <p className="text-xs">Teams are ranked by points, then goal difference, then goals scored.</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500/20"></div>
                      <span className="text-xs">Champions League qualification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500/20"></div>
                      <span className="text-xs">Europa League qualification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500/20"></div>
                      <span className="text-xs">Relegation zone</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs value={viewType} onValueChange={(value) => setViewType(value as "table" | "cards")} className="w-auto">
            <TabsList className="bg-black/30 border border-white/10">
              <TabsTrigger value="table" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="cards" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Cards
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription className="text-gray-400">Updated {new Date().toLocaleDateString()}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {viewType === "table" ? (
          <div className="rounded-md border border-white/5">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  {COLUMNS.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "h-10 px-4 text-xs font-normal text-gray-400",
                        column.align === "center" && "text-center",
                      )}
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          onClick={() => requestSort(column.key)}
                          className="text-gray-400 font-normal p-0 hover:text-white flex items-center"
                        >
                          {column.label} {getSortIcon(column.key)}
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStandings.map((entry, index) => {
                  const positionChange = entry.previousPosition ? entry.previousPosition - entry.position : 0

                  return (
                    <TableRow
                      key={entry.team}
                      className={cn(
                        "border-b border-white/5 hover:bg-white/5",
                        zones?.champions === entry.position && "bg-blue-500/5",
                        zones?.championsLeague >= entry.position &&
                          entry.position > (zones?.champions || 0) &&
                          "bg-blue-500/5",
                        zones?.europaLeague >= entry.position &&
                          entry.position > (zones?.championsLeague || 0) &&
                          "bg-amber-500/5",
                        entry.position > (zones?.relegation || 0) && "bg-red-500/5",
                      )}
                    >
                      <TableCell className="relative px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{entry.position}</span>
                          {positionChange !== 0 && (
                            <span
                              className={cn(
                                "text-xs",
                                positionChange > 0 && "text-emerald-500",
                                positionChange < 0 && "text-red-500",
                              )}
                            >
                              {positionChange > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                          {zones?.champions === entry.position && <Medal className="h-3 w-3 text-blue-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-white">
                        {entry.team}
                        {entry.form && (
                          <div className="mt-1 flex gap-0.5">
                            {entry.form.map((result, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "inline-flex h-1.5 w-1.5 rounded-full",
                                  result === "W" && "bg-emerald-500",
                                  result === "D" && "bg-amber-500",
                                  result === "L" && "bg-red-500",
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-white">{entry.played}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-emerald-500">{entry.won}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-amber-500">{entry.drawn}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-red-500">{entry.lost}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-white">{entry.goalsFor}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-white">{entry.goalsAgainst}</TableCell>
                      <TableCell
                        className={cn(
                          "px-4 py-3 text-center",
                          entry.goalDifference > 0 && "text-emerald-500",
                          entry.goalDifference < 0 && "text-red-500",
                        )}
                      >
                        {entry.goalDifference > 0 && "+"}
                        {entry.goalDifference}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center font-bold">{entry.points}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedStandings.map((entry) => (
              <TeamCard key={entry.team} entry={entry} maxPoints={maxPoints} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

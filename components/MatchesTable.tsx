"use client"

import type React from "react"

import { memo, useMemo, useState, useEffect, useRef } from "react"
import {
  Calendar,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Clock,
  X,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Zap,
  Info,
  ListFilter,
  Check,
} from "lucide-react"
import type { Match } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { format, isWithinInterval } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { MatchDetailsView } from "./MatchDetailsView"

// Add this helper function at the top of the file, before the component definitions
// This will safely parse dates and return a valid Date object or fallback to current date

const safeParseDate = (dateString: string): Date => {
  try {
    // First try to parse as ISO
    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}, using current date as fallback`)
      return new Date()
    }

    return date
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error)
    return new Date()
  }
}

interface MatchesTableProps {
  matches: Match[]
}

type MatchStatus = "All" | "Upcoming" | "Live" | "Completed"
type SortKey = "date" | "round" | "league" | "team" | "goals" | "status"
type SortDirection = "asc" | "desc"
type ViewType = "rounds" | "all" | "cards" | "calendar"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface MatchFilters {
  team: string
  round: string
  result: string
  league: string[]
  status: MatchStatus
  dateRange: DateRange
}

const MatchScore = memo(
  ({
    homeScore,
    awayScore,
    isHalfTime,
  }: {
    homeScore: number
    awayScore: number
    isHalfTime?: boolean
  }) => {
    const scoreClass = useMemo(() => {
      if (isHalfTime) return "text-gray-400"
      if (homeScore > awayScore) return "text-emerald-400"
      if (homeScore < awayScore) return "text-red-400"
      return "text-amber-400"
    }, [homeScore, awayScore, isHalfTime])

    return (
      <span className={`font-mono font-bold ${scoreClass}`}>
        {homeScore} - {awayScore}
      </span>
    )
  },
)

MatchScore.displayName = "MatchScore"

const MatchStatusBadge = memo(({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Live":
        return "bg-red-500/20 text-red-400 border-red-500/20 animate-pulse"
      case "Upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20"
      case "Completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/20"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "Live":
        return <Zap className="w-3 h-3 mr-1" />
      case "Upcoming":
        return <Clock className="w-3 h-3 mr-1" />
      case "Completed":
        return <Check className="w-3 h-3 mr-1" />
      default:
        return <Info className="w-3 h-3 mr-1" />
    }
  }

  return (
    <Badge variant="outline" className={`text-xs flex items-center ${getStatusStyles()}`}>
      {getStatusIcon()}
      {status}
    </Badge>
  )
})

MatchStatusBadge.displayName = "MatchStatusBadge"

const MatchCard = memo(({ match, onClick }: { match: Match; onClick: () => void }) => {
  const homeWin = match.home_score > match.away_score
  const awayWin = match.home_score < match.away_score
  const draw = match.home_score === match.away_score

  // Determine match status based on date and scores
  const matchDate = safeParseDate(match.date)
  const now = new Date()
  const isLive = matchDate <= now && matchDate >= new Date(now.getTime() - 2 * 60 * 60 * 1000) // Within last 2 hours
  const isCompleted = matchDate < now && !isLive
  const isUpcoming = matchDate > now

  const status = isLive ? "Live" : isCompleted ? "Completed" : "Upcoming"

  // For live matches, calculate the current minute
  const matchMinute = isLive ? Math.min(90, Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60))) : null

  return (
    <div
      className="bg-black/30 rounded-lg border border-white/5 p-4 hover:bg-black/40 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400">{format(matchDate, "PPP")}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
            {match.league || "League"}
          </Badge>
          <MatchStatusBadge status={status} />
        </div>
      </div>

      <div className="flex items-center justify-between my-3">
        <div className={`text-right flex-1 text-white ${homeWin ? "font-bold" : ""}`}>{match.home_team}</div>

        <div className="mx-4 px-4 py-2 bg-black/30 rounded-lg flex flex-col items-center">
          {isLive && <div className="text-xs text-red-400 font-semibold animate-pulse mb-1">{matchMinute}'</div>}
          <div className="text-lg font-bold">
            <MatchScore homeScore={match.home_score} awayScore={match.away_score} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            HT: <MatchScore homeScore={match.ht_home_score} awayScore={match.ht_away_score} isHalfTime />
          </div>
        </div>

        <div className={`text-left flex-1 text-white ${awayWin ? "font-bold" : ""}`}>{match.away_team}</div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-gray-500">{homeWin ? "Home Win" : awayWin ? "Away Win" : "Draw"}</div>
        <div className="text-xs text-gray-500">Total Goals: {match.home_score + match.away_score}</div>
      </div>
    </div>
  )
})

MatchCard.displayName = "MatchCard"

const DateRangePicker = memo(
  ({
    value,
    onChange,
  }: {
    value: DateRange
    onChange: (range: DateRange) => void
  }) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const handleSelect = (date: Date | undefined) => {
      const range =
        !value.from || (value.from && value.to)
          ? { from: date, to: undefined }
          : { from: value.from, to: date && date > value.from ? date : value.from }

      onChange(range)

      if (range.from && range.to) {
        setIsCalendarOpen(false)
      }
    }

    const clearDateRange = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange({ from: undefined, to: undefined })
    }

    return (
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="bg-black/30 border-white/10 text-white hover:bg-black/40 justify-start text-left font-normal w-full"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
                  <X className="ml-2 h-4 w-4 hover:text-red-400" onClick={clearDateRange} />
                </>
              ) : (
                <>
                  {format(value.from, "LLL dd, y")}
                  <X className="ml-2 h-4 w-4 hover:text-red-400" onClick={clearDateRange} />
                </>
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#0a0f14] border-white/10" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={value.from}
            selected={{
              from: value.from,
              to: value.to,
            }}
            onSelect={(range) => handleSelect(range?.from || range?.to)}
            numberOfMonths={2}
            className="bg-[#0a0f14] text-white"
          />
        </PopoverContent>
      </Popover>
    )
  },
)

DateRangePicker.displayName = "DateRangePicker"

const MatchFiltersPanel = memo(
  ({
    filters,
    onFilterChange,
    availableLeagues,
    availableTeams,
    onReset,
  }: {
    filters: MatchFilters
    onFilterChange: (key: string, value: any) => void
    availableLeagues: string[]
    availableTeams: string[]
    onReset: () => void
  }) => {
    return (
      <div className="space-y-4 bg-black/30 p-4 rounded-lg border border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <ListFilter className="w-4 h-4 mr-2 text-blue-400" />
            Filter Matches
          </h3>
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs text-gray-400 hover:text-white">
            Reset All
          </Button>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Date Range</Label>
            <DateRangePicker value={filters.dateRange} onChange={(range) => onFilterChange("dateRange", range)} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Match Status</Label>
            <div className="flex flex-wrap gap-2">
              {(["All", "Upcoming", "Live", "Completed"] as MatchStatus[]).map((status) => (
                <Badge
                  key={status}
                  variant="outline"
                  className={`cursor-pointer ${
                    filters.status === status
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/20"
                      : "bg-black/20 text-gray-400 border-white/10 hover:bg-black/30"
                  }`}
                  onClick={() => onFilterChange("status", status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Leagues</Label>
            <ScrollArea className="h-24 rounded-md border border-white/10 bg-black/20 p-2">
              <div className="space-y-2">
                {availableLeagues.map((league) => (
                  <div key={league} className="flex items-center space-x-2">
                    <Checkbox
                      id={`league-${league}`}
                      checked={filters.league.includes(league)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFilterChange("league", [...filters.league, league])
                        } else {
                          onFilterChange(
                            "league",
                            filters.league.filter((l) => l !== league),
                          )
                        }
                      }}
                      className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor={`league-${league}`} className="text-sm text-white cursor-pointer">
                      {league}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Team</Label>
            <Select value={filters.team} onValueChange={(value) => onFilterChange("team", value)}>
              <SelectTrigger className="bg-black/30 border-white/10 text-white">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f14] border-white/10 text-white">
                <SelectItem value="all">All Teams</SelectItem>
                {availableTeams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Round</Label>
            <Input
              placeholder="Filter by round..."
              value={filters.round}
              onChange={(e) => onFilterChange("round", e.target.value)}
              className="bg-black/30 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Result</Label>
            <Select value={filters.result} onValueChange={(value) => onFilterChange("result", value)}>
              <SelectTrigger className="bg-black/30 border-white/10 text-white">
                <SelectValue placeholder="Match result" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f14] border-white/10 text-white">
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="home">Home Wins</SelectItem>
                <SelectItem value="away">Away Wins</SelectItem>
                <SelectItem value="draw">Draws</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  },
)

MatchFiltersPanel.displayName = "MatchFiltersPanel"

// Helper function to determine match status
const getMatchStatus = (match: Match): MatchStatus => {
  const matchDate = safeParseDate(match.date)
  const now = new Date()

  // Consider a match "Live" if it's happening now (within a 2-hour window)
  const isLive = matchDate <= now && matchDate >= new Date(now.getTime() - 2 * 60 * 60 * 1000)

  // A match is completed if it's in the past and not live
  const isCompleted = matchDate < now && !isLive

  // A match is upcoming if it's in the future
  const isUpcoming = matchDate > now

  if (isLive) return "Live"
  if (isCompleted) return "Completed"
  return "Upcoming"
}

// Helper function to check if a match is within a date range
const isMatchInDateRange = (match: Match, dateRange: DateRange): boolean => {
  if (!dateRange.from) return true

  const matchDate = safeParseDate(match.date)

  if (dateRange.from && !dateRange.to) {
    // If only "from" date is specified, match date should be on or after it
    return matchDate >= dateRange.from
  }

  if (dateRange.from && dateRange.to) {
    // If both dates are specified, match date should be within the range
    return isWithinInterval(matchDate, { start: dateRange.from, end: dateRange.to })
  }

  return true
}

// Live match timer component
const LiveMatchTimer = memo(({ startTime }: { startTime: Date }) => {
  const [currentMinute, setCurrentMinute] = useState(0)

  useEffect(() => {
    const calculateMinute = () => {
      const now = new Date()
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
      return Math.min(90, elapsedMinutes) // Cap at 90 minutes
    }

    setCurrentMinute(calculateMinute())

    const timer = setInterval(() => {
      setCurrentMinute(calculateMinute())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [startTime])

  return <div className="text-red-400 font-semibold animate-pulse">{currentMinute}'</div>
})

LiveMatchTimer.displayName = "LiveMatchTimer"

// Calendar view for matches
const MatchCalendarView = memo(
  ({
    matches,
    onMatchClick,
  }: {
    matches: Match[]
    onMatchClick: (match: Match) => void
  }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Group matches by date
    const matchesByDate = useMemo(() => {
      const grouped: Record<string, Match[]> = {}

      matches.forEach((match) => {
        try {
          const matchDate = safeParseDate(match.date)
          const dateKey = format(matchDate, "yyyy-MM-dd")
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push(match)
        } catch (error) {
          console.warn(`Error processing match date: ${match.date}`, error)
        }
      })

      return grouped
    }, [matches])

    const renderMatchCell = (date: Date | undefined) => {
      if (!date) return null

      const dateKey = format(date, "yyyy-MM-dd")
      const dayMatches = matchesByDate[dateKey] || []

      if (dayMatches.length === 0) return null

      return (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-500/10 rounded-b-sm p-1">
          <div className="text-xs text-blue-400 font-medium text-center">
            {dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"}
          </div>
        </div>
      )
    }

    const handleDateClick = (date: Date | undefined) => {
      if (!date) return

      const dateKey = format(date, "yyyy-MM-dd")
      const dayMatches = matchesByDate[dateKey] || []

      if (dayMatches.length > 0) {
        // If there's only one match, open it directly
        if (dayMatches.length === 1) {
          onMatchClick(dayMatches[0])
        } else {
          // TODO: Show a popover with all matches for that day
          // For now, just open the first match
          onMatchClick(dayMatches[0])
        }
      }
    }

    return (
      <div className="bg-black/30 rounded-lg border border-white/5 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Match Calendar</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="h-8 w-8 bg-black/20 border-white/10 text-white hover:bg-black/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-white font-medium">{format(currentMonth, "MMMM yyyy")}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="h-8 w-8 bg-black/20 border-white/10 text-white hover:bg-black/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CalendarComponent
          mode="single"
          month={currentMonth}
          onDayClick={handleDateClick}
          components={{
            DayContent: (props) => {
              // Check if props and props.day exist before accessing properties
              if (!props || !props.day) {
                return <div>-</div>
              }
              return (
                <div className="relative h-full w-full">
                  <div>{props.day.day}</div>
                  {renderMatchCell(props.day.date)}
                </div>
              )
            },
          }}
          className="bg-transparent text-white"
          classNames={{
            day_today: "bg-blue-500/20 text-blue-400 font-bold",
            day_selected: "bg-blue-500 text-white",
            day_outside: "text-gray-600",
          }}
        />
      </div>
    )
  },
)

MatchCalendarView.displayName = "MatchCalendarView"

// Main MatchesTable component
export const MatchesTable = memo(({ matches = [] }: MatchesTableProps) => {
  const [viewType, setViewType] = useState<ViewType>("rounds")
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "date",
    direction: "desc",
  })
  const [filters, setFilters] = useState<MatchFilters>({
    team: "",
    round: "",
    result: "",
    league: [],
    status: "All",
    dateRange: { from: undefined, to: undefined },
  })
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [liveMatches, setLiveMatches] = useState<Match[]>([])
  const liveUpdateInterval = useRef<NodeJS.Timeout | null>(null)

  // Extract available leagues and teams from matches
  const availableLeagues = useMemo(() => {
    const leagues = new Set<string>()
    matches.forEach((match) => {
      if (match.league) leagues.add(match.league)
    })
    return Array.from(leagues).sort()
  }, [matches])

  const availableTeams = useMemo(() => {
    const teams = new Set<string>()
    matches.forEach((match) => {
      teams.add(match.home_team)
      teams.add(match.away_team)
    })
    return Array.from(teams).sort()
  }, [matches])

  // Filter matches based on all criteria
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // Team filter
      const teamMatch = filters.team
        ? match.home_team.toLowerCase().includes(filters.team.toLowerCase()) ||
          match.away_team.toLowerCase().includes(filters.team.toLowerCase())
        : true

      // Round filter
      const roundMatch = filters.round ? match.round === filters.round || match.round?.includes(filters.round) : true

      // Result filter
      let resultMatch = true
      if (filters.result === "home") {
        resultMatch = match.home_score > match.away_score
      } else if (filters.result === "away") {
        resultMatch = match.home_score < match.away_score
      } else if (filters.result === "draw") {
        resultMatch = match.home_score === match.away_score
      }

      // League filter
      const leagueMatch = filters.league.length > 0 ? filters.league.includes(match.league || "") : true

      // Status filter
      const matchStatus = getMatchStatus(match)
      const statusMatch = filters.status === "All" || matchStatus === filters.status

      // Date range filter
      const dateMatch = isMatchInDateRange(match, filters.dateRange)

      return teamMatch && roundMatch && resultMatch && leagueMatch && statusMatch && dateMatch
    })
  }, [matches, filters])

  // Sort filtered matches
  const sortedMatches = useMemo(() => {
    if (!sortConfig) return filteredMatches

    return [...filteredMatches].sort((a, b) => {
      if (sortConfig.key === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }

      if (sortConfig.key === "round") {
        const roundA = Number.parseInt(a.round || "0")
        const roundB = Number.parseInt(b.round || "0")
        return sortConfig.direction === "asc" ? roundA - roundB : roundB - roundA
      }

      if (sortConfig.key === "league") {
        const leagueA = a.league || ""
        const leagueB = b.league || ""
        return sortConfig.direction === "asc" ? leagueA.localeCompare(leagueB) : leagueB.localeCompare(leagueA)
      }

      if (sortConfig.key === "team") {
        const teamA = a.home_team
        const teamB = b.home_team
        return sortConfig.direction === "asc" ? teamA.localeCompare(teamB) : teamB.localeCompare(teamA)
      }

      if (sortConfig.key === "goals") {
        const goalsA = a.home_score + a.away_score
        const goalsB = b.home_score + b.away_score
        return sortConfig.direction === "asc" ? goalsA - goalsB : goalsB - goalsA
      }

      if (sortConfig.key === "status") {
        const statusOrder = { Live: 0, Upcoming: 1, Completed: 2 }
        const statusA = getMatchStatus(a)
        const statusB = getMatchStatus(b)
        return sortConfig.direction === "asc"
          ? statusOrder[statusA] - statusOrder[statusB]
          : statusOrder[statusB] - statusOrder[statusA]
      }

      return 0
    })
  }, [filteredMatches, sortConfig])

  // Group matches by round
  const matchesByRound = useMemo(() => {
    return sortedMatches.reduce(
      (acc, match) => {
        const round = match.round || "Unknown"
        if (!acc[round]) {
          acc[round] = []
        }
        acc[round].push(match)
        return acc
      },
      {} as Record<string, Match[]>,
    )
  }, [sortedMatches])

  // Handle sorting
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      team: "",
      round: "",
      result: "",
      league: [],
      status: "All",
      dateRange: { from: undefined, to: undefined },
    })
  }

  // Handle match selection
  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
  }

  // Simulate real-time updates for live matches
  useEffect(() => {
    // Find matches that are currently live
    const currentLiveMatches = matches.filter((match) => getMatchStatus(match) === "Live")
    setLiveMatches(currentLiveMatches)

    // Set up interval to update live match scores
    if (currentLiveMatches.length > 0 && !liveUpdateInterval.current) {
      liveUpdateInterval.current = setInterval(() => {
        // In a real app, this would fetch updates from an API
        // For demo purposes, we'll just simulate random score changes
        setLiveMatches((prev) =>
          prev.map((match) => {
            // 10% chance of a goal being scored
            if (Math.random() < 0.1) {
              // 50% chance for home team, 50% for away team
              if (Math.random() < 0.5) {
                return { ...match, home_score: match.home_score + 1 }
              } else {
                return { ...match, away_score: match.away_score + 1 }
              }
            }
            return match
          }),
        )
      }, 30000) // Check for updates every 30 seconds
    }

    return () => {
      if (liveUpdateInterval.current) {
        clearInterval(liveUpdateInterval.current)
        liveUpdateInterval.current = null
      }
    }
  }, [matches])

  // Update the main matches array with live match updates
  useEffect(() => {
    if (liveMatches.length > 0) {
      // In a real app, this would update the central state or context
      // For demo purposes, we'll just log the updates
      console.log("Live match updates:", liveMatches)
    }
  }, [liveMatches])

  if (matches.length === 0) {
    return (
      <Card className="bg-black/20 border-white/5">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-gray-500" />
            <p className="text-gray-400">No matches available for this league yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/20 border-white/5">
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-white">Match Schedule</CardTitle>
            {liveMatches.length > 0 && (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/20 animate-pulse">
                {liveMatches.length} Live
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className={`bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2 ${isFilterPanelOpen ? "bg-blue-500/20 text-blue-400" : ""}`}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {Object.values(filters).some((v) =>
                Array.isArray(v) ? v.length > 0 : v !== "" && v !== "All" && v !== undefined,
              ) && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white">
                  {
                    Object.values(filters).filter((v) =>
                      Array.isArray(v) ? v.length > 0 : v !== "" && v !== "All" && v !== undefined,
                    ).length
                  }
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0f14] border-white/10 text-white">
                <DropdownMenuItem
                  onClick={() => requestSort("date")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Date {getSortIcon("date")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("round")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Round {getSortIcon("round")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("league")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  League {getSortIcon("league")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("team")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Team {getSortIcon("team")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("goals")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Total Goals {getSortIcon("goals")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => requestSort("status")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Status {getSortIcon("status")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tabs value={viewType} onValueChange={(value) => setViewType(value as ViewType)} className="w-auto">
              <TabsList className="bg-black/30 border border-white/10">
                <TabsTrigger value="rounds" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  By Round
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  All Matches
                </TabsTrigger>
                <TabsTrigger value="cards" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Cards
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isFilterPanelOpen && (
            <div className="md:col-span-1">
              <MatchFiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                availableLeagues={availableLeagues}
                availableTeams={availableTeams}
                onReset={resetFilters}
              />
            </div>
          )}

          <div className={isFilterPanelOpen ? "md:col-span-3" : "md:col-span-4"}>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full bg-white/5" />
                <Skeleton className="h-64 w-full bg-white/5" />
              </div>
            ) : viewType === "calendar" ? (
              <MatchCalendarView matches={sortedMatches} onMatchClick={handleMatchClick} />
            ) : viewType === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {sortedMatches.map((match, index) => (
                  <MatchCard
                    key={`${match.home_team}-${match.away_team}-${index}`}
                    match={match}
                    onClick={() => handleMatchClick(match)}
                  />
                ))}
                {sortedMatches.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No matches found with the current filters.
                  </div>
                )}
              </div>
            ) : viewType === "rounds" ? (
              <div className="space-y-6">
                {Object.entries(matchesByRound).map(([round, roundMatches]) => (
                  <div key={round} className="bg-black/30 rounded-xl overflow-hidden border border-white/5">
                    <div className="flex items-center gap-2 p-3 bg-black/40">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        {round}
                      </span>
                      <h4 className="text-base font-medium text-white">Round {round}</h4>
                      <span className="text-xs text-gray-400 ml-auto">{roundMatches.length} matches</span>
                    </div>
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow className="border-b border-white/5 hover:bg-transparent">
                          <TableHead className="text-gray-400 font-normal">Date</TableHead>
                          <TableHead className="text-gray-400 font-normal">League</TableHead>
                          <TableHead className="text-gray-400 font-normal">Home Team</TableHead>
                          <TableHead className="text-gray-400 font-normal">Away Team</TableHead>
                          <TableHead className="text-gray-400 font-normal text-center">HT</TableHead>
                          <TableHead className="text-gray-400 font-normal text-center">FT</TableHead>
                          <TableHead className="text-gray-400 font-normal text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roundMatches.map((match, index) => {
                          const matchStatus = getMatchStatus(match)
                          const isLive = matchStatus === "Live"
                          const matchDate = safeParseDate(match.date)

                          return (
                            <TableRow
                              key={`${match.home_team}-${match.away_team}-${index}`}
                              className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                              onClick={() => handleMatchClick(match)}
                            >
                              <TableCell>{format(matchDate, "PPP")}</TableCell>
                              <TableCell>{match.league || "—"}</TableCell>
                              <TableCell
                                className={`font-medium text-white ${match.home_score > match.away_score ? "font-bold" : ""}`}
                              >
                                {match.home_team}
                              </TableCell>
                              <TableCell
                                className={`font-medium text-white ${match.home_score < match.away_score ? "font-bold" : ""}`}
                              >
                                {match.away_team}
                              </TableCell>
                              <TableCell className="text-center">
                                <MatchScore
                                  homeScore={match.ht_home_score}
                                  awayScore={match.ht_away_score}
                                  isHalfTime
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                {isLive ? (
                                  <div className="flex flex-col items-center">
                                    <LiveMatchTimer startTime={matchDate} />
                                    <MatchScore homeScore={match.home_score} awayScore={match.away_score} />
                                  </div>
                                ) : (
                                  <MatchScore homeScore={match.home_score} awayScore={match.away_score} />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <MatchStatusBadge status={matchStatus} />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ))}
                {Object.keys(matchesByRound).length === 0 && (
                  <div className="text-center py-8 text-white opacity-70">
                    No matches found with the current filters.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/30 rounded-xl overflow-hidden border border-white/5">
                <Table>
                  <TableHeader className="bg-black/40">
                    <TableRow className="border-b border-white/5 hover:bg-transparent">
                      <TableHead className="text-gray-400 font-normal">
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("round")}
                          className="text-gray-400 font-normal p-0 hover:text-white flex items-center"
                        >
                          Round {getSortIcon("round")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-400 font-normal">
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("date")}
                          className="text-gray-400 font-normal p-0 hover:text-white flex items-center"
                        >
                          Date {getSortIcon("date")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-400 font-normal">
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("league")}
                          className="text-gray-400 font-normal p-0 hover:text-white flex items-center"
                        >
                          League {getSortIcon("league")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-400 font-normal">Home Team</TableHead>
                      <TableHead className="text-gray-400 font-normal">Away Team</TableHead>
                      <TableHead className="text-gray-400 font-normal text-center">HT</TableHead>
                      <TableHead className="text-gray-400 font-normal text-center">FT</TableHead>
                      <TableHead className="text-gray-400 font-normal text-center">
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("goals")}
                          className="text-gray-400 font-normal p-0 hover:text-white flex items-center justify-center"
                        >
                          Goals {getSortIcon("goals")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-gray-400 font-normal text-center">
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("status")}
                          className="text-gray-400 font-normal p-0 hover:text-white flex items-center justify-center"
                        >
                          Status {getSortIcon("status")}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMatches.map((match, index) => {
                      const matchStatus = getMatchStatus(match)
                      const isLive = matchStatus === "Live"
                      const matchDate = safeParseDate(match.date)

                      return (
                        <TableRow
                          key={`${match.home_team}-${match.away_team}-${index}`}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                          onClick={() => handleMatchClick(match)}
                        >
                          <TableCell>{match.round}</TableCell>
                          <TableCell>{format(matchDate, "PPP")}</TableCell>
                          <TableCell>{match.league || "—"}</TableCell>
                          <TableCell
                            className={`font-medium text-white ${match.home_score > match.away_score ? "font-bold" : ""}`}
                          >
                            {match.home_team}
                          </TableCell>
                          <TableCell
                            className={`font-medium text-white ${match.home_score < match.away_score ? "font-bold" : ""}`}
                          >
                            {match.away_team}
                          </TableCell>
                          <TableCell className="text-center">
                            <MatchScore homeScore={match.ht_home_score} awayScore={match.ht_away_score} isHalfTime />
                          </TableCell>
                          <TableCell className="text-center">
                            {isLive ? (
                              <div className="flex flex-col items-center">
                                <LiveMatchTimer startTime={matchDate} />
                                <MatchScore homeScore={match.home_score} awayScore={match.away_score} />
                              </div>
                            ) : (
                              <MatchScore homeScore={match.home_score} awayScore={match.away_score} />
                            )}
                          </TableCell>
                          <TableCell className="text-center text-gray-400">
                            {match.home_score + match.away_score}
                          </TableCell>
                          <TableCell className="text-center">
                            <MatchStatusBadge status={matchStatus} />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {sortedMatches.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="h-32 text-center text-gray-400">
                          No matches found with the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Match Details Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="bg-[#0a0f14] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMatch && <MatchDetailsView match={selectedMatch} />}
        </DialogContent>
      </Dialog>
    </Card>
  )
})

MatchesTable.displayName = "MatchesTable"


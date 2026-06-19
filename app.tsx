"use client"

import type React from "react"
import { useState, useMemo, useCallback, memo } from "react"
import { z } from "zod"
import {
  Trophy,
  BarChart3,
  ChevronDown,
  Settings,
  Bell,
  Search,
  Plus,
  Eye,
  Edit2,
  CheckCircle,
  Trash2,
  Clock,
  Award,
  Activity,
  ArrowRight,
  Info,
  TrendingDown,
  TrendingUp,
  Medal,
  Shield,
  ArrowUpDown,
  ChevronUp,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// CSV Components
import { CSVUpload } from "./components/CSVUpload"
import type { CSVRow } from "./types/csv.types"

// Form handling
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Types and Schemas
const matchSchema = z.object({
  home_team: z.string(),
  away_team: z.string(),
  full_time_home_goals: z.number().int().min(0),
  full_time_away_goals: z.number().int().min(0),
})

export type Match = {
  match_time: string
  home_team: string
  away_team: string
  half_time_home_goals: number
  half_time_away_goals: number
  full_time_home_goals: number
  full_time_away_goals: number
  round?: string
  league?: string
  venue?: string
  referee?: string
  attendance?: number
  weather?: string
}

export interface LeagueData {
  id: string
  name: string
  season: string
  winner: string
  secondPlace: string
  thirdPlace: string
  status: "In Progress" | "Completed"
}

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
  form: Array<"W" | "D" | "L">
  previousPosition?: number
}

export interface TeamForm {
  position: number
  team: string
  played: number
  goalsFor: number
  goalsAgainst: number
  points: number
  form: Array<"W" | "D" | "L">
}

// Constants
const MAX_FORM_ENTRIES = 5

// Utility Functions
const safeParseDate = (dateString: string): Date => {
  try {
    const date = new Date(dateString)
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

const safeToNumber = (value: unknown): number => {
  if (typeof value === "number" && !isNaN(value)) return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim())
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

const generateStableKey = (prefix: string, index: number, content: string): string => {
  const hash = content.split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff
  }, 0)
  return `${prefix}-${index}-${Math.abs(hash)}`
}

// Convert CSV data to Match format
const convertCSVToMatch = (csvRow: CSVRow): Match => ({
  match_time: csvRow.match_time,
  home_team: csvRow.home_team,
  away_team: csvRow.away_team,
  half_time_home_goals: csvRow.half_time_home_goals,
  half_time_away_goals: csvRow.half_time_away_goals,
  full_time_home_goals: csvRow.full_time_home_goals,
  full_time_away_goals: csvRow.full_time_away_goals,
})

// League Statistics Calculator
interface TeamStats extends Omit<StandingsEntry, "position" | "previousPosition"> {}

const createInitialTeamStats = (team: string): TeamStats => ({
  team,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  form: [],
})

class LeagueStatsCalculator {
  private teamStats: Map<string, TeamStats>

  constructor(private matches: Match[]) {
    this.teamStats = new Map()
    this.processMatches()
  }

  private ensureTeamExists(team: string): void {
    if (!this.teamStats.has(team)) {
      this.teamStats.set(team, createInitialTeamStats(team))
    }
  }

  private updateTeamStats(team: string, goalsFor: number, goalsAgainst: number, result: "W" | "D" | "L"): void {
    const stats = this.teamStats.get(team)!
    stats.played++
    stats.goalsFor += goalsFor
    stats.goalsAgainst += goalsAgainst
    stats.goalDifference = stats.goalsFor - stats.goalsAgainst

    switch (result) {
      case "W":
        stats.won++
        stats.points += 3
        break
      case "D":
        stats.drawn++
        stats.points++
        break
      case "L":
        stats.lost++
        break
    }

    stats.form.push(result)
    if (stats.form.length > MAX_FORM_ENTRIES) {
      stats.form = stats.form.slice(-MAX_FORM_ENTRIES)
    }
  }

  private processMatches(): void {
    for (const match of this.matches) {
      try {
        const { home_team, away_team, full_time_home_goals, full_time_away_goals } = match
        this.ensureTeamExists(home_team)
        this.ensureTeamExists(away_team)

        if (full_time_home_goals > full_time_away_goals) {
          this.updateTeamStats(home_team, full_time_home_goals, full_time_away_goals, "W")
          this.updateTeamStats(away_team, full_time_away_goals, full_time_home_goals, "L")
        } else if (full_time_home_goals < full_time_away_goals) {
          this.updateTeamStats(home_team, full_time_home_goals, full_time_away_goals, "L")
          this.updateTeamStats(away_team, full_time_away_goals, full_time_home_goals, "W")
        } else {
          this.updateTeamStats(home_team, full_time_home_goals, full_time_away_goals, "D")
          this.updateTeamStats(away_team, full_time_away_goals, full_time_home_goals, "D")
        }
      } catch (error) {
        console.error("Invalid match data:", error)
        continue
      }
    }
  }

  private sortTeams<T extends { points: number; goalDifference: number; goalsFor: number; team: string }>(
    teams: T[],
  ): T[] {
    return teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.team.localeCompare(b.team)
    })
  }

  public getStandings(): StandingsEntry[] {
    if (this.teamStats.size === 0) return []

    const previousStandings = new Map(
      Array.from(this.teamStats.entries()).map(([team, stats], index) => [team, { ...stats, position: index + 1 }]),
    )

    const currentStandings = this.sortTeams(Array.from(this.teamStats.values())).map((stats, index) => ({
      ...stats,
      position: index + 1,
      previousPosition: previousStandings.get(stats.team)?.position,
    }))

    return currentStandings
  }

  public getTeamForms(): TeamForm[] {
    if (this.teamStats.size === 0) return []

    return this.sortTeams(
      Array.from(this.teamStats.values()).map((stats) => ({
        position: 0,
        team: stats.team,
        played: stats.played,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        points: stats.points,
        form: [...stats.form],
      })),
    ).map((form, index) => ({
      ...form,
      position: index + 1,
    }))
  }
}

const calculateStandings = (matches: Match[]): StandingsEntry[] => {
  const calculator = new LeagueStatsCalculator(matches)
  return calculator.getStandings()
}

const calculateTeamForms = (matches: Match[]): TeamForm[] => {
  const calculator = new LeagueStatsCalculator(matches)
  return calculator.getTeamForms()
}

// Components

// Header Component
const Logo = memo(() => (
  <div className="flex items-center gap-3 group">
    <Trophy
      size={28}
      className="text-blue-500 transition-transform duration-300 group-hover:scale-110"
      aria-hidden="true"
    />
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-white">Soccer Championship Analysis</h1>
      <p className="text-xs text-gray-400 hidden md:block">Professional Soccer Statistics & Analysis</p>
    </div>
  </div>
))

Logo.displayName = "Logo"

const SeasonIndicator = memo(({ season }: { season: string }) => (
  <div className="flex items-center gap-3">
    <Button
      variant="outline"
      className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
    >
      <BarChart3 size={16} className="text-blue-500" aria-hidden="true" />
      <span className="font-medium">Season {season}</span>
      <ChevronDown size={14} className="text-gray-400" aria-hidden="true" />
    </Button>
  </div>
))

SeasonIndicator.displayName = "SeasonIndicator"

const Header = memo(
  ({ currentSeason = "2023-2024", className = "" }: { currentSeason?: string; className?: string }) => {
    return (
      <header
        className={`
        bg-[#0a0f14]/90 backdrop-blur-md border-b border-white/5 
        text-white shadow-lg sticky top-0 z-50 
        transition-all duration-300 ease-in-out
        ${className}
      `}
      >
        <nav className="container mx-auto px-4 md:px-6 py-4" role="navigation" aria-label="Main navigation">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo />
            <div className="flex items-center gap-3">
              <SeasonIndicator season={currentSeason} />
              <Button variant="outline" size="icon" className="w-9 h-9 bg-white/5 border-white/10 hover:bg-white/10">
                <Bell className="h-4 w-4 text-gray-300" />
              </Button>
              <Button variant="outline" size="icon" className="w-9 h-9 bg-white/5 border-white/10 hover:bg-white/10">
                <Settings className="h-4 w-4 text-gray-300" />
              </Button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
)

Header.displayName = "Header"

// League Table Components
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

const LeagueTable = memo(
  ({
    leagues,
    onLeagueAction,
    onSearch,
    onNewLeague,
  }: {
    leagues: LeagueData[]
    onLeagueAction: (leagueId: string, action: "view" | "edit" | "complete" | "delete") => void
    onSearch: (term: string) => void
    onNewLeague: () => void
  }) => {
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
  },
)

LeagueTable.displayName = "LeagueTable"

// New League Modal
const formSchema = z.object({
  leagueId: z
    .string()
    .min(3, "League ID must be at least 3 characters")
    .max(50, "League ID must be less than 50 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "League ID can only contain letters, numbers, hyphens, and underscores")
    .trim(),
})

type FormValues = z.infer<typeof formSchema>

const NewLeagueModal = ({
  isOpen,
  onClose,
  onCreateLeague,
}: {
  isOpen: boolean
  onClose: () => void
  onCreateLeague: (leagueId: string) => Promise<void>
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leagueId: "",
    },
  })

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setIsSubmitting(true)
        await onCreateLeague(values.leagueId)
        form.reset()
        onClose()
      } catch (error) {
        form.setError("leagueId", {
          type: "manual",
          message: error instanceof Error ? error.message : "Failed to create league",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [onCreateLeague, onClose, form],
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0a0f14] border border-white/5 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Create New League</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the ID for the new league. The name will be automatically generated.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leagueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">League ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter league ID..."
                      disabled={isSubmitting}
                      className="font-mono bg-black/30 border-white/10 text-white focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4" />
                Create League
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Standings Table Component
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

const StandingsTable = ({ standings = [], className }: { standings: StandingsEntry[]; className?: string }) => {
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
              <Card key={entry.team} className="bg-black/30 border-white/5 overflow-hidden">
                <div className="relative">
                  <Progress
                    value={maxPoints > 0 ? (entry.points / maxPoints) * 100 : 0}
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
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${entry.played > 0 ? (entry.won / entry.played) * 100 : 0}%` }}
                      ></div>
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${entry.played > 0 ? (entry.drawn / entry.played) * 100 : 0}%` }}
                      ></div>
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${entry.played > 0 ? (entry.lost / entry.played) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// League Details Component
const LeagueDetails = ({
  league,
  matches,
  onBack,
  onUpdateLeague,
  onUpdateMatches,
}: {
  league: LeagueData
  matches: Match[]
  onBack: () => void
  onUpdateLeague: (league: LeagueData) => void
  onUpdateMatches: (matches: Match[]) => void
}) => {
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const standings = useMemo(() => calculateStandings(matches), [matches])
  const teamForms = useMemo(() => calculateTeamForms(matches), [matches])

  const handleDataImported = useCallback(
    (csvData: CSVRow[]) => {
      const newMatches: Match[] = csvData.map(convertCSVToMatch)
      onUpdateMatches([...matches, ...newMatches])

      toast({
        title: "Data Imported Successfully",
        description: `Successfully imported ${newMatches.length} matches.`,
      })
    },
    [matches, onUpdateMatches, toast],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Leagues
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{league.name}</h1>
          <p className="text-gray-400">{league.season}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 bg-black/20 w-full rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  League Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Season</p>
                  <p className="text-white font-medium">{league.season}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <StatusBadge status={league.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Matches</p>
                  <p className="text-white font-medium">{matches.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Teams</p>
                  <p className="text-white font-medium">{standings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Goals</p>
                  <p className="text-white font-medium">
                    {matches.reduce((sum, match) => sum + match.full_time_home_goals + match.full_time_away_goals, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg Goals/Match</p>
                  <p className="text-white font-medium">
                    {matches.length > 0
                      ? (
                          matches.reduce(
                            (sum, match) => sum + match.full_time_home_goals + match.full_time_away_goals,
                            0,
                          ) / matches.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Current Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {standings.slice(0, 3).map((team, index) => (
                  <div key={team.team} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-yellow-500 text-black",
                        index === 1 && "bg-gray-400 text-black",
                        index === 2 && "bg-amber-600 text-white",
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{team.team}</p>
                      <p className="text-xs text-gray-400">{team.points} pts</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {standings.length > 0 && <StandingsTable standings={standings.slice(0, 10)} />}
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Matches</CardTitle>
              <CardDescription>Latest match results</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No matches available. Import CSV data to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches
                    .slice(-10)
                    .reverse()
                    .map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-white font-medium">{match.home_team}</p>
                            <p className="text-xs text-gray-400">Home</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">
                              {match.full_time_home_goals} - {match.full_time_away_goals}
                            </p>
                            <p className="text-xs text-gray-400">
                              HT: {match.half_time_home_goals} - {match.half_time_away_goals}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{match.away_team}</p>
                            <p className="text-xs text-gray-400">Away</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{match.match_time}</p>
                          {match.round && <p className="text-xs text-gray-500">Round {match.round}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings" className="space-y-6">
          <StandingsTable standings={standings} />
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <CSVUpload onDataImported={handleDataImported} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Main App Component
export default function App() {
  const { toast } = useToast()
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)
  const [leaguesList, setLeaguesList] = useState<LeagueData[]>([
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
  ])
  const [matches, setMatches] = useState<Match[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewLeagueModalOpen, setIsNewLeagueModalOpen] = useState(false)

  const filteredLeagues = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    return leaguesList.filter((league) =>
      Object.values(league).some((value) => value?.toString().toLowerCase().includes(searchLower)),
    )
  }, [leaguesList, searchTerm])

  const currentStandings = useMemo(() => {
    return calculateStandings(matches)
  }, [matches])

  const selectedLeague = useMemo(
    () => (selectedLeagueId ? leaguesList.find((league) => league.id === selectedLeagueId) : null),
    [selectedLeagueId, leaguesList],
  )

  const handleLeagueAction = useCallback(
    (leagueId: string, action: "view" | "edit" | "complete" | "delete") => {
      switch (action) {
        case "view":
        case "edit":
          setSelectedLeagueId(leagueId)
          break
        case "complete":
          setLeaguesList((prev) =>
            prev.map((league) =>
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
          )
          toast({
            title: "League Completed",
            description: "The league has been marked as completed.",
          })
          break
        case "delete":
          setLeaguesList((prev) => prev.filter((league) => league.id !== leagueId))
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
    async (leagueId: string) => {
      const newLeague: LeagueData = {
        id: leagueId,
        name: `League ${leagueId}`,
        season: `2023-2024`,
        winner: "-",
        secondPlace: "-",
        thirdPlace: "-",
        status: "In Progress",
      }
      setLeaguesList((prev) => [...prev, newLeague])
      setIsNewLeagueModalOpen(false)
      toast({
        title: "League Created",
        description: `New league "${leagueId}" has been created successfully.`,
      })
    },
    [toast],
  )

  const handleUpdateLeague = useCallback(
    (updatedLeague: LeagueData) => {
      setLeaguesList((prev) => prev.map((league) => (league.id === updatedLeague.id ? updatedLeague : league)))
      toast({
        title: "League Updated",
        description: "The league details have been updated successfully.",
      })
    },
    [toast],
  )

  const handleUpdateMatches = useCallback((updatedMatches: Match[]) => {
    setMatches(updatedMatches)
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
                matches={matches}
                onBack={() => setSelectedLeagueId(null)}
                onUpdateLeague={handleUpdateLeague}
                onUpdateMatches={handleUpdateMatches}
              />
            ) : (
              <LeagueTable
                leagues={filteredLeagues}
                onLeagueAction={handleLeagueAction}
                onSearch={setSearchTerm}
                onNewLeague={() => setIsNewLeagueModalOpen(true)}
              />
            )}

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </main>

      <NewLeagueModal
        isOpen={isNewLeagueModalOpen}
        onClose={() => setIsNewLeagueModalOpen(false)}
        onCreateLeague={handleCreateLeague}
      />
    </div>
  )
}

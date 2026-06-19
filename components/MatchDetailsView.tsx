"use client"

import { memo, useState, useMemo } from "react"
import { format } from "date-fns"
import {
  Trophy,
  Clock,
  Calendar,
  Award,
  Activity,
  AlertTriangle,
  Check,
  X,
  ArrowRight,
  Repeat,
  Zap,
  Info,
  Layers,
} from "lucide-react"
import type { Match } from "../types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for match details
interface MatchEvent {
  id: string
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var" | "penalty_missed" | "own_goal"
  minute: number
  team: "home" | "away"
  player: string
  assistBy?: string
  playerOut?: string
  description?: string
}

interface PlayerStats {
  id: string
  name: string
  number: number
  position: string
  isStarter: boolean
  minutesPlayed: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  rating: number
}

interface TeamLineup {
  formation: string
  coach: string
  players: PlayerStats[]
}

interface MatchStats {
  possession: [number, number]
  shots: [number, number]
  shotsOnTarget: [number, number]
  corners: [number, number]
  fouls: [number, number]
  yellowCards: [number, number]
  redCards: [number, number]
  offsides: [number, number]
}

// Add the safeParseDate helper function at the top of the file
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

// Generate mock data based on the match
const generateMockEvents = (match: Match): MatchEvent[] => {
  const events: MatchEvent[] = []
  const homeGoals = match.home_score
  const awayGoals = match.away_score
  const homeTeam = match.home_team
  const awayTeam = match.away_team

  // Generate player names based on team names
  const generatePlayerName = (team: string, num: number) => {
    const firstNames = ["John", "Alex", "David", "James", "Robert", "Michael", "William", "Thomas", "Daniel", "Matthew"]
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Miller",
      "Davis",
      "Garcia",
      "Rodriguez",
      "Wilson",
    ]

    // Use team name first letter and a random last name
    return `${firstNames[num % firstNames.length]} ${lastNames[(num + team.length) % lastNames.length]}`
  }

  // Add home goals
  for (let i = 0; i < homeGoals; i++) {
    const minute = Math.floor(Math.random() * 90) + 1
    const isOwnGoal = Math.random() < 0.1 // 10% chance of own goal
    const isPenalty = !isOwnGoal && Math.random() < 0.2 // 20% chance of penalty

    if (isOwnGoal) {
      events.push({
        id: `home-own-goal-${i}`,
        type: "own_goal",
        minute,
        team: "away", // Own goal is scored by the away team for the home team
        player: generatePlayerName(awayTeam, i + 10),
        description: `Own goal by ${awayTeam} player`,
      })
    } else {
      events.push({
        id: `home-goal-${i}`,
        type: "goal",
        minute,
        team: "home",
        player: generatePlayerName(homeTeam, i),
        assistBy: Math.random() < 0.7 ? generatePlayerName(homeTeam, i + 5) : undefined, // 70% chance of assist
        description: isPenalty ? "Penalty goal" : undefined,
      })
    }
  }

  // Add away goals
  for (let i = 0; i < awayGoals; i++) {
    const minute = Math.floor(Math.random() * 90) + 1
    const isOwnGoal = Math.random() < 0.1 // 10% chance of own goal
    const isPenalty = !isOwnGoal && Math.random() < 0.2 // 20% chance of penalty

    if (isOwnGoal) {
      events.push({
        id: `away-own-goal-${i}`,
        type: "own_goal",
        minute,
        team: "home", // Own goal is scored by the home team for the away team
        player: generatePlayerName(homeTeam, i + 10),
        description: `Own goal by ${homeTeam} player`,
      })
    } else {
      events.push({
        id: `away-goal-${i}`,
        type: "goal",
        minute,
        team: "away",
        player: generatePlayerName(awayTeam, i),
        assistBy: Math.random() < 0.7 ? generatePlayerName(awayTeam, i + 5) : undefined, // 70% chance of assist
        description: isPenalty ? "Penalty goal" : undefined,
      })
    }
  }

  // Add yellow cards (2-5 per team)
  const homeYellowCards = Math.floor(Math.random() * 4) + 2
  const awayYellowCards = Math.floor(Math.random() * 4) + 2

  for (let i = 0; i < homeYellowCards; i++) {
    events.push({
      id: `home-yellow-${i}`,
      type: "yellow_card",
      minute: Math.floor(Math.random() * 90) + 1,
      team: "home",
      player: generatePlayerName(homeTeam, i + 15),
    })
  }

  for (let i = 0; i < awayYellowCards; i++) {
    events.push({
      id: `away-yellow-${i}`,
      type: "yellow_card",
      minute: Math.floor(Math.random() * 90) + 1,
      team: "away",
      player: generatePlayerName(awayTeam, i + 15),
    })
  }

  // Add red cards (0-1 per team)
  if (Math.random() < 0.3) {
    // 30% chance of home red card
    events.push({
      id: `home-red-0`,
      type: "red_card",
      minute: Math.floor(Math.random() * 90) + 1,
      team: "home",
      player: generatePlayerName(homeTeam, 20),
    })
  }

  if (Math.random() < 0.3) {
    // 30% chance of away red card
    events.push({
      id: `away-red-0`,
      type: "red_card",
      minute: Math.floor(Math.random() * 90) + 1,
      team: "away",
      player: generatePlayerName(awayTeam, 20),
    })
  }

  // Add substitutions (3-5 per team)
  const homeSubstitutions = Math.floor(Math.random() * 3) + 3
  const awaySubstitutions = Math.floor(Math.random() * 3) + 3

  for (let i = 0; i < homeSubstitutions; i++) {
    events.push({
      id: `home-sub-${i}`,
      type: "substitution",
      minute: Math.min(90, 45 + Math.floor(Math.random() * 45)), // Substitutions usually in second half
      team: "home",
      player: generatePlayerName(homeTeam, i + 25), // Player in
      playerOut: generatePlayerName(homeTeam, i + 30), // Player out
    })
  }

  for (let i = 0; i < awaySubstitutions; i++) {
    events.push({
      id: `away-sub-${i}`,
      type: "substitution",
      minute: Math.min(90, 45 + Math.floor(Math.random() * 45)), // Substitutions usually in second half
      team: "away",
      player: generatePlayerName(awayTeam, i + 25), // Player in
      playerOut: generatePlayerName(awayTeam, i + 30), // Player out
    })
  }

  // Add VAR decisions (0-2 per match)
  const varDecisions = Math.floor(Math.random() * 3)
  for (let i = 0; i < varDecisions; i++) {
    const team = Math.random() < 0.5 ? "home" : "away"
    events.push({
      id: `var-${i}`,
      type: "var",
      minute: Math.floor(Math.random() * 90) + 1,
      team,
      player: generatePlayerName(team === "home" ? homeTeam : awayTeam, i + 35),
      description: Math.random() < 0.5 ? "Goal disallowed for offside" : "Penalty decision overturned",
    })
  }

  // Sort events by minute
  return events.sort((a, b) => a.minute - b.minute)
}

const generateMockLineups = (match: Match): { home: TeamLineup; away: TeamLineup } => {
  const generateTeamLineup = (team: string): TeamLineup => {
    const formations = ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2"]
    const formation = formations[Math.floor(Math.random() * formations.length)]

    const positions = {
      "4-4-2": ["GK", "RB", "CB", "CB", "LB", "RM", "CM", "CM", "LM", "ST", "ST"],
      "4-3-3": ["GK", "RB", "CB", "CB", "LB", "CDM", "CM", "CM", "RW", "ST", "LW"],
      "3-5-2": ["GK", "CB", "CB", "CB", "RWB", "CM", "CDM", "CM", "LWB", "ST", "ST"],
      "4-2-3-1": ["GK", "RB", "CB", "CB", "LB", "CDM", "CDM", "RAM", "CAM", "LAM", "ST"],
      "5-3-2": ["GK", "RWB", "CB", "CB", "CB", "LWB", "CM", "CM", "CM", "ST", "ST"],
    }

    const playerPositions = positions[formation as keyof typeof positions] || positions["4-4-2"]

    // Generate player names based on team name
    const generatePlayerName = (num: number) => {
      const firstNames = [
        "John",
        "Alex",
        "David",
        "James",
        "Robert",
        "Michael",
        "William",
        "Thomas",
        "Daniel",
        "Matthew",
      ]
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Miller",
        "Davis",
        "Garcia",
        "Rodriguez",
        "Wilson",
      ]

      // Use team name first letter and a random last name
      return `${firstNames[num % firstNames.length]} ${lastNames[(num + team.length) % lastNames.length]}`
    }

    const players: PlayerStats[] = []

    // Generate 11 starters
    for (let i = 0; i < 11; i++) {
      players.push({
        id: `${team}-player-${i}`,
        name: generatePlayerName(i),
        number: i + 1,
        position: playerPositions[i],
        isStarter: true,
        minutesPlayed: Math.floor(Math.random() * 30) + 60, // 60-90 minutes
        goals: Math.random() < 0.2 ? 1 : 0, // 20% chance of scoring
        assists: Math.random() < 0.15 ? 1 : 0, // 15% chance of assist
        yellowCards: Math.random() < 0.1 ? 1 : 0, // 10% chance of yellow card
        redCards: Math.random() < 0.02 ? 1 : 0, // 2% chance of red card
        rating: Math.floor(Math.random() * 3) + 6, // 6-8 rating
      })
    }

    // Generate 7 substitutes
    for (let i = 0; i < 7; i++) {
      const minutesPlayed = Math.random() < 0.6 ? Math.floor(Math.random() * 30) : 0 // 60% chance of playing

      players.push({
        id: `${team}-sub-${i}`,
        name: generatePlayerName(i + 11),
        number: i + 12,
        position: playerPositions[i % 11], // Reuse positions
        isStarter: false,
        minutesPlayed,
        goals: minutesPlayed > 0 && Math.random() < 0.1 ? 1 : 0, // 10% chance of scoring if played
        assists: minutesPlayed > 0 && Math.random() < 0.08 ? 1 : 0, // 8% chance of assist if played
        yellowCards: minutesPlayed > 0 && Math.random() < 0.05 ? 1 : 0, // 5% chance of yellow card if played
        redCards: 0, // No red cards for subs
        rating: minutesPlayed > 0 ? Math.floor(Math.random() * 3) + 6 : 0, // 6-8 rating if played
      })
    }

    return {
      formation,
      coach: `Coach ${team.split(" ")[0]}`, // Use first word of team name as coach name
      players,
    }
  }

  return {
    home: generateTeamLineup(match.home_team),
    away: generateTeamLineup(match.away_team),
  }
}

const generateMockStats = (match: Match): MatchStats => {
  // Generate possession stats that add up to 100
  const homePossession = Math.floor(Math.random() * 40) + 30 // 30-70%
  const awayPossession = 100 - homePossession

  // Generate other stats based on score and possession
  const homeShots = Math.floor(match.home_score * (1.5 + Math.random())) + Math.floor(homePossession / 10)
  const awayShots = Math.floor(match.away_score * (1.5 + Math.random())) + Math.floor(awayPossession / 10)

  const homeShotsOnTarget = Math.min(homeShots, match.home_score + Math.floor(Math.random() * 5))
  const awayShotsOnTarget = Math.min(awayShots, match.away_score + Math.floor(Math.random() * 5))

  return {
    possession: [homePossession, awayPossession],
    shots: [homeShots, awayShots],
    shotsOnTarget: [homeShotsOnTarget, awayShotsOnTarget],
    corners: [Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2],
    fouls: [Math.floor(Math.random() * 10) + 5, Math.floor(Math.random() * 10) + 5],
    yellowCards: [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)],
    redCards: [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)],
    offsides: [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)],
  }
}

// Event icon component
const EventIcon = memo(({ type }: { type: MatchEvent["type"] }) => {
  switch (type) {
    case "goal":
      return <Trophy className="h-4 w-4 text-emerald-400" />
    case "yellow_card":
      return <AlertTriangle className="h-4 w-4 text-amber-400" />
    case "red_card":
      return <AlertTriangle className="h-4 w-4 text-red-400" />
    case "substitution":
      return <Repeat className="h-4 w-4 text-blue-400" />
    case "var":
      return <Activity className="h-4 w-4 text-purple-400" />
    case "penalty_missed":
      return <X className="h-4 w-4 text-red-400" />
    case "own_goal":
      return <Trophy className="h-4 w-4 text-red-400" />
    default:
      return <Info className="h-4 w-4 text-gray-400" />
  }
})

EventIcon.displayName = "EventIcon"

// Match timeline component
const MatchTimeline = memo(
  ({
    events,
    homeTeam,
    awayTeam,
  }: {
    events: MatchEvent[]
    homeTeam: string
    awayTeam: string
  }) => {
    return (
      <div className="space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className={`flex items-center py-2 px-3 rounded-md ${
              event.team === "home" ? "justify-start" : "justify-end flex-row-reverse"
            } hover:bg-white/5`}
          >
            <div className={`flex items-center gap-2 ${event.team === "away" && "flex-row-reverse text-right"}`}>
              <div className="bg-black/30 rounded-full p-1.5">
                <EventIcon type={event.type} />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-medium">{event.player}</span>
                  {event.type === "goal" && event.assistBy && (
                    <span className="text-xs text-gray-400">(assist: {event.assistBy})</span>
                  )}
                  {event.type === "substitution" && event.playerOut && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      {event.playerOut}
                    </span>
                  )}
                </div>
                {event.description && <p className="text-xs text-gray-400">{event.description}</p>}
              </div>
            </div>

            <div className={`flex-1 flex ${event.team === "home" ? "justify-end" : "justify-start"}`}>
              <Badge
                variant="outline"
                className={`
                text-xs px-1.5 
                ${
                  event.team === "home"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }
              `}
              >
                {event.minute}'
              </Badge>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-400">No events recorded for this match.</div>
        )}
      </div>
    )
  },
)

MatchTimeline.displayName = "MatchTimeline"

// Team lineup component
const TeamLineup = memo(
  ({
    lineup,
    teamName,
  }: {
    lineup: TeamLineup
    teamName: string
  }) => {
    // Group players by position
    const positionGroups = useMemo(() => {
      const groups: Record<string, PlayerStats[]> = {
        Goalkeepers: [],
        Defenders: [],
        Midfielders: [],
        Forwards: [],
      }

      lineup.players.forEach((player) => {
        if (player.position === "GK") {
          groups["Goalkeepers"].push(player)
        } else if (["CB", "RB", "LB", "RWB", "LWB"].includes(player.position)) {
          groups["Defenders"].push(player)
        } else if (["CM", "CDM", "CAM", "RM", "LM", "RAM", "LAM"].includes(player.position)) {
          groups["Midfielders"].push(player)
        } else {
          groups["Forwards"].push(player)
        }
      })

      return groups
    }, [lineup])

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{teamName}</h3>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {lineup.formation}
          </Badge>
        </div>

        <div className="text-sm text-gray-400">Coach: {lineup.coach}</div>

        <Separator className="bg-white/10" />

        <div className="space-y-6">
          {Object.entries(positionGroups).map(([groupName, players]) => (
            <div key={groupName} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">{groupName}</h4>

              <div className="space-y-1">
                {players
                  .sort((a, b) => (a.isStarter === b.isStarter ? 0 : a.isStarter ? -1 : 1))
                  .map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        player.isStarter ? "bg-black/20" : "bg-transparent"
                      } hover:bg-black/30`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-xs font-medium text-white">
                          {player.number}
                        </div>
                        <div>
                          <div className="text-white font-medium">{player.name}</div>
                          <div className="text-xs text-gray-500">{player.position}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {player.goals > 0 && (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs">
                            <Trophy className="h-3 w-3" />
                            {player.goals}
                          </div>
                        )}

                        {player.assists > 0 && (
                          <div className="flex items-center gap-1 text-blue-400 text-xs">
                            <Award className="h-3 w-3" />
                            {player.assists}
                          </div>
                        )}

                        {player.yellowCards > 0 && (
                          <div className="flex items-center gap-1 text-amber-400 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {player.yellowCards}
                          </div>
                        )}

                        {player.redCards > 0 && (
                          <div className="flex items-center gap-1 text-red-400 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {player.redCards}
                          </div>
                        )}

                        {player.rating > 0 && (
                          <Badge
                            className={`
                        ${
                          player.rating >= 8
                            ? "bg-emerald-500/20 text-emerald-400"
                            : player.rating >= 7
                              ? "bg-blue-500/20 text-blue-400"
                              : player.rating >= 6
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                        }
                      `}
                          >
                            {player.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
)

TeamLineup.displayName = "TeamLineup"

// Match stats component
const MatchStats = memo(
  ({
    stats,
    homeTeam,
    awayTeam,
  }: {
    stats: MatchStats
    homeTeam: string
    awayTeam: string
  }) => {
    const StatRow = ({
      label,
      values,
      colorize = false,
    }: {
      label: string
      values: [number, number]
      colorize?: boolean
    }) => {
      const total = values[0] + values[1]
      const homePercent = total > 0 ? (values[0] / total) * 100 : 50
      const awayPercent = total > 0 ? (values[1] / total) * 100 : 50

      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className={colorize && values[0] > values[1] ? "text-emerald-400 font-medium" : "text-white"}>
              {values[0]}
            </span>
            <span className="text-gray-400">{label}</span>
            <span className={colorize && values[1] > values[0] ? "text-emerald-400 font-medium" : "text-white"}>
              {values[1]}
            </span>
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/30">
            <div className="bg-blue-500 h-full" style={{ width: `${homePercent}%` }} />
            <div className="bg-red-500 h-full" style={{ width: `${awayPercent}%` }} />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-white">{homeTeam}</div>
          <div className="text-lg font-semibold text-white">{awayTeam}</div>
        </div>

        <div className="space-y-4">
          <StatRow label="Possession %" values={stats.possession} />
          <StatRow label="Shots" values={stats.shots} colorize />
          <StatRow label="Shots on Target" values={stats.shotsOnTarget} colorize />
          <StatRow label="Corners" values={stats.corners} />
          <StatRow label="Fouls" values={stats.fouls} />
          <StatRow label="Yellow Cards" values={stats.yellowCards} />
          <StatRow label="Red Cards" values={stats.redCards} />
          <StatRow label="Offsides" values={stats.offsides} />
        </div>
      </div>
    )
  },
)

MatchStats.displayName = "MatchStats"

// Update the MatchDetailsView component to use safeParseDate
export const MatchDetailsView = memo(({ match }: { match: Match }) => {
  const [activeTab, setActiveTab] = useState("timeline")

  // Generate mock data
  const events = useMemo(() => generateMockEvents(match), [match])
  const lineups = useMemo(() => generateMockLineups(match), [match])
  const stats = useMemo(() => generateMockStats(match), [match])

  // Determine match status
  const matchDate = safeParseDate(match.date)
  const now = new Date()
  const isLive = matchDate <= now && matchDate >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const isCompleted = matchDate < now && !isLive
  const isUpcoming = matchDate > now

  const status = isLive ? "Live" : isCompleted ? "Completed" : "Upcoming"

  // For live matches, calculate the current minute
  const matchMinute = isLive ? Math.min(90, Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60))) : null

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-white">Match Details</DialogTitle>
          <Badge
            variant="outline"
            className={`
              ${
                status === "Live"
                  ? "bg-red-500/20 text-red-400 border-red-500/20 animate-pulse"
                  : status === "Upcoming"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/20"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
              }
            `}
          >
            {status === "Live" && <Zap className="w-3 h-3 mr-1" />}
            {status === "Upcoming" && <Clock className="w-3 h-3 mr-1" />}
            {status === "Completed" && <Check className="w-3 h-3 mr-1" />}
            {status}
            {isLive && matchMinute && ` - ${matchMinute}'`}
          </Badge>
        </div>
        <DialogDescription className="text-gray-400">
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            <span>{format(matchDate, "PPP p")}</span>

            {match.league && (
              <>
                <span className="text-gray-600">•</span>
                <Trophy className="h-4 w-4" />
                <span>{match.league}</span>
              </>
            )}

            {match.round && (
              <>
                <span className="text-gray-600">•</span>
                <Layers className="h-4 w-4" />
                <span>Round {match.round}</span>
              </>
            )}
          </div>
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6">
        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 bg-blue-500/20 text-blue-400">
                  <AvatarFallback>{match.home_team.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-2 text-lg font-bold text-white">{match.home_team}</h3>
              </div>

              <div className="flex flex-col items-center">
                {isLive && <div className="text-sm text-red-400 font-semibold animate-pulse mb-1">{matchMinute}'</div>}
                <div className="text-4xl font-bold text-white">
                  {match.home_score} - {match.away_score}
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  HT: {match.ht_home_score} - {match.ht_away_score}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 bg-red-500/20 text-red-400">
                  <AvatarFallback>{match.away_team.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-2 text-lg font-bold text-white">{match.away_team}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-black/20 w-full rounded-xl">
            <TabsTrigger
              value="timeline"
              className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="lineups"
              className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
            >
              Lineups
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-black/20"
            >
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <Card className="bg-black/30 border-white/10">
              <CardContent className="p-4">
                <ScrollArea className="h-[400px] pr-4">
                  <MatchTimeline events={events} homeTeam={match.home_team} awayTeam={match.away_team} />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineups" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/30 border-white/10">
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <TeamLineup lineup={lineups.home} teamName={match.home_team} />
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10">
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <TeamLineup lineup={lineups.away} teamName={match.away_team} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card className="bg-black/30 border-white/10">
              <CardContent className="p-6">
                <MatchStats stats={stats} homeTeam={match.home_team} awayTeam={match.away_team} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
})

MatchDetailsView.displayName = "MatchDetailsView"

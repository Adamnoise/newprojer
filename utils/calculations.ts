import { z } from "zod"

export const matchSchema = z.object({
  home_team: z.string(),
  away_team: z.string(),
  home_score: z.number().int().min(0),
  away_score: z.number().int().min(0),
})

export type Match = z.infer<typeof matchSchema>

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

const MAX_FORM_ENTRIES = 5

export class LeagueStatsCalculator {
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
        matchSchema.parse(match)

        const { home_team, away_team, home_score, away_score } = match
        this.ensureTeamExists(home_team)
        this.ensureTeamExists(away_team)

        if (home_score > away_score) {
          this.updateTeamStats(home_team, home_score, away_score, "W")
          this.updateTeamStats(away_team, away_score, home_score, "L")
        } else if (home_score < away_score) {
          this.updateTeamStats(home_team, home_score, away_score, "L")
          this.updateTeamStats(away_team, away_score, home_score, "W")
        } else {
          this.updateTeamStats(home_team, home_score, away_score, "D")
          this.updateTeamStats(away_team, away_score, home_score, "D")
        }
      } catch (error) {
        console.error("Invalid match data:", error)
        continue
      }
    }
  }

  private sortTeams<T extends { points: number; goalDifference: number; goalsFor: number }>(teams: T[]): T[] {
    return teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.team.localeCompare(b.team) // Alphabetical as final tiebreaker
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
        position: 0, // Will be set after sorting
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

export function calculateStandings(matches: Match[]): StandingsEntry[] {
  const calculator = new LeagueStatsCalculator(matches)
  return calculator.getStandings()
}

export function calculateTeamForms(matches: Match[]): TeamForm[] {
  const calculator = new LeagueStatsCalculator(matches)
  return calculator.getTeamForms()
}


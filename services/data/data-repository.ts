import type { LeagueData, Match } from "../../types"

/**
 * DataRepository defines the interface for data access operations
 * related to leagues and matches.
 * This abstraction allows for different implementations (e.g., in-memory, database, API).
 */
export interface DataRepository {
  getLeagues(): Promise<LeagueData[]>
  getLeagueById(id: string): Promise<LeagueData | null>
  createLeague(league: LeagueData): Promise<LeagueData>
  updateLeague(league: LeagueData): Promise<LeagueData>
  deleteLeague(id: string): Promise<boolean>

  getMatches(leagueId: string): Promise<Match[]>
  updateMatches(leagueId: string, matches: Match[]): Promise<Match[]>
}

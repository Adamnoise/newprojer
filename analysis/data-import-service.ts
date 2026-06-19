import Papa from "papaparse"
import type { Match } from "../types"
import type { DataSource } from "./types"
import type { CSVMatchRow } from "../types/csv.types"

export class DataImportService {
  /**
   * Imports data from a CSV file based on the specific format.
   * @param file The CSV file to import.
   * @returns A promise that resolves with an array of Match objects.
   */
  public async importFromCsv(file: File): Promise<Match[]> {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVMatchRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const matches: Match[] = results.data
              .filter(
                (row) =>
                  row.match_time &&
                  row.home_team &&
                  row.away_team &&
                  row.half_time_home_goals !== undefined &&
                  row.half_time_away_goals !== undefined &&
                  row.full_time_home_goals !== undefined &&
                  row.full_time_away_goals !== undefined,
              )
              .map((row) => ({
                date: `2024-01-01T${row.match_time}:00Z`, // Placeholder date, combine with time
                home_team: row.home_team,
                away_team: row.away_team,
                ht_home_score: Number(row.half_time_home_goals),
                ht_away_score: Number(row.half_time_away_goals),
                home_score: Number(row.full_time_home_goals),
                away_score: Number(row.full_time_away_goals),
                round: undefined, // Not in the provided CSV example
                league: undefined, // Not in the provided CSV example, will be set by context
                venue: undefined,
                referee: undefined,
                attendance: undefined,
                weather: undefined,
              }))

            resolve(matches)
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  }

  /**
   * Imports data from a database (placeholder).
   */
  public async importFromDatabase(config: Record<string, any>): Promise<Match[]> {
    console.warn("Database import not fully implemented. Returning mock data.")
    // In a real implementation, this would connect to a database and fetch data
    return Promise.resolve([])
  }

  /**
   * Imports data from an API (placeholder).
   */
  public async importFromApi(config: Record<string, any>): Promise<Match[]> {
    console.warn("API import not fully implemented. Returning mock data.")
    try {
      // Example: Fetch from a mock API endpoint
      const response = await fetch(config.url || "/api/mock-matches", {
        method: config.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
          ...(config.headers || {}),
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Transform API data to Match format (example transformation)
      const matches: Match[] = data.map((item: any) => ({
        date: item.date || new Date().toISOString(),
        home_team: item.homeTeam,
        away_team: item.awayTeam,
        ht_home_score: item.halfTimeHomeScore,
        ht_away_score: item.halfTimeAwayScore,
        home_score: item.fullTimeHomeScore,
        away_score: item.fullTimeAwayScore,
        round: item.round,
        league: item.league,
        venue: item.venue,
        referee: item.referee,
        attendance: item.attendance,
        weather: item.weather,
      }))

      return matches
    } catch (error) {
      console.error("API import error:", error)
      throw error
    }
  }

  /**
   * Imports data from a data source based on its type.
   * @param dataSource The data source configuration.
   * @param file Optional: File object for CSV type.
   * @returns A promise that resolves with an array of Match objects.
   */
  public async importFromDataSource(dataSource: DataSource, file?: File): Promise<Match[]> {
    switch (dataSource.type) {
      case "csv":
        if (file) {
          return this.importFromCsv(file)
        }
        throw new Error("CSV file not provided for CSV data source type.")

      case "database":
        return this.importFromDatabase(dataSource.config)

      case "api":
        return this.importFromApi(dataSource.config)

      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`)
    }
  }
}

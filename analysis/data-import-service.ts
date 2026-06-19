import Papa from "papaparse"
import type { Match } from "../types"
import type { DataSource } from "./types"

export class DataImportService {
  /**
   * Imports data from a CSV file
   */
  public async importFromCsv(file: File): Promise<Match[]> {
    return new Promise((resolve, reject) => {
      Papa.parse<any>(file, {
        header: true,
        complete: (results) => {
          try {
            const matches = results.data
              .filter(
                (row) =>
                  row.date &&
                  row.home_team &&
                  row.away_team &&
                  row.ht_home_score !== undefined &&
                  row.ht_away_score !== undefined &&
                  row.home_score !== undefined &&
                  row.away_score !== undefined,
              )
              .map((row) => ({
                date: row.date,
                home_team: row.home_team,
                away_team: row.away_team,
                ht_home_score: Number(row.ht_home_score),
                ht_away_score: Number(row.ht_away_score),
                home_score: Number(row.home_score),
                away_score: Number(row.away_score),
                round: row.round || undefined,
                league: row.league || undefined,
                venue: row.venue || undefined,
                referee: row.referee || undefined,
                attendance: row.attendance ? Number(row.attendance) : undefined,
                weather: row.weather || undefined,
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
   * Imports data from a database
   */
  public async importFromDatabase(config: Record<string, any>): Promise<Match[]> {
    // This is a placeholder for database connection logic
    // In a real implementation, this would connect to a database and fetch data

    // Mock implementation
    return Promise.resolve([])
  }

  /**
   * Imports data from an API
   */
  public async importFromApi(config: Record<string, any>): Promise<Match[]> {
    try {
      const response = await fetch(config.url, {
        method: config.method || "GET",
        headers: config.headers || {},
        body: config.body ? JSON.stringify(config.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Transform API data to Match format
      // This would need to be customized based on the API response structure
      const matches: Match[] = data.map((item: any) => ({
        date: item.date,
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
   * Imports data from a data source
   */
  public async importFromDataSource(dataSource: DataSource): Promise<Match[]> {
    switch (dataSource.type) {
      case "csv":
        // This would need to be adjusted based on how the CSV file is provided
        if (dataSource.config.file) {
          return this.importFromCsv(dataSource.config.file)
        }
        throw new Error("CSV file not provided")

      case "database":
        return this.importFromDatabase(dataSource.config)

      case "api":
        return this.importFromApi(dataSource.config)

      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`)
    }
  }
}


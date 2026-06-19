import Papa from "papaparse"
import type { CSVMatchRow, CSVParseResult, CSVError, CSVValidationResult } from "../types/csv.types"
import type { Match } from "../types"
import { REQUIRED_CSV_HEADERS } from "../constants/csv.constants"

/**
 * Parses a CSV file using PapaParse.
 * @param file The CSV file to parse.
 * @returns A promise that resolves with the parsed data and any errors.
 */
export async function parseCSV<T>(file: File): Promise<CSVParseResult<T>> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // We'll handle type conversion manually for better control
      complete: (results: Papa.ParseResult<T>) => {
        resolve({
          data: results.data,
          errors: results.errors.map((err) => ({
            type: err.type,
            code: err.code,
            message: err.message,
            row: err.row !== undefined ? err.row + 1 : -1, // PapaParse rows are 0-indexed, convert to 1-indexed
          })),
          meta: results.meta,
        })
      },
      error: (error: Papa.ParseError) => {
        reject({
          type: error.type,
          code: error.code,
          message: error.message,
          row: error.row !== undefined ? error.row + 1 : -1,
        })
      },
    })
  })
}

/**
 * Validates parsed CSV data against expected headers and data types.
 * @param parsedData The data parsed from the CSV.
 * @param originalErrors Errors reported by PapaParse.
 * @returns A validation result object.
 */
export function validateCSVData(parsedData: any[], originalErrors: CSVError[]): CSVValidationResult {
  const errors: CSVError[] = [...originalErrors]
  const warnings: CSVError[] = []
  const processedData: Match[] = []

  if (!parsedData || parsedData.length === 0) {
    errors.push({
      type: "Validation",
      code: "EMPTY_FILE",
      message: "The CSV file is empty or contains no valid data rows.",
      row: -1,
    })
    return { isValid: false, errors, warnings, parsedData: [] }
  }

  // Check for required headers
  const actualHeaders = Object.keys(parsedData[0] || {})
  const missingHeaders = REQUIRED_CSV_HEADERS.filter((header) => !actualHeaders.includes(header))

  if (missingHeaders.length > 0) {
    errors.push({
      type: "Validation",
      code: "MISSING_HEADERS",
      message: `Missing required CSV headers: ${missingHeaders.join(", ")}. Please ensure your CSV file has all the necessary columns.`,
      row: -1,
    })
    return { isValid: false, errors, warnings, parsedData: [] }
  }

  parsedData.forEach((row: CSVMatchRow, index: number) => {
    const rowNum = index + 1 // 1-indexed row number for display
    const rowErrors: string[] = []

    // Validate and convert numeric fields
    const htHomeScore = Number.parseInt(row.half_time_home_goals)
    const htAwayScore = Number.parseInt(row.half_time_away_goals)
    const ftHomeScore = Number.parseInt(row.full_time_home_goals)
    const ftAwayScore = Number.parseInt(row.full_time_away_goals)

    if (isNaN(htHomeScore) || htHomeScore < 0) rowErrors.push("half_time_home_goals must be a non-negative number.")
    if (isNaN(htAwayScore) || htAwayScore < 0) rowErrors.push("half_time_away_goals must be a non-negative number.")
    if (isNaN(ftHomeScore) || ftHomeScore < 0) rowErrors.push("full_time_home_goals must be a non-negative number.")
    if (isNaN(ftAwayScore) || ftAwayScore < 0) rowErrors.push("full_time_away_goals must be a non-negative number.")

    // Validate string fields are not empty
    if (!row.match_time || row.match_time.trim() === "") rowErrors.push("match_time cannot be empty.")
    if (!row.home_team || row.home_team.trim() === "") rowErrors.push("home_team cannot be empty.")
    if (!row.away_team || row.away_team.trim() === "") rowErrors.push("away_team cannot be empty.")

    if (rowErrors.length > 0) {
      errors.push({
        type: "Validation",
        code: "INVALID_ROW_DATA",
        message: `Row ${rowNum}: ${rowErrors.join(" ")}`,
        row: rowNum,
      })
    } else {
      // Map CSVMatchRow to Match interface
      processedData.push({
        date: `2024-01-01T${row.match_time}:00Z`, // Placeholder date, combine with time
        home_team: row.home_team,
        away_team: row.away_team,
        ht_home_score: htHomeScore,
        ht_away_score: htAwayScore,
        home_score: ftHomeScore,
        away_score: ftAwayScore,
        round: undefined, // CSV example doesn't have round, so it's optional
        league: undefined, // League will be set by the context of the import
        venue: undefined,
        referee: undefined,
        attendance: undefined,
        weather: undefined,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    parsedData: processedData,
  }
}

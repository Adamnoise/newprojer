"use client"

import { useState, useCallback } from "react"
import { parseCSV, validateCSVData } from "../utils/csv.utils"
import type { CSVParseResult, CSVValidationResult } from "../types/csv.types"
import type { Match } from "../types"

export interface UseCSVPreviewResult {
  isLoading: boolean
  parsedData: Match[] | null
  validationResult: CSVValidationResult | null
  fileName: string | null
  parseFile: (file: File) => Promise<void>
  resetPreview: () => void
}

export function useCSVPreview(): UseCSVPreviewResult {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<Match[] | null>(null)
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setFileName(file.name)
    setParsedData(null)
    setValidationResult(null)

    try {
      const parseResults: CSVParseResult<any> = await parseCSV(file)
      const validation = validateCSVData(parseResults.data, parseResults.errors)

      setValidationResult(validation)
      if (validation.isValid) {
        setParsedData(validation.parsedData as Match[])
      } else {
        setParsedData(null) // Clear data if validation fails
      }
    } catch (error: any) {
      console.error("Error during CSV parsing:", error)
      setValidationResult({
        isValid: false,
        errors: [
          {
            type: "Parsing",
            code: "PARSE_ERROR",
            message: error.message || "An unknown error occurred during CSV parsing.",
            row: -1,
          },
        ],
        warnings: [],
        parsedData: [],
      })
      setParsedData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPreview = useCallback(() => {
    setIsLoading(false)
    setParsedData(null)
    setValidationResult(null)
    setFileName(null)
  }, [])

  return {
    isLoading,
    parsedData,
    validationResult,
    fileName,
    parseFile,
    resetPreview,
  }
}

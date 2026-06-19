import type React from "react"
/**
 * Comprehensive TypeScript definitions for CSV processing
 * Provides strict typing for all CSV-related operations
 */

/** Core CSV row structure for soccer match data */
export interface CSVRow {
  readonly match_time: string
  readonly home_team: string
  readonly away_team: string
  readonly half_time_home_goals: number
  readonly half_time_away_goals: number
  readonly full_time_home_goals: number
  readonly full_time_away_goals: number
}

/** Alternative CSV row structure for soccer match data with string goals */
export interface CSVMatchRow {
  match_time: string
  home_team: string
  away_team: string
  half_time_home_goals: string
  half_time_away_goals: string
  full_time_home_goals: string
  full_time_away_goals: string
}

/** Validation error/warning structure */
export interface ValidationError {
  readonly row: number
  readonly field: keyof CSVRow
  readonly message: string
  readonly severity: "error" | "warning"
}

/** CSV error structure */
export interface CSVError {
  type: string
  code: string
  message: string
  row: number
}

/** Complete validation result with performance metrics */
export interface ValidationResult {
  readonly isValid: boolean
  readonly totalRows: number
  readonly validRows: number
  readonly errors: readonly ValidationError[]
  readonly warnings: readonly ValidationError[]
  readonly processingTime: number
}

/** CSV validation result structure */
export interface CSVValidationResult {
  isValid: boolean
  errors: CSVError[]
  warnings: CSVError[]
  parsedData: any[]
}

/** CSV file processing state */
export interface CSVProcessingState {
  readonly status: "idle" | "parsing" | "validating" | "complete" | "error"
  readonly progress: number
  readonly currentRow: number
}

/** CSV parse result structure */
export interface CSVParseResult<T> {
  data: T[]
  errors: CSVError[]
  meta: any
}

/** CSV preview component props */
export interface CSVPreviewProps {
  readonly data: readonly CSVRow[]
  readonly validation: ValidationResult
  readonly onConfirm: () => Promise<void>
  readonly onCancel: () => void
  readonly isLoading?: boolean
  readonly maxPreviewRows?: number
  readonly className?: string
  readonly "data-testid"?: string
}

/** Custom hook return type */
export interface UseCSVPreviewReturn {
  readonly previewData: readonly CSVRow[]
  readonly isExpanded: boolean
  readonly canExpand: boolean
  readonly toggleExpanded: () => void
  readonly visibleErrors: readonly ValidationError[]
  readonly visibleWarnings: readonly ValidationError[]
  readonly showAllErrors: boolean
  readonly showAllWarnings: boolean
  readonly toggleShowAllErrors: () => void
  readonly toggleShowAllWarnings: () => void
}

/** Hook props interface */
export interface UseCSVPreviewProps {
  readonly data: readonly CSVRow[]
  readonly validation: ValidationResult
  readonly maxPreviewRows?: number
}

/** Error boundary props */
export interface ErrorBoundaryProps {
  readonly children: React.ReactNode
  readonly fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/** Error boundary state */
export interface ErrorBoundaryState {
  readonly hasError: boolean
  readonly error: Error | null
}

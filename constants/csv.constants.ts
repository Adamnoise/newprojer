/**
 * Centralized configuration and styling constants
 * All magic numbers and styling classes in one place
 */

/** Core CSV processing constants */
export const CSV_CONSTANTS = {
  DEFAULT_PREVIEW_ROWS: 10,
  MAX_PREVIEW_ROWS: 50,
  MAX_VISIBLE_ERRORS: 5,
  MAX_VISIBLE_WARNINGS: 3,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  CHUNK_SIZE: 1000,
  REQUIRED_HEADERS: [
    "match_time",
    "home_team",
    "away_team",
    "half_time_home_goals",
    "half_time_away_goals",
    "full_time_home_goals",
    "full_time_away_goals",
  ],
  NUMERIC_FIELDS: ["half_time_home_goals", "half_time_away_goals", "full_time_home_goals", "full_time_away_goals"],
  FILE_TYPES: ["text/csv", "application/vnd.ms-excel"],
} as const

/** CSS class configurations */
export const CSS_CLASSES = {
  VALIDATION_SUMMARY: {
    CONTAINER: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",
    CARD: "rounded-lg border p-4 transition-colors",
    VALID_CARD: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
    ERROR_CARD: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
    WARNING_CARD: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
  },
  DATA_TABLE: {
    CONTAINER: "rounded-lg border overflow-hidden",
    TABLE: "w-full border-collapse",
    HEADER: "bg-muted/50 font-medium text-left p-3 border-b",
    CELL: "p-3 border-b text-sm",
    ROW_EVEN: "bg-background",
    ROW_ODD: "bg-muted/20",
  },
  ERROR_LIST: {
    CONTAINER: "space-y-2 max-h-64 overflow-y-auto",
    ITEM: "flex items-start gap-2 p-3 rounded-md text-sm",
    ERROR_ITEM: "bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800",
    WARNING_ITEM: "bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
  },
  ACTIONS: {
    CONTAINER: "flex flex-col sm:flex-row gap-3 pt-6 border-t",
    BUTTON_PRIMARY: "flex-1 sm:flex-none",
    BUTTON_SECONDARY: "flex-1 sm:flex-none",
  },
} as const

/** Accessibility labels and descriptions */
export const ARIA_LABELS = {
  CSV_PREVIEW: "CSV data preview and validation results",
  VALIDATION_SUMMARY: "Data validation summary statistics",
  DATA_TABLE: "Preview of CSV data rows",
  ERROR_LIST: "List of validation errors",
  WARNING_LIST: "List of validation warnings",
  EXPAND_BUTTON: "Show more data rows",
  COLLAPSE_BUTTON: "Show fewer data rows",
  CONFIRM_BUTTON: "Confirm and import CSV data",
  CANCEL_BUTTON: "Cancel CSV import",
  SHOW_ALL_ERRORS: "Show all validation errors",
  SHOW_ALL_WARNINGS: "Show all validation warnings",
} as const

/** Field display names for user-friendly labels */
export const FIELD_LABELS = {
  match_time: "Match Time",
  home_team: "Home Team",
  away_team: "Away Team",
  half_time_home_goals: "HT Home Goals",
  half_time_away_goals: "HT Away Goals",
  full_time_home_goals: "FT Home Goals",
  full_time_away_goals: "FT Away Goals",
} as const

/** Validation messages */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_NUMBER: "Must be a valid number",
  INVALID_DATE: "Must be a valid date",
  NEGATIVE_GOALS: "Goals cannot be negative",
  EMPTY_TEAM_NAME: "Team name cannot be empty",
  INVALID_TEAM_NAME: "Team name contains invalid characters",
} as const

/** --------------------------------------------------------------------------
 * Additional named exports needed by other modules
 * -------------------------------------------------------------------------- */

/**
 * The list of headers that *must* be present in every uploaded CSV file.
 * Other modules (e.g. `utils/csv.utils.ts`) rely on this constant for
 * header-validation logic.
 */
export const REQUIRED_CSV_HEADERS = CSV_CONSTANTS.REQUIRED_HEADERS

/**
 * Convenience constant: same value as `CSV_CONSTANTS.MAX_FILE_SIZE`
 * but expressed in megabytes for UI messages & validations.
 */
export const MAX_FILE_SIZE_MB = CSV_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024

export interface PatternDefinition {
  id: string
  name: string
  description: string
  conditions: PatternCondition[]
  createdAt: string
  updatedAt: string
}

export interface PatternCondition {
  id: string
  type: "halftime_score" | "fulltime_score" | "score_change" | "team_performance" | "custom"
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "between" | "contains"
  value: any
  target?: "home" | "away" | "both"
  timeFrame?: "first_half" | "second_half" | "full_match"
  customFormula?: string
}

export interface PatternOccurrence {
  patternId: string
  matchId: string
  date: string
  homeTeam: string
  awayTeam: string
  htHomeScore: number
  htAwayScore: number
  ftHomeScore: number
  ftAwayScore: number
  confidence: number
  metadata: Record<string, any>
}

export interface PatternAnalysisResult {
  patternId: string
  patternName: string
  totalMatches: number
  occurrences: number
  frequency: number
  homeTeamFrequency: Record<string, number>
  awayTeamFrequency: Record<string, number>
  matchupFrequency: Record<string, number>
  seasonalTrends: Record<string, number>
  confidenceInterval: [number, number]
  occurrenceDetails: PatternOccurrence[]
}

export interface DataSource {
  id: string
  name: string
  type: "csv" | "database" | "api"
  config: Record<string, any>
  lastSynced?: string
}

export interface AnalysisJob {
  id: string
  dataSourceId: string
  patternIds: string[]
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  startTime?: string
  endTime?: string
  results?: Record<string, PatternAnalysisResult>
  error?: string
}

export interface Alert {
  id: string
  patternId: string
  name: string
  conditions: AlertCondition[]
  actions: AlertAction[]
  isActive: boolean
  lastTriggered?: string
}

export interface AlertCondition {
  type: "frequency" | "confidence" | "occurrence_count"
  operator: "=" | "!=" | ">" | "<" | ">=" | "<="
  value: number
}

export interface AlertAction {
  type: "email" | "notification" | "webhook"
  config: Record<string, any>
}

export interface AnalysisFilter {
  leagues?: string[]
  teams?: string[]
  dateRange?: [string, string]
  seasons?: string[]
  minConfidence?: number
}

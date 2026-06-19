export interface LeagueData {
  id: string
  name: string
  season: string
  winner: string
  secondPlace: string
  thirdPlace: string
  status: "In Progress" | "Completed"
}

export interface Match {
  date: string
  home_team: string
  away_team: string
  ht_home_score: number
  ht_away_score: number
  home_score: number
  away_score: number
  round?: string
  league?: string
  venue?: string
  referee?: string
  attendance?: number
  weather?: string
}

export interface TeamForm {
  position: number
  team: string
  played: number
  goalsFor: number
  goalsAgainst: number
  points: number
  form: string
}

export interface MatchEvent {
  id: string
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var" | "penalty_missed" | "own_goal"
  minute: number
  team: "home" | "away"
  player: string
  assistBy?: string
  playerOut?: string
  description?: string
}

export interface PlayerStats {
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

export interface TeamLineup {
  formation: string
  coach: string
  players: PlayerStats[]
}

export interface MatchStats {
  possession: [number, number]
  shots: [number, number]
  shotsOnTarget: [number, number]
  corners: [number, number]
  fouls: [number, number]
  yellowCards: [number, number]
  redCards: [number, number]
  offsides: [number, number]
}


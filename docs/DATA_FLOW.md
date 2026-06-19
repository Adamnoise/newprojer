# Data Flow & Calculations

## Overview
This document describes how data propagates through the application, from raw input to the final displayed statistics. The system relies on automatic recalculation (memoization) to ensure the UI is always in sync with the underlying data.

## Data Pipeline

### 1. Source of Truth
The primary state resides in the `LeagueDetails.tsx` component:
\`\`\`typescript
const [matches, setMatches] = useState<Match[]>([]);
\`\`\`
All other data (standings, form, analysis) is derived from this single array of `Match` objects.

### 2. Calculation Engine (`utils/calculations.ts`)

When `matches` changes, the `calculateStandings` function is triggered.

#### Standings Calculation Logic
For each match, the system updates the stats for both the Home and Away teams:
- **Points**: +3 for a win, +1 for a draw, +0 for a loss.
- **Goals**: `goalsFor` increases by goals scored, `goalsAgainst` by goals conceded.
- **Goal Difference**: `goalsFor - goalsAgainst`.
- **Played**: Incremented by 1.

**Sorting Rules**:
The standings table is automatically sorted by:
1. Points (Descending)
2. Goal Difference (Descending)
3. Goals For (Descending)

#### Form Calculation Logic
The `calculateTeamForms` function processes matches to determine recent performance:
1. Filters matches for a specific team.
2. Sorts them by date (most recent first).
3. Takes the last 5 matches.
4. Maps the result to 'W' (Win), 'D' (Draw), or 'L' (Loss).

### 3. Component Updates

The data flow to components is unidirectional (Top-Down):

\`\`\`mermaid
graph TD
    A[LeagueDetails State: matches] -->|Passes matches| B(calculateStandings)
    A -->|Passes matches| C(calculateTeamForms)
    B -->|Returns TableData| A
    C -->|Returns FormData| A
    A -->|Props: standings| D[StandingsTable]
    A -->|Props: form| E[FormTable]
    A -->|Props: matches| F[MatchesTable]
\`\`\`

### 4. Real-time Analysis

In addition to standard tables, the `matches` state is also consumed by the Analysis Services:
- **Pattern Analysis**: Scans the match list for defined patterns (e.g., "Home team wins after trailing at half-time").
- **Statistical Analysis**: Calculates aggregate metrics like "Average Goals per Match" or "Home Win Percentage".

These calculations happen on-the-fly in the browser, ensuring that as soon as a CSV is imported, all insights are immediately available without a page reload.

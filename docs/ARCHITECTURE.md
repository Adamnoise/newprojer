# System Architecture

## Overview
Soccer Championship Analysis is a Next.js application designed for managing soccer leagues, processing match data, and performing advanced statistical analysis. The application follows a service-oriented architecture on the frontend, utilizing React's component-based structure for the UI and specialized service modules for business logic.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks (useState, useMemo, useEffect)
- **Data Processing**: PapaParse (CSV), Zod (Validation)
- **Visualization**: Recharts

## Directory Structure

### `/app`
Contains the Next.js App Router pages and layouts.
- `page.tsx`: The main entry point, displaying the list of leagues.
- `layout.tsx`: The root layout definition.

### `/components`
Reusable UI components.
- **Core Views**: `LeagueDetails.tsx`, `LeagueTable.tsx`
- **Data Display**: `StandingsTable.tsx`, `FormTable.tsx`, `MatchesTable.tsx`
- **Input/Actions**: `CSVUpload.tsx`, `NewLeagueModal.tsx`
- **Analysis**: `AnalysisResultsPanel.tsx`, `PatternDefinitionPanel.tsx`

### `/analysis`
Contains the core business logic and service modules.
- **`data-import-service.ts`**: Handles parsing and processing of imported data.
- **`statistical-analysis.ts`**: Performs statistical calculations on match data.
- **`pattern-analysis-service.ts`**: Identifies patterns in match results.
- **`alert-service.ts`**: Manages notifications based on analysis results.
- **`visualization-service.ts`**: Prepares data for charts and graphs.

### `/utils`
Utility functions for common operations.
- **`calculations.ts`**: Core logic for calculating league standings and team form.
- **`csv.utils.ts`**: Configuration and validation logic for CSV imports.

## Key Architectural Patterns

### Service Layer
Business logic is encapsulated in service files within the `/analysis` directory. These services are stateless functions or classes that process data and return results, keeping the UI components focused on rendering.

### Reactive Data Flow
The application uses a reactive data flow model.
1. **Input**: Raw match data is imported via CSV.
2. **State**: The `LeagueDetails` component holds the "source of truth" state for matches.
3. **Derivation**: `useMemo` hooks in `LeagueDetails` and `utils/calculations.ts` automatically derive secondary data (standings, form, statistics) whenever the match list changes.
4. **Rendering**: Derived data is passed down to presentation components (`StandingsTable`, `FormTable`) via props.

### Component Composition
The UI is built using small, focused components. `LeagueDetails.tsx` acts as a "Smart Component" (Container) that manages state and orchestration, while child components like `StandingsTable.tsx` are "Dumb Components" (Presentational) that simply render the data they receive.

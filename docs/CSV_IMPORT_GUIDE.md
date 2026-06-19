# CSV Import Guide

## Overview
The application allows users to import match data via CSV files. This process is handled by the `CSVUpload` component and the `data-import-service`.

## CSV Format Requirements

The CSV file must contain specific headers to be correctly parsed. The order of columns does not matter, but the header names must match exactly.

### Required Headers
| Header Name | Description | Example |
|-------------|-------------|---------|
| `match_time` | Time of the match | `15:00` |
| `home_team` | Name of the home team | `Manchester City` |
| `away_team` | Name of the away team | `Arsenal` |
| `half_time_home_goals` | Goals scored by home team at half time | `1` |
| `half_time_away_goals` | Goals scored by away team at half time | `0` |
| `full_time_home_goals` | Final score for home team | `2` |
| `full_time_away_goals` | Final score for away team | `1` |

### Optional Headers
- `date`: Date of the match (YYYY-MM-DD)
- `round`: Match round number
- `referee`: Name of the referee
- `stadium`: Name of the stadium
- `attendance`: Number of spectators

## Import Process

1. **File Selection**: User selects a CSV file in the `CSVUpload` component.
2. **Parsing**: The file is parsed using `PapaParse` in the browser.
3. **Validation**:
   - The system checks for the presence of all required headers defined in `utils/csv.utils.ts`.
   - Rows with missing required data are flagged or skipped.
4. **Transformation**:
   - String values from the CSV are converted to the appropriate types (numbers for scores, Date objects for times).
   - The data is mapped to the `Match` interface defined in `types.ts`.
5. **State Update**:
   - The parsed and validated `Match` objects are passed to the parent component (`LeagueDetails`).
   - The application state is updated, triggering a recalculation of all standings and statistics.

## Troubleshooting

- **"Missing Headers" Error**: Ensure your CSV file has the exact header names listed above. Case sensitivity matters.
- **"Invalid Data"**: Check that goal columns contain only numbers.
- **Encoding**: Ensure the CSV is saved with UTF-8 encoding to handle special characters in team names correctly.

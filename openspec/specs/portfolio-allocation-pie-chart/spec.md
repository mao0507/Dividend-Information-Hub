## ADDED Requirements

### Requirement: System provides total invested amount
The system SHALL calculate the user's total invested amount as the sum of `(buy price * buy quantity)` across all buy lots.

#### Scenario: Compute total invested amount from multiple buy lots
- **WHEN** the user has multiple buy lots across one or more stocks
- **THEN** the system returns total invested amount equal to the sum of each lot's invested cost

### Requirement: System provides stock allocation slices for pie chart
The system SHALL provide pie chart slice data grouped by stock code, where each slice value is the total invested amount for that stock and each slice ratio is that stock invested amount divided by total invested amount.

#### Scenario: Build pie chart data from mixed holdings
- **WHEN** the user requests portfolio allocation chart data and has holdings in multiple stocks
- **THEN** the system returns grouped slices including stock code, invested amount, and ratio for each stock

#### Scenario: No holdings for chart
- **WHEN** the user requests allocation chart data and has no holdings
- **THEN** the system returns total invested amount as zero and an empty slice list

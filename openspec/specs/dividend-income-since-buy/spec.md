## ADDED Requirements

### Requirement: System calculates dividend income since buy timestamp
The system SHALL calculate cumulative dividend income using only dividend events whose ex-dividend date is on or after each buy lot's buy timestamp, multiplied by the buy lot quantity, and summed across all buy lots of the user.

#### Scenario: Include only eligible dividend events after buy
- **WHEN** a user owns a buy lot and the stock has dividend events both before and after the buy timestamp
- **THEN** the system includes only events on or after the buy timestamp in the cumulative dividend income result

#### Scenario: Aggregate dividend income across multiple buy lots
- **WHEN** a user has multiple buy lots for one or more stocks with eligible dividend events
- **THEN** the system returns cumulative dividend income equal to the sum of each eligible event amount multiplied by its corresponding lot quantity

### Requirement: System returns dividend income summary for dashboard
The system SHALL expose a dashboard-ready summary field for cumulative dividend income since buy, so frontend can display the user's realized dividend cashflow from tracked holdings.

#### Scenario: Return zero when no eligible dividends
- **WHEN** a user has holdings but no eligible dividend events since buy timestamps
- **THEN** the system returns cumulative dividend income as zero

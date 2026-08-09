## ADDED Requirements

### Requirement: Dashboard SHALL render accumulated income and total invested amount in one card
The system SHALL present accumulated dividend income and total invested amount within a single dashboard card component, instead of two separate sections.

#### Scenario: Summary data is available
- **WHEN** dashboard summary API returns accumulated income and total invested amount
- **THEN** the UI renders both metrics inside one card container

#### Scenario: Legacy separated blocks are removed
- **WHEN** the merged card is rendered
- **THEN** the previous separated accumulated-income block and standalone total-invested block are not rendered

### Requirement: Combined card MUST preserve status and as-of context
The system MUST continue to show state-dependent messaging and data timestamp context for accumulated income within the combined card.

#### Scenario: Accumulated income state is ready
- **WHEN** accumulated income state is ready
- **THEN** the card shows accumulated income value, YoY indicator, and as-of date

#### Scenario: Accumulated income state is non-ready
- **WHEN** accumulated income state is empty, stale, or error
- **THEN** the card shows fallback placeholders/messages while still displaying total invested amount

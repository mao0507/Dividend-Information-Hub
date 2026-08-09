## ADDED Requirements

### Requirement: User can record stock buy lots
The system SHALL allow a signed-in user to create a stock holding buy lot record with stock code, buy timestamp, buy price, and buy quantity. The system MUST persist each buy lot as an independent record linked to the user.

#### Scenario: Create a valid buy lot
- **WHEN** the user submits stock code, buy timestamp, buy price, and buy quantity with valid values
- **THEN** the system stores the buy lot and returns the created record with a unique identifier

#### Scenario: Reject invalid buy lot data
- **WHEN** the user submits missing fields, non-positive price, or non-positive quantity
- **THEN** the system rejects the request with a validation error and does not create a record

### Requirement: User can list own stock holding buy lots
The system SHALL provide an endpoint for a signed-in user to retrieve all their stock holding buy lot records. The system MUST return only records belonging to the requesting user.

#### Scenario: Retrieve existing buy lots
- **WHEN** a user requests their holding list and has existing buy lots
- **THEN** the system returns all buy lots for that user with stock code, buy timestamp, buy price, and buy quantity

#### Scenario: User has no buy lots
- **WHEN** a user requests their holding list and has not created any buy lots
- **THEN** the system returns an empty list

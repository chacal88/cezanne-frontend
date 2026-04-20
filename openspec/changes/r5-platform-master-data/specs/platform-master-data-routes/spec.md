## ADDED Requirements

### Requirement: Platform master-data routes are registered
The system SHALL register SysAdmin platform routes for hiring companies, recruitment agencies, and subscriptions list/detail/edit surfaces with explicit route ids, metadata, capability gates, parent targets, and dashboard fallback behavior.

#### Scenario: Master-data route metadata exists
- **WHEN** route metadata is requested for each master-data route
- **THEN** the metadata identifies the `sysadmin` domain, the correct entity module, the Platform master-data route family, and the required platform capability

### Requirement: Platform master-data pages render deterministic states
The system SHALL render master-data list, detail, and edit pages from deterministic frontend state models that include loading, empty, error, denied, not-found, stale, ready, success, and cancel outcomes as applicable.

#### Scenario: Detail stale state is explicit
- **WHEN** a master-data detail page receives a stale entity state
- **THEN** the page exposes a stale outcome with a stable parent return target instead of redirecting to unrelated recruiter-core routes

### Requirement: Platform master-data navigation exposes implemented links
The system SHALL expose live Platform / Master data navigation links only for implemented master-data routes and SHALL keep unimplemented platform groups linkless.

#### Scenario: SysAdmin sees master-data links
- **WHEN** a SysAdmin platform context opens the shell navigation
- **THEN** Platform / Master data contains links to hiring companies, recruitment agencies, and subscriptions while users/requests and taxonomy remain planned without links

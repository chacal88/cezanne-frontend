## ADDED Requirements

### Requirement: Company subscription route is company-owned
The system SHALL treat `/hiring-company/:id/subscription` as a `sysadmin.companies` route with company-detail parent return behavior while delegating subscription mutation readiness to platform subscription capability.

#### Scenario: Company subscription route metadata is split by concern
- **WHEN** route metadata is requested for `/hiring-company/:id/subscription`
- **THEN** the route is owned by the companies module, requires company management for route entry, declares platform subscription mutation capability, and returns to the company detail route

### Requirement: Company subscription actions require subscription capability
The system SHALL show subscription mutation actions as available only when the user has both company route access and platform subscription management capability.

#### Scenario: Company manager without subscription capability sees blocked actions
- **WHEN** a user can manage hiring companies but cannot manage platform subscriptions
- **THEN** the company subscription page remains accessible but subscription mutation actions are blocked with an explicit capability reason

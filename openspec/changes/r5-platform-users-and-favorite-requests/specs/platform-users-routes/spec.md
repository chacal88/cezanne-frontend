## ADDED Requirements

### Requirement: Platform user routes are registered
The system SHALL register platform-owned `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` routes under `sysadmin.users` with `canManagePlatformUsers` and dashboard fallback.

#### Scenario: Platform user metadata is explicit
- **WHEN** route metadata is requested for a platform user route
- **THEN** the metadata identifies `sysadmin.users`, platform users-and-requests route family, `canManagePlatformUsers`, and implemented state

### Requirement: Platform user list filters are URL-owned
The system SHALL parse `page`, `search`, `hiringCompanyId`, and `recruitmentAgencyId` from the user list URL and sanitize invalid or empty values.

#### Scenario: Invalid user filters degrade safely
- **WHEN** platform user list filters contain invalid page or empty strings
- **THEN** page degrades to `1` and empty filters are omitted

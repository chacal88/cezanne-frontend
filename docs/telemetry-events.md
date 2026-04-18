# Frontend Greenfield Telemetry Event Catalog

## Purpose

This document defines the initial telemetry event taxonomy for the greenfield frontend.

It answers:
- which event names are allowed initially
- what each event means
- which minimal payload fields are expected

## Source baseline

Built on top of:
- `observability.md`
- `screens.md`
- `roadmap.md`

## Event naming rules

- use lowercase snake_case
- name by business meaning, not by component name
- prefer stable nouns and outcomes
- avoid provider-specific semantics in event names

## Common payload fields

Most events may include:
- `routeId`
- `routeClass`
- `domain`
- `module`
- `entryMode`
- `correlationId`
- `journey`
- `taskType`

Only add extra fields if they are relevant to the event.

## Event families

### 1. Shell and auth

| Event | Meaning | Typical extra fields |
|---|---|---|
| `shell_boot_started` | authenticated shell bootstrap started | none |
| `shell_boot_succeeded` | authenticated shell bootstrap completed | `durationMs` |
| `shell_boot_failed` | authenticated shell bootstrap failed | `failureKind` |
| `login_started` | login attempt started | `provider` if applicable |
| `login_succeeded` | login completed | `provider` if applicable |
| `login_failed` | login failed | `failureKind`, `provider` |
| `sso_callback_succeeded` | SSO/SAML callback succeeded | `provider` |
| `sso_callback_failed` | SSO/SAML callback failed | `provider`, `failureKind` |
| `token_flow_invalid` | token route received invalid token | `flowType` |
| `token_flow_expired` | token route received expired token | `flowType` |

### 2. Navigation and notification

| Event | Meaning | Typical extra fields |
|---|---|---|
| `nav_item_opened` | user opened a nav destination | `targetRouteId` |
| `notification_clicked` | user clicked a notification | `notificationKey` |
| `notification_destination_resolved` | typed destination resolved | `notificationKey`, `destinationKind` |
| `notification_destination_denied` | target denied by access/context | `notificationKey`, `destinationKind`, `denyReason` |
| `notification_fallback_used` | fallback destination used | `notificationKey`, `fallbackKind` |

### 3. Journeys

| Event | Meaning | Typical extra fields |
|---|---|---|
| `journey_started` | a tracked journey started | `journey` |
| `journey_step` | meaningful intermediate step | `journey`, `step` |
| `journey_finished` | journey ended | `journey`, `outcome` |

`outcome` values:
- `success`
- `failure`
- `cancel`
- `abandon`

### 4. Task flows

| Event | Meaning | Typical extra fields |
|---|---|---|
| `taskflow_opened` | task flow opened | `taskType`, `parentRouteId` |
| `taskflow_submitted` | submit action fired | `taskType` |
| `taskflow_succeeded` | task flow completed successfully | `taskType` |
| `taskflow_failed` | task flow failed | `taskType`, `failureKind` |
| `taskflow_cancelled` | user cancelled or closed flow | `taskType` |

### 5. Jobs

| Event | Meaning | Typical extra fields |
|---|---|---|
| `jobs_list_viewed` | jobs list entered | `scope` |
| `jobs_filter_changed` | jobs filters changed | `changedKeys` |
| `job_authoring_opened` | authoring route entered | `mode` (`create` or `edit`) |
| `job_authoring_saved` | authoring saved successfully | `mode` |
| `job_authoring_failed` | authoring save failed | `mode`, `failureKind` |
| `job_detail_viewed` | job hub viewed | `jobId` |

### 6. Candidates

| Event | Meaning | Typical extra fields |
|---|---|---|
| `candidate_detail_viewed` | candidate hub viewed | `candidateId`, `jobId` |
| `candidate_sequence_next` | next-candidate navigation used | `jobId` |
| `candidate_sequence_previous` | previous-candidate navigation used | `jobId` |
| `candidate_action_opened` | action entry launched from candidate | `taskType` |
| `candidate_action_succeeded` | action completed successfully | `taskType` |
| `candidate_action_failed` | action failed | `taskType`, `failureKind` |
| `candidate_cv_uploaded` | CV upload completed | `candidateId` |

### 7. Reports, billing, integrations

| Event | Meaning | Typical extra fields |
|---|---|---|
| `report_viewed` | report family opened | `reportFamily` |
| `report_export_requested` | export requested | `reportFamily` |
| `billing_viewed` | billing overview opened | none |
| `billing_upgrade_started` | upgrade flow started | `plan` if known |
| `integration_provider_opened` | integration provider detail opened | `providerId` |
| `integration_token_entry_opened` | token integration route opened | `integrationType` |

## Event taxonomy rule

New events must be added here before they become part of the default product instrumentation contract.

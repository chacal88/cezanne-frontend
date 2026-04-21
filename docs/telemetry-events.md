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
| `integration_provider_configuration_saved` | provider-specific configuration saved | `providerFamily`, `providerState`, `section`, `outcome` |
| `integration_provider_configuration_failed` | provider-specific configuration failed validation or save | `providerFamily`, `providerState`, `section`, `failureKind` |
| `integration_provider_auth_started` | provider connect or reauthorize started | `providerFamily`, `providerState`, `action` |
| `integration_provider_auth_failed` | provider connect or reauthorize failed | `providerFamily`, `providerState`, `failureKind` |
| `integration_provider_diagnostics_started` | provider diagnostics run started | `providerFamily`, `providerState` |
| `integration_provider_diagnostics_completed` | provider diagnostics completed | `providerFamily`, `providerState`, `outcome`, `maxSeverity` |
| `integration_token_entry_opened` | token integration route opened | `integrationType` |


### 8. Public external journeys

| Event | Meaning | Typical extra fields |
|---|---|---|
| `public_shared_job_opened` | shared public job route opened | `jobOrRole`, `tokenState`, `source` |
| `public_application_opened` | public application route opened | `jobOrRole`, `tokenState`, `source` |
| `public_application_submit_started` | public application workflow started | `jobOrRole` |
| `public_application_submit_completed` | public application workflow completed | `jobOrRole`, `uploadCount` |
| `public_application_submit_failed` | public application workflow failed but remained recoverable in-route | `jobOrRole`, `stage` |
| `public_survey_opened` | public survey continuation route opened | `surveyuuid`, `tokenState` |
| `public_survey_submit_completed` | public survey completed successfully | `surveyuuid` |
| `public_survey_submit_failed` | public survey completion failed but remained recoverable in-route | `surveyuuid` |
| `external_interview_request_opened` | external interview request route opened | `scheduleUuid`, `tokenState` |
| `external_interview_request_bootstrapped` | interview request bootstrap resolved | `scheduleUuid`, `readiness` |
| `external_interview_request_token_state_resolved` | interview request token state resolved | `scheduleUuid`, `tokenState` |
| `external_interview_request_submission_started` | interview request accept/decline started | `scheduleUuid`, `decision` |
| `external_interview_request_submission_completed` | interview request reached a stable terminal outcome | `scheduleUuid`, `outcome` |
| `external_interview_request_submission_failed` | interview request action failed but remained recoverable in-route | `scheduleUuid`, `stage` |
| `external_review_candidate_opened` | external review candidate route opened | `code`, `tokenState` |
| `external_review_candidate_bootstrapped` | review candidate bootstrap resolved | `code`, `readiness` |
| `external_review_candidate_token_state_resolved` | review candidate token state resolved | `code`, `tokenState` |
| `external_review_candidate_submission_started` | review candidate submission started | `code` |
| `external_review_candidate_submission_completed` | review candidate submission completed | `code`, `outcome` |
| `external_review_candidate_submission_failed` | review candidate submission failed but remained recoverable in-route | `code`, `stage` |
| `external_interview_feedback_opened` | external interview feedback route opened | `code`, `tokenState` |
| `external_interview_feedback_bootstrapped` | interview feedback bootstrap resolved | `code`, `readiness` |
| `external_interview_feedback_token_state_resolved` | interview feedback token state resolved | `code`, `tokenState` |
| `external_interview_feedback_submission_started` | interview feedback submission started | `code` |
| `external_interview_feedback_submission_completed` | interview feedback submission completed | `code`, `outcome` |
| `external_interview_feedback_submission_failed` | interview feedback submission failed but remained recoverable in-route | `code`, `stage` |
| `external_interview_feedback_terminal_viewed` | submitted feedback read-only state rendered | `code`, `outcome` |
| `requisition_approval_opened` | requisition approval route opened | `tokenState`, `workflowState`, `readiness` |
| `requisition_approval_submit_started` | requisition approval submit started | `decision` |
| `requisition_approval_submit_completed` | requisition approval submit completed successfully | `decision`, `terminalState` |
| `requisition_approval_submit_failed` | requisition approval submit failed but remained recoverable in-route | `decision`, `stage` |
| `requisition_approval_token_state_resolved` | requisition approval resolved to a token-state outcome after concurrent consumption | `decision`, `tokenState` |
| `requisition_approval_workflow_drift` | requisition approval resolved to workflow drift instead of generic failure | `decision` |
| `requisition_forms_opened` | requisition forms/download route opened | `tokenState`, `readiness`, `mode` |
| `requisition_forms_download_started` | explicit requisition forms download action started | `mode` |
| `requisition_forms_download_completed` | requisition forms download action completed | `documentCount` |
| `requisition_forms_download_failed` | requisition forms download failed but remained retryable in-route | `stage`, `retryable` |
| `requisition_forms_token_state_resolved` | requisition forms/download resolved to a token-state outcome | `tokenState` |


### 9. SysAdmin platform foundation

| Event | Meaning | Typical extra fields |
|---|---|---|
| `platform_route_entry_attempted` | platform route direct entry or navigation was attempted | `targetRouteId`, `platformRouteFamily`, `outcome` |
| `platform_route_denied` | platform route was denied by access or context | `targetRouteId`, `platformRouteFamily`, `denyReason` |
| `platform_fallback_used` | platform route entry fell back to dashboard | `targetRouteId`, `fallbackTarget`, `fallbackMode` |
| `platform_nav_group_exposed` | a Platform navigation group became visible | `navGroup` |
| `platform_placeholder_viewed` | a foundation placeholder route rendered before route-heavy implementation | `targetRouteId`, `platformRouteFamily` |


### 10. R5 settings leftovers

| Event | Meaning | Typical extra fields |
|---|---|---|
| `settings_compat_resolved` | `/parameters` compatibility request resolved to a dedicated subsection route | `routeId`, `requestedSubsection`, `resolvedSubsection`, `outcome` |
| `settings_compat_fallback_used` | `/parameters` compatibility request used fallback for unknown, unauthorized, unavailable, or unimplemented subsection | `routeId`, `requestedSubsection`, `resolvedSubsection`, `fallbackTarget`, `reason` |
| `api_endpoints_validation_failed` | API endpoints settings validation blocked save | `routeId`, `failureKind` |
| `api_endpoints_save_failed` | API endpoints settings save failed but remained recoverable in-route | `routeId`, `failureKind` |
| `api_endpoints_save_succeeded` | API endpoints settings save reached stable success state | `routeId` |

R5 settings events must not include endpoint URLs, credentials, headers, tenant-sensitive identifiers, or raw session payloads.

## Event taxonomy rule

New events must be added here before they become part of the default product instrumentation contract.

## R5 SysAdmin foundation event payload contract

| Event | Trigger | Required safe payload |
|---|---|---|
| `platform_route_entry` | SysAdmin enters `/dashboard` platform mode or a platform placeholder route | `routeId`, `routeFamily`, `capabilityOutcome`; optional `mode` or implementation state |
| `platform_route_denied` | authenticated user lacks the platform route capability | `routeId`, `routeFamily`, `capability`, `capabilityOutcome`, `fallbackOutcome` |
| `platform_fallback_used` | denied platform route resolves to `/dashboard` | `targetRouteId`, `fallbackTarget`, `fallbackMode` |
| `platform_nav_group_exposed` | a Platform child group is visible in shell navigation | `navGroup`, optional `implementationState` |

These events must not include tenant-sensitive identifiers. Platform mutation success/failure events remain reserved for later route-heavy SysAdmin slices.

### Provider-specific integration telemetry safety

Provider-specific integration telemetry must not include credentials, OAuth secrets, private tokens, webhook secrets, signed URLs, raw logs, tenant-sensitive identifiers, or provider callback payloads. Use provider family, state, section, action, outcome, safe diagnostic severity/check id, and correlation id only.

## Provider-specific integrations depth implementation note

Provider setup events are emitted only from authenticated `/integrations/:id` configuration, auth, and diagnostics actions. The implemented safe payload shape is limited to provider family, provider state, section, action, outcome, safe diagnostic check id/severity, failure kind, and correlation id. It must not include credentials, OAuth secrets, private tokens, webhook secrets, signed URLs, raw logs, tenant-sensitive identifiers, provider callback payloads, or public/token route tokens.

## Provider readiness operational gate telemetry

| Event | Meaning | Key attributes |
|---|---|---|
| `provider_readiness_gate_evaluated` | operational route evaluated normalized provider readiness before a scheduling, publishing, or HRIS workflow action/status | `readinessFamily`, `providerFamily`, `outcome`, `actionContext`, `recoveryTargetType`, `correlationId` |

Safety rule:
- this event must not include credentials, OAuth secrets, private tokens, webhook secrets, signed URLs, raw diagnostics logs, tenant-sensitive identifiers, provider callback payloads, public route tokens, provider setup form values, board mapping payloads, or HRIS sync payloads.
- `recoveryTargetType` may be `provider-setup` or `none`; the event should not require concrete tenant/provider setup identifiers beyond allowlisted provider family data.

## Integration operational-depth telemetry

The operational-depth sequence is synchronized in `integration-operational-depth-sequence-plan.md`; all eight packages are implemented and validated.

| Event | Meaning | Key attributes |
|---|---|---|
| `calendar_scheduling_action` | authenticated calendar scheduling slot selection, submit start, conflict, submit failure, or submitted success outcome for job/candidate task routes | `routeFamily`, `action`, `schedulingState`, `readinessOutcome`, `correlationId` |
| `job_board_publishing_action` | publish/unpublish, partial, retry, failure, or success outcome | `routeFamily`, `action`, `publishingState`, `readinessOutcome`, `targetType`, `correlationId` |
| `hris_requisition_sync_action` | HRIS mapping, sync, drift, retry, or remediation outcome | `routeFamily`, `action`, `hrisState`, `readinessOutcome`, `driftType`, `correlationId` |
| `messaging_conversation_action` | inbox destination resolution, conversation open, send, retry, stale refresh, or sent outcome | `routeFamily`, `action`, `messagingState`, `entryMode`, `fallbackKind`, `correlationId` |
| `contract_signing_action` | contract launch, send, retry, status refresh, downstream handoff, or terminal outcome | `routeFamily`, `action`, `contractState`, `taskContext`, `terminalOutcome`, `correlationId` |
| `survey_review_scoring_action` | survey/review/scoring open, submit, retry, terminal, or scoring refresh outcome | `routeFamily`, `action`, `operationalState`, `tokenState`, `taskContext`, `terminalOutcome`, `correlationId` |
| `ats_candidate_source_action` | ATS source resolution, import/sync, duplicate outcome, retry, refresh, or failure | `routeFamily`, `action`, `atsState`, `sourceState`, `duplicateOutcome`, `syncImportOutcome`, `correlationId` |

Safety rule: operational-depth telemetry must not include credentials, OAuth secrets, private tokens, signed URLs, diagnostics logs, tenant-sensitive identifiers, provider callback payloads, raw provider records, message bodies, attachment contents, contract documents, signature data, survey answers, scoring rubrics, reviewer private notes, raw schemas, raw ATS records, webhook payloads, or candidate-identifying external ids.

### Job-board publishing safety

`job_board_publishing_action` is allowlisted to route family, action, publishing state, normalized readiness outcome, target type, and correlation id. It must not include credentials, OAuth secrets, webhook secrets, signed URLs, raw provider payloads, board mappings, tenant-sensitive identifiers, provider callback payloads, or public route tokens.

## HRIS requisition operational depth telemetry

| Event | Meaning | Key attributes |
|---|---|---|
| `hris_requisition_sync_action` | HRIS readiness evaluation, sync intent, retry, mapping drift, blocked action, or remediation outcome | `routeFamily`, `action`, `hrisState`, `readinessOutcome`, `recoveryTargetType`, `driftType`, `correlationId` |

Safety rule:
- this event must use the allowlisted payload above and must not include OAuth secrets, private tokens, webhook secrets, signed URLs, raw HRIS payloads, raw mappings, diagnostics logs, tenant-sensitive identifiers, provider callback payloads, or public route tokens.
- mapping drift is reported as `driftType: mapping`; workflow drift remains represented by requisition workflow state and is not overwritten by HRIS-ready success telemetry.

## Contract signing telemetry

`contract_signing_action` is an allowlisted event for recruiter-side contract launch, send start, send failure, retry, status refresh, downstream handoff, and terminal outcomes. Payloads include only route family, action, contract state, task context, normalized terminal outcome when available, and correlation id. Document contents, signature data, signed URLs, tokens, credentials, raw contract/provider payloads, tenant-sensitive identifiers, and public callback payloads are excluded.


## ATS and assessment provider setup telemetry note

ATS and assessment setup reuses provider setup telemetry events for configuration, auth, and diagnostics. Payloads are allowlisted to provider family, provider state, section, action, outcome, safe check id/severity, failure kind, and correlation id. They must not include credentials, webhook secrets, callback tokens, raw ATS records, candidate/job payloads, assessment submissions, scoring payloads, tenant identifiers, raw logs, or public route tokens.

## Auth session foundation telemetry

`auth_session_action` records auth entry, token flow, callback, session bootstrap, logout, and session-expired outcomes. Allowed payload fields are `routeFamily`, `action`, `providerFamily`, normalized `outcome`, `tokenState`, `callbackOutcome`, `sessionOutcome`, `entryMode`, `fallbackKind`, and `correlationId`. Payloads must not include passwords, raw tokens, authorization codes, refresh tokens, session payloads, provider callback payloads, tenant-sensitive identifiers, email addresses, or private user identifiers.

## Implementation-depth safe telemetry note

Auth/session, shell notifications, Jobs, Candidate, and public/token product-depth telemetry must use allowlisted normalized fields only: route family, action, normalized state/outcome, fallback kind, entry mode, and correlation id. Raw tokens, auth codes, credentials, message bodies, survey answers, provider payloads, signed URLs, document contents, and tenant-sensitive identifiers are disallowed.

## Email deliverability readiness telemetry

| Event | Meaning | Key attributes |
|---|---|---|
| `email_deliverability_readiness_evaluated` | Inbox, notification, or candidate communication surface evaluated normalized email deliverability readiness before showing blocked/degraded/unavailable send state | `routeId`, `capabilityOutcome`, `readinessState`, `providerFamily`, `domainCategory`, `correlationId` |

Safety rule: email deliverability readiness telemetry must not include raw domains, email addresses, DNS records, DKIM selectors, Return-Path values, verification tokens, sender-signature secrets, provider payloads, Route53/Postmark retry internals, message bodies, attachment contents, tenant-sensitive identifiers, or public route tokens. Domain information is limited to redacted category values such as `managed`, `fallback`, `owned`, or `unknown`.

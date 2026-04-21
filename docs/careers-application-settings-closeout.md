# Careers/application settings closeout

## Confirmed contracts

- Authenticated settings routes own configuration state for careers page, application page, job listings, and job listing editor screens.
- Public and token routes remain under the `public-external` domain. Settings saves and publish actions expose public-reflection intent only; they do not mutate public route state directly.
- Job listings consume normalized job-board publishing readiness/status from the integrations and jobs support layers. Provider setup stays under `/integrations/:providerId` and is exposed only as a safe remediation link when a readiness gate allows it.
- Route metadata for `/settings/careers-page`, `/settings/application-page*`, `/settings/job-listings`, and `/settings/job-listings/edit*` must match router guards, required capabilities, fallback targets, route family, parent targets, and implementation state.

## Public-reflection payload rules

Safe payloads may include route id, route family, target type, target reference, sanitized brand slug, settings id, section/subsection, listing uuid, publishing state, public-reflection state, and correlation id. Payloads must not include public tokens, provider credentials, raw provider diagnostics, applicant data, or public callback payloads.

## Unknowns intentionally preserved

- Confirmed backend settings API schemas are not available in this package; fixture-backed adapters remain explicit.
- Final safe URL/telemetry coverage for brand and label fields is still pending backend/product confirmation.
- Public rendering proof for careers pages, public applications, and shared jobs is represented as intent until a public route contract is confirmed.

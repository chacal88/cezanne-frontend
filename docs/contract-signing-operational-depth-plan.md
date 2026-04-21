# Contract Signing Operational Depth Plan

## Purpose

This plan scopes authenticated recruiter-side contract signing operational depth for candidate contract summaries plus candidate- and job-scoped offer/contract launchers.

## Status

Implemented by OpenSpec change `contract-signing-operational-depth`.

## Scoped consumers

Confirmed in this package:
- Candidate documents/contracts summaries consume document metadata separately from signing status.
- Candidate offer/contract launchers consume contract actionability, send/retry, status refresh, downstream signer handoff, and candidate parent-refresh intent.
- Job offer/contract overlays consume the same contract actionability model while preserving job parent return.

Out of scope:
- Standalone `e-signer` signer-facing UI.
- Public/token `/integration/*` routes.
- Backend contract persistence, provider orchestration, signed URLs, signature placement, or raw provider payload handling.

## Operational model

The route-local model covers loading, ready, template-required, document-required, sending, sent, send-failed, signing-pending, signed, declined, expired, voided, status-stale, provider-blocked, degraded, and unavailable outcomes. Document metadata answers whether a generated/uploaded contract artifact exists; signing status answers whether send, retry, refresh, or downstream handoff can proceed.

## Telemetry

The allowlisted contract telemetry event is `contract_signing_action` with only:

- `routeFamily`;
- `action` (`launch`, `send_started`, `send_failed`, `retry_started`, `status_refreshed`, `downstream_handoff`, or `terminal_outcome`);
- `contractState`;
- `taskContext`;
- normalized `terminalOutcome` when already available;
- `correlationId`.

Telemetry must not include document contents, signature data, signed URLs, tokens, credentials, raw contract payloads, provider payloads, tenant-sensitive identifiers, public callback payloads, or standalone signer internals.

## Validation

Validation must prove document/signing separation, blocked prerequisites, send/retry/status refresh outcomes, parent refresh intent, downstream signer separation, safe telemetry, and unchanged standalone signer/public token behavior.

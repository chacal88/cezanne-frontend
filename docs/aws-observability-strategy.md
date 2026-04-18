# Frontend Greenfield AWS Observability Strategy

## Purpose

This document defines the recommended AWS-oriented observability strategy for the greenfield frontend stack.

It answers:
- how to use AWS services without coupling product code to AWS SDKs
- which AWS services map to which observability layer
- what tracing and correlation strategy should be preferred on AWS

## Source baseline

Built on top of:
- `observability.md`
- `telemetry-events.md`
- `correlation-id-policy.md`
- `architecture.md`

Validated against official AWS documentation for:
- CloudWatch RUM
- CloudWatch Synthetics
- CloudWatch Application Signals
- AWS X-Ray migration guidance toward OpenTelemetry

## Recommended strategy

Use an **AWS-backed but provider-agnostic observability architecture**:

- product code depends on internal ports only
- AWS services are wired through adapters in the infrastructure layer
- tracing standard is **OpenTelemetry**
- AWS service choice is mapped per observability concern, not forced into one service

## Service mapping

| Observability concern | Recommended AWS service | Role in the stack |
|---|---|---|
| Real user monitoring | CloudWatch RUM | browser performance, page views, client-side metrics, frontend experience signals |
| Synthetic journeys | CloudWatch Synthetics | scheduled canaries for critical routes and flows |
| Service health / SLO / dependency views | CloudWatch Application Signals | service-level health, latency, errors, dependency topology |
| Trace ingestion and propagation | OpenTelemetry via ADOT / CloudWatch agent | tracing standard and propagation layer |
| Backend trace destination | AWS X-Ray compatible destination through OTel path | backend trace visibility where needed |
| Metrics / logs dashboards | CloudWatch | operational dashboards, alarms, metric aggregation |

## Architecture rule

Do **not** wire frontend domains directly to:
- CloudWatch RUM SDK primitives
- X-Ray SDK calls
- raw AWS vendor instrumentation calls

Instead:
- `src/lib/observability/` defines the internal ports
- `src/app/providers.tsx` selects the AWS adapters
- domain code emits only typed telemetry events and context

## Why OpenTelemetry should be the tracing standard

Use OpenTelemetry as the tracing standard for this stack.

Reasons:
- AWS recommends migration toward OpenTelemetry for tracing/instrumentation
- it keeps the architecture aligned with a broader ecosystem, not only AWS-specific tooling
- it protects the stack from overcommitting to legacy X-Ray-specific instrumentation

## X-Ray guidance

Do not center the architecture on X-Ray SDK/daemon instrumentation.

Recommended usage:
- treat X-Ray compatibility as a destination/integration concern
- use OpenTelemetry instrumentation and collectors/agents instead of building new direct X-Ray SDK dependency into the architecture

Implication:
- if X-Ray is enabled in the environment, it should sit behind the tracing/export pipeline
- product code should still remain unaware of it

## AWS implementation shape

### Layer A: frontend product code

Depends on:
- `ObservabilityPort` or split telemetry/error/RUM ports

Emits:
- typed events from `telemetry-events.md`
- correlation id from `correlation-id-policy.md`
- route/domain/module context from `observability.md`

### Layer B: frontend adapter layer

Implements:
- `RumPort` → CloudWatch RUM adapter
- `TelemetryPort` → analytics/custom-event adapter
- `ErrorReportingPort` → chosen error backend adapter

Important note:
- AWS is strong for RUM, synthetic monitoring, metrics, and tracing correlation
- many teams still choose a specialized error product for exception triage UX
- therefore error reporting may remain swappable even in an AWS-first stack

### Layer C: backend observability layer

Implements:
- OpenTelemetry instrumentation
- propagation of `x-correlation-id`
- export to AWS-supported backends/collectors
- Application Signals for service health

## Recommended AWS-first operating model

### For frontend runtime

- CloudWatch RUM enabled for real sessions
- custom event emission aligned to the event taxonomy
- route and journey context attached to important events

### For backend and APIs

- OpenTelemetry instrumentation
- collector or CloudWatch agent in the platform runtime
- Application Signals for health, latency, and SLO visibility

### For proactive monitoring

- CloudWatch Synthetics canaries for:
  - login
  - dashboard
  - inbox entry
  - jobs list
  - candidate detail
  - public application

## Decision rules

### Rule 1: AWS services should be selected by concern

Do not ask one AWS service to solve every observability problem.

Preferred split:
- RUM → CloudWatch RUM
- synthetic → Synthetics
- service health → Application Signals
- tracing standard → OpenTelemetry

### Rule 2: Ports remain the contract

Even in an AWS-only deployment model:
- internal ports remain mandatory
- event taxonomy remains provider-agnostic
- correlation id policy remains provider-agnostic

### Rule 3: Keep error reporting swappable

If CloudWatch-only error handling proves operationally sufficient, keep it.
If a specialized error product is later needed, the architecture should already allow swapping adapters without changing product code.

## Initial recommendation for this repository

If the platform standard is AWS-first, the best starting point is:

1. `CloudWatch RUM` for browser/session visibility
2. `CloudWatch Synthetics` for critical journey canaries
3. `CloudWatch Application Signals` for backend/service observability
4. `OpenTelemetry` as the tracing and instrumentation standard
5. `x-correlation-id` propagation from frontend to backend
6. internal observability ports so product code stays cloud-vendor-neutral

## Related documents

- `observability.md`
- `telemetry-events.md`
- `correlation-id-policy.md`
- `architecture.md`

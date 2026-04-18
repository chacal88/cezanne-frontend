# AGENTS.md — recruit-frontend

## Documentation Contract

This app uses the documentation in `./docs/` as the active implementation package.

Before making non-trivial changes, read:
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/README.md`

Then open the documents that match the change area.

## Primary reading order for this app

Start with:
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/roadmap.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/architecture.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/domains.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/modules.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/screens.md`

For access, routing, and behavior contracts:
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/access-model.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/capabilities.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/notification-destinations.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/navigation-and-return-behavior.md`

For implementation workflow:
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/skills.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/release-skill-workflow.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/implementation-readiness-checklist.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/r0-execution-plan.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/r0-route-registration-plan.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/conventions.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/adrs/README.md`

For observability:
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/observability.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/telemetry-events.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/correlation-id-policy.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/aws-observability-strategy.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/observability-implementation-plan.md`

## Relationship to repository-level docs

Use these as supporting references:
- `/Users/kauesantos/Documents/recruit/docs/frontend-2/README.md` → archive / migration evidence base
- `/Users/kauesantos/Documents/recruit/frontend/` → source of truth for current legacy business behavior until replacement is complete
- Figma → complementary visual evidence, never the canonical source of route or capability truth

## Working rules

- Treat `recruit-frontend/docs/` as the active execution package.
- Treat `docs/frontend-2/` as read-only migration evidence.
- Validate non-trivial behavior against the current `frontend/` implementation when needed.
- Do not invent route, capability, or access behavior from design alone.
- Follow app-local ADRs and conventions before introducing new patterns.

## Update rules

- When changing runtime behavior, update the relevant app docs in `recruit-frontend/docs/`.
- When changing cross-cutting patterns, update `architecture.md`, `conventions.md`, and ADRs when appropriate.
- When refining release scope or readiness, update the release workflow and readiness docs.
- Keep confirmed facts separate from inference.

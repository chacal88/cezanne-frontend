# ADR 0001: SPA over SSR

## Context

The recruiter frontend is primarily an authenticated operational application with dense in-app workflows, role-aware shell behavior, routed overlays, and limited SEO value.

## Decision

Use a client-rendered SPA architecture with Vite + React.

Do not adopt Next.js, Remix, or another SSR-first framework for R0–R2.

## Consequences

- simpler shell and routing model
- faster local iteration for dense internal workflows
- no SSR complexity for authenticated-only surfaces
- public/external slices can still be extracted later if needed

## Alternatives rejected

- SSR app framework: rejected due to complexity without clear product gain
- hybrid SSR/SPA split at R0: rejected because it increases architectural overhead too early

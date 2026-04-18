# ADR 0004: Tailwind plus CVA over CSS-in-JS

## Context

The design-system direction already favors tokens, reusable primitives, and predictable variant APIs.

## Decision

Use Tailwind CSS for styling and CVA for component variants.

Do not use runtime CSS-in-JS as the primary styling strategy.

## Consequences

- token integration stays simple
- variant APIs remain typed and predictable
- runtime styling overhead is minimized

## Alternatives rejected

- styled-components / Emotion: rejected due to runtime cost and looser variant discipline
- CSS Modules as the primary system: rejected because they are weaker for variant-heavy primitives

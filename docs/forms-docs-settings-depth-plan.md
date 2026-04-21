# Forms/docs settings depth plan

## Confirmed docs-to-code gaps

Confirmed facts:
- `recruit-frontend/docs/modules.md` declares `settings.forms-docs-controls` with `canManageFormsDocsSettings`.
- `recruit-frontend/docs/capabilities.md` declares `canManageFormsDocsSettings` as `hc` + admin + `formsDocs`.
- Before this change, `recruit-frontend/src/lib/access-control/types.ts` and `evaluate-capabilities.ts` did not expose `canManageFormsDocsSettings`.
- Before this change, the operational settings subsection registry did not include `forms-docs`, and `/parameters/:settingsId/settings/forms-docs` resolved as an unknown compatibility request.
- Before this change, there was no route-owned `settings/forms-docs-controls` implementation under `src/domains/settings/`.

Inference:
- The missing module should consume the existing operational settings substrate instead of creating a separate settings shell, because the neighboring settings modules use that substrate for readiness, save, retry, and compatibility behavior.

## Prerequisite archived specs

Confirmed archived/current specs that this change depends on:
- `operational-settings-subsections`: route-owned settings subsection registry, compatibility parsing, deny/unavailable fallback, and dedicated route mapping.
- `operational-settings-workflow`: shared route-local readiness, save, validation, retry, and stable outcome model.
- `candidate-document-truth`: candidate documents/contracts stay candidate-owned and consume normalized document/contract state.
- `public-application-submission`: public application upload/submission stays public-route-owned.
- `public-token-product-depth`: public/token routes stay unsigned and same-route for retry/terminal states.
- `settings-parameters-compat`: `/parameters` remains a compatibility resolver and not a monolithic settings page.

## Confirmed backend contracts and validation gaps

Confirmed frontend contracts:
- Candidate documents/contracts currently use local frontend fixtures/stores and route-owned summaries.
- Public application and integration forms token routes currently use local frontend adapters/fixtures for upload and submission flows.
- Operational settings modules currently persist deterministic frontend fixtures through local storage while exposing replaceable store/workflow seams.

Unknown backend fields that remain validation gaps:
- Forms/docs settings configuration identifier and versioning source.
- Whether document requests are configured by candidate stage, job, public application source, or a company-level default.
- The backend shape for required/optional requested documents, allowed file types, maximum file size, and refresh/stale event metadata.
- The API used to propagate downstream refresh intent to candidate documents/contracts and public/token upload/submission consumers.

Implementation rule:
- Until these fields are confirmed, the route renders unavailable/degraded state options and saves only deterministic adapter fixtures. It must not fabricate backend API endpoints or claim server persistence.

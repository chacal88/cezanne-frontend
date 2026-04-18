import type { IntegrationCvRouteParams, IntegrationFormsRouteParams, IntegrationJobRouteParams } from './models';

export function buildIntegrationCvPath(params: IntegrationCvRouteParams): string {
  return params.action ? `/integration/cv/${params.token}/${params.action}` : `/integration/cv/${params.token}`;
}

export function buildIntegrationFormsPath(params: IntegrationFormsRouteParams): string {
  return `/integration/forms/${params.token}`;
}

export function buildIntegrationJobPath(params: IntegrationJobRouteParams): string {
  return params.action ? `/integration/job/${params.token}/${params.action}` : `/integration/job/${params.token}`;
}

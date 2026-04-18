import { buildCancelTarget } from '../../../lib/routing';
import type { JobHubSection, JobTaskContext, JobTaskKind } from '../support/models';

export function validateJobTaskSearch(search: Record<string, unknown>) {
  return {
    parent: typeof search.parent === 'string' && search.parent.startsWith('/job/') ? search.parent : undefined,
    section: typeof search.section === 'string' ? (search.section as JobHubSection) : undefined,
  };
}

export function resolveJobTaskContext(input: {
  kind: JobTaskKind;
  pathname: string;
  jobId: string;
  candidateId?: string;
  bidId?: string;
  parent?: string;
  section?: JobHubSection;
}): JobTaskContext {
  const defaultParent = input.section ? `/job/${input.jobId}?section=${input.section}` : `/job/${input.jobId}`;

  return {
    kind: input.kind,
    jobId: input.jobId,
    candidateId: input.candidateId,
    bidId: input.bidId,
    section: input.section,
    parentTarget: buildCancelTarget(input.pathname, defaultParent, input.parent ?? defaultParent),
  };
}

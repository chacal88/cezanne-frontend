import { matchRouteMetadata } from '../../../lib/routing/route-metadata';
import type {
  CandidateActionKind,
  CandidateContextSegments,
  CandidateDegradedSection,
  CandidateHubActionFixtureState,
  CandidateHubActionKind,
  CandidateRouteEntryMode,
  CandidateRouteSearch,
  CandidateTaskSearch,
} from './models';
import { sanitizeCandidateDatabaseReturnTarget } from './candidate-database-routing';

const degradedSectionValues = ['documents', 'contracts', 'surveys', 'custom-fields', 'collaboration', 'feedback'] as const;
const entryModeValues = ['direct', 'job', 'notification', 'database'] as const;
const fixtureActionValues = ['move', 'hire', 'unhire', 'review-request'] as const;
const fixtureActionStateValues = ['ready', 'blocked', 'saving', 'submitting', 'succeeded', 'failed', 'retryable', 'cancelled', 'terminal', 'parent-refresh-required'] as const;

export function buildCandidateDetailPath(context: CandidateContextSegments): string {
  return ['/candidate', context.candidateId, context.jobId, context.status, context.order, context.filters, context.interview]
    .filter(Boolean)
    .join('/');
}

export function buildCandidateActionPath(kind: CandidateActionKind, context: CandidateContextSegments, cvId: string): string {
  const parentPath = buildCandidateDetailPath(context);
  if (kind === 'reject') return `${parentPath}/cv-reject/${cvId}`;
  return `${parentPath}/cv/${cvId}/${kind}`;
}

export function parseCandidateContextFromPathname(pathname: string): CandidateContextSegments {
  const match = matchRouteMetadata(pathname);
  if (!match || match.metadata.domain !== 'candidates') {
    throw new Error(`Path is not a registered candidate route: ${pathname}`);
  }

  const { candidateId, jobId, status, order, filters, interview } = match.params;
  return { candidateId, jobId, status, order, filters, interview };
}

export function validateCandidateDetailSearch(search: Record<string, unknown>): CandidateRouteSearch {
  const entry =
    typeof search.entry === 'string' && (entryModeValues as readonly string[]).includes(search.entry)
      ? (search.entry as CandidateRouteEntryMode)
      : 'direct';

  const degrade =
    typeof search.degrade === 'string'
      ? search.degrade
          .split(',')
          .map((value) => value.trim())
          .filter((value): value is CandidateDegradedSection => (degradedSectionValues as readonly string[]).includes(value))
      : [];

  const returnTo = entry === 'database' ? sanitizeCandidateDatabaseReturnTarget(search.returnTo) : undefined;
  const fixtureAction =
    typeof search.fixtureAction === 'string' && (fixtureActionValues as readonly string[]).includes(search.fixtureAction)
      ? (search.fixtureAction as CandidateHubActionKind)
      : undefined;
  const fixtureActionState =
    typeof search.fixtureActionState === 'string' && (fixtureActionStateValues as readonly string[]).includes(search.fixtureActionState)
      ? (search.fixtureActionState as CandidateHubActionFixtureState)
      : undefined;

  return { entry, degrade, returnTo, fixtureAction, fixtureActionState };
}

export function validateCandidateTaskSearch(search: Record<string, unknown>): CandidateTaskSearch {
  const entry =
    typeof search.entry === 'string' && (entryModeValues as readonly string[]).includes(search.entry)
      ? (search.entry as CandidateRouteEntryMode)
      : 'direct';

  const parent = typeof search.parent === 'string' && search.parent.startsWith('/candidate/') ? search.parent : undefined;
  return { entry, parent };
}

export function parseCandidateDetailSearchFromUrl(searchValue: string): CandidateRouteSearch {
  const params = new URLSearchParams(searchValue);
  return validateCandidateDetailSearch(Object.fromEntries(params.entries()));
}

export function parseCandidateTaskSearchFromUrl(searchValue: string): CandidateTaskSearch {
  const params = new URLSearchParams(searchValue);
  return validateCandidateTaskSearch(Object.fromEntries(params.entries()));
}

export function buildCandidateParentRefreshTarget(parentTarget: string) {
  try {
    const url = new URL(parentTarget, 'http://recruit.local');
    if (url.origin !== 'http://recruit.local' || !url.pathname.startsWith('/candidate/')) return parentTarget;
    url.searchParams.set('refresh', 'candidate');
    return `${url.pathname}${url.search}`;
  } catch {
    return parentTarget;
  }
}

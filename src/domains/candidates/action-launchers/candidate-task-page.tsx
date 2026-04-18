import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { observability } from '../../../app/observability';
import { resolveCandidateActionContext } from './candidate-action-context';
import { completeCandidateAction, getCandidateRecord } from '../support/store';
import { parseCandidateContextFromPathname, parseCandidateTaskSearchFromUrl } from '../support/routing';
import type { CandidateActionKind } from '../support/models';

function getActionKind(pathname: string): CandidateActionKind {
  if (pathname.endsWith('/schedule')) return 'schedule';
  if (pathname.endsWith('/offer')) return 'offer';
  return 'reject';
}

function getCvIdFromPathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const rejectIndex = parts.indexOf('cv-reject');
  if (rejectIndex >= 0) return parts[rejectIndex + 1];
  const cvIndex = parts.indexOf('cv');
  return parts[cvIndex + 1] ?? 'cv-missing';
}

export function CandidateTaskRoutePage() {
  const location = useLocation();
  const search = parseCandidateTaskSearchFromUrl(window.location.search);
  const contextSegments = parseCandidateContextFromPathname(location.pathname);
  const kind = getActionKind(location.pathname);
  const actionContext = useMemo(
    () =>
      resolveCandidateActionContext({
        kind,
        pathname: location.pathname,
        context: contextSegments,
        cvId: getCvIdFromPathname(location.pathname),
        parent: search.parent,
        entryMode: search.entry,
      }),
    [contextSegments, kind, location.pathname, search.entry, search.parent],
  );
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    observability.telemetry.track({
      name: 'candidate_action_opened',
      data: {
        candidateId: actionContext.candidateId,
        taskType: actionContext.kind,
        parentRouteId: 'candidates.detail',
        correlationId: ensureCorrelationId(),
      },
    });
  }, [actionContext.candidateId, actionContext.kind]);

  function handleClose(outcome: 'cancel' | 'success') {
    if (outcome === 'cancel') {
      observability.telemetry.track({
        name: 'taskflow_cancelled',
        data: { taskType: actionContext.kind, correlationId: ensureCorrelationId() },
      });
    }
    window.location.assign(actionContext.returnTarget);
  }

  function handleComplete() {
    setActiveCorrelationId(createCorrelationId());
    completeCandidateAction(actionContext.candidateId, actionContext.kind);
    observability.telemetry.track({
      name: 'candidate_action_succeeded',
      data: {
        candidateId: actionContext.candidateId,
        taskType: actionContext.kind,
        correlationId: ensureCorrelationId(),
      },
    });
    observability.telemetry.track({
      name: 'taskflow_succeeded',
      data: { taskType: actionContext.kind, correlationId: ensureCorrelationId() },
    });
    window.location.assign(actionContext.returnTarget);
  }

  function handleFailure() {
    setFailure('The task could not complete. Recovery stays on the candidate hub.');
    observability.telemetry.track({
      name: 'candidate_action_failed',
      data: {
        candidateId: actionContext.candidateId,
        taskType: actionContext.kind,
        failureKind: 'simulated',
        correlationId: ensureCorrelationId(),
      },
    });
  }

  const record = getCandidateRecord(actionContext.candidateId);

  return (
    <section>
      <h1>Candidate task</h1>
      <p data-testid="candidate-task-kind">{actionContext.kind}</p>
      <p data-testid="candidate-task-candidate">{actionContext.candidateId}</p>
      <p data-testid="candidate-task-cv">{actionContext.cvId}</p>
      <p data-testid="candidate-task-parent">{actionContext.returnTarget}</p>
      <p data-testid="candidate-task-recovery">{actionContext.recoveryTarget}</p>
      <p data-testid="candidate-task-entry">{actionContext.entryMode}</p>
      <p data-testid="candidate-task-last-action">{record.lastAction}</p>
      {failure ? <p data-testid="candidate-task-failure">{failure}</p> : null}
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => handleClose('cancel')} data-testid="candidate-task-close-link">
          Close task
        </button>
        <button type="button" onClick={handleFailure} data-testid="candidate-task-fail-link">
          Simulate failure
        </button>
        <button type="button" onClick={handleComplete} data-testid="candidate-task-complete-link">
          Complete task
        </button>
      </div>
    </section>
  );
}

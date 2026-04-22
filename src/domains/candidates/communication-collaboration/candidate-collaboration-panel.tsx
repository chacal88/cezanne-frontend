import { buildCandidateConversationHandoff } from '../../inbox/support';
import type { CandidateDetailView } from '../support/models';
import { buildCandidateDetailPath } from '../support/routing';

export function CandidateCollaborationPanel({ view }: { view: CandidateDetailView }) {
  const degraded = view.degradedSections.includes('collaboration');
  const recoveryTarget = buildCandidateDetailPath({
    candidateId: view.candidateSummary.candidateId,
    jobId: view.jobContext?.jobId,
    status: view.jobContext?.status,
    order: view.jobContext?.order,
    filters: view.jobContext?.filters,
    interview: view.jobContext?.interview,
  });
  const handoff = buildCandidateConversationHandoff({
    candidateId: view.candidateSummary.candidateId,
    conversationId: view.collaboration.conversationId,
    canOpenCandidateConversation: !degraded,
    recoveryTarget,
  });

  return (
    <section className="candidate-product-panel" data-testid="candidate-collaboration-panel">
      <h2>Collaboration</h2>
      <p data-testid="candidate-comments-state">{degraded ? 'collaboration unavailable' : `${view.comments.length} comments`}</p>
      <p data-testid="candidate-tags-state">{degraded ? 'tags unavailable' : view.collaboration.tags.join(', ')}</p>
      {handoff.status === 'opened' ? (
        <a className="candidate-product-link candidate-product-link--secondary" href={handoff.target.path} data-testid="candidate-open-conversation-link">
          Open candidate conversation
        </a>
      ) : (
        <p data-testid="candidate-conversation-handoff-state">{handoff.state.kind}</p>
      )}
    </section>
  );
}

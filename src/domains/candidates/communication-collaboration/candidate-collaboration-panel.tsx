import type { CandidateDetailView } from '../support/models';

export function CandidateCollaborationPanel({ view }: { view: CandidateDetailView }) {
  const degraded = view.degradedSections.includes('collaboration');

  return (
    <section>
      <h2>Collaboration</h2>
      <p data-testid="candidate-comments-state">{degraded ? 'collaboration unavailable' : `${view.comments.length} comments`}</p>
      <p data-testid="candidate-tags-state">{degraded ? 'tags unavailable' : view.collaboration.tags.join(', ')}</p>
      <a href={`/inbox?conversation=${view.collaboration.conversationId}`} data-testid="candidate-open-conversation-link">
        Open candidate conversation
      </a>
    </section>
  );
}

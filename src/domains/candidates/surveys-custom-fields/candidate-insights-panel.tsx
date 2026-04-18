import type { CandidateDetailView } from '../support/models';

export function CandidateInsightsPanel({ view }: { view: CandidateDetailView }) {
  const surveysDegraded = view.degradedSections.includes('surveys');
  const fieldsDegraded = view.degradedSections.includes('custom-fields');
  const feedbackDegraded = view.degradedSections.includes('feedback');

  return (
    <section>
      <h2>Surveys and feedback</h2>
      <p data-testid="candidate-surveys-state">{surveysDegraded ? 'surveys unavailable' : view.surveysSummary.status}</p>
      <p data-testid="candidate-interviews-state">{feedbackDegraded ? 'feedback unavailable' : view.interviewsSummary.status}</p>
      <ul data-testid="candidate-custom-fields">
        {fieldsDegraded
          ? [<li key="unavailable">custom fields unavailable</li>]
          : view.customFields.map((field) => <li key={field.label}>{field.label}: {field.value}</li>)}
      </ul>
    </section>
  );
}

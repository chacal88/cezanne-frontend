export type TemplatesRouteKind = 'index' | 'detail' | 'smart-questions' | 'diversity-questions' | 'interview-scoring';

export type TemplatesRouteState =
  | { kind: 'index' }
  | { kind: 'detail'; templateId: string }
  | { kind: 'smart-questions' }
  | { kind: 'diversity-questions' }
  | { kind: 'interview-scoring' };

export type TemplateSummary = {
  id: string;
  title: string;
};

export type TemplatesSettingsConfigView = {
  summaries: TemplateSummary[];
  smartQuestionsTitle: string;
  diversityQuestionsTitle: string;
  interviewScoringTitle: string;
  simulateSubmissionFailure: boolean;
};

export type TemplatesResolvedView = {
  requested: TemplatesRouteKind;
  active: TemplatesRouteKind;
  fallbackReason: 'matched' | 'fallback_unavailable';
};

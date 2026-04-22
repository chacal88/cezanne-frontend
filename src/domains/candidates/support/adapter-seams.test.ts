import { describe, expect, it } from 'vitest';
import { candidateFixtureDataAdapter } from './store';

describe('candidate data adapter seam', () => {
  it('exposes replaceable fixture operations without inventing backend APIs', () => {
    const before = candidateFixtureDataAdapter.getCandidateRecord('candidate-123');
    const request = candidateFixtureDataAdapter.completeCandidateAction(before.id, 'schedule');
    const after = candidateFixtureDataAdapter.getCandidateRecord(before.id);

    expect(after.lastAction).toBe('schedule completed');
    expect(request.method).toBe('POST');
  });

  it('returns a stable fallback record for unknown candidate ids', () => {
    const first = candidateFixtureDataAdapter.getCandidateRecord('api-candidate-1');
    const second = candidateFixtureDataAdapter.getCandidateRecord('api-candidate-1');

    expect(second).toBe(first);
  });
});

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
});

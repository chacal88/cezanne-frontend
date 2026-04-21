import { withCorrelationHeaders } from '../../../lib/api-client';
import type { CandidateActionKind } from './models';

export type CandidateRecord = {
  id: string;
  cvId: string;
  name: string;
  stage: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  lastAction: string;
  comments: string[];
  tags: string[];
  conversationId: string;
  formsCount: number;
  formsStatus: string;
  candidateOwnedDocuments: number;
  contractsCount: number;
  contractsStatus: string;
  interviewsCount: number;
  interviewsStatus: string;
  surveysCount: number;
  surveysStatus: string;
  customFields: Array<{ label: string; value: string }>;
  cvVersion: number;
  previewPath: string;
  downloadPath: string;
  updatedAt: string;
};


export type CandidateDataAdapter = {
  getCandidateRecord(candidateId: string): CandidateRecord;
  completeCandidateAction(candidateId: string, kind: CandidateActionKind): RequestInit;
  uploadCandidateCv(candidateId: string): RequestInit;
};

const storageKey = 'candidate-store-v1';
const seededRecords: CandidateRecord[] = [
  {
    id: 'candidate-123',
    cvId: 'cv-123',
    name: 'Riley Candidate',
    stage: 'screening',
    headline: 'Product recruiter shortlist candidate',
    email: 'riley@example.test',
    phone: '+1-555-0100',
    location: 'Austin, TX',
    lastAction: 'Initial hub load',
    comments: ['Strong recruiter notes', 'Awaiting next interview slot'],
    tags: ['priority', 'remote'],
    conversationId: 'conversation-321',
    formsCount: 2,
    formsStatus: 'awaiting recruiter review',
    candidateOwnedDocuments: 1,
    contractsCount: 1,
    contractsStatus: 'ready',
    interviewsCount: 1,
    interviewsStatus: 'scheduled',
    surveysCount: 1,
    surveysStatus: 'ready',
    customFields: [
      { label: 'Notice period', value: '30 days' },
      { label: 'Preferred location', value: 'Remote' },
    ],
    cvVersion: 1,
    previewPath: '/assets/candidate-123-cv-v1.pdf',
    downloadPath: '/assets/candidate-123-cv-v1.pdf?download=1',
    updatedAt: '2026-04-18T10:00:00Z',
  },
  {
    id: 'candidate-456',
    cvId: 'cv-456',
    name: 'Morgan Applicant',
    stage: 'interview',
    headline: 'Operations specialist in active process',
    email: 'morgan@example.test',
    phone: '+1-555-0101',
    location: 'Denver, CO',
    lastAction: 'Candidate sequence available',
    comments: ['Review feedback requested'],
    tags: ['onsite'],
    conversationId: 'conversation-654',
    formsCount: 1,
    formsStatus: 'completed',
    candidateOwnedDocuments: 2,
    contractsCount: 0,
    contractsStatus: 'not-started',
    interviewsCount: 2,
    interviewsStatus: 'feedback pending',
    surveysCount: 0,
    surveysStatus: 'not-enabled',
    customFields: [{ label: 'Preferred shift', value: 'Morning' }],
    cvVersion: 2,
    previewPath: '/assets/candidate-456-cv-v2.pdf',
    downloadPath: '/assets/candidate-456-cv-v2.pdf?download=1',
    updatedAt: '2026-04-18T09:00:00Z',
  },
  {
    id: 'candidate-degraded',
    cvId: 'cv-degraded',
    name: 'Taylor Partial',
    stage: 'offer',
    headline: 'Deliberately degraded candidate demo',
    email: 'taylor@example.test',
    phone: '+1-555-0102',
    location: 'Chicago, IL',
    lastAction: 'Partial downstream degradation',
    comments: ['Contracts backend unavailable'],
    tags: ['degraded'],
    conversationId: 'conversation-987',
    formsCount: 1,
    formsStatus: 'awaiting docs',
    candidateOwnedDocuments: 1,
    contractsCount: 1,
    contractsStatus: 'provider-down',
    interviewsCount: 1,
    interviewsStatus: 'complete',
    surveysCount: 1,
    surveysStatus: 'complete',
    customFields: [{ label: 'Work authorization', value: 'Verified' }],
    cvVersion: 1,
    previewPath: '/assets/candidate-degraded-cv-v1.pdf',
    downloadPath: '/assets/candidate-degraded-cv-v1.pdf?download=1',
    updatedAt: '2026-04-18T08:00:00Z',
  },
];

const candidateState = new Map<string, CandidateRecord>(seededRecords.map((record) => [record.id, record]));
const listeners = new Set<() => void>();
let hydrated = false;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function hydrateFromStorage() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  const raw = window.sessionStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const records = JSON.parse(raw) as CandidateRecord[];
    candidateState.clear();
    records.forEach((record) => candidateState.set(record.id, record));
  } catch {
    window.sessionStorage.removeItem(storageKey);
  }
}

function persistToStorage() {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(storageKey, JSON.stringify(Array.from(candidateState.values())));
}

function emitChange() {
  persistToStorage();
  listeners.forEach((listener) => listener());
}

export function subscribeCandidateStore(listener: () => void) {
  hydrateFromStorage();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCandidateRecord(candidateId: string): CandidateRecord {
  hydrateFromStorage();
  return (
    candidateState.get(candidateId) ?? {
      id: candidateId,
      cvId: `cv-${candidateId}`,
      name: `Candidate ${candidateId}`,
      stage: 'screening',
      headline: `Fallback seeded candidate for ${candidateId}`,
      email: `${candidateId}@example.test`,
      phone: '+1-555-0109',
      location: 'Remote',
      lastAction: 'Direct entry fallback',
      comments: ['Generated from route context'],
      tags: ['generated'],
      conversationId: 'conversation-fallback',
      formsCount: 0,
      formsStatus: 'not-started',
      candidateOwnedDocuments: 0,
      contractsCount: 0,
      contractsStatus: 'not-started',
      interviewsCount: 0,
      interviewsStatus: 'not-started',
      surveysCount: 0,
      surveysStatus: 'not-started',
      customFields: [],
      cvVersion: 1,
      previewPath: `/assets/${candidateId}-cv-v1.pdf`,
      downloadPath: `/assets/${candidateId}-cv-v1.pdf?download=1`,
      updatedAt: '2026-04-18T07:00:00Z',
    }
  );
}

export function buildCandidateWorkflowRequest(method: 'POST' | 'PATCH' | 'DELETE') {
  return withCorrelationHeaders({
    method,
    headers: {
      'content-type': 'application/json',
    },
  });
}

export function completeCandidateAction(candidateId: string, kind: CandidateActionKind) {
  const requestInit = buildCandidateWorkflowRequest('POST');
  const record = getCandidateRecord(candidateId);
  const nextRecord: CandidateRecord = {
    ...record,
    stage: kind === 'reject' ? 'rejected' : kind === 'offer' ? 'offer' : 'interview',
    lastAction: `${kind} completed`,
    updatedAt: new Date().toISOString(),
    interviewsStatus: kind === 'schedule' ? 'scheduled' : record.interviewsStatus,
    contractsStatus: kind === 'offer' ? 'sent' : record.contractsStatus,
  };

  candidateState.set(candidateId, nextRecord);
  emitChange();
  return requestInit;
}

export function uploadCandidateCv(candidateId: string) {
  const requestInit = buildCandidateWorkflowRequest('POST');
  const record = getCandidateRecord(candidateId);
  const nextVersion = record.cvVersion + 1;
  const nextRecord: CandidateRecord = {
    ...record,
    lastAction: 'cv uploaded',
    cvVersion: nextVersion,
    candidateOwnedDocuments: record.candidateOwnedDocuments + 1,
    previewPath: `/assets/${candidateId}-cv-v${nextVersion}.pdf`,
    downloadPath: `/assets/${candidateId}-cv-v${nextVersion}.pdf?download=1`,
    updatedAt: new Date().toISOString(),
  };

  candidateState.set(candidateId, nextRecord);
  emitChange();
  return requestInit;
}

export const candidateFixtureDataAdapter: CandidateDataAdapter = {
  getCandidateRecord,
  completeCandidateAction,
  uploadCandidateCv,
};

import { createContext, useContext, type PropsWithChildren } from 'react';
import { evaluateCapabilities } from './evaluate-capabilities';
import type { AccessContext, Capabilities } from './types';

export const defaultAccessContext: AccessContext = {
  isAuthenticated: true,
  organizationType: 'hc',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: ['seeCandidates', 'jobRequisition'],
  subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox', 'rejectionReason'],
  rolloutFlags: ['customFieldsBeta'],
};

const accessContextOverrideStorageKey = 'recruit.accessContextOverride';

function parseAccessContextOverride(): AccessContext | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;

  const rawValue = window.localStorage.getItem(accessContextOverrideStorageKey);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<AccessContext>;
    return {
      ...defaultAccessContext,
      ...parsed,
      pivotEntitlements: Array.isArray(parsed.pivotEntitlements) ? parsed.pivotEntitlements : defaultAccessContext.pivotEntitlements,
      subscriptionCapabilities: Array.isArray(parsed.subscriptionCapabilities)
        ? parsed.subscriptionCapabilities
        : defaultAccessContext.subscriptionCapabilities,
      rolloutFlags: Array.isArray(parsed.rolloutFlags) ? parsed.rolloutFlags : defaultAccessContext.rolloutFlags,
    };
  } catch {
    return null;
  }
}

const AccessContextReact = createContext<{ access: AccessContext; capabilities: Capabilities } | null>(null);

export function AccessProvider({ children, value }: PropsWithChildren<{ value?: AccessContext }>) {
  const access = value ?? parseAccessContextOverride() ?? defaultAccessContext;
  const capabilities = evaluateCapabilities(access);
  return <AccessContextReact.Provider value={{ access, capabilities }}>{children}</AccessContextReact.Provider>;
}

export function useAccessContext() {
  const context = useContext(AccessContextReact);
  if (!context) throw new Error('useAccessContext must be used inside AccessProvider');
  return context.access;
}

export function useCapabilities() {
  const context = useContext(AccessContextReact);
  if (!context) throw new Error('useCapabilities must be used inside AccessProvider');
  return context.capabilities;
}

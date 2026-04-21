import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { evaluateCapabilities } from './evaluate-capabilities';
import type { AccessContext, Capabilities } from './types';

export const publicAccessContext: AccessContext = {
  isAuthenticated: false,
  organizationType: 'none',
  isAdmin: false,
  isSysAdmin: false,
  pivotEntitlements: [],
  subscriptionCapabilities: [],
  rolloutFlags: [],
};

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
const AccessSessionReact = createContext<{ setAccessContext: (next: AccessContext) => void; resetAccessContext: () => void } | null>(null);

export function AccessProvider({ children, value, initialValue }: PropsWithChildren<{ value?: AccessContext; initialValue?: AccessContext }>) {
  const [uncontrolledAccess, setUncontrolledAccess] = useState<AccessContext>(() => initialValue ?? parseAccessContextOverride() ?? defaultAccessContext);
  const access = value ?? uncontrolledAccess;
  const capabilities = useMemo(() => evaluateCapabilities(access), [access]);
  const sessionActions = useMemo(() => ({
    setAccessContext: (next: AccessContext) => {
      if (!value) setUncontrolledAccess(next);
    },
    resetAccessContext: () => {
      if (!value) setUncontrolledAccess(publicAccessContext);
    },
  }), [value]);

  return (
    <AccessSessionReact.Provider value={sessionActions}>
      <AccessContextReact.Provider value={{ access, capabilities }}>{children}</AccessContextReact.Provider>
    </AccessSessionReact.Provider>
  );
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

export function useAccessSession() {
  const context = useContext(AccessSessionReact);
  if (!context) throw new Error('useAccessSession must be used inside AccessProvider');
  return context;
}

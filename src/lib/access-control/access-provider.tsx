import { createContext, useContext, type PropsWithChildren } from 'react';
import { evaluateCapabilities } from './evaluate-capabilities';
import type { AccessContext, Capabilities } from './types';

const defaultAccessContext: AccessContext = {
  isAuthenticated: true,
  organizationType: 'hc',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: ['seeCandidates', 'jobRequisition'],
  subscriptionCapabilities: ['calendarIntegration'],
  rolloutFlags: [],
};

const AccessContextReact = createContext<{ access: AccessContext; capabilities: Capabilities } | null>(null);

export function AccessProvider({ children, value = defaultAccessContext }: PropsWithChildren<{ value?: AccessContext }>) {
  const capabilities = evaluateCapabilities(value);
  return <AccessContextReact.Provider value={{ access: value, capabilities }}>{children}</AccessContextReact.Provider>;
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

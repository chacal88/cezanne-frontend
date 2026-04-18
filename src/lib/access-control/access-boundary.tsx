import type { PropsWithChildren, ReactNode } from 'react';
import { useCapabilities } from './access-provider';
import type { Capabilities } from './types';

export function AccessBoundary({
  capability,
  fallback,
  children,
}: PropsWithChildren<{ capability: keyof Capabilities; fallback: ReactNode }>) {
  const capabilities = useCapabilities();
  if (!capabilities[capability]) return <>{fallback}</>;
  return <>{children}</>;
}

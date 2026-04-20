import { useEffect } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCapabilities } from '../../../lib/access-control';
import { observability } from '../../../app/observability';
import { getPlatformFallbackOutcome, platformRouteMetadata } from '../../../lib/platform';

export function HiringCompaniesFoundationPage() {
  const { t } = useTranslation('sysadmin');
  const capabilities = useCapabilities();
  const fallbackOutcome = getPlatformFallbackOutcome(capabilities, platformRouteMetadata.hiringCompanies);

  useEffect(() => {
    observability.telemetry.track({
      name: fallbackOutcome.allowed ? 'platform_route_entry' : 'platform_route_denied',
      data: {
        routeId: fallbackOutcome.routeId,
        routeFamily: fallbackOutcome.routeFamily,
        capability: fallbackOutcome.capability,
        capabilityOutcome: fallbackOutcome.capabilityOutcome,
        fallbackOutcome: fallbackOutcome.fallbackOutcome,
      },
    });

    if (!fallbackOutcome.allowed) {
      observability.telemetry.track({
        name: 'platform_fallback_used',
        data: {
          targetRouteId: fallbackOutcome.routeId,
          fallbackTarget: fallbackOutcome.fallbackTarget,
          fallbackMode: 'dashboard',
        },
      });
    }
  }, [fallbackOutcome]);

  if (!fallbackOutcome.allowed) {
    return <Navigate to={fallbackOutcome.fallbackTarget} replace />;
  }

  return (
    <section aria-labelledby="platform-placeholder-title">
      <p>{t('foundation.eyebrow')}</p>
      <h1 id="platform-placeholder-title">{t('foundation.hiringCompanies.title')}</h1>
      <p>{t('foundation.hiringCompanies.detail')}</p>
      <dl>
        <dt>{t('foundation.routeIdLabel')}</dt>
        <dd data-testid="platform-placeholder-route-id">{fallbackOutcome.routeId}</dd>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-placeholder-state">foundation-placeholder</dd>
      </dl>
    </section>
  );
}

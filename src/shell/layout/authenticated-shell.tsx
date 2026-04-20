import { useEffect, type PropsWithChildren } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getVisiblePlatformNavigation, getVisibleShellNavigation } from '../navigation/nav-registry';
import { useCapabilities } from '../../lib/access-control';
import { observability } from '../../app/observability';

export function AuthenticatedShell({ children }: PropsWithChildren) {
  const capabilities = useCapabilities();
  const navItems = getVisibleShellNavigation(capabilities);
  const platformGroups = getVisiblePlatformNavigation(capabilities);
  const { t } = useTranslation('shell');

  useEffect(() => {
    platformGroups.forEach((group) => {
      observability.telemetry.track({
        name: 'platform_nav_group_exposed',
        data: { navGroup: group.navGroup, implementationState: group.implementationState },
      });
    });
  }, [platformGroups]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t('authenticatedShell.title')}</h2>
        <nav style={{ display: 'grid', gap: 8 }}>
          {navItems.map((item) => (
            <Link key={`${item.to}-${item.labelKey}`} to={item.to as never} params={item.params as never} search={item.search as never}>
              {t(item.labelKey)}
            </Link>
          ))}
          {platformGroups.length > 0 ? (
            <section aria-labelledby="platform-navigation-heading" style={{ display: 'grid', gap: 6, marginTop: 16 }}>
              <h3 id="platform-navigation-heading" style={{ margin: 0 }}>
                {t('platformNavigation.label')}
              </h3>
              {platformGroups.map((group) => (
                <div key={group.navGroup} data-testid={`platform-nav-${group.navGroup}`}>
                  <strong>{t(group.labelKey)}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 12 }}>{t('platformNavigation.unavailable')}</p>
                </div>
              ))}
            </section>
          ) : null}
        </nav>
      </aside>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}

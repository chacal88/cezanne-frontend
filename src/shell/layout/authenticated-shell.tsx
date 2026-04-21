import { useEffect, type PropsWithChildren } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getVisibleAccountNavigation, getVisiblePlatformNavigation, getVisibleShellNavigation } from '../navigation/nav-registry';
import { useAccessContext, useCapabilities } from '../../lib/access-control';
import { observability } from '../../app/observability';
import './authenticated-shell.css';

export function AuthenticatedShell({ children }: PropsWithChildren) {
  const capabilities = useCapabilities();
  const accessContext = useAccessContext();
  const navItems = getVisibleShellNavigation(capabilities);
  const accountItems = getVisibleAccountNavigation(capabilities, accessContext);
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
    <div className="recruit-shell">
      <aside className="recruit-shell__sidebar">
        <a className="recruit-shell__logo" href="/dashboard" aria-label="Cezanne Recruitment">
          <img src="/assets/img/cezanne/cezanne_recruitment_logo_2026_white1x.png" alt="Cezanne Recruitment" />
        </a>
        <div className="recruit-shell__org">
          <span className="recruit-shell__org-avatar" />
          <span><strong>{accessContext.organizationType === 'ra' ? 'Recruitment agency' : accessContext.organizationType === 'hc' ? 'Hiring company' : 'Platform'}</strong><span>{accessContext.isSysAdmin ? 'SysAdmin' : 'Recruiter'}</span></span>
        </div>
        <nav className="recruit-shell__nav" aria-label={t('authenticatedShell.title')}>
          {navItems.map((item) => (
            <Link key={`${item.to}-${item.labelKey}`} to={item.to as never} params={item.params as never} search={item.search as never}>
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        {accountItems.length > 0 ? (
          <section className="recruit-shell__account" aria-labelledby="account-navigation-heading">
            <h3 id="account-navigation-heading">{t('accountNavigation.label')}</h3>
            {accountItems.map((link) => <Link key={link.to} to={link.to as never}>{t(link.labelKey)}</Link>)}
          </section>
        ) : null}
      </aside>
      <div className="recruit-shell__main">
        <header className="recruit-shell__topbar"><a>Get help</a><span>🔔</span><span>👤</span></header>
        <main className="recruit-shell__content">{children}</main>
      </div>
    </div>
  );
}

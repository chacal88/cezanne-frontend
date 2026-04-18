import type { PropsWithChildren } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getVisibleShellNavigation } from '../navigation/nav-registry';
import { useCapabilities } from '../../lib/access-control';

export function AuthenticatedShell({ children }: PropsWithChildren) {
  const capabilities = useCapabilities();
  const navItems = getVisibleShellNavigation(capabilities);
  const { t } = useTranslation('shell');

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
        </nav>
      </aside>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}

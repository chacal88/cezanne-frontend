import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

export function PublicShell({ children }: PropsWithChildren) {
  const { t } = useTranslation('auth');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <header style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, color: '#666' }}>{t('publicShell.eyebrow')}</p>
          <h1 style={{ margin: '8px 0 0' }}>{t('publicShell.title')}</h1>
        </header>
        {children}
      </div>
    </div>
  );
}

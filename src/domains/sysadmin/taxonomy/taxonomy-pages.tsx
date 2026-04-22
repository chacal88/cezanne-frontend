import { useTranslation } from 'react-i18next';
import {
  buildSectorDetailState,
  buildSectorListState,
  buildSubsectorDetailState,
  buildSubsectorListState,
  parseTaxonomyStateKind,
  type TaxonomyState,
} from './support/taxonomy-state';

export function SectorListPage({ search = {} }: { search?: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.sectorListTitle')} copy={t('taxonomy.sectorListCopy')} state={buildSectorListState(parseTaxonomyStateKind(search.fixtureState))} />;
}

export function SectorDetailPage({ sectorId, search = {} }: { sectorId: string; search?: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.sectorDetailTitle', { id: sectorId })} copy={t('taxonomy.sectorDetailCopy')} state={buildSectorDetailState(sectorId, parseTaxonomyStateKind(search.fixtureState))} />;
}

export function SubsectorListPage({ sectorId, search = {} }: { sectorId: string; search?: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.subsectorListTitle', { id: sectorId })} copy={t('taxonomy.subsectorListCopy')} state={buildSubsectorListState(sectorId, parseTaxonomyStateKind(search.fixtureState))} />;
}

export function SubsectorDetailPage({ subsectorId, search = {} }: { subsectorId: string; search?: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  const sectorId = typeof search.sectorId === 'string' ? search.sectorId : undefined;
  return <TaxonomySection title={t('taxonomy.subsectorDetailTitle', { id: subsectorId })} copy={t('taxonomy.subsectorDetailCopy')} state={buildSubsectorDetailState(subsectorId, sectorId, parseTaxonomyStateKind(search.fixtureState))} />;
}

function TaxonomySection({ title, copy, state }: { title: string; copy: string; state: TaxonomyState }) {
  const { t } = useTranslation('sysadmin');
  return (
    <section aria-labelledby="platform-taxonomy-title">
      <p>{t('taxonomy.eyebrow')}</p>
      <h1 id="platform-taxonomy-title">{title}</h1>
      <p>{copy}</p>
      <dl>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-taxonomy-state">{state.kind}</dd>
        <dt>{t('taxonomy.surfaceLabel')}</dt>
        <dd>{state.surface}</dd>
        <dt>{t('taxonomy.parentTargetLabel')}</dt>
        <dd>{state.parentTarget}</dd>
      </dl>
    </section>
  );
}

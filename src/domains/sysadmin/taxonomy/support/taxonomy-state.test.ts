import { buildSectorDetailState, buildSectorListState, buildSubsectorDetailState, buildSubsectorListState, parseTaxonomyStateKind } from './taxonomy-state';

describe('platform taxonomy state', () => {
  it('models taxonomy as platform route family outside settings and master data', () => {
    expect(buildSectorListState()).toMatchObject({
      surface: 'sector-list',
      routeFamily: 'taxonomy',
      settingsSubsection: false,
      masterDataRoute: false,
      parentTarget: '/dashboard',
    });
  });

  it('models parent child return behavior', () => {
    expect(buildSectorDetailState('sector-1')).toMatchObject({ parentTarget: '/sectors' });
    expect(buildSubsectorListState('sector-1')).toMatchObject({ parentTarget: '/sectors/sector-1' });
    expect(buildSubsectorDetailState('subsector-1', 'sector-1')).toMatchObject({ parentTarget: '/sectors/sector-1/subsectors' });
    expect(buildSubsectorDetailState('subsector-1')).toMatchObject({ parentTarget: '/sectors' });
  });

  it('parses taxonomy fixture states for list detail and mutation frames', () => {
    expect(parseTaxonomyStateKind('mutation-success')).toBe('mutation-success');
    expect(parseTaxonomyStateKind('not-real')).toBe('ready');
  });

  it('exposes list detail denied stale error and mutation contracts on every taxonomy surface', () => {
    expect(buildSectorListState('denied')).toMatchObject({ surface: 'sector-list', kind: 'denied' });
    expect(buildSectorDetailState('sector-1', 'not-found')).toMatchObject({ surface: 'sector-detail', kind: 'not-found' });
    expect(buildSubsectorListState('sector-1', 'error')).toMatchObject({ surface: 'subsector-list', kind: 'error' });
    expect(buildSubsectorDetailState('subsector-1', 'sector-1', 'stale')).toMatchObject({ surface: 'subsector-detail', kind: 'stale' });
    expect(buildSubsectorDetailState('subsector-1', 'sector-1', 'mutation-error')).toMatchObject({ surface: 'subsector-detail', kind: 'mutation-error' });
  });
});

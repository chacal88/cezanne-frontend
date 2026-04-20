import { buildSectorDetailState, buildSectorListState, buildSubsectorDetailState, buildSubsectorListState } from './taxonomy-state';

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
});

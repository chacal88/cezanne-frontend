import { buildMarketplaceListViewModel, isMarketplaceListType, marketplaceRoutes } from './marketplace-state';

describe('RA marketplace state', () => {
  it('models supported marketplace list states outside billing and platform scope', () => {
    expect(marketplaceRoutes).toEqual({ list: '/jobmarket/$type', fallback: '/dashboard' });
    expect(isMarketplaceListType('fill')).toBe(true);
    expect(buildMarketplaceListViewModel('fill')).toMatchObject({
      state: 'ready',
      type: 'fill',
      itemCount: 1,
      parentTarget: '/dashboard',
      billingScope: false,
      platformScope: false,
    });
  });

  it('models bidding cvs assigned and empty list states', () => {
    expect(buildMarketplaceListViewModel('bidding')).toMatchObject({ state: 'ready', itemCount: 1 });
    expect(buildMarketplaceListViewModel('cvs')).toMatchObject({ state: 'ready', itemCount: 1 });
    expect(buildMarketplaceListViewModel('assigned')).toMatchObject({ state: 'ready', itemCount: 1 });
    expect(buildMarketplaceListViewModel('assigned', { forceEmpty: true })).toMatchObject({
      state: 'empty',
      itemCount: 0,
      billingScope: false,
      platformScope: false,
    });
  });

  it('models unknown marketplace type as unavailable', () => {
    expect(isMarketplaceListType('unknown')).toBe(false);
    expect(buildMarketplaceListViewModel('unknown')).toMatchObject({
      state: 'unavailable',
      type: 'unknown',
      itemCount: 0,
      parentTarget: '/dashboard',
      billingScope: false,
      platformScope: false,
      unavailableReason: 'Marketplace type is unavailable',
    });
  });
});

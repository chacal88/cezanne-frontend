export type MarketplaceListType = 'fill' | 'bidding' | 'cvs' | 'assigned';
export type MarketplaceListState = 'ready' | 'empty' | 'unavailable';

export type MarketplaceItem = {
  id: string;
  title: string;
  type: MarketplaceListType;
};

export const marketplaceRoutes = {
  list: '/jobmarket/$type',
  fallback: '/dashboard',
} as const;

const items: MarketplaceItem[] = [
  { id: 'fill-1', title: 'Fill frontend role', type: 'fill' },
  { id: 'bidding-1', title: 'Bid on backend role', type: 'bidding' },
  { id: 'cvs-1', title: 'CVs awaiting review', type: 'cvs' },
  { id: 'assigned-1', title: 'Assigned recruiter collaboration', type: 'assigned' },
];

export function isMarketplaceListType(type: string): type is MarketplaceListType {
  return type === 'fill' || type === 'bidding' || type === 'cvs' || type === 'assigned';
}

export function buildMarketplaceListViewModel(type: string, options: { forceEmpty?: boolean } = {}) {
  if (!isMarketplaceListType(type)) {
    return {
      state: 'unavailable' as MarketplaceListState,
      type,
      items: [] as MarketplaceItem[],
      itemCount: 0,
      parentTarget: '/dashboard' as const,
      billingScope: false,
      platformScope: false,
      unavailableReason: 'Marketplace type is unavailable',
    };
  }

  const visibleItems = options.forceEmpty ? [] : items.filter((item) => item.type === type);

  return {
    state: visibleItems.length > 0 ? 'ready' as MarketplaceListState : 'empty' as MarketplaceListState,
    type,
    items: visibleItems,
    itemCount: visibleItems.length,
    parentTarget: '/dashboard' as const,
    billingScope: false,
    platformScope: false,
  };
}

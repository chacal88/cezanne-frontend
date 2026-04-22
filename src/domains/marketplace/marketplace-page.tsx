import { buildMarketplaceListViewModel } from './support/marketplace-state';

export function MarketplaceListPage({ type }: { type: string }) {
  const forceEmpty = new URLSearchParams(window.location.search).get('state') === 'empty';
  const view = buildMarketplaceListViewModel(type, { forceEmpty });

  return (
    <section>
      <h1>Marketplace</h1>
      <p>RA marketplace foundation</p>
      <p data-testid="marketplace-type">{view.type}</p>
      <p data-testid="marketplace-state">{view.state}</p>
      <p data-testid="marketplace-item-count">{view.itemCount}</p>
      <p data-testid="marketplace-billing-scope">{String(view.billingScope)}</p>
      <p data-testid="marketplace-platform-scope">{String(view.platformScope)}</p>
      {view.unavailableReason ? <p data-testid="marketplace-unavailable-reason">{view.unavailableReason}</p> : null}
      <ul>
        {view.items.map((item) => (
          <li key={item.id} data-testid={`marketplace-item-${item.type}`}>
            {item.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

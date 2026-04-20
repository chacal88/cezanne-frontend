import { Link } from '@tanstack/react-router';
import { buildOrgFavoriteDetailViewModel, buildOrgFavoriteRequestViewModel, buildOrgFavoritesListViewModel } from './support/favorites-state';

export function OrgFavoritesIndexPage() {
  const view = buildOrgFavoritesListViewModel();

  return (
    <section>
      <h1>Favorites</h1>
      <p>Org-scoped favorites</p>
      <p data-testid="favorites-state">{view.state}</p>
      <p data-testid="favorites-platform-request-queue">{String(view.platformRequestQueue)}</p>
      <p data-testid="favorites-personal-count">{view.personalCount}</p>
      <p data-testid="favorites-org-shared-count">{view.orgSharedCount}</p>
      <p data-testid="favorites-recruiter-linked-count">{view.recruiterLinkedCount}</p>
      <ul>
        {view.favorites.map((favorite) => (
          <li key={favorite.id} data-testid={`favorite-${favorite.ownership}`}>
            <Link to="/favorites/$favoriteId" params={{ favoriteId: favorite.id }}>
              {favorite.label}
            </Link>
            <span> — {favorite.ownership}</span>
          </li>
        ))}
      </ul>
      <Link to="/favorites/request" data-testid="favorite-request-create-link">
        Request favorite action
      </Link>
    </section>
  );
}

export function OrgFavoriteDetailPage({ favoriteId }: { favoriteId: string }) {
  const view = buildOrgFavoriteDetailViewModel(favoriteId);

  return (
    <section>
      <p>Org favorite detail</p>
      <h1>{view.favorite?.label ?? 'Favorite unavailable'}</h1>
      <p data-testid="favorite-detail-state">{view.state}</p>
      <p data-testid="favorite-detail-platform-request-queue">{String(view.platformRequestQueue)}</p>
      {view.favorite ? <p data-testid="favorite-detail-ownership">{view.favorite.ownership}</p> : null}
      {view.unavailableReason ? <p data-testid="favorite-detail-unavailable-reason">{view.unavailableReason}</p> : null}
      <Link to={view.parentTarget} data-testid="favorite-detail-parent-link">
        Back to favorites
      </Link>
    </section>
  );
}

export function OrgFavoriteRequestPage({ requestId }: { requestId?: string }) {
  const view = buildOrgFavoriteRequestViewModel(requestId);

  return (
    <section>
      <p>Org favorite request</p>
      <h1>{view.request.title}</h1>
      <p data-testid="favorite-request-state">{view.state}</p>
      <p data-testid="favorite-request-platform-request-queue">{String(view.platformRequestQueue)}</p>
      {view.request.unavailableReason ? <p data-testid="favorite-request-unavailable-reason">{view.request.unavailableReason}</p> : null}
      <ul>
        {view.actions.map((action) => (
          <li key={action.action} data-testid={`favorite-request-action-${action.action}`}>
            {action.label}: {action.state}
          </li>
        ))}
      </ul>
      <Link to={view.parentTarget} data-testid="favorite-request-parent-link">
        Back to favorites
      </Link>
    </section>
  );
}

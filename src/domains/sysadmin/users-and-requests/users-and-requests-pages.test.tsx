import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../testing/render';
import { PlatformFavoriteRequestDetailPage, PlatformFavoriteRequestsPage, PlatformUserCreatePage } from './users-and-requests-pages';

describe('SysAdmin users and requests pages', () => {
  it('renders platform user create lifecycle fixture states', () => {
    renderWithProviders(<PlatformUserCreatePage search={{ fixtureState: 'saving', page: '2', search: 'alex' }} />);

    expect(screen.getByRole('heading', { name: 'Create platform user' })).toBeVisible();
    expect(screen.getByTestId('platform-users-requests-state')).toHaveTextContent('saving');
    expect(screen.getByText('/users?page=2&search=alex')).toBeVisible();
  });

  it('renders favorite request queue retry states', () => {
    renderWithProviders(<PlatformFavoriteRequestsPage search={{ fixtureState: 'action-failure' }} />);

    expect(screen.getByTestId('platform-users-requests-state')).toHaveTextContent('action-failure');
    expect(screen.getByTestId('platform-favorite-request-retry')).toHaveTextContent('true');
  });

  it('renders favorite request action failure as retryable action context', () => {
    renderWithProviders(<PlatformFavoriteRequestDetailPage requestId="request-1" fixtureState="action-failure" />);

    expect(screen.getByTestId('platform-favorite-request-action')).toHaveTextContent('available');
    expect(screen.getByTestId('platform-favorite-request-reject-action')).toHaveTextContent('available');
    expect(screen.getByTestId('platform-favorite-request-reopen-action')).toHaveTextContent('available');
    expect(screen.getByTestId('platform-favorite-request-retry')).toHaveTextContent('true');
  });
});

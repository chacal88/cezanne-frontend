import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../testing/render';
import { SectorDetailPage, SectorListPage, SubsectorDetailPage, SubsectorListPage } from './taxonomy-pages';

describe('SysAdmin taxonomy pages', () => {
  it('renders sector list denied hook', () => {
    renderWithProviders(<SectorListPage search={{ fixtureState: 'denied' }} />);

    expect(screen.getByTestId('platform-taxonomy-state')).toHaveTextContent('denied');
    expect(screen.getByText('sector-list')).toBeVisible();
  });

  it('renders sector detail not-found hook', () => {
    renderWithProviders(<SectorDetailPage sectorId="sector-1" search={{ fixtureState: 'not-found' }} />);

    expect(screen.getByTestId('platform-taxonomy-state')).toHaveTextContent('not-found');
    expect(screen.getByText('/sectors')).toBeVisible();
  });

  it('renders subsector list error hook', () => {
    renderWithProviders(<SubsectorListPage sectorId="sector-1" search={{ fixtureState: 'error' }} />);

    expect(screen.getByTestId('platform-taxonomy-state')).toHaveTextContent('error');
    expect(screen.getByText('/sectors/sector-1')).toBeVisible();
  });

  it('renders subsector detail stale and parent-sector hook', () => {
    renderWithProviders(<SubsectorDetailPage subsectorId="subsector-1" search={{ fixtureState: 'stale', sectorId: 'sector-1' }} />);

    expect(screen.getByTestId('platform-taxonomy-state')).toHaveTextContent('stale');
    expect(screen.getByText('/sectors/sector-1/subsectors')).toBeVisible();
  });
});

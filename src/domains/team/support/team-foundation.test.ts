import { buildOrgTeamViewModel, orgTeamRoutes } from './team-foundation';

describe('org team foundation view model', () => {
  it('keeps org team foundation out of platform scope', () => {
    expect(orgTeamRoutes).toEqual({ index: '/team', recruiters: '/team/recruiters', invite: '/users/invite' });
    expect(buildOrgTeamViewModel('team-index')).toMatchObject({
      kind: 'team-index',
      activeCount: 2,
      pendingInviteCount: 1,
      recruiterCount: 2,
      fallbackTarget: '/dashboard',
      platformScope: false,
    });
  });
});

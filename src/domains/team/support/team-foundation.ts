export type OrgTeamRouteKind = 'team-index' | 'recruiter-visibility' | 'invite-foundation';
export type OrgTeamMemberState = 'active' | 'pending-invite' | 'disabled';

export type OrgTeamMember = {
  id: string;
  name: string;
  role: 'admin' | 'recruiter';
  state: OrgTeamMemberState;
};

export const orgTeamRoutes = {
  index: '/team',
  recruiters: '/team/recruiters',
  invite: '/users/invite',
} as const;

const members: OrgTeamMember[] = [
  { id: 'member-1', name: 'Alex Admin', role: 'admin', state: 'active' },
  { id: 'member-2', name: 'Riley Recruiter', role: 'recruiter', state: 'active' },
  { id: 'member-3', name: 'Pending Member', role: 'recruiter', state: 'pending-invite' },
];

export function buildOrgTeamViewModel(kind: OrgTeamRouteKind) {
  return {
    kind,
    members,
    activeCount: members.filter((member) => member.state === 'active').length,
    pendingInviteCount: members.filter((member) => member.state === 'pending-invite').length,
    recruiterCount: members.filter((member) => member.role === 'recruiter').length,
    fallbackTarget: '/dashboard' as const,
    platformScope: false,
  };
}

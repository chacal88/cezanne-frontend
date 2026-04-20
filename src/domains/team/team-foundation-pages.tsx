import { Link } from '@tanstack/react-router';
import { buildOrgTeamViewModel, type OrgTeamRouteKind } from './support/team-foundation';

function OrgTeamFoundationPage({ kind, title }: { kind: OrgTeamRouteKind; title: string }) {
  const view = buildOrgTeamViewModel(kind);

  return (
    <section>
      <p>Org team foundation</p>
      <h1>{title}</h1>
      <p data-testid="org-team-route-kind">{view.kind}</p>
      <p data-testid="org-team-platform-scope">{String(view.platformScope)}</p>
      <p data-testid="org-team-active-count">{view.activeCount}</p>
      <p data-testid="org-team-pending-invite-count">{view.pendingInviteCount}</p>
      <p data-testid="org-team-recruiter-count">{view.recruiterCount}</p>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/team" data-testid="org-team-index-link">Team</Link>
        <Link to="/team/recruiters" data-testid="org-team-recruiters-link">Recruiters</Link>
        <Link to="/users/invite" data-testid="org-team-invite-link">Invite foundation</Link>
      </nav>
    </section>
  );
}

export function OrgTeamIndexPage() {
  return <OrgTeamFoundationPage kind="team-index" title="Team" />;
}

export function OrgRecruiterVisibilityPage() {
  return <OrgTeamFoundationPage kind="recruiter-visibility" title="Recruiter visibility" />;
}

export function OrgInviteFoundationPage() {
  return <OrgTeamFoundationPage kind="invite-foundation" title="Invite foundation" />;
}

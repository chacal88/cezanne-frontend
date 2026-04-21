import { Link } from "@tanstack/react-router";
import {
  buildOrgTeamViewModel,
  type OrgTeamRouteKind,
} from "./support/team-foundation";

function OrgTeamFoundationPage({
  kind,
  title,
}: {
  kind: OrgTeamRouteKind;
  title: string;
}) {
  const view = buildOrgTeamViewModel(kind);

  return (
    <section>
      <p>Org team foundation</p>
      <h1>{title}</h1>
      <p data-testid="org-team-route-kind">{view.kind}</p>
      <p data-testid="org-team-platform-scope">{String(view.platformScope)}</p>
      <p data-testid="org-team-readiness">{view.teamState.readiness}</p>
      <p data-testid="org-team-retryable">{String(view.teamState.retryable)}</p>
      <p data-testid="org-team-unknown-contract-count">
        {view.teamState.unknownContractFields.length}
      </p>
      <p data-testid="org-team-active-count">{view.activeCount}</p>
      <p data-testid="org-team-pending-invite-count">
        {view.pendingInviteCount}
      </p>
      <p data-testid="org-team-recruiter-count">{view.recruiterCount}</p>
      <p data-testid="org-team-invite-ready-action-count">
        {view.inviteReadyActionCount}
      </p>
      <p data-testid="org-team-invite-blocked-action-count">
        {view.inviteBlockedActionCount}
      </p>
      <p data-testid="org-team-membership-ready-action-count">
        {view.membershipReadyActionCount}
      </p>
      <p data-testid="org-team-membership-blocked-action-count">
        {view.membershipBlockedActionCount}
      </p>
      {kind === "team-index" ? (
        <section aria-label="Org team product-depth states">
          <h2>Team members</h2>
          <p data-testid="org-team-state-label">
            {view.teamState.readiness === "degraded"
              ? "Team data is partially available. Refresh to confirm the latest membership state."
              : "Team data is available."}
          </p>
          <ul>
            {view.teamState.members.map((member) => (
              <li key={member.id}>
                {member.name}: {member.role} / {member.state}
              </li>
            ))}
          </ul>
          <h2>Pending invites</h2>
          <p data-testid="org-team-refresh-required">
            {String(view.teamState.refreshRequired)}
          </p>
          <p data-testid="org-team-safe-telemetry-state">
            {view.telemetry.stateKind}
          </p>
        </section>
      ) : null}
      {kind === "recruiter-visibility" ? (
        <section aria-label="Recruiter visibility product-depth states">
          <h2>Recruiter visibility</h2>
          <p data-testid="org-recruiter-visibility-readiness">
            {view.recruiterVisibilityState.readiness}
          </p>
          <p data-testid="org-recruiter-visibility-filter">
            {view.recruiterVisibilityState.filter}
          </p>
          <p data-testid="org-recruiter-visibility-parent-target">
            {view.recruiterVisibilityState.parentTarget}
          </p>
          <p data-testid="org-recruiter-visibility-visible-count">
            {view.recruiterVisibilityState.visibleCount}
          </p>
          <p data-testid="org-recruiter-visibility-limited-count">
            {view.recruiterVisibilityState.limitedCount}
          </p>
          <p data-testid="org-recruiter-visibility-hidden-count">
            {view.recruiterVisibilityState.hiddenCount}
          </p>
          <p data-testid="org-recruiter-assignment-ready-count">
            {view.recruiterVisibilityState.assignmentReadyCount}
          </p>
          <p data-testid="org-recruiter-assignment-blocked-count">
            {view.recruiterVisibilityState.assignmentBlockedCount}
          </p>
          <ul>
            {view.recruiterVisibilityState.recruiters.map((recruiter) => (
              <li key={recruiter.id}>
                {recruiter.name}: {recruiter.visibility} / assignment{" "}
                {recruiter.assignmentReadiness}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {kind === "invite-foundation" ? (
        <section aria-label="Org invite actions">
          <h2>Invite management</h2>
          <ul>
            {view.inviteActionsByInvite.map(({ invite, actions }) => (
              <li key={invite.id}>
                <strong>{invite.email}</strong>
                <span> — {invite.state}</span>
                <ul>
                  {actions.map((action) => (
                    <li key={`${invite.id}-${action.action}`}>
                      {action.label}: {action.state}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section aria-label="Org membership readiness">
        <h2>Membership readiness</h2>
        <ul>
          {view.members.map((member) => (
            <li key={member.id}>
              {member.name}: {member.role} / {member.state}
            </li>
          ))}
        </ul>
      </section>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/team" data-testid="org-team-index-link">
          Team
        </Link>
        <Link to="/team/recruiters" data-testid="org-team-recruiters-link">
          Recruiters
        </Link>
        <Link to="/users/invite" data-testid="org-team-invite-link">
          Invite management
        </Link>
      </nav>
    </section>
  );
}

export function OrgTeamIndexPage() {
  return <OrgTeamFoundationPage kind="team-index" title="Team" />;
}

export function OrgRecruiterVisibilityPage() {
  return (
    <OrgTeamFoundationPage
      kind="recruiter-visibility"
      title="Recruiter visibility"
    />
  );
}

export function OrgInviteFoundationPage() {
  return (
    <OrgTeamFoundationPage kind="invite-foundation" title="Invite management" />
  );
}

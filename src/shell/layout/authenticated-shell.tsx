import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  getSidebarNavigationEntries,
  getVisibleAccountNavigation,
  getVisiblePlatformNavigation,
  type SidebarNavigationLink,
} from "../navigation/nav-registry";
import { useAccessContext, useCapabilities } from "../../lib/access-control";
import { observability } from "../../app/observability";
import "./authenticated-shell.css";

type SidebarGroup = {
  id: string;
  labelKey: string;
  icon: string;
  links: SidebarNavigationLink[];
};

const shellLabelFallbacks: Record<string, string> = {
  "navigation.jobsManage": "Manage jobs",
  "navigation.jobRequisitions": "Job requisitions",
  "navigation.templateEmail": "Email templates",
  "navigation.templateSmartQuestions": "Smart questions",
  "navigation.templateDiversityQuestions": "Diversity questions",
  "navigation.templateInterviewScoring": "Interview scorecards",
  "navigation.users": "Users",
  "navigation.recruiters": "Recruiter directory",
  "navigation.settings": "Settings",
  "navigation.userSettings": "User settings",
  "navigation.companySettings": "Company settings",
  "navigation.agencySettings": "Agency settings",
  "navigation.settingsApplicationPage": "iFrame pages",
  "navigation.settingsJobListings": "Job listings",
  "navigation.reportCandidates": "Candidates",
  "navigation.reportDiversity": "Diversity",
  "navigation.reportHiringProcess": "Hiring Process",
  "navigation.reportJobs": "Jobs",
  "navigation.reportSource": "Source",
  "navigation.reportTeams": "Team",
};

function useShellLabel() {
  const { t } = useTranslation("shell");
  return (key: string) =>
    t(key, { defaultValue: shellLabelFallbacks[key] ?? key });
}

function materializePath(link: Pick<SidebarNavigationLink, "to" | "params">) {
  return Object.entries(link.params ?? {}).reduce(
    (path, [key, value]) => path.replace(`$${key}`, value),
    link.to,
  );
}

function isLinkActive(
  pathname: string,
  link: Pick<SidebarNavigationLink, "to" | "params">,
) {
  const path = materializePath(link);
  if (pathname === path) return true;
  if (path !== "/" && pathname.startsWith(`${path}/`)) return true;
  return false;
}

function isGroupActive(pathname: string, group: SidebarGroup) {
  return group.links.some((link) => isLinkActive(pathname, link));
}

function NavLinkItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: SidebarNavigationLink;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const label = useShellLabel();
  return (
    <Link
      key={`${item.to}-${item.labelKey}-${item.id}`}
      to={item.to as never}
      params={item.params as never}
      search={item.search as never}
      title={label(item.labelKey)}
      className="recruit-shell__nav-item"
      activeProps={{ className: "recruit-shell__nav-item is-active" }}
      onClick={onNavigate}
    >
      {item.icon ? (
        <i
          className={`fas fa-${item.icon} recruit-shell__nav-icon`}
          aria-hidden="true"
        />
      ) : null}
      {!collapsed ? (
        <span className="recruit-shell__nav-label">{label(item.labelKey)}</span>
      ) : null}
      {item.badgeKey && !collapsed ? (
        <span className="recruit-shell__nav-badge">{label(item.badgeKey)}</span>
      ) : null}
    </Link>
  );
}

function NavGroupItem({
  group,
  collapsed,
  pathname,
}: {
  group: SidebarGroup;
  collapsed: boolean;
  pathname: string;
}) {
  const label = useShellLabel();
  const active = isGroupActive(pathname, group);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  const primaryLink = group.links[0];

  return (
    <div
      className={`recruit-shell__nav-group${open ? " is-open" : ""}${active ? " is-active" : ""}`}
    >
      <div className="recruit-shell__nav-group-row">
        <Link
          to={primaryLink.to as never}
          params={primaryLink.params as never}
          search={primaryLink.search as never}
          className="recruit-shell__nav-item recruit-shell__nav-group-trigger"
          activeProps={{
            className:
              "recruit-shell__nav-item recruit-shell__nav-group-trigger is-active",
          }}
          title={label(group.labelKey)}
        >
          <i
            className={`fas fa-${group.icon} recruit-shell__nav-icon`}
            aria-hidden="true"
          />
          {!collapsed ? (
            <span className="recruit-shell__nav-label">
              {label(group.labelKey)}
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            className="recruit-shell__nav-group-toggle"
            title={
              open
                ? `Collapse ${label(group.labelKey)}`
                : `Expand ${label(group.labelKey)}`
            }
            aria-label={
              open
                ? `Collapse ${label(group.labelKey)}`
                : `Expand ${label(group.labelKey)}`
            }
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <i
              className={`fas fa-caret-${open ? "up" : "down"} recruit-shell__nav-caret`}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
      {open ? (
        <div
          className="recruit-shell__submenu"
          role="group"
          aria-label={label(group.labelKey)}
        >
          {group.links.map((link) => (
            <NavLinkItem key={link.id} item={link} collapsed={collapsed} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AuthenticatedShell({ children }: PropsWithChildren) {
  const capabilities = useCapabilities();
  const accessContext = useAccessContext();
  const navEntries = getSidebarNavigationEntries(capabilities);
  const accountItems = getVisibleAccountNavigation(capabilities, accessContext);
  const platformGroups = getVisiblePlatformNavigation(capabilities);
  const { t } = useTranslation("shell");
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    platformGroups.forEach((group) => {
      observability.telemetry.track({
        name: "platform_nav_group_exposed",
        data: {
          navGroup: group.navGroup,
          implementationState: group.implementationState,
        },
      });
    });
  }, [platformGroups]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen]);

  const isCandidateDatabaseRoute = pathname === "/candidates-database";
  const shellClass = `recruit-shell${collapsed ? " recruit-shell--collapsed" : ""}${isCandidateDatabaseRoute ? " recruit-shell--candidate-database" : ""}`;
  const profileLink = accountItems.find((link) => link.id === "user-profile");
  const organizationProfileLink = accountItems.find(
    (link) =>
      link.id === "hiring-company-profile" ||
      link.id === "recruitment-agency-profile",
  );
  const logoutLink = accountItems.find((link) => link.id === "logout");

  const platformSidebarGroups: SidebarGroup[] = platformGroups.map((group) => ({
    id: group.navGroup,
    labelKey: group.labelKey,
    icon: group.icon,
    links: group.links.map((link) => ({
      id: `${group.navGroup}-${link.to}`,
      labelKey: link.labelKey,
      to: link.to,
      capability: link.capability,
      implementationState: "partial",
      icon: link.icon,
    })),
  }));

  return (
    <div className={shellClass}>
      <aside className="recruit-shell__sidebar">
        <a
          className="recruit-shell__logo"
          href="/dashboard"
          aria-label="Cezanne Recruitment"
        >
          <img
            src="/assets/img/cezanne/cezanne_recruitment_logo_2026_white1x.png"
            alt="Cezanne Recruitment"
          />
        </a>
        <nav
          className="recruit-shell__nav"
          aria-label={t("authenticatedShell.title")}
        >
          {platformSidebarGroups.length ? (
            <div className="recruit-shell__nav-section">
              {!collapsed ? (
                <div className="recruit-shell__nav-section-label">
                  {t("platformNavigation.label")}
                </div>
              ) : null}
              {platformSidebarGroups.map((group) => (
                <NavGroupItem
                  key={group.id}
                  group={group}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              ))}
            </div>
          ) : null}
          {navEntries.map((entry) => {
            if (entry.kind === "link")
              return (
                <NavLinkItem
                  key={entry.id}
                  item={entry}
                  collapsed={collapsed}
                />
              );
            return (
              <NavGroupItem
                key={entry.id}
                group={entry}
                collapsed={collapsed}
                pathname={pathname}
              />
            );
          })}
        </nav>
      </aside>
      <div className="recruit-shell__main">
        <header className="recruit-shell__topbar">
          <button
            type="button"
            className="recruit-shell__toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className="fas fa-bars" aria-hidden="true" />
          </button>
          <div className="recruit-shell__topbar-right">
            <a className="recruit-shell__help" href="#help">
              <i className="fas fa-question-circle" aria-hidden="true" /> Get
              help
            </a>
            <Link
              className="recruit-shell__notif"
              to="/notifications"
              aria-label="Notifications"
            >
              <i className="fas fa-bell" aria-hidden="true" />
              <span className="recruit-shell__notif-badge">19</span>
            </Link>
            <div className="recruit-shell__user" ref={userMenuRef}>
              <button
                type="button"
                className="recruit-shell__user-button"
                onClick={() => setUserMenuOpen((value) => !value)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <i className="fas fa-user-circle" aria-hidden="true" />
              </button>
              {userMenuOpen ? (
                <div className="recruit-shell__user-menu" role="menu">
                  <div className="recruit-shell__user-menu-header">
                    <div className="recruit-shell__user-menu-avatar">
                      <i className="fas fa-user" aria-hidden="true" />
                    </div>
                    <div className="recruit-shell__user-menu-name">
                      <strong>
                        {accessContext.isSysAdmin ? "SysAdmin" : "Recruiter"}
                      </strong>
                      <span>
                        {accessContext.organizationType === "ra"
                          ? "Recruitment agency"
                          : accessContext.organizationType === "hc"
                            ? "Hiring company"
                            : "Platform"}
                      </span>
                    </div>
                  </div>
                  {organizationProfileLink ? (
                    <Link
                      className="recruit-shell__user-menu-link"
                      to={organizationProfileLink.to as never}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t(organizationProfileLink.labelKey)}
                    </Link>
                  ) : null}
                  <div className="recruit-shell__user-menu-actions">
                    {profileLink ? (
                      <Link
                        className="recruit-shell__user-menu-profile"
                        to={profileLink.to as never}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <i className="fas fa-user" aria-hidden="true" /> Profile
                      </Link>
                    ) : null}
                    {logoutLink ? (
                      <Link
                        className="recruit-shell__user-menu-signout"
                        to={logoutLink.to as never}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Sign out
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="recruit-shell__content">{children}</main>
        <footer className="recruit-shell__footer">
          <div className="recruit-shell__footer-copy">
            <strong>
              Copyright &copy; {new Date().getFullYear()}{" "}
              <a href="http://cezannehr.com">Cezanne Recruitment</a>.
            </strong>{" "}
            All rights reserved.
          </div>
          <div className="recruit-shell__footer-version">
            <strong>Version</strong> dev
          </div>
        </footer>
      </div>
    </div>
  );
}

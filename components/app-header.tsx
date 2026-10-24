"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AgentLevel } from "@prisma/client";
import { SignOutButton } from "@/components/sign-out-button";
import type { WorkspaceChoice } from "@/components/workspace-switcher";
import { selectTenantAction } from "@/app/(app)/tenants/actions";
import { RoleSwitcher } from "@/components/role-switcher";
import {
  AGENT_MENU_LINKS,
  SWITCH_TENANT_LINK,
  initialsOf,
  isNavItemActive,
  realRoleOf,
  roleViewLabels,
} from "@/lib/header-nav";
import { AGENT_LEVEL_LABELS } from "@/lib/agents/levels";
import { isAdmin, isSuperAdmin, type AppRole } from "@/lib/roles";
import { Avatar } from "@/components/avatar";
import { AccountThemeSelector } from "@/components/theme-toggle";

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2";

export type ShellAgent = {
  id: string;
  name: string;
  level: string;
};

/** Closes a popover on outside click or Escape, returning focus to its trigger. */
function useDismiss(
  open: boolean,
  close: () => void,
  containerRef: React.RefObject<HTMLElement | null>,
  triggerRef?: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef?.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, containerRef, triggerRef]);
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.7V17c0 .6-.5 1-1 1.2-1.2.5-2 2-2 3.8" />
      <path d="M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 4v4" />
      <path d="M9 14h.01" />
      <path d="M15 14h.01" />
    </svg>
  );
}

function NotificationsBell({ unreadCount }: { unreadCount: number }) {
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";
  return (
    <button
      type="button"
      className="icon-button notifications-button inline-flex h-8 items-center justify-center rounded-full border border-zk-border bg-zk-surface px-2 text-zk-text hover:bg-zk-chip"
      data-action="notifications"
      aria-label={label}
    >
      <span data-icon="bell" aria-hidden="true">
        <BellIcon />
      </span>
      {unreadCount > 0 ? (
        <span className="notification-count inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-zk-surface bg-electric-blue-strong px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}

function levelLabel(level: string) {
  return level in AGENT_LEVEL_LABELS ? AGENT_LEVEL_LABELS[level as AgentLevel] : level;
}

/**
 * The active workspace pill for the light top bar: green status dot, workspace
 * name and a chevron. Choosing another workspace submits selectTenantAction,
 * the same switch the workspaces page and the sidebar switcher use.
 */
function HeaderWorkspaceSwitcher({
  workspaces,
  activeTenantId,
}: {
  workspaces: WorkspaceChoice[];
  activeTenantId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useDismiss(open, () => setOpen(false), rootRef, buttonRef);

  const counts = new Map<string, number>();
  for (const workspace of workspaces) {
    const key = workspace.name.toLocaleLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const shared = (name: string) => (counts.get(name.toLocaleLowerCase()) ?? 0) > 1;
  const selected = workspaces.find((w) => w.id === activeTenantId) ?? workspaces[0];

  if (!selected) {
    return (
      <Link
        href="/tenants"
        className={`inline-flex h-8 items-center rounded-full px-2 text-sm font-medium text-zk-text hover:bg-zk-chip ${linkFocus}`}
      >
        Workspaces
      </Link>
    );
  }

  const label = shared(selected.name) ? `${selected.name} (${selected.slug})` : selected.name;

  function choose(id: string) {
    setOpen(false);
    if (id === selected?.id) return;
    const form = formRef.current;
    const input = form?.elements.namedItem("tenantId");
    if (!form || !(input instanceof HTMLInputElement)) return;
    input.value = id;
    form.requestSubmit();
  }

  return (
    <div ref={rootRef} className="relative">
      <form ref={formRef} action={selectTenantAction}>
        <input type="hidden" name="tenantId" defaultValue={selected.id} />
        <button
          ref={buttonRef}
          type="button"
          data-action="workspace"
          aria-label={`Active workspace, ${label}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`workspace quiet inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-zk-text hover:bg-zk-chip ${linkFocus}`}
        >
          <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="truncate">{label}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-icon="chevron-down" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open ? (
          <ul
            role="listbox"
            aria-label="Workspaces"
            className="absolute left-0 top-full z-50 mt-1 max-h-64 w-max min-w-full max-w-56 overflow-y-auto rounded-xl border border-zk-border bg-zk-surface p-1 shadow-[0_16px_40px_rgba(11,23,51,0.16)]"
          >
            {workspaces.map((workspace) => {
              const optionLabel = shared(workspace.name)
                ? `${workspace.name} (${workspace.slug})`
                : workspace.name;
              const current = workspace.id === selected.id;
              return (
                <li key={workspace.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={current}
                    onClick={() => choose(workspace.id)}
                    className={`block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs ${
                      current
                        ? "bg-zk-tint font-semibold text-zk-accent"
                        : "text-zk-text hover:bg-zk-chip"
                    }`}
                  >
                    {optionLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </form>
    </div>
  );
}

function AgentsMenu({ pathname, agents }: { pathname: string | null; agents: ShellAgent[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useDismiss(open, () => setOpen(false), containerRef, buttonRef);
  const current = (pathname ?? "").replace(/\/+$/, "");

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        data-action="workspace"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="agents-nav-menu"
        onClick={() => setOpen((value) => !value)}
        className={`agents-menu button inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-zk-text hover:bg-zk-chip ${linkFocus}`}
      >
        <span data-icon="agent" aria-hidden="true">
          <AgentIcon />
        </span>
        Agents
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-icon="chevron-down" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          id="agents-nav-menu"
          role="menu"
          className="absolute right-0 top-12 z-50 flex w-[260px] flex-col gap-0.5 rounded-2xl border border-zk-border bg-zk-surface p-2 shadow-[0_16px_40px_rgba(11,23,51,0.16)]"
        >
          {agents.length > 0 ? (
            <span className="px-2.5 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-[0.06em] text-zk-muted">
              Project agents
            </span>
          ) : null}
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href="/settings/agents"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-zk-text"
            >
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-zk-tint text-xs font-extrabold text-zk-accent">
                {initialsOf(agent.name)}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold">{agent.name}</span>
              <span className="rounded-full bg-zk-info-bg px-2 py-0.5 text-[11px] font-bold text-zk-info-fg">
                {levelLabel(agent.level)}
              </span>
            </Link>
          ))}
          {agents.length > 0 ? <div className="my-1 h-px bg-zk-divider" /> : null}
          <Link
            href="/settings/agents"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2 rounded-[10px] px-2.5 font-bold text-zk-accent"
          >
            <PlusIcon />
            Create agent
          </Link>
          {AGENT_MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={current === link.href ? "page" : undefined}
              className="flex min-h-10 items-center rounded-[10px] px-2.5 font-semibold text-zk-text2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavButton({
  dataView,
  href,
  label,
  pathname,
}: {
  dataView: string;
  href: string;
  label: string;
  pathname: string | null;
}) {
  const active = isNavItemActive(pathname, href);
  return (
    <Link
      href={href}
      data-view={dataView}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-8 items-center justify-center rounded-full px-2 text-sm font-medium text-zk-text ${active ? "bg-zk-tint text-zk-accent" : "hover:bg-zk-chip hover:text-zk-text"}`}
    >
      {label}
    </Link>
  );
}

export function AppHeader({
  userName,
  userImage,
  role,
  isRealSuperAdmin,
  isRealAdmin,
  unreadCount = 0,
  userId,
  workspaces = [],
  activeTenantId = null,
  points = 0,
  rank = null,
  agents = [],
  reportFormUrl,
}: {
  userName?: string | null;
  userImage?: string | null;
  role?: AppRole | null;
  isRealSuperAdmin?: boolean;
  isRealAdmin?: boolean;
  unreadCount?: number;
  userId?: string | null;
  workspaces?: WorkspaceChoice[];
  activeTenantId?: string | null;
  points?: number;
  rank?: number | null;
  agents?: ShellAgent[];
  reportFormUrl?: string;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const closeAccount = () => setAccountOpen(false);
  useDismiss(accountOpen, closeAccount, accountRef);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setAccountOpen(false);
  }

  const canSwitchRole = Boolean((isRealSuperAdmin || isRealAdmin) && role);
  const realRole = realRoleOf({ isRealSuperAdmin, isRealAdmin });
  const effectiveRole: AppRole = role ?? "user";
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeTenantId) ?? workspaces[0];

  return (
    <header className="relative z-40 min-h-[66px] border-b border-zk-border bg-zk-surface lg:sticky lg:top-0 topbar">
      <Link
        href="/issues"
        aria-label="Ziki issues"
        className="brand inline-flex items-center gap-1 text-sm font-semibold text-zk-text"
      >
        <span className="brand-mark inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zk-chip text-xs font-bold text-zk-text" aria-hidden="true">
          z
        </span>
        <span>ziki</span>
      </Link>

      <span className="top-divider hidden h-4 w-px bg-zk-border lg:block" aria-hidden="true" />

      <HeaderWorkspaceSwitcher workspaces={workspaces} activeTenantId={activeTenantId} />

      <nav className="top-nav flex items-center gap-2 px-2" aria-label="Main navigation">
        <span className="nav-indicator hidden h-4 w-px bg-zk-border lg:block" aria-hidden="true" />
        <NavButton dataView="overview" href="/dashboard" label="Overview" pathname={pathname} />
        <NavButton dataView="issues" href="/issues" label="Issues" pathname={pathname} />
        <NavButton dataView="agents" href="/settings/agents" label="Agents" pathname={pathname} />
        <NavButton dataView="team" href="/settings/team" label="Team" pathname={pathname} />
      </nav>

      <div className="account-controls flex min-w-0 items-center gap-2 sm:gap-3 lg:shrink-0 ml-auto">
        <AgentsMenu pathname={pathname} agents={agents} />
        <NotificationsBell unreadCount={unreadCount} />
        <div ref={accountRef} className="relative">
          <button
            type="button"
            className="account-button inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-surface px-2.5 py-1 text-sm text-zk-text hover:bg-zk-chip"
            data-action="account"
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-controls="account-menu"
            onClick={() => setAccountOpen((open) => !open)}
          >
            <span className="sr-only">Account menu for {userName}</span>
            <span className="avatar neutral inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zk-chip text-xs font-bold text-zk-text">
              {initialsOf(userName)}
            </span>
            <span className="account-name truncate font-semibold text-zk-text">{userName}</span>
            {userId && points > 0 ? (
              <span className="points rounded-full bg-zk-warn-bg px-2 py-0.5 text-xs font-bold text-zk-warn-fg">
                <span data-icon="trophy" aria-hidden="true">
                  <TrophyIcon />
                </span>
                {points} pts
              </span>
            ) : null}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-icon="chevron-down" aria-hidden="true">
              <path d={accountOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
            </svg>
          </button>

          {accountOpen ? (
            <div
              id="account-menu"
              role="menu"
              aria-label="Account"
              className="absolute right-0 top-full mt-1 z-50 flex w-[300px] max-w-[calc(100vw-2rem)] origin-top flex-col gap-1 rounded-[20px] border border-zk-border bg-zk-surface p-2 shadow-[0_24px_56px_rgba(11,23,51,0.22)] motion-safe:animate-[header-pop_120ms_ease-out]"
            >
              <AccountSummary
                userName={userName}
                userImage={userImage}
                realRole={realRole}
                points={points}
                rank={rank}
              />
              {canSwitchRole ? (
                <div className="border-t border-zk-divider px-2 py-2.5">
                  <RoleSwitcher activeRole={effectiveRole} isSuperAdmin={isRealSuperAdmin} />
                </div>
              ) : null}
              <AccountThemeSelector />
              <div className="mx-2 h-px bg-zk-divider" />
              <MenuLink href={SWITCH_TENANT_LINK.href} active={isNavItemActive(pathname, SWITCH_TENANT_LINK.href)}>
                <span className="flex-1">{SWITCH_TENANT_LINK.label}</span>
                {activeWorkspace ? (
                  <span className="rounded-full bg-zk-chip px-2 py-0.5 text-xs font-bold text-zk-text2">
                    {activeWorkspace.name}
                  </span>
                ) : null}
              </MenuLink>
              <MenuLink href="/leaderboard" active={isNavItemActive(pathname, "/leaderboard")}>
                Leaderboard
              </MenuLink>
              {isAdmin(effectiveRole) ? (
                <MenuLink href="/admin/dashboard" active={isNavItemActive(pathname, "/admin/dashboard")}>
                  Dashboard
                </MenuLink>
              ) : null}
              {isSuperAdmin(role) ? (
                <MenuLink href="/admin/users" active={isNavItemActive(pathname, "/admin/users")}>
                  Admins
                </MenuLink>
              ) : null}
              <MenuLink href="/settings/profile" active={isNavItemActive(pathname, "/settings/profile")}>
                Profile
              </MenuLink>
              <MenuLink href="/settings" active={isNavItemActive(pathname, "/settings")}>
                Settings
              </MenuLink>
              <MenuLink href="/docs" active={isNavItemActive(pathname, "/docs")}>
                Docs & /llms.txt
              </MenuLink>
              {reportFormUrl ? (
                <MenuLink href={reportFormUrl}>Report issue</MenuLink>
              ) : null}
              <div className="mx-2 h-px bg-zk-divider" />
              <SignOutButton
                userId={userId}
                className={`${linkFocus} font-bold text-zk-bad-fg hover:bg-zk-bad-soft`}
              />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function AccountSummary({
  userName,
  userImage,
  realRole,
  points,
  rank,
}: {
  userName?: string | null;
  userImage?: string | null;
  realRole: AppRole;
  points: number;
  rank: number | null;
}) {
  const roleLabel = realRole === "user" ? "Member" : roleViewLabels[realRole];
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-zk-tint p-3">
      <Avatar name={userName} image={userImage} size="lg" variant="solid" />
      <div className="min-w-0">
        <p className="truncate text-base font-extrabold text-zk-text">{userName}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-full bg-zk-surface px-2 py-0.5 font-bold text-zk-text2">{roleLabel}</span>
          <span className="font-semibold text-zk-accent">
            {points} pts{rank ? ` · #${rank}` : ""}
          </span>
        </p>
      </div>
    </div>
  );
}

function MenuLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${linkFocus} ${
        active ? "bg-zk-tint text-zk-accent" : "text-zk-text hover:bg-zk-chip"
      }`}
    >
      {children}
    </Link>
  );
}

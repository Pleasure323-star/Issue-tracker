"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { WorkspaceChoice } from "@/components/workspace-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { RoleSwitcher } from "@/components/role-switcher";
import { isAdmin, isSuperAdmin, type AppRole } from "@/lib/roles";
import { isNavItemActive } from "@/lib/header-nav";
import { Avatar } from "@/components/avatar";
import { ThemeToggle, AccountThemeSelector } from "@/components/theme-toggle";
import { formatPoints, pointsProgress, TARGET_POINTS } from "@/lib/points/rules";
import { recentNotificationsAction } from "@/app/actions/notifications";
import { LocalTime } from "@/components/local-time";
import { BASE_PATH } from "@/lib/base-path";

export type ShellAgent = {
  id: string;
  name: string;
  level: string;
};

/** Workspace dropdown button (matches AgentsMenu styling). */
function WorkspaceMenu({ workspaces, activeTenantId }: { workspaces: WorkspaceChoice[]; activeTenantId: string | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = workspaces.find((workspace) => workspace.id === activeTenantId) ?? workspaces[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="workspace quiet inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-surface px-2.5 py-1 text-sm text-zk-text hover:bg-zk-chip"
      >
        <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        <span className="truncate font-semibold text-zk-text">{selected?.name ?? "Workspace"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && workspaces.length > 0 ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-50 flex w-[260px] flex-col gap-0.5 rounded-xl border border-zk-border bg-zk-surface p-2 shadow-[0_24px_56px_rgba(11,23,51,0.22)]"
        >
          {workspaces.map((workspace) => {
            const current = workspace.id === activeTenantId;
            return (
              <Link
                key={workspace.id}
                href="/tenants"
                onClick={() => setOpen(false)}
                className={`flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left ${current ? "bg-zk-tint text-zk-accent font-semibold" : "text-zk-text hover:bg-zk-chip hover:text-zk-text"}`}
              >
                <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${current ? "bg-zk-tint" : "bg-zk-surface"} text-xs font-extrabold ${current ? "text-zk-accent" : "text-zk-text"}`}>
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
                <span className={`min-w-0 flex-1 truncate ${current ? "font-semibold text-zk-accent" : "font-medium text-zk-text"}`}>
                  {workspace.name}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** Agents dropdown button (matches artifact: "Agents ▼" pill). */
function AgentsMenu({ pathname, agents }: { pathname: string | null; agents: ShellAgent[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="agents-nav-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-surface px-3 py-1.5 text-sm text-zk-text hover:bg-zk-chip"
      >
        <span data-icon="agent" aria-hidden="true">
          <AgentIcon />
        </span>
        Agents
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          id="agents-nav-menu"
          role="menu"
          className="absolute right-0 top-full mt-1 z-50 flex w-[260px] flex-col gap-0.5 rounded-xl border border-zk-border bg-zk-surface p-2 shadow-[0_24px_56px_rgba(11,23,51,0.22)]"
        >
          {agents.length > 0 ? (
            agents.map((agent) => (
              <Link
                key={agent.id}
                href="/settings/agents"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-zk-text"
              >
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-zk-tint text-xs font-extrabold text-zk-accent">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{agent.name}</span>
                <span className="rounded-full bg-zk-info-bg px-2 py-0.5 text-[11px] font-bold text-zk-info-fg">
                  {agent.level}
                </span>
              </Link>
            ))
          ) : null}
          <Link href="/settings/agents" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-2 rounded-[10px] px-2.5 font-bold text-zk-accent">
            <span>Create agent</span>
            <span>+</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/** Agent icon (matches artifact: person silhouette). */
function AgentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 4v4" />
    </svg>
  );
}

/** Trophy icon for points badge (matches artifact: 🏆 5 pts). */
function TrophyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 14.7V17c0 .6-.5 1-1 1.2-1.2.5-2 2-2 3.8" />
      <path d="M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

/** Notification bell icon button (matches artifact: bell icon). */
function NotificationsBell({ unreadCount, active }: { unreadCount: number; active: boolean }) {
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";
  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-zk-border bg-zk-surface text-zk-text hover:bg-zk-chip relative ${active ? "border-electric-blue" : ""}`}
      aria-label={label}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-zk-surface bg-electric-blue-strong px-1 text-[11px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}

export function AppHeader({
  userName,
  userImage,
  role,
  isRealSuperAdmin,
  isRealAdmin,
  userId,
  points = 0,
  workspaces = [],
  activeTenantId = null,
  unreadCount = 0,
  agents = [],
  reportFormUrl,
}: {
  userName?: string | null;
  userImage?: string | null;
  role?: AppRole | null;
  isRealSuperAdmin?: boolean;
  isRealAdmin?: boolean;
  userId?: string | null;
  points?: number;
  workspaces?: WorkspaceChoice[];
  activeTenantId?: string | null;
  unreadCount?: number;
  agents?: ShellAgent[];
  reportFormUrl?: string;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  const realRole = isRealSuperAdmin ? "super_admin" : isRealAdmin ? "admin" : "user";
  const effectiveRole: AppRole = role ?? "user";
  const canSwitchRole = Boolean((isRealSuperAdmin || isRealAdmin) && role);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeTenantId) ?? workspaces[0];

  return (
    // Workspace top bar: 66 px high, near-white surface, subtle bottom divider.
    // Single row: brand + workspace switcher | agents + notifications + account.
    <header className="relative z-40 min-h-[66px] border-b border-zk-border bg-zk-surface lg:sticky lg:top-0">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 border-b border-zk-border">
        {/* Brand: ziki logo mark */}
        <Link
          href="/dashboard"
          aria-label="Ziki"
          className="flex items-center gap-1"
        >
          <Image
            src="/ziki-logo.png"
            alt="Ziki"
            width={140}
            height={40}
            className="h-9 w-auto object-contain"
            unoptimized
          />
        </Link>

        {/* Workspace dropdown */}
        <WorkspaceMenu workspaces={workspaces} activeTenantId={activeTenantId} />

        {/* Spacer pushes agents/notifications/account to the right. */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:shrink-0">
          <AgentsMenu pathname={pathname} agents={agents} />
          <ThemeToggle />
          <NotificationsBell unreadCount={unreadCount} active={isNavItemActive(pathname, "/notifications")} />
          <div ref={accountRef} className="relative">
            <button
              ref={accountButtonRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-controls="account-menu"
              onClick={() => setAccountOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-surface px-3 py-1.5 text-sm text-zk-text hover:bg-zk-chip"
            >
              <span className="sr-only">Account menu for {userName}</span>
              <Avatar name={userName} image={userImage} size="sm" variant="solid" />
              <span className="truncate font-semibold text-zk-text">{userName}</span>
              <span className="inline-flex items-center rounded-full bg-zk-warn-bg px-2 py-0.5 text-xs font-bold text-zk-warn-fg">
                <span data-icon="trophy" aria-hidden="true" className="flex items-center shrink-0">
                  <span className="h-3 w-3 flex items-center">
                    <TrophyIcon />
                  </span>
                </span>
                <span className="ml-1">{points} pts</span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={accountOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6" />}
              </svg>
            </button>

            {accountOpen ? (
              <div
                id="account-menu"
                role="menu"
                aria-label="Account"
                className="absolute right-0 top-full mt-1 z-50 flex w-[300px] max-w-[calc(100vw-2rem)] origin-top flex-col gap-1 rounded-[20px] border border-zk-border bg-zk-surface p-2 shadow-[0_24px_56px_rgba(11,23,51,0.22)]"
              >
                <div className="flex items-center gap-3 rounded-[14px] bg-zk-tint p-3">
                  <Avatar name={userName} image={userImage} size="lg" variant="solid" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold text-zk-text">{userName}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-full bg-zk-surface px-2 py-0.5 font-bold text-zk-text2">
                        {realRole === "user" ? "Member" : realRole === "admin" ? "Team lead (admin)" : "Super admin"}
                      </span>
                    </p>
                  </div>
                </div>
                {canSwitchRole ? (
                  <div className="border-t border-zk-divider px-2 py-2.5">
                    <RoleSwitcher activeRole={effectiveRole} isSuperAdmin={isRealSuperAdmin} />
                  </div>
                ) : null}
                <AccountThemeSelector />
                <div className="mx-2 h-px bg-zk-divider" />
                <MenuLink href="/tenants" active={isNavItemActive(pathname, "/tenants")} label="Switch workspace">
                  {activeWorkspace ? (
                    <span className="rounded-full bg-zk-chip px-2 py-0.5 text-xs font-bold text-zk-text2">
                      {activeWorkspace.name}
                    </span>
                  ) : null}
                </MenuLink>
                <MenuLink href="/leaderboard" label="Leaderboard" />
                {isAdmin(effectiveRole) ? <MenuLink href="/admin/dashboard" label="Dashboard" /> : null}
                {isSuperAdmin(role) ? <MenuLink href="/admin/users" label="Admins" /> : null}
                <MenuLink href="/settings/profile" label="Profile" />
                <MenuLink href="/settings" label="Settings" />
                <MenuLink href="/docs" label="Docs & /llms.txt" />
                {reportFormUrl ? <MenuLink href={reportFormUrl} label="Report issue" /> : null}
                <div className="mx-2 h-px bg-zk-divider" />
                <SignOutButton userId={userId} className="font-bold text-zk-bad-fg hover:bg-zk-bad-soft" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  href,
  active = false,
  label,
  children,
}: {
  href: string;
  active?: boolean;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${active ? "bg-zk-tint text-zk-accent" : "text-zk-text hover:bg-zk-chip"}`}
    >
      {children ?? label}
    </Link>
  );
}

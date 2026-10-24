"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive } from "@/lib/header-nav";

const railTile =
  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-tint";

/**
 * The app rail from the design.md/Figma reference: a 60 px icon-only strip on
 * the deep plum background. The active tile uses plum/500 (#513431); workspace
 * identity lives in the top bar, so the rail carries navigation only.
 */
export function AppSidebar({
  issueCount,
  pendingEscalationsCount = 0,
}: {
  issueCount: number;
  /** Pending escalation count shown on the Escalations rail tile. */
  pendingEscalationsCount?: number;
}) {
  const pathname = usePathname();
  const overview = isNavItemActive(pathname, "/dashboard");
  const issues = isNavItemActive(pathname, "/issues");
  const team = isNavItemActive(pathname, "/settings/team");
  const escalations = isNavItemActive(pathname, "/escalations");

  return (
    // Phones: a slim icon strip above the top bar. From lg up: the 60 px rail.
    <aside className="flex w-full flex-row items-center gap-1 bg-zk-surface px-2 py-2 text-zk-text lg:sticky lg:top-0 lg:h-dvh lg:w-[60px] lg:shrink-0 lg:flex-col lg:gap-2 lg:py-4">
      <nav aria-label="Workspace" className="flex flex-row items-center gap-1 lg:flex-col lg:gap-1.5 lg:mt-[35px]">
        <RailTile href="/dashboard" label="Overview" active={overview}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </RailTile>
        <RailTile href="/issues" label="Issues" active={issues} count={issueCount}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </RailTile>
        <RailTile href="/settings/team" label="Team" active={team}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
            <path d="M16 3.1a4 4 0 0 1 0 7.8" />
          </svg>
        </RailTile>
        <RailTile
          href="/escalations"
          label="Escalations"
          active={escalations}
          count={pendingEscalationsCount}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </RailTile>
      </nav>
    </aside>
  );
}

function RailTile({
  href,
  label,
  active,
  count = 0,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      className={`${railTile} ${
        active
          ? "bg-zk-chip text-zk-text"
          : "text-zk-text hover:bg-zk-chip hover:text-zk-text"
      }`}
    >
      {children}
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#311916] bg-electric-blue-strong px-1 text-[10px] font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

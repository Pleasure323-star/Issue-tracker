import type { Metadata } from "next";
import { bugInTenant, currentTenantIdFor } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { IssueStageTabs } from "@/components/overview/issue-stage-tabs";
import { IssueToolbar } from "@/components/overview/issue-toolbar";
import { IssueTableHeader, IssueRow, type OverviewIssueRow } from "@/components/overview/issue-row";

export const metadata: Metadata = { title: "Overview" };

const REFERENCE_ISSUES: OverviewIssueRow[] = [
  {
    id: "ref-64",
    number: 64,
    title: "Notification badge count doesn’t clear after reading all mentions",
    platform: "Mobile",
    voteCount: 22,
    userVoted: false,
    commentCount: 3,
    severity: "medium",
    status: "open",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reporterName: "Alex Rivera",
    reporterImage: null,
  },
  {
    id: "ref-151",
    number: 151,
    title: "Add confirmation step before deleting a channel",
    platform: "Web",
    voteCount: 8,
    userVoted: false,
    commentCount: 1,
    severity: "low",
    status: "open",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    reporterName: "Sam Chen",
    reporterImage: null,
  },
  {
    id: "ref-139",
    number: 139,
    title: "Read receipts setting does not sync between desktop and mobile",
    platform: "Mobile",
    voteCount: 7,
    userVoted: false,
    commentCount: 0,
    severity: "high",
    status: "in_progress",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    reporterName: "Jordan Lee",
    reporterImage: null,
  },
];

async function loadIssues(
  userId: string,
  tenantId: string,
): Promise<OverviewIssueRow[]> {
  if (!tenantId) return REFERENCE_ISSUES;

  try {
    const bugs = await prisma.bug.findMany({
      where: {
        ...bugInTenant(tenantId),
        isDeleted: false,
      },
      orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        number: true,
        title: true,
        severity: true,
        status: true,
        voteCount: true,
        createdAt: true,
        reporter: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return bugs.map((bug) => ({
      id: bug.id,
      number: bug.number,
      title: bug.title,
      platform: "Web",
      voteCount: bug.voteCount,
      userVoted: false,
      commentCount: 0,
      severity: bug.severity as "low" | "medium" | "high" | "critical",
      status: bug.status,
      createdAt: bug.createdAt.toISOString(),
      reporterName: bug.reporter?.name ?? null,
      reporterImage: bug.reporter?.image ?? null,
    }));
  } catch {
    return REFERENCE_ISSUES;
  }
}

async function loadPageData() {
  let tenantId: string | null = null;
  try {
    tenantId = await currentTenantIdFor("demo");
  } catch {
    tenantId = null;
  }

  let issues: OverviewIssueRow[] = REFERENCE_ISSUES;
  if (tenantId) {
    try {
      issues = await loadIssues("demo", tenantId);
    } catch {
      issues = REFERENCE_ISSUES;
    }
  }

  return { issues };
}

export default async function OverviewPage() {
  let issues: OverviewIssueRow[] = REFERENCE_ISSUES;
  try {
    const { issues: loadedIssues } = await loadPageData();
    issues = loadedIssues;
  } catch {
    issues = REFERENCE_ISSUES;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F6]">
      <main className="min-w-0 flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1
              className="text-[23px] font-bold text-[#17191D] tracking-tight"
              id="overview-heading"
            >
              Overview
            </h1>
            <p className="text-[14px] text-[#697181]">
              Track, prioritize and triage issues across your workspace.
            </p>
          </div>
        </div>

        <IssueToolbar newIssueHref="/issues/new" />

        <IssueStageTabs selectedId="inbox" onSelect={() => {}} />

        <section
          aria-labelledby="overview-heading"
          className="mt-6 rounded-[24px] border border-[#E8E8EA] bg-[#FEFEFE] shadow-sm"
        >
          <IssueTableHeader />
          <ul className="divide-y divide-[#E8E8EA]">
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}


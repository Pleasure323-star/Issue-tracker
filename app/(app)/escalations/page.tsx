import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { currentTenantIdFor } from "@/lib/tenant-context";
import { listOwnerEscalations, type EscalationType } from "@/lib/agent-questions";
import { LocalTime } from "@/components/local-time";
import { EscalationTypeBadge, QuickResolveButtons, RedesignDecisionButtons, ApprovalDecisionButtons } from "./escalation-controls";

export const metadata = { title: "Agent Escalations" };

const ALL_TYPES: Array<EscalationType | "Redesign"> = [
  "Blocker",
  "Work Authorization",
  "Question",
  "Scope Expansion",
  "Human Approval",
  "Redesign",
];

type OwnerEscalation = {
  id: string;
  source: "question" | "redesign" | "approval";
  body: string;
  cleanBody: string;
  escalationType: EscalationType;
  isWaiting: boolean;
  agentName: string;
  createdAt: Date;
  answeredAt?: Date | null;
  answer?: string | null;
  bug?: { id: string; title: string } | null;
  href: string;
};

export default async function EscalationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; type?: string }>;
}) {
  const user = await requireUser();
  const tenantId = await currentTenantIdFor(user.id);
  const escalations = tenantId ? await listOwnerEscalations(user.id, tenantId) : [];

  const params = searchParams ? await searchParams : {};
  const statusFilter = params.status ?? "waiting";
  const typeFilter = params.type ?? "all";

  const rows = escalations.map((item) => ({
    ...item,
    href: item.source === "redesign" ? `/redesigns/${item.id}` : `/escalations/${item.id}`,
  }));

  const pendingCount = rows.filter((q) => q.isWaiting).length;

  const filtered = rows.filter((item) => {
    if (statusFilter === "waiting" && !item.isWaiting) return false;
    if (statusFilter === "answered" && item.isWaiting) return false;
    if (typeFilter !== "all" && item.escalationType !== typeFilter) return false;
    return true;
  });

  const makeQuery = (newStatus: string, newType: string) => {
    const q = new URLSearchParams();
    if (newStatus !== "waiting") q.set("status", newStatus);
    if (newType !== "all") q.set("type", newType);
    const s = q.toString();
    return s ? `/escalations?${s}` : "/escalations";
  };

  const statusPill = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full px-3.5 text-xs font-semibold transition-colors ${
      active ? "bg-electric-blue-strong text-white" : "bg-zk-chip text-zk-text2 hover:bg-zk-tint"
    }`;

  const typePill = (active: boolean) =>
    `inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors ${
      active ? "bg-deep-ocean text-white" : "bg-zk-chip text-zk-muted hover:bg-zk-tint hover:text-zk-text"
    }`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Agent Escalations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Incoming blockers, authorization requests, design decisions, and questions requiring human guidance.
          </p>
        </div>
        {pendingCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            {pendingCount} waiting for resolution
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            All escalations unblocked
          </span>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">Status</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={makeQuery("waiting", typeFilter)} className={statusPill(statusFilter === "waiting")}>
              Waiting ({pendingCount})
            </Link>
            <Link href={makeQuery("answered", typeFilter)} className={statusPill(statusFilter === "answered")}>
              Resolved ({rows.length - pendingCount})
            </Link>
            <Link href={makeQuery("all", typeFilter)} className={statusPill(statusFilter === "all")}>
              All ({rows.length})
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">Type</span>
          <Link href={makeQuery(statusFilter, "all")} className={typePill(typeFilter === "all")}>
            All Types
          </Link>
          {ALL_TYPES.map((t) => (
            <Link key={t} href={makeQuery(statusFilter, t)} className={typePill(typeFilter === t)}>
              {t}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {filtered.map((item) => (
            <li key={`${item.source}-${item.id}`} className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <EscalationTypeBadge type={item.escalationType} />
                  <Link href={item.href} className="font-medium text-teal-800 hover:underline">
                    {item.source === "redesign" ? item.title : item.agentName}
                  </Link>
                  {item.source === "redesign" ? (
                    <span className="text-xs text-slate-400">{item.agentName}</span>
                  ) : null}
                  <span className="text-xs text-slate-400">•</span>
                  <LocalTime date={item.createdAt} className="text-xs text-slate-500" />
                </div>
                {item.isWaiting ? (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                    Awaiting response
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                    Resolved
                  </span>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm text-slate-800">{item.body}</p>

              {item.bug ? (
                <div className="text-xs">
                  <span className="text-slate-500">Linked Issue: </span>
                  <Link
                    href={`/issues/${item.bug.id}`}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    #{item.bug.title}
                  </Link>
                </div>
              ) : null}

              {item.isWaiting && item.source === "question" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
                  <QuickResolveButtons escalationId={item.id} />
                  <Link href={item.href} className="text-xs font-medium text-teal-700 hover:underline">
                    Write custom response →
                  </Link>
                </div>
              ) : item.isWaiting && item.source === "redesign" ? (
                <div className="border-t border-slate-100 pt-2">
                  <RedesignDecisionButtons proposalId={item.id} bugId={item.bug?.id ?? null} />
                </div>
              ) : item.isWaiting && item.source === "approval" ? (
                <div className="border-t border-slate-100 pt-2">
                  <ApprovalDecisionButtons approvalId={item.id} />
                </div>
              ) : item.source === "question" ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 text-xs text-slate-700 space-y-1">
                  <span className="font-semibold text-slate-600">Your resolution:</span>
                  <p className="whitespace-pre-wrap">{item.answer}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No escalations match this filter.</p>
          <p className="mt-1 text-xs text-slate-500">
            Agents, design proposals, and approval gates surface here.
          </p>
        </div>
      )}
    </div>
  );
}

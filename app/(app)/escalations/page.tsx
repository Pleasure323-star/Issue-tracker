import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { currentTenantIdFor } from "@/lib/tenant-context";
import { listOwnerEscalations, type EscalationType } from "@/lib/agent-questions";
import { LocalTime } from "@/components/local-time";
import { escalationTypeLabel } from "@/lib/escalation-labels";
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
  escalationType: EscalationType | "Redesign";
  isWaiting: boolean;
  agentName: string;
  title?: string;
  authorized?: boolean;
  createdAt: Date;
  answeredAt?: Date | null;
  answer?: string | null;
  bug?: { id: string; number: number; title: string } | null;
  href: string | null;
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

  const rows: OwnerEscalation[] = escalations.map((item) => ({
    ...item,
    href:
      item.source === "redesign"
        ? `/redesigns/${item.id}`
        : item.source === "approval"
          ? item.bug
            ? `/issues/${item.bug.id}`
            : null
          : `/escalations/${item.id}`,
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
      active
        ? "bg-electric-blue-strong text-white"
        : "bg-zk-chip text-zk-text2 hover:bg-zk-tint"
    }`;

  const typePill = (active: boolean) =>
    `inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors ${
      active
        ? "bg-deep-ocean text-white"
        : "bg-zk-chip text-zk-muted hover:bg-zk-tint hover:text-zk-text"
    }`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zk-text">Agent Escalations</h1>
          <p className="mt-1 text-sm text-zk-muted">
            Incoming blockers, authorization requests, design decisions, and questions requiring human guidance.
          </p>
        </div>
        {pendingCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-zk-warn-bd bg-zk-warn-bg px-3 py-1 text-xs font-semibold text-zk-warn-fg">
            <span className="h-2 w-2 animate-pulse rounded-full bg-zk-warn-fg" />
            {pendingCount} waiting for resolution
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-zk-ok-bg px-3 py-1 text-xs font-semibold text-zk-ok-fg">
            <span className="h-2 w-2 rounded-full bg-zk-ok-fg" />
            All escalations unblocked
          </span>
        )}
      </div>

      <div className="space-y-3 rounded-[20px] border border-zk-border bg-zk-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zk-divider pb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-zk-accent">Status</span>
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
          <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.06em] text-zk-accent">Type</span>
          <Link href={makeQuery(statusFilter, "all")} className={typePill(typeFilter === "all")}>
            All Types
          </Link>
          {ALL_TYPES.map((t) => (
            <Link key={t} href={makeQuery(statusFilter, t)} className={typePill(typeFilter === t)}>
              {escalationTypeLabel(t)}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="divide-y divide-zk-divider overflow-hidden rounded-[20px] border border-zk-border bg-zk-surface">
          {filtered.map((item) => (
            <li key={`${item.source}-${item.id}`} className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <EscalationTypeBadge type={item.escalationType} />
                  {item.href ? (
                    <Link href={item.href} className="font-semibold text-zk-accent hover:underline">
                      {item.source === "redesign" ? item.title : item.agentName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-zk-text">{item.agentName}</span>
                  )}
                  {item.source === "redesign" ? (
                    <span className="text-xs text-zk-muted">{item.agentName}</span>
                  ) : null}
                  <span className="text-xs text-zk-muted">•</span>
                  <LocalTime date={item.createdAt} className="text-xs text-zk-muted" />
                </div>
                {item.isWaiting ? (
                  <span className="inline-flex items-center rounded-full border border-zk-warn-bd bg-zk-warn-bg px-2.5 py-0.5 text-xs font-semibold text-zk-warn-fg">
                    Awaiting response
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zk-ok-bg px-2.5 py-0.5 text-xs font-semibold text-zk-ok-fg">
                    Resolved
                  </span>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm text-zk-text">{item.body}</p>

              {item.bug ? (
                <div className="text-xs">
                  <span className="text-zk-muted">Linked Issue: </span>
                  <Link
                    href={`/issues/${item.bug.id}`}
                    className="font-semibold text-zk-accent hover:underline"
                  >
                    #{item.bug.number} {item.bug.title}
                  </Link>
                </div>
              ) : null}

              {item.isWaiting ? (
                <div className="border-t border-zk-divider pt-2">
                  {item.source === "question" ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <QuickResolveButtons escalationId={item.id} />
                      <Link href={`/escalations/${item.id}`} className="text-xs font-semibold text-zk-accent hover:underline">
                        Write custom response →
                      </Link>
                    </div>
                  ) : item.source === "redesign" && item.authorized ? (
                    <RedesignDecisionButtons
                      proposalId={item.id}
                      bugId={item.bug?.id ?? null}
                      authorized={item.authorized}
                    />
                  ) : item.source === "approval" ? (
                    <ApprovalDecisionButtons approvalId={item.id} />
                  ) : (
                    <Link href={`/redesigns/${item.id}`} className="text-xs font-semibold text-zk-accent hover:underline">
                      Review proposal →
                    </Link>
                  )}
                </div>
              ) : item.source === "question" ? (
                <div className="space-y-1 rounded-[12px] border border-zk-border bg-zk-chip/60 p-3 text-xs text-zk-text2">
                  <span className="font-semibold text-zk-muted">Your resolution:</span>
                  <p className="whitespace-pre-wrap">{item.answer}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[20px] border border-dashed border-zk-border bg-zk-surface p-8 text-center">
          <p className="text-sm font-semibold text-zk-text">No escalations match this filter.</p>
          <p className="mt-1 text-xs text-zk-muted">
            Agents, design proposals, and approval gates surface here.
          </p>
        </div>
      )}
    </div>
  );
}

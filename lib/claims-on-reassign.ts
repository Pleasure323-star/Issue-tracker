import type { Prisma } from "@prisma/client";
import { publish } from "@/lib/agent-api/events";
import { statusChangedSummary } from "@/lib/activity-log";

/**
 * #658: a person changing an issue's assignee in the app takes the task away
 * from whoever an agent claimed it for. Their active claim is released in the
 * same transaction, so it stops counting towards their task cap and their
 * agent stops heartbeating it. A claim held for the new assignee stays.
 *
 * When the issue is left unassigned in progress with no claim behind it, it
 * goes back to `open` (#623), unless the same edit set a status of its own.
 */
export async function releaseClaimsOnReassign(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string;
    bugId: string;
    actorUserId: string;
    assigneeId: string | null;
    /** The issue's status after the edit; reopening only applies to `in_progress`. */
    status: string;
    /** The edit set the status itself, so leave it alone. */
    statusChanged: boolean;
  },
): Promise<{ released: number; reopened: boolean }> {
  // Some callers' tests run without the claims table mocked; nothing to release then.
  if (typeof tx.issueClaim?.findMany !== "function") return { released: 0, reopened: false };
  const { tenantId, bugId, actorUserId, assigneeId } = input;
  const claims = await tx.issueClaim.findMany({
    where: {
      bugId,
      status: "active",
      releasedAt: null,
      ...(assigneeId ? { beneficiaryUserId: { not: assigneeId } } : {}),
    },
    select: { id: true, agentId: true, beneficiaryUserId: true },
  });
  if (claims.length) {
    await tx.issueClaim.updateMany({
      where: { id: { in: claims.map((claim) => claim.id) } },
      data: { status: "released", releasedAt: new Date(), releaseReason: "reassigned" },
    });
    for (const claim of claims) {
      await publish(tx, {
        tenantId,
        type: "claim.released",
        actorAgentId: claim.agentId,
        bugId,
        payload: { claimId: claim.id, issueId: bugId, beneficiaryUserId: claim.beneficiaryUserId, reason: "reassigned" },
      });
    }
  }

  let reopened = false;
  if (!assigneeId && input.status === "in_progress" && !input.statusChanged) {
    const held = await tx.issueClaim.count({ where: { bugId, releasedAt: null, status: { in: ["offered", "active"] } } });
    // `status` was read before the transaction, so check it again where it is
    // written: a resolve that committed in between must not be undone.
    const moved = held ? { count: 0 } : await tx.bug.updateMany({
      where: { id: bugId, status: "in_progress", assigneeId: null },
      data: { status: "open" },
    });
    if (moved.count) {
      await tx.bugActivity.create({
        data: {
          bugId,
          actorId: actorUserId,
          type: "status_changed",
          summary: statusChangedSummary("in_progress", "open"),
          metadata: { field: "status", from: "in_progress", to: "open" },
        },
      });
      reopened = true;
    }
  }
  return { released: claims.length, reopened };
}

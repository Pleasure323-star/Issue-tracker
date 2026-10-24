import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";

const publish = vi.hoisted(() => vi.fn());
vi.mock("@/lib/agent-api/events", () => ({ publish }));

import { releaseClaimsOnReassign } from "./claims-on-reassign";

const tx = {
  issueClaim: { findMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
  bug: { updateMany: vi.fn() },
  bugActivity: { create: vi.fn() },
};
const db = tx as unknown as Prisma.TransactionClient;
const claim = { id: "claim-1", agentId: "agent-ada", beneficiaryUserId: "ada" };
const base = { tenantId: "tenant", bugId: "bug1", actorUserId: "admin", status: "in_progress", statusChanged: false };

beforeEach(() => {
  vi.clearAllMocks();
  tx.issueClaim.findMany.mockResolvedValue([claim]);
  tx.issueClaim.count.mockResolvedValue(0);
  tx.bug.updateMany.mockResolvedValue({ count: 1 });
});

describe("changing the assignee releases an agent's claim (#658)", () => {
  it("unassigning releases the active claim, publishes claim.released and reopens the issue", async () => {
    expect(await releaseClaimsOnReassign(db, { ...base, assigneeId: null })).toEqual({ released: 1, reopened: true });

    expect(tx.issueClaim.findMany.mock.calls[0][0].where).toEqual({ bugId: "bug1", status: "active", releasedAt: null });
    expect(tx.issueClaim.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["claim-1"] } },
      data: { status: "released", releasedAt: expect.any(Date), releaseReason: "reassigned" },
    });
    expect(publish).toHaveBeenCalledWith(tx, expect.objectContaining({
      type: "claim.released",
      bugId: "bug1",
      payload: expect.objectContaining({ claimId: "claim-1", beneficiaryUserId: "ada", reason: "reassigned" }),
    }));
    expect(tx.bug.updateMany).toHaveBeenCalledWith({
      where: { id: "bug1", status: "in_progress", assigneeId: null },
      data: { status: "open" },
    });
    expect(tx.bugActivity.create.mock.calls[0][0].data).toMatchObject({ type: "status_changed", metadata: { from: "in_progress", to: "open" } });
  });

  it("does not reopen or log when the issue changed since it was read (e.g. resolved meanwhile)", async () => {
    tx.bug.updateMany.mockResolvedValue({ count: 0 });
    expect(await releaseClaimsOnReassign(db, { ...base, assigneeId: null })).toEqual({ released: 1, reopened: false });
    expect(tx.bugActivity.create).not.toHaveBeenCalled();
  });

  it("reassigning releases only claims held for someone else and keeps the issue in progress", async () => {
    expect(await releaseClaimsOnReassign(db, { ...base, assigneeId: "bob" })).toEqual({ released: 1, reopened: false });
    expect(tx.issueClaim.findMany.mock.calls[0][0].where).toMatchObject({ beneficiaryUserId: { not: "bob" } });
    expect(tx.bug.updateMany).not.toHaveBeenCalled();
  });

  it("does nothing when no claim is active", async () => {
    tx.issueClaim.findMany.mockResolvedValue([]);
    expect(await releaseClaimsOnReassign(db, { ...base, assigneeId: "bob" })).toEqual({ released: 0, reopened: false });
    expect(tx.issueClaim.updateMany).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("does not reopen while another claim or offer still holds the issue", async () => {
    tx.issueClaim.count.mockResolvedValue(1);
    expect(await releaseClaimsOnReassign(db, { ...base, assigneeId: null })).toEqual({ released: 1, reopened: false });
    expect(tx.bug.updateMany).not.toHaveBeenCalled();
  });

  it("leaves the status alone when the edit set one, or the issue is not in progress", async () => {
    await releaseClaimsOnReassign(db, { ...base, assigneeId: null, statusChanged: true });
    await releaseClaimsOnReassign(db, { ...base, assigneeId: null, status: "open" });
    expect(tx.bug.updateMany).not.toHaveBeenCalled();
    expect(tx.issueClaim.updateMany).toHaveBeenCalledTimes(2);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  membership: { findUnique: vi.fn() },
  agentQuestion: { findFirst: vi.fn(), updateMany: vi.fn() },
  agentAuditEvent: { create: vi.fn() },
  agentEvent: { create: vi.fn() },
  webhookSubscription: { findMany: vi.fn() },
  webhookDelivery: { createMany: vi.fn() },
  issueApproval: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  projectAuditEvent: { create: vi.fn() },
  agent: { findFirst: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

vi.mock("@/lib/auth-helpers", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1", email: "user@example.com" }),
}));

vi.mock("@/lib/tenant-context", () => ({
  currentTenantIdFor: vi.fn().mockResolvedValue("tenant-1"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: (fn: (...a: unknown[]) => unknown) => fn,
}));

vi.mock("@/lib/agent-api/offer", () => ({
  offerNext: vi.fn(),
  scheduleOfferExpiry: vi.fn(),
}));

vi.mock("@/lib/github/merge-pr", () => ({
  mergeAcceptedFix: vi.fn(),
}));

vi.mock("@/lib/agent-notifications", () => ({
  notifyClaimOffered: vi.fn(),
}));

vi.mock("@/lib/notify", () => ({
  notifyLater: vi.fn(),
}));

import {
  answerEscalationAction,
  decideApprovalAction,
  quickResolveEscalationAction,
} from "./actions";

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction.mockImplementation((run: (tx: typeof db) => unknown) => run(db));
  db.membership.findUnique.mockResolvedValue({ userId: "user-1", role: "owner" });
  db.agentQuestion.findFirst.mockResolvedValue({
    id: "esc-1",
    agentId: "agent-1",
    bugId: null,
    ownerUserId: "user-1",
  });
  db.agentQuestion.updateMany.mockResolvedValue({ count: 1 });
  db.agentAuditEvent.create.mockResolvedValue({});
  db.agentEvent.create.mockResolvedValue({ id: "e1" });
  db.webhookSubscription.findMany.mockResolvedValue([]);
  db.issueApproval.findFirst.mockResolvedValue({
    id: "appr-1",
    status: "pending",
    stage: "before_offer",
    bugId: "bug-1",
    bug: {
      id: "bug-1",
      title: "Login broken",
      tenantId: "tenant-1",
      projectId: "proj-1",
      status: "open",
      assigneeId: null,
      pullRequestUrl: null,
    },
    ruleId: null,
  });
  db.issueApproval.updateMany.mockResolvedValue({ count: 1 });
  db.projectAuditEvent.create.mockResolvedValue({});
  db.agent.findFirst.mockResolvedValue(null);
});

describe("quickResolveEscalationAction (#763)", () => {
  it("resolves escalation with approve message", async () => {
    const result = await quickResolveEscalationAction("esc-1", "approve");
    expect(result).toEqual({ ok: true });
    expect(db.agentQuestion.updateMany).toHaveBeenCalledWith({
      where: { id: "esc-1", answer: null },
      data: expect.objectContaining({
        answer: "Approved. Proceed with your proposed approach.",
        answeredAt: expect.any(Date),
      }),
    });
  });

  it("resolves escalation with authorize message", async () => {
    const result = await quickResolveEscalationAction("esc-1", "authorize");
    expect(result).toEqual({ ok: true });
    expect(db.agentQuestion.updateMany).toHaveBeenCalledWith({
      where: { id: "esc-1", answer: null },
      data: expect.objectContaining({
        answer: "Work authorized. You may begin implementation.",
        answeredAt: expect.any(Date),
      }),
    });
  });
});

describe("answerEscalationAction (#763)", () => {
  it("records a custom answer", async () => {
    const formData = new FormData();
    formData.set("escalationId", "esc-1");
    formData.set("answer", "Custom human response.");

    const result = await answerEscalationAction(undefined, formData);
    expect(result).toEqual({ ok: true });
    expect(db.agentQuestion.updateMany).toHaveBeenCalledWith({
      where: { id: "esc-1", answer: null },
      data: expect.objectContaining({
        answer: "Custom human response.",
        answeredAt: expect.any(Date),
      }),
    });
  });

  it("rejects empty answer", async () => {
    const formData = new FormData();
    formData.set("escalationId", "esc-1");
    formData.set("answer", "   ");

    const result = await answerEscalationAction(undefined, formData);
    expect(result).toEqual({ ok: false, error: "Write an answer before sending it." });
    expect(db.agentQuestion.updateMany).not.toHaveBeenCalled();
  });
});

describe("decideApprovalAction (#432)", () => {
  it("approves a pending IssueApproval via the escalations queue", async () => {
    const result = await decideApprovalAction("appr-1", "approved");
    expect(result).toEqual({ ok: true });
    expect(db.issueApproval.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "appr-1" }),
        data: expect.objectContaining({ status: "approved" }),
      }),
    );
  });

  it("rejects a pending IssueApproval via the escalations queue", async () => {
    const result = await decideApprovalAction("appr-1", "rejected");
    expect(result).toEqual({ ok: true });
    expect(db.issueApproval.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "appr-1" }),
        data: expect.objectContaining({ status: "rejected" }),
      }),
    );
  });
});

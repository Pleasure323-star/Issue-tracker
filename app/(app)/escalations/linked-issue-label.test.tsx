import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const requireUser = vi.hoisted(() => vi.fn());
const currentTenantIdFor = vi.hoisted(() => vi.fn());
const ownerQuestion = vi.hoisted(() => vi.fn());
const findProposals = vi.hoisted(() => vi.fn());
const findQuestions = vi.hoisted(() => vi.fn());
const findMembership = vi.hoisted(() => vi.fn());
const findApprovals = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-helpers", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ currentTenantIdFor }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: { findUnique: findMembership },
    agentQuestion: { findMany: findQuestions },
    redesignProposal: { findMany: findProposals },
    issueApproval: { findMany: findApprovals },
  },
}));
vi.mock("@/lib/agent-questions", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agent-questions")>()),
  ownerQuestion,
}));
vi.mock("next/navigation", () => ({ notFound: vi.fn(() => { throw new Error("notFound"); }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock("@/components/local-time", () => ({ LocalTime: () => null }));
vi.mock("./escalation-controls", () => ({
  EscalationTypeBadge: () => null,
  QuickResolveButtons: () => null,
  EscalationAnswerForm: () => null,
  RedesignDecisionButtons: () => null,
  ApprovalDecisionButtons: () => null,
}));

import EscalationsPage from "./page";
import EscalationDetailPage from "./[id]/page";

const bug = { id: "bug-1", number: 42, title: "Login button broken" };
const question = {
  id: "q-1",
  body: "[Question] Which locale?",
  answer: null,
  answeredAt: null,
  bugId: bug.id,
  createdAt: new Date("2026-10-20T10:00:00.000Z"),
  agent: { id: "agent-1", name: "Helper" },
  bug,
};

describe("escalation linked issue label (#559)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: "user-1" });
    currentTenantIdFor.mockResolvedValue("tenant-1");
  });

  it("labels question and redesign rows on the list with #<number> <title>", async () => {
    findMembership.mockResolvedValue({ role: "owner" });
    findQuestions.mockResolvedValue([question]);
    findApprovals.mockResolvedValue([]);
    findProposals.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: "r-1",
        title: "Rework login",
        body: "Proposal",
        status: "proposed",
        createdAt: new Date("2026-10-19T10:00:00.000Z"),
        bug: { id: "bug-2", number: 7, title: "Slow login" },
        authorAgent: { id: "agent-2", name: "Helper", ownerUserId: "user-2" },
      },
    ]);

    const html = renderToStaticMarkup(await EscalationsPage({ searchParams: Promise.resolve({ status: "all" }) })).replace(/<!-- -->/g, "");

    expect(html).toContain("#42 Login button broken");
    expect(html).toContain("#7 Slow login");
    expect(findQuestions.mock.calls[0][0].select.bug.select.number).toBe(true);
    expect(findProposals.mock.calls[0][0].select.bug.select.number).toBe(true);
  });

  it("links an approval row to its issue, not to a question page", async () => {
    findMembership.mockResolvedValue({ role: "owner" });
    findQuestions.mockResolvedValue([]);
    findProposals.mockResolvedValue([]);
    findApprovals.mockResolvedValue([
      {
        id: "a-1",
        stage: "before_merge",
        status: "pending",
        createdAt: new Date("2026-10-21T10:00:00.000Z"),
        bug: { id: "bug-3", number: 9, title: "Checkout fails" },
      },
    ]);

    const html = renderToStaticMarkup(await EscalationsPage({ searchParams: Promise.resolve({}) })).replace(/<!-- -->/g, "");

    expect(html).toContain('href="/issues/bug-3"');
    expect(html).not.toContain('href="/escalations/a-1"');
  });

  it("labels the associated issue on the detail page with #<number> <title>", async () => {
    ownerQuestion.mockResolvedValue(question);

    const html = renderToStaticMarkup(await EscalationDetailPage({ params: Promise.resolve({ id: "q-1" }) })).replace(/<!-- -->/g, "");

    expect(html).toContain("#42 Login button broken");
  });
});

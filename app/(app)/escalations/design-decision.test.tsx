import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const requireUser = vi.hoisted(() => vi.fn());
const currentTenantIdFor = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  membership: { findUnique: vi.fn() },
  agentQuestion: { findMany: vi.fn() },
  redesignProposal: { findMany: vi.fn() },
  issueApproval: { findMany: vi.fn() },
}));

vi.mock("@/lib/auth-helpers", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ currentTenantIdFor }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock("@/components/local-time", () => ({ LocalTime: () => null }));
vi.mock("./actions", () => ({
  answerEscalationAction: vi.fn(),
  decideApprovalAction: vi.fn(),
  decideRedesignAction: vi.fn(),
  quickResolveEscalationAction: vi.fn(),
}));

import EscalationsPage from "./page";

const question = {
  id: "q-1",
  body: "[Blocker] Need staging access",
  answer: null,
  answeredAt: null,
  bugId: null,
  createdAt: new Date("2026-10-20T10:00:00.000Z"),
  agent: { id: "agent-1", name: "Helper" },
  bug: null,
};
const proposal = {
  id: "r-1",
  title: "Rework the login screen",
  body: "Two mockups attached",
  status: "proposed",
  createdAt: new Date("2026-10-21T10:00:00.000Z"),
  onBehalfOfUserId: "user-1",
  bug: null,
  authorAgent: { id: "agent-2", name: "Designer", ownerUserId: "user-2" },
};

async function render(params: { status?: string; type?: string }) {
  const page = await EscalationsPage({ searchParams: Promise.resolve(params) });
  return renderToStaticMarkup(page).replace(/<!-- -->/g, "");
}

describe("redesigns as an escalation type (#433)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: "user-1" });
    currentTenantIdFor.mockResolvedValue("tenant-1");
    db.membership.findUnique.mockResolvedValue({ role: "owner" });
    db.agentQuestion.findMany.mockResolvedValue([question]);
    db.redesignProposal.findMany.mockResolvedValueOnce([proposal]).mockResolvedValueOnce([]);
    db.issueApproval.findMany.mockResolvedValue([]);
  });

  it("badges a redesign proposal as a design decision and offers the design filter", async () => {
    const html = await render({});

    expect(html).toContain("Design decision needed");
    expect(html).toContain('href="/escalations?type=Redesign"');
    expect(html).not.toContain("Scope Expansion</span>");
  });

  it("lists only redesign proposals under the design filter, with the decision buttons inline", async () => {
    const html = await render({ type: "Redesign" });

    expect(html).toContain("Rework the login screen");
    expect(html).not.toContain("Need staging access");
    expect(html).toContain("Approve Design");
    expect(html).toContain("Reject");
  });
});

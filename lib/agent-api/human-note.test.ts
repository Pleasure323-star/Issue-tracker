import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  bug: { findUnique: vi.fn() },
  issueClaim: { findFirst: vi.fn() },
  membership: { findUnique: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/agent-api/events", () => ({ publish: vi.fn() }));
vi.mock("@/lib/organization-role", () => ({ isOrganizationAdmin: vi.fn(() => false) }));

import { addHumanNote, humanNoteSchema } from "./issues";
import { publish } from "./events";

const agent = {
  agentId: "agent1",
  ownerId: "ada",
  tenantId: "tenant",
  level: "contributor" as const,
  keyId: "key1",
  ownerRole: null as const,
};

const inProgressBug = {
  id: "issue1",
  status: "in_progress" as const,
  tenantId: "tenant",
  projectId: "project",
  reporterId: "ada",
};

beforeEach(() => {
  vi.clearAllMocks();
  db.bug.findUnique.mockResolvedValue(null);
  db.issueClaim.findFirst.mockResolvedValue(null);
  db.membership.findUnique.mockResolvedValue(null);
});

describe("humanNoteSchema", () => {
  it("accepts a valid note", () => {
    const result = humanNoteSchema.safeParse({ note: "Check edge cases" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBe("Check edge cases");
  });

  it("rejects empty notes", () => {
    const result = humanNoteSchema.safeParse({ note: "" });
    expect(result.success).toBe(false);
  });

  it("rejects notes over 500 chars", () => {
    const result = humanNoteSchema.safeParse({ note: "x".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("addHumanNote", () => {
  it("adds a human note when the issue is in progress with an active claim", async () => {
    db.bug.findUnique.mockResolvedValue({ ...inProgressBug, reporterId: "ada" });
    db.issueClaim.findFirst.mockResolvedValue({ id: "claim1" });

    const result = await addHumanNote(agent, "issue1", "Check edge cases");

    expect(result).toEqual({ note: "Check edge cases" });
    expect(publish).toHaveBeenCalledWith(db, {
      tenantId: "tenant",
      type: "issue.human_note",
      actorAgentId: "agent1",
      bugId: "issue1",
      payload: { note: "Check edge cases", actorId: "ada" },
    });
  });

  it("rejects when the issue is not found", async () => {
    db.bug.findUnique.mockResolvedValue(null);
    await expect(addHumanNote(agent, "issue1", "Check edge cases")).rejects.toMatchObject({
      status: 404,
      message: "Issue not found.",
    });
  });

  it("rejects when the issue is not in progress", async () => {
    db.bug.findUnique.mockResolvedValue({ ...inProgressBug, status: "open" });
    await expect(addHumanNote(agent, "issue1", "Check edge cases")).rejects.toMatchObject({
      status: 409,
      message: "This issue is not in progress.",
    });
  });

  it("rejects when there is no active claim", async () => {
    db.bug.findUnique.mockResolvedValue({ ...inProgressBug, reporterId: "ada" });
    db.issueClaim.findFirst.mockResolvedValue(null);
    await expect(addHumanNote(agent, "issue1", "Check edge cases")).rejects.toMatchObject({
      status: 409,
      message: "This issue has no active agent claim.",
    });
  });

  it("rejects when the actor is not the reporter or an admin", async () => {
    db.bug.findUnique.mockResolvedValue({ ...inProgressBug, reporterId: "someone-else" });
    db.issueClaim.findFirst.mockResolvedValue({ id: "claim1" });
    await expect(addHumanNote(agent, "issue1", "Check edge cases")).rejects.toMatchObject({
      status: 403,
      message: "Only the issue reporter or an organization admin can add a note.",
    });
  });
});
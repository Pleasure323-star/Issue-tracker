"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { currentTenantIdFor } from "@/lib/tenant-context";
import { answerSchema, answerAgentQuestion } from "@/lib/agent-questions";
import { decideRedesign, redesignDecisionSchema } from "@/lib/redesigns";
import { decideApproval } from "@/lib/approvals";
import { IssueApiError } from "@/lib/agent-api/issues";

export type AnswerActionResult = { ok: true } | { ok: false; error: string };

export async function answerEscalationAction(
  _previous: AnswerActionResult | undefined,
  formData: FormData,
): Promise<AnswerActionResult> {
  const user = await requireUser();
  const tenantId = await currentTenantIdFor(user.id);
  if (!tenantId) return { ok: false, error: "Workspace membership required." };

  const escalationId = formData.get("escalationId") ?? formData.get("questionId");
  if (typeof escalationId !== "string" || !escalationId) {
    return { ok: false, error: "Invalid escalation." };
  }

  const parsed = answerSchema.safeParse({ answer: formData.get("answer") ?? "" });
  if (!parsed.success) return { ok: false, error: "Write an answer before sending it." };

  try {
    await answerAgentQuestion(user.id, tenantId, escalationId, parsed.data.answer);
  } catch (error) {
    if (error instanceof IssueApiError) return { ok: false, error: error.message };
    throw error;
  }

  revalidatePath("/escalations");
  revalidatePath(`/escalations/${escalationId}`);
  revalidatePath("/questions");
  revalidatePath(`/questions/${escalationId}`);
  return { ok: true };
}

export async function quickResolveEscalationAction(
  escalationId: string,
  actionType: "approve" | "authorize" | "reject",
): Promise<AnswerActionResult> {
  const user = await requireUser();
  const tenantId = await currentTenantIdFor(user.id);
  if (!tenantId) return { ok: false, error: "Workspace membership required." };

  let answerText = "Approved. Proceed with your proposed approach.";
  if (actionType === "authorize") {
    answerText = "Work authorized. You may begin implementation.";
  } else if (actionType === "reject") {
    answerText = "Declined. Do not proceed with this direction.";
  }

  try {
    await answerAgentQuestion(user.id, tenantId, escalationId, answerText);
  } catch (error) {
    if (error instanceof IssueApiError) return { ok: false, error: error.message };
    throw error;
  }

  revalidatePath("/escalations");
  revalidatePath(`/escalations/${escalationId}`);
  revalidatePath("/issues");
  return { ok: true };
}

const decisionTargetId = z.string().trim().min(1).max(191);
const approvalDecision = z.enum(["approved", "rejected"]);

export type DecideRedesignResult = { ok: true } | { ok: false; error: string };

export async function decideRedesignAction(
  proposalId: string,
  decision: "approved" | "rejected" | "chosen",
): Promise<DecideRedesignResult> {
  const user = await requireUser();
  const tenantId = await currentTenantIdFor(user.id);
  if (!tenantId) return { ok: false, error: "Workspace membership required." };

  const id = decisionTargetId.safeParse(proposalId);
  const parsed = redesignDecisionSchema.safeParse({ decision });
  if (!id.success || !parsed.success) return { ok: false, error: "Invalid redesign decision." };

  try {
    await decideRedesign(user.id, tenantId, id.data, parsed.data.decision);
  } catch (error) {
    if (error instanceof IssueApiError) return { ok: false, error: error.message };
    throw error;
  }

  revalidatePath("/escalations");
  return { ok: true };
}

export type DecideApprovalResult = { ok: true } | { ok: false; error: string };

export async function decideApprovalAction(
  approvalId: string,
  decision: "approved" | "rejected",
): Promise<DecideApprovalResult> {
  const user = await requireUser();
  const tenantId = await currentTenantIdFor(user.id);
  if (!tenantId) return { ok: false, error: "Workspace membership required." };

  const id = decisionTargetId.safeParse(approvalId);
  const parsed = approvalDecision.safeParse(decision);
  if (!id.success || !parsed.success) return { ok: false, error: "Invalid approval decision." };

  try {
    await decideApproval(user.id, tenantId, id.data, parsed.data);
  } catch (error) {
    if (error instanceof IssueApiError) return { ok: false, error: error.message };
    throw error;
  }

  revalidatePath("/escalations");
  return { ok: true };
}

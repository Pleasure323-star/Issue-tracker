/**
 * Who may move a bug through its workflow.
 *
 * Ticket #10: "Set Bug Report Status to Open by Default and Restrict Status
 * Changes to Assignees". Status is the assignee's call, so they own it.
 *
 * Interaction with the admin-only triage gate (ticket #9): severity and
 * assignee stay admin-only, but status is deliberately not. Gating status
 * behind `isAdmin` *and* the assignee would mean a non-admin assignee could
 * never move their own bug, and no admin could either — the bug would be stuck
 * on "Open" forever. So the assignee keeps status regardless of role.
 *
 * An unassigned bug has no assignee to defer to, so admin triage applies there
 * to avoid the same deadlock.
 */
export function canChangeBugStatus(
  userId: string,
  assigneeId: string | null,
  isAdminUser: boolean,
): boolean {
  if (assigneeId === userId) return true;
  if (assigneeId === null) return isAdminUser;
  return false;
}

export const NOT_ASSIGNEE_MESSAGE =
  "Only the assignee can change this bug's status.";
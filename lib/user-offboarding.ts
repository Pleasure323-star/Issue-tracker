import "server-only";
import type { PrismaClient } from "@prisma/client";

/**
 * Internal offboarding operation for trusted administrative callers (#356).
 * Reassign required history to an existing retention account before deletion.
 * Assignees are cleared and user-owned dependent rows follow their FK policies.
 * Callers must authorize offboarding before invoking this helper.
 */
export async function offboardUser(
  db: PrismaClient,
  userId: string,
  replacementUserId: string,
): Promise<void> {
  if (userId === replacementUserId) {
    throw new Error("The replacement user must be a different account");
  }

  await db.$transaction(async (tx) => {
    await tx.user.findUniqueOrThrow({ where: { id: replacementUserId } });

    await tx.bug.updateMany({
      where: { reporterId: userId },
      data: { reporterId: replacementUserId },
    });
    await tx.comment.updateMany({
      where: { authorId: userId },
      data: { authorId: replacementUserId },
    });
    await tx.bugActivity.updateMany({
      where: { actorId: userId },
      data: { actorId: replacementUserId },
    });

    await tx.user.delete({ where: { id: userId } });
  });
}

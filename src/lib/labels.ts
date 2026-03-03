import { eq, and, asc } from "drizzle-orm";
import { db } from "@/db";
import { labels, taskLabels } from "@/db/schema";

type Result<T> = { data: T; error: null } | { data: null; error: string };

export async function createLabel(
  workspaceId: string,
  name: string,
  color: string
): Promise<Result<typeof labels.$inferSelect>> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { data: null, error: "Label name is required" };
  }

  const [label] = await db
    .insert(labels)
    .values({ workspaceId, name: trimmed, color })
    .returning();

  return { data: label, error: null };
}

export async function getWorkspaceLabels(
  workspaceId: string
): Promise<Result<Array<typeof labels.$inferSelect>>> {
  const result = await db.query.labels.findMany({
    where: eq(labels.workspaceId, workspaceId),
    orderBy: [asc(labels.name)],
  });

  return { data: result, error: null };
}

export async function deleteLabel(
  labelId: string,
  workspaceId: string
): Promise<Result<{ deleted: boolean }>> {
  const existing = await db.query.labels.findFirst({
    where: and(eq(labels.id, labelId), eq(labels.workspaceId, workspaceId)),
  });

  if (!existing) {
    return { data: null, error: "Label not found" };
  }

  await db.delete(labels).where(eq(labels.id, labelId));

  return { data: { deleted: true }, error: null };
}

export async function addLabelToTask(
  taskId: string,
  labelId: string
): Promise<Result<{ added: boolean }>> {
  const existing = await db.query.taskLabels.findFirst({
    where: and(
      eq(taskLabels.taskId, taskId),
      eq(taskLabels.labelId, labelId)
    ),
  });

  if (existing) {
    return { data: { added: true }, error: null };
  }

  await db.insert(taskLabels).values({ taskId, labelId });

  return { data: { added: true }, error: null };
}

export async function removeLabelFromTask(
  taskId: string,
  labelId: string
): Promise<Result<{ removed: boolean }>> {
  await db
    .delete(taskLabels)
    .where(
      and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId))
    );

  return { data: { removed: true }, error: null };
}

export async function getTaskLabels(
  taskId: string
): Promise<Result<Array<typeof labels.$inferSelect>>> {
  const result = await db.query.taskLabels.findMany({
    where: eq(taskLabels.taskId, taskId),
    with: { label: true },
  });

  return { data: result.map((tl) => tl.label), error: null };
}

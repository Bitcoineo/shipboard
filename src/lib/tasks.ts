import { eq, max, asc } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";

type Result<T> = { data: T; error: null } | { data: null; error: string };

export async function createTask(
  columnId: string,
  boardId: string,
  title: string,
  data?: {
    description?: string;
    assigneeId?: string;
    priority?: "none" | "low" | "medium" | "high" | "urgent";
    dueDate?: string;
  }
): Promise<Result<typeof tasks.$inferSelect>> {
  const trimmed = title.trim();
  if (!trimmed) {
    return { data: null, error: "Task title is required" };
  }

  const result = await db
    .select({ maxPos: max(tasks.position) })
    .from(tasks)
    .where(eq(tasks.columnId, columnId));
  const position = (result[0]?.maxPos ?? 0) + 1000;

  const [task] = await db
    .insert(tasks)
    .values({
      columnId,
      boardId,
      title: trimmed,
      description: data?.description?.trim() || null,
      assigneeId: data?.assigneeId || null,
      priority: data?.priority || "none",
      dueDate: data?.dueDate || null,
      position,
    })
    .returning();

  return { data: task, error: null };
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    assigneeId?: string | null;
    priority?: "none" | "low" | "medium" | "high" | "urgent";
    dueDate?: string | null;
  }
): Promise<Result<typeof tasks.$inferSelect>> {
  const existing = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!existing) {
    return { data: null, error: "Task not found" };
  }

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.title !== undefined) {
    const trimmed = data.title.trim();
    if (!trimmed) return { data: null, error: "Task title is required" };
    updates.title = trimmed;
  }
  if (data.description !== undefined) updates.description = data.description;
  if (data.assigneeId !== undefined) updates.assigneeId = data.assigneeId;
  if (data.priority !== undefined) updates.priority = data.priority;
  if (data.dueDate !== undefined) updates.dueDate = data.dueDate;

  const [updated] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, taskId))
    .returning();

  return { data: updated, error: null };
}

export async function deleteTask(
  taskId: string
): Promise<Result<{ deleted: boolean }>> {
  const existing = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!existing) {
    return { data: null, error: "Task not found" };
  }

  await db.delete(tasks).where(eq(tasks.id, taskId));

  return { data: { deleted: true }, error: null };
}

export async function moveTask(
  taskId: string,
  targetColumnId: string,
  position: number
): Promise<Result<typeof tasks.$inferSelect>> {
  const existing = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!existing) {
    return { data: null, error: "Task not found" };
  }

  const [updated] = await db
    .update(tasks)
    .set({
      columnId: targetColumnId,
      position,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return { data: updated, error: null };
}

export async function getBoardTasks(
  boardId: string
): Promise<Result<Array<typeof tasks.$inferSelect & { assignee: { id: string; name: string | null; avatarColor: string | null } | null }>>> {
  const result = await db.query.tasks.findMany({
    where: eq(tasks.boardId, boardId),
    orderBy: [asc(tasks.position)],
    with: {
      assignee: {
        columns: {
          id: true,
          name: true,
          avatarColor: true,
        },
      },
    },
  });

  return { data: result, error: null };
}

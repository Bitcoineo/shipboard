import { eq, and, max } from "drizzle-orm";
import { db } from "@/db";
import { columns } from "@/db/schema";

type Result<T> = { data: T; error: null } | { data: null; error: string };

export async function createColumn(
  boardId: string,
  name: string,
  position?: number
): Promise<Result<typeof columns.$inferSelect>> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { data: null, error: "Column name is required" };
  }

  let pos = position;
  if (pos === undefined) {
    const result = await db
      .select({ maxPos: max(columns.position) })
      .from(columns)
      .where(eq(columns.boardId, boardId));
    pos = (result[0]?.maxPos ?? 0) + 1000;
  }

  const [column] = await db
    .insert(columns)
    .values({ boardId, name: trimmed, position: pos })
    .returning();

  return { data: column, error: null };
}

export async function updateColumn(
  columnId: string,
  boardId: string,
  name: string
): Promise<Result<typeof columns.$inferSelect>> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { data: null, error: "Column name is required" };
  }

  const existing = await db.query.columns.findFirst({
    where: and(eq(columns.id, columnId), eq(columns.boardId, boardId)),
  });

  if (!existing) {
    return { data: null, error: "Column not found" };
  }

  const [updated] = await db
    .update(columns)
    .set({ name: trimmed })
    .where(eq(columns.id, columnId))
    .returning();

  return { data: updated, error: null };
}

export async function deleteColumn(
  columnId: string,
  boardId: string
): Promise<Result<{ deleted: boolean }>> {
  const existing = await db.query.columns.findFirst({
    where: and(eq(columns.id, columnId), eq(columns.boardId, boardId)),
  });

  if (!existing) {
    return { data: null, error: "Column not found" };
  }

  await db.delete(columns).where(eq(columns.id, columnId));

  return { data: { deleted: true }, error: null };
}

export async function reorderColumns(
  boardId: string,
  columnIds: string[]
): Promise<Result<{ reordered: boolean }>> {
  for (let i = 0; i < columnIds.length; i++) {
    await db
      .update(columns)
      .set({ position: (i + 1) * 1000 })
      .where(and(eq(columns.id, columnIds[i]), eq(columns.boardId, boardId)));
  }

  return { data: { reordered: true }, error: null };
}

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { boards, columns } from "@/db/schema";

type Result<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_COLUMNS = [
  { name: "To Do", position: 1000 },
  { name: "In Progress", position: 2000 },
  { name: "Done", position: 3000 },
];

export async function createBoard(
  workspaceId: string,
  name: string,
  description?: string
): Promise<Result<typeof boards.$inferSelect>> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) {
    return { data: null, error: "Board name must be at least 2 characters" };
  }

  const [board] = await db
    .insert(boards)
    .values({
      workspaceId,
      name: trimmed,
      description: description?.trim() || null,
    })
    .returning();

  for (const col of DEFAULT_COLUMNS) {
    await db.insert(columns).values({
      boardId: board.id,
      name: col.name,
      position: col.position,
    });
  }

  return { data: board, error: null };
}

export async function getWorkspaceBoards(
  workspaceId: string
): Promise<
  Result<
    Array<
      typeof boards.$inferSelect & { columnCount: number; taskCount: number }
    >
  >
> {
  const boardRows = await db.query.boards.findMany({
    where: eq(boards.workspaceId, workspaceId),
    with: {
      columns: true,
      tasks: true,
    },
  });

  const result = boardRows.map((b) => ({
    id: b.id,
    workspaceId: b.workspaceId,
    name: b.name,
    description: b.description,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    columnCount: b.columns.length,
    taskCount: b.tasks.length,
  }));

  return { data: result, error: null };
}

export async function getBoardWithColumns(
  boardId: string,
  workspaceId: string
): Promise<
  Result<
    | (typeof boards.$inferSelect & {
        columns: Array<typeof columns.$inferSelect & { taskCount: number }>;
      })
    | null
  >
> {
  const board = await db.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.workspaceId, workspaceId)),
    with: {
      columns: {
        orderBy: (cols, { asc }) => [asc(cols.position)],
        with: {
          tasks: true,
        },
      },
    },
  });

  if (!board) return { data: null, error: null };

  const result = {
    id: board.id,
    workspaceId: board.workspaceId,
    name: board.name,
    description: board.description,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    columns: board.columns.map((col) => ({
      id: col.id,
      boardId: col.boardId,
      name: col.name,
      position: col.position,
      createdAt: col.createdAt,
      taskCount: col.tasks.length,
    })),
  };

  return { data: result, error: null };
}

export async function getBoardWithColumnsAndTasks(
  boardId: string,
  workspaceId: string
) {
  const board = await db.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.workspaceId, workspaceId)),
    with: {
      columns: {
        orderBy: (cols, { asc }) => [asc(cols.position)],
        with: {
          tasks: {
            orderBy: (t, { asc }) => [asc(t.position)],
            with: {
              assignee: {
                columns: {
                  id: true,
                  name: true,
                  avatarColor: true,
                },
              },
              labels: {
                with: {
                  label: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!board) return { data: null, error: null };

  return { data: board, error: null };
}

export async function deleteBoard(
  boardId: string,
  workspaceId: string
): Promise<Result<{ deleted: boolean }>> {
  const board = await db.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.workspaceId, workspaceId)),
  });

  if (!board) {
    return { data: null, error: "Board not found" };
  }

  await db.delete(boards).where(eq(boards.id, boardId));

  return { data: { deleted: true }, error: null };
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { getBoardWithColumns } from "@/lib/boards";
import { updateColumn, deleteColumn } from "@/lib/columns";

type Params = {
  params: { workspaceSlug: string; boardId: string; columnId: string };
};

async function resolveAndAuthorize(params: Params["params"], userId: string) {
  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) return { error: "Workspace not found", status: 404 } as const;

  const member = await hasPermission(userId, workspace.id, "member");
  if (!member) return { error: "Forbidden", status: 403 } as const;

  const { data: board } = await getBoardWithColumns(params.boardId, workspace.id);
  if (!board) return { error: "Board not found", status: 404 } as const;

  return { workspace, board } as const;
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveAndAuthorize(params, session.user.id);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { name } = await request.json();
  const result = await updateColumn(params.columnId, params.boardId, name);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveAndAuthorize(params, session.user.id);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const result = await deleteColumn(params.columnId, params.boardId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ data: result.data });
}

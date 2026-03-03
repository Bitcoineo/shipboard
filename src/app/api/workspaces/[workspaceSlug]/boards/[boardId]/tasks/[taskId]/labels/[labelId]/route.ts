import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { removeLabelFromTask } from "@/lib/labels";

type Params = {
  params: {
    workspaceSlug: string;
    boardId: string;
    taskId: string;
    labelId: string;
  };
};

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const member = await hasPermission(session.user.id, workspace.id, "member");
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await removeLabelFromTask(params.taskId, params.labelId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}

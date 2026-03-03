import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { getBoardWithColumnsAndTasks } from "@/lib/boards";
import { getWorkspaceLabels } from "@/lib/labels";
import BoardColumns from "./board-columns";

export default async function BoardPage({
  params,
}: {
  params: { workspaceSlug: string; boardId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) redirect("/workspaces");

  const member = await hasPermission(session.user.id, workspace.id, "member");
  if (!member) redirect("/workspaces");

  const { data: board } = await getBoardWithColumnsAndTasks(
    params.boardId,
    workspace.id
  );
  if (!board) redirect(`/${params.workspaceSlug}`);

  const { data: labels } = await getWorkspaceLabels(workspace.id);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{board.name}</h1>
        {board.description && (
          <p className="mt-1 text-sm text-gray-500">{board.description}</p>
        )}
      </div>
      <BoardColumns
        initialColumns={board.columns}
        boardId={board.id}
        workspaceSlug={params.workspaceSlug}
        workspaceLabels={labels ?? []}
      />
    </div>
  );
}

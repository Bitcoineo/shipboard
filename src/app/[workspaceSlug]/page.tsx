import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { getWorkspaceBoards } from "@/lib/boards";
import BoardList from "./board-list";

export default async function WorkspacePage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) redirect("/workspaces");

  const member = await hasPermission(session.user.id, workspace.id, "member");
  if (!member) redirect("/workspaces");

  const { data: boards } = await getWorkspaceBoards(workspace.id);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#2D2D2D]">{workspace.name}</h1>
      <div className="mt-6">
        <BoardList
          initialBoards={boards ?? []}
          workspaceSlug={params.workspaceSlug}
        />
      </div>
    </div>
  );
}

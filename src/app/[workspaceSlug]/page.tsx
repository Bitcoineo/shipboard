import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { getWorkspaceBoards } from "@/lib/boards";
import BoardList from "./board-list";
import DeleteWorkspace from "./delete-workspace";

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

  const isOwner = member.role === "owner";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#37352F]">{workspace.name}</h1>
      <p className="mt-1 text-sm text-[#787774]">
        Your role: <strong className="capitalize text-[#37352F]">{member.role}</strong>
      </p>
      <div className="mt-6">
        <BoardList
          initialBoards={boards ?? []}
          workspaceSlug={params.workspaceSlug}
        />
      </div>

      {isOwner && (
        <DeleteWorkspace
          workspaceName={workspace.name}
          workspaceSlug={params.workspaceSlug}
        />
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { getWorkspaceBoards } from "@/lib/boards";
import { isMember } from "@/lib/permissions";
import MobileLayout from "./mobile-layout";
import CommandPalette from "./command-palette";
import WorkspaceBreadcrumb from "./breadcrumb";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) redirect("/workspaces");

  const memberCheck = await isMember(session.user.id, workspace.id);
  if (!memberCheck) redirect("/workspaces");

  const { data: boards } = await getWorkspaceBoards(workspace.id);

  const boardList = (boards ?? []).map((b) => ({ id: b.id, name: b.name }));

  const sidebarProps = {
    workspaceName: workspace.name,
    workspaceSlug: params.workspaceSlug,
    boards: boardList,
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <MobileLayout sidebarProps={sidebarProps}>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[#EEEEED] bg-white px-4 sm:px-6 py-3">
            <WorkspaceBreadcrumb
              workspaceSlug={params.workspaceSlug}
              workspaceName={workspace.name}
              boards={boardList}
            />
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: "#4F46E5" }}
                title={session.user.name || session.user.email || ""}
              >
                {(session.user.name || session.user.email || "?")[0].toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8">{children}</main>
        </div>
      </MobileLayout>

      <CommandPalette
        workspaceSlug={params.workspaceSlug}
        workspaceName={workspace.name}
        boards={boardList}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { getWorkspaceBoards } from "@/lib/boards";
import { isMember } from "@/lib/permissions";
import Link from "next/link";
import Sidebar from "./sidebar";

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

  return (
    <div className="flex h-screen">
      <Sidebar
        workspaceName={workspace.name}
        workspaceSlug={params.workspaceSlug}
        boards={(boards ?? []).map((b) => ({ id: b.id, name: b.name }))}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/workspaces"
              className="font-semibold text-gray-900 hover:text-gray-700"
            >
              ShipBoard
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/${params.workspaceSlug}`}
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              {workspace.name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: "#171717" }}
              title={session.user.name || session.user.email || ""}
            >
              {(session.user.name || session.user.email || "?")[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

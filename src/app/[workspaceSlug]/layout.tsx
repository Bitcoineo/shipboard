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
        <header className="flex items-center justify-between border-b border-[#E8E5E0] bg-white px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/workspaces"
              className="flex items-center gap-1.5 font-semibold text-[#37352F] transition-colors hover:text-[#2383E2]"
            >
              <svg className="h-4 w-4 text-[#2383E2]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
                <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
              </svg>
              ShipBoard
            </Link>
            <span className="text-[#E8E5E0]">/</span>
            <Link
              href={`/${params.workspaceSlug}`}
              className="font-medium text-[#787774] transition-colors hover:text-[#37352F]"
            >
              {workspace.name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: "#2383E2" }}
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

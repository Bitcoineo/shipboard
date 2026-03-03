import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import DeleteWorkspace from "../delete-workspace";

export default async function SettingsPage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) redirect("/workspaces");

  const member = await hasPermission(session.user.id, workspace.id, "owner");
  if (!member) redirect(`/${params.workspaceSlug}`);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2D2D2D]">Settings</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">
        Workspace configuration.
      </p>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-[#2D2D2D]">General</h2>
        <div className="mt-3 space-y-3">
          <div className="rounded-md border border-[#EEEEED] bg-white px-4 py-3">
            <p className="text-xs text-[#A3A3A3]">Name</p>
            <p className="mt-0.5 text-sm font-medium text-[#2D2D2D]">
              {workspace.name}
            </p>
          </div>
          <div className="rounded-md border border-[#EEEEED] bg-white px-4 py-3">
            <p className="text-xs text-[#A3A3A3]">Slug</p>
            <p className="mt-0.5 text-sm font-medium text-[#2D2D2D]">
              /{workspace.slug}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <DeleteWorkspace
          workspaceName={workspace.name}
          workspaceSlug={params.workspaceSlug}
        />
      </div>
    </div>
  );
}

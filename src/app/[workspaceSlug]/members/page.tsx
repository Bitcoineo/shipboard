import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { getWorkspaceMembers } from "@/lib/members";
import { getWorkspaceInvites } from "@/lib/invites";
import { getWorkspaceLabels } from "@/lib/labels";
import MemberList from "./member-list";

export default async function MembersPage({
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

  const { data: members } = await getWorkspaceMembers(workspace.id);
  const isAdmin = member.role === "admin" || member.role === "owner";

  const { data: pendingInvites } = isAdmin
    ? await getWorkspaceInvites(workspace.id)
    : { data: [] };

  const { data: labels } = await getWorkspaceLabels(workspace.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#37352F]">Members & Settings</h1>
      <p className="mt-1 text-sm text-[#787774]">
        People with access to this workspace.
      </p>
      <div className="mt-6">
        <MemberList
          members={members ?? []}
          pendingInvites={pendingInvites ?? []}
          labels={labels ?? []}
          currentUserRole={member.role}
          currentUserId={session.user.id}
          workspaceSlug={params.workspaceSlug}
        />
      </div>
    </div>
  );
}

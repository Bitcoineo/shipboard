import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { hasPermission } from "@/lib/permissions";
import { updateMemberRole, removeMember } from "@/lib/members";

type Params = { params: { workspaceSlug: string; memberId: string } };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Only owner can change roles
  const member = await hasPermission(session.user.id, workspace.id, "owner");
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role } = await request.json();

  if (!role || !["admin", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Valid role (admin/member) required" },
      { status: 400 }
    );
  }

  const result = await updateMemberRole(params.memberId, workspace.id, role);

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

  const { data: workspace } = await getWorkspaceBySlug(params.workspaceSlug);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Admin+ can remove members
  const member = await hasPermission(session.user.id, workspace.id, "admin");
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await removeMember(params.memberId, workspace.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}

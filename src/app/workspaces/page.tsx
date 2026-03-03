import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getUserWorkspaces } from "@/lib/workspaces";
import WorkspaceList from "./workspace-list";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { data: workspaces } = await getUserWorkspaces(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">ShipBoard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <WorkspaceList initialWorkspaces={workspaces ?? []} />
      </main>
    </div>
  );
}

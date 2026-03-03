import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getUserWorkspaces } from "@/lib/workspaces";
import Link from "next/link";
import WorkspaceList from "./workspace-list";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { data: workspaces } = await getUserWorkspaces(session.user.id);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <header className="border-b border-[#E8E5E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/workspaces" className="flex items-center gap-1.5">
            <svg className="h-5 w-5 text-[#2383E2]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
              <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
            </svg>
            <span className="text-xl font-semibold text-[#37352F]">ShipBoard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#787774]">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-[#E8E5E0] px-3 py-1.5 text-sm text-[#787774] transition-colors hover:bg-[#EFEFEF]"
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

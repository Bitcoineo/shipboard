import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/workspaces");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-gray-900">ShipBoard</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <svg
              className="h-16 w-16 text-gray-900"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.2" />
              <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.4" />
              <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Ship faster, together.
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            The simple project board for teams that want to move fast.
            Organize tasks, collaborate with your team, and ship what matters.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-center text-xs text-gray-400">
        ShipBoard &mdash; Team task &amp; project management
      </footer>
    </div>
  );
}

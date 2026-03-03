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
        <span className="text-lg font-bold text-[#37352F]">ShipBoard</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md border border-[#E8E5E0] px-4 py-2 text-sm font-medium text-[#37352F] transition-colors hover:bg-[#F7F7F5]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-[#2383E2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2]"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="mx-auto max-w-2xl animate-fade-in-up text-center">
          <div className="mb-8 flex justify-center">
            <svg
              className="h-16 w-16 text-[#2383E2]"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.2" />
              <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.4" />
              <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-[#37352F]">
            Your team&apos;s work. One board.
          </h1>
          <p className="mt-4 text-lg text-[#787774]">
            See every task, who owns it, and what&apos;s blocking it — without a single status meeting.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-[#2383E2] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2] active:scale-[0.98]"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-[#E8E5E0] px-6 py-3 text-sm font-medium text-[#37352F] transition-colors hover:bg-[#F7F7F5]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E8E5E0] px-6 py-6 text-center text-xs text-[#9B9A97]">
        Built by Bitcoineo
      </footer>
    </div>
  );
}

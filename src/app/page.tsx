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
        <Link href="/" className="flex items-center gap-1.5">
          <svg className="h-5 w-5 text-[#2383E2]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
            <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
          </svg>
          <span className="text-lg font-bold text-[#37352F]">ShipBoard</span>
        </Link>
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
          <h1 className="text-5xl font-bold tracking-tight text-[#37352F]">
            Your team&apos;s work. One board.
          </h1>
          <p className="mt-4 text-lg text-[#787774]">
            See what&apos;s happening, who&apos;s on it, and what&apos;s next.
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

          {/* Kanban animation mockup */}
          <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#E8E5E0] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex gap-2 sm:gap-3">
              {/* ── To Do column ── */}
              <div className="kb-col-1 flex-1 rounded-lg bg-[#F7F7F5] p-2 opacity-0 sm:p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#787774] sm:text-xs">To Do</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {/* Card 1 — will lift + move to In Progress at 3s */}
                  <div className="kb-card-move-source rounded-md border border-[#E8E5E0] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1.5 h-1 w-4 rounded-full bg-[#F97316]" />
                        <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                        <div className="mt-1 h-1.5 w-3/4 rounded bg-[#E8E5E0] sm:h-2" />
                      </div>
                      <div className="ml-2 h-4 w-4 flex-shrink-0 rounded-full bg-[#D3D1CB] sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  {/* Card 2 — priority shifts yellow→red at 3.8s */}
                  <div className="kb-card-2 rounded-md border border-[#E8E5E0] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="mb-1.5 h-1 w-4 rounded-full bg-[#EAB308] kb-priority-shift" />
                    <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                    <div className="mt-1 h-1.5 w-2/3 rounded bg-[#E8E5E0] sm:h-2" />
                  </div>
                  {/* Card 3 */}
                  <div className="kb-card-3 rounded-md border border-[#E8E5E0] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="mb-1.5 h-1 w-4 rounded-full bg-[#EF4444]" />
                    <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                    <div className="mt-1 h-1.5 w-1/2 rounded bg-[#E8E5E0] sm:h-2" />
                    <div className="mt-1 h-1.5 w-3/4 rounded bg-[#E8E5E0] sm:h-2" />
                  </div>
                </div>
              </div>

              {/* ── In Progress column ── */}
              <div className="kb-col-2 kb-idle-pulse flex-1 rounded-lg bg-[#F7F7F5] p-2 opacity-0 sm:p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#787774] sm:text-xs">In Progress</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {/* Card 4 — avatar pops in at 4.2s */}
                  <div className="kb-card-4 rounded-md border border-[#E8E5E0] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1.5 h-1 w-4 rounded-full bg-[#3B82F6]" />
                        <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                        <div className="mt-1 h-1.5 w-1/2 rounded bg-[#E8E5E0] sm:h-2" />
                      </div>
                      <div className="kb-avatar-pop ml-2 h-4 w-4 flex-shrink-0 rounded-full bg-[#2383E2] sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  {/* Card 5 */}
                  <div className="kb-card-5 rounded-md border border-[#E8E5E0] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1.5 h-1 w-4 rounded-full bg-[#EAB308]" />
                        <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                        <div className="mt-1 h-1.5 w-2/3 rounded bg-[#E8E5E0] sm:h-2" />
                      </div>
                      <div className="ml-2 h-4 w-4 flex-shrink-0 rounded-full bg-[#D3D1CB] sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  {/* Ghost card — moves in from To Do at 3.5s */}
                  <div className="kb-card-move-target rounded-md border border-[#2383E2] bg-[#EBF5FF] p-2 shadow-sm sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1.5 h-1 w-4 rounded-full bg-[#F97316]" />
                        <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                        <div className="mt-1 h-1.5 w-3/4 rounded bg-[#E8E5E0] sm:h-2" />
                      </div>
                      <div className="ml-2 h-4 w-4 flex-shrink-0 rounded-full bg-[#D3D1CB] sm:h-5 sm:w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Done column ── */}
              <div className="kb-col-3 flex-1 rounded-lg bg-[#F7F7F5] p-2 opacity-0 sm:p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#787774] sm:text-xs">Done</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {/* Card 6 — check + strikethrough */}
                  <div className="kb-card-6 relative rounded-md border border-[#E8E5E0] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="mb-1.5 h-1 w-4 rounded-full bg-[#10B981]" />
                    <div className="relative">
                      <div className="h-1.5 w-full rounded bg-[#E8E5E0] sm:h-2" />
                      <div className="kb-strikethrough" />
                    </div>
                    <div className="kb-check absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#10B981] sm:h-5 sm:w-5">
                      <svg className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E8E5E0] px-6 py-6">
        <div className="flex items-center justify-center gap-3 text-sm text-[#9B9A97]">
          <span>Built by Bitcoineo</span>
          <a href="https://github.com/Bitcoineo" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#37352F]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#37352F]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

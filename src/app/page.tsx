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
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-1.5">
          <svg className="h-5 w-5 text-[#4F46E5]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
            <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
          </svg>
          <span className="text-lg font-bold text-[#2D2D2D]">ShipBoard</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md border border-[#EEEEED] px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-[#2D2D2D] transition-colors hover:bg-[#F8F8F7]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-[#4F46E5] px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition-colors hover:bg-[#4338CA]"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 pb-16">
        <div className="mx-auto max-w-2xl animate-fade-in-up text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#2D2D2D]">
            Your team&apos;s work. One board.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#6B6B6B]">
            See what&apos;s happening, who&apos;s on it, and what&apos;s next.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center rounded-md bg-[#4F46E5] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4338CA] active:scale-[0.98]"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center rounded-md border border-[#EEEEED] px-6 py-3 text-sm font-medium text-[#2D2D2D] transition-colors hover:bg-[#F8F8F7]"
            >
              Sign in
            </Link>
          </div>

          {/* Kanban animation mockup */}
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-[#EEEEED] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex gap-2 sm:gap-3">
              {/* ── To Do column ── */}
              <div className="kb-col-1 flex-1 rounded-lg bg-[#F8F8F7] p-2 opacity-0 sm:p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B6B] sm:text-xs">To Do</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {/* Card 1 — lifts + fades, moves to In Progress */}
                  <div className="kb-card-move-source rounded-md border border-[#EEEEED] border-l-2 border-l-[#F97316] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">Design landing page</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="rounded-full bg-blue-100 px-1 py-0.5 text-[8px] font-medium text-blue-600 sm:text-[10px]">feature</span>
                        </div>
                      </div>
                      <div className="ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[8px] font-medium text-white sm:h-5 sm:w-5 sm:text-[10px]">A</div>
                    </div>
                  </div>
                  {/* Card 2 — priority shifts yellow→red */}
                  <div className="kb-card-2 rounded-md border border-[#EEEEED] border-l-2 border-l-[#EAB308] bg-white p-2 shadow-sm opacity-0 sm:p-2.5 kb-priority-shift">
                    <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">Write docs</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="rounded-full bg-green-100 px-1 py-0.5 text-[8px] font-medium text-green-600 sm:text-[10px]">docs</span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="kb-card-3 rounded-md border border-[#EEEEED] border-l-2 border-l-[#EF4444] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">Fix auth redirect</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="rounded-full bg-red-100 px-1 py-0.5 text-[8px] font-medium text-red-600 sm:text-[10px]">bug</span>
                        </div>
                      </div>
                      <div className="ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-[8px] font-medium text-white sm:h-5 sm:w-5 sm:text-[10px]">J</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── In Progress column ── */}
              <div className="kb-col-2 kb-idle-pulse flex-1 rounded-lg bg-[#F8F8F7] p-2 opacity-0 sm:p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B6B] sm:text-xs">In Progress</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {/* Card 4 — avatar pops in */}
                  <div className="kb-card-4 rounded-md border border-[#EEEEED] border-l-2 border-l-[#3B82F6] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">Set up auth flow</p>
                      </div>
                      <div className="kb-avatar-pop ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-medium text-white sm:h-5 sm:w-5 sm:text-[10px]">M</div>
                    </div>
                  </div>
                  {/* Card 5 */}
                  <div className="kb-card-5 rounded-md border border-[#EEEEED] border-l-2 border-l-[#EAB308] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">API endpoints</p>
                      </div>
                      <div className="ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[8px] font-medium text-white sm:h-5 sm:w-5 sm:text-[10px]">A</div>
                    </div>
                  </div>
                  {/* Ghost card — moves in from To Do */}
                  <div className="kb-card-move-target rounded-md border border-[#4F46E5] border-l-2 border-l-[#4F46E5] bg-[#EEF2FF] p-2 shadow-sm sm:p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">Design landing page</p>
                      </div>
                      <div className="ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[8px] font-medium text-white sm:h-5 sm:w-5 sm:text-[10px]">A</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Done column ── */}
              <div className="kb-col-3 flex-1 rounded-lg bg-[#F8F8F7] p-2 opacity-0 sm:p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B6B] sm:text-xs">Done</p>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {/* Card 6 — check + strikethrough */}
                  <div className="kb-card-6 relative rounded-md border border-[#EEEEED] border-l-2 border-l-[#10B981] bg-white p-2 shadow-sm opacity-0 sm:p-2.5">
                    <div className="relative">
                      <p className="text-[10px] font-medium text-[#2D2D2D] sm:text-xs">Deploy to Vercel</p>
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

        {/* How it works */}
        <section className="mx-auto mt-16 w-full max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-[#2D2D2D]">How it works</h2>

          {/* Desktop layout */}
          <div className="relative mt-10 hidden sm:block">
            {/* Connector lines layer */}
            <div className="absolute left-0 right-0 top-5 z-0 flex items-center px-[calc(16.67%)]">
              <div className="flex-1" />
              <svg className="flex-1" viewBox="0 0 100 2" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="1" x2="100" y2="1" className="hiw-connector-1" stroke="#4F46E5" strokeWidth="2" strokeDasharray="4 4" pathLength="100" />
              </svg>
              <div className="flex-1" />
              <svg className="flex-1" viewBox="0 0 100 2" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="1" x2="100" y2="1" className="hiw-connector-2" stroke="#4F46E5" strokeWidth="2" strokeDasharray="4 4" pathLength="100" />
              </svg>
              <div className="flex-1" />
            </div>

            {/* Steps */}
            <div className="relative z-10 grid grid-cols-3 gap-10">
              {[
                { step: 1, title: "Create a workspace", desc: "Invite your team. Everyone sees the same boards." },
                { step: 2, title: "Add boards and tasks", desc: "Drag tasks between columns as work progresses." },
                { step: 3, title: "Ship with clarity", desc: "Always know what\u2019s done, what\u2019s stuck, and who\u2019s on it." },
              ].map((s) => (
                <div key={s.step} className={`hiw-step-${s.step} text-center`}>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4F46E5] bg-white text-sm font-bold text-[#4F46E5]">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#2D2D2D]">{s.title}</h3>
                  <p className="mt-2 text-sm text-[#6B6B6B]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile layout */}
          <div className="relative mt-10 sm:hidden">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-10 z-0 flex h-[calc(100%-80px)] flex-col items-center">
              <svg className="h-1/2 w-[2px]" viewBox="0 0 2 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="1" y1="0" x2="1" y2="100" className="hiw-connector-1" stroke="#4F46E5" strokeWidth="2" strokeDasharray="4 4" pathLength="100" />
              </svg>
              <svg className="h-1/2 w-[2px]" viewBox="0 0 2 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="1" y1="0" x2="1" y2="100" className="hiw-connector-2" stroke="#4F46E5" strokeWidth="2" strokeDasharray="4 4" pathLength="100" />
              </svg>
            </div>

            {/* Steps stacked */}
            <div className="relative z-10 space-y-10">
              {[
                { step: 1, title: "Create a workspace", desc: "Invite your team. Everyone sees the same boards." },
                { step: 2, title: "Add boards and tasks", desc: "Drag tasks between columns as work progresses." },
                { step: 3, title: "Ship with clarity", desc: "Always know what\u2019s done, what\u2019s stuck, and who\u2019s on it." },
              ].map((s) => (
                <div key={s.step} className={`hiw-step-${s.step} flex gap-4`}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#4F46E5] bg-white text-sm font-bold text-[#4F46E5]">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#2D2D2D]">{s.title}</h3>
                    <p className="mt-1 text-sm text-[#6B6B6B]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-20 text-center text-sm text-[#A3A3A3]">
          Built for teams who think in tasks, not tickets.
        </p>
      </main>

      {/* CTA band */}
      <section className="bg-[#2D2D2D] px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Your first board takes 30 seconds.</h2>
        <Link
          href="/register"
          className="mt-6 inline-block w-full max-w-xs sm:w-auto mx-auto sm:mx-0 text-center rounded-md bg-[#4F46E5] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#4338CA] active:scale-[0.98]"
        >
          Start for free
        </Link>
      </section>

      <footer className="border-t border-[#EEEEED] px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#A3A3A3]">
          <span>Built by Bitcoineo</span>
          <a href="https://github.com/Bitcoineo" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#2D2D2D]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#2D2D2D]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

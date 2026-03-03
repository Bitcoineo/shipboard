"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  workspaceName: string;
  workspaceSlug: string;
  boards: Array<{ id: string; name: string }>;
}

export default function Sidebar({
  workspaceName,
  workspaceSlug,
  boards,
}: SidebarProps) {
  const pathname = usePathname();

  const membersActive = pathname === `/${workspaceSlug}/members`;
  const settingsActive = pathname === `/${workspaceSlug}/settings`;

  return (
    <aside className="flex w-64 flex-col border-r border-[#EEEEED] bg-[#F8F8F7]">
      {/* Logo */}
      <div className="border-b border-[#EEEEED] px-4 py-3">
        <Link href="/workspaces" className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-[#4F46E5]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
            <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
          </svg>
          <span className="text-sm font-bold text-[#2D2D2D]">ShipBoard</span>
        </Link>
      </div>

      {/* Workspace header */}
      <div className="p-4">
        <Link
          href="/workspaces"
          className="flex items-center gap-1 text-xs text-[#A3A3A3] transition-colors hover:text-[#2D2D2D]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All Workspaces
        </Link>
        <h2 className="mt-3 truncate text-sm font-semibold text-[#2D2D2D]">
          {workspaceName}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {/* Boards section */}
        {boards.length > 0 && (
          <p className="mb-1 mt-1 px-2 text-[11px] font-medium uppercase tracking-wider text-[#A3A3A3]">
            Boards
          </p>
        )}
        {boards.length === 0 ? (
          <p className="mt-2 px-2 text-sm text-[#A3A3A3]">No boards yet</p>
        ) : (
          <ul className="space-y-0.5">
            {boards.map((board) => {
              const boardPath = `/${workspaceSlug}/boards/${board.id}`;
              const isActive = pathname === boardPath;
              return (
                <li key={board.id}>
                  <Link
                    href={boardPath}
                    className={`flex items-center gap-2 rounded-md py-2 text-sm transition-all duration-120 ${
                      isActive
                        ? "translate-x-0.5 border-l-[3px] border-[#4F46E5] bg-white pl-[calc(0.5rem-3px)] pr-2 font-medium text-[#4F46E5]"
                        : "px-2 text-[#6B6B6B] hover:bg-[#F0F0EF] hover:text-[#2D2D2D] hover:translate-x-0.5"
                    }`}
                  >
                    <svg className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-[#4F46E5]" : "text-[#A3A3A3]"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <span className="truncate">{board.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Workspace management section */}
        <div className="mt-4 border-t border-[#EEEEED] pt-4">
          <ul className="space-y-0.5">
            <li>
              <Link
                href={`/${workspaceSlug}/members`}
                className={`flex items-center gap-2 rounded-md py-2 text-sm transition-all duration-120 ${
                  membersActive
                    ? "translate-x-0.5 border-l-[3px] border-[#4F46E5] bg-white pl-[calc(0.5rem-3px)] pr-2 font-medium text-[#4F46E5]"
                    : "px-2 text-[#6B6B6B] hover:bg-[#F0F0EF] hover:text-[#2D2D2D] hover:translate-x-0.5"
                }`}
              >
                <svg className={`h-4 w-4 flex-shrink-0 ${membersActive ? "text-[#4F46E5]" : "text-[#A3A3A3]"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Members
              </Link>
            </li>
            <li>
              <Link
                href={`/${workspaceSlug}/settings`}
                className={`flex items-center gap-2 rounded-md py-2 text-sm transition-all duration-120 ${
                  settingsActive
                    ? "translate-x-0.5 border-l-[3px] border-[#4F46E5] bg-white pl-[calc(0.5rem-3px)] pr-2 font-medium text-[#4F46E5]"
                    : "px-2 text-[#6B6B6B] hover:bg-[#F0F0EF] hover:text-[#2D2D2D] hover:translate-x-0.5"
                }`}
              >
                <svg className={`h-4 w-4 flex-shrink-0 ${settingsActive ? "text-[#4F46E5]" : "text-[#A3A3A3]"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#EEEEED] px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
          <kbd className="rounded border border-[#EEEEED] bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#A3A3A3]">⌘K</kbd>
          <span>Search</span>
        </div>
      </div>
    </aside>
  );
}

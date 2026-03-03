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

  return (
    <aside className="flex w-60 flex-col border-r border-[#E8E5E0] bg-[#F7F7F5]">
      <div className="border-b border-[#E8E5E0] px-4 py-3">
        <Link href="/workspaces" className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-[#2383E2]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
            <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
          </svg>
          <span className="text-sm font-bold text-[#37352F]">ShipBoard</span>
        </Link>
      </div>
      <div className="p-4">
        <Link
          href="/workspaces"
          className="text-xs text-[#9B9A97] transition-colors hover:text-[#37352F]"
        >
          &larr; All Workspaces
        </Link>
        <h2 className="mt-3 truncate text-sm font-semibold text-[#37352F]">
          {workspaceName}
        </h2>
      </div>
      <nav className="flex-1 px-3">
        <div className="flex items-center gap-1.5 px-1">
          <svg className="h-3 w-3 text-[#9B9A97]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9B9A97]">
            Boards
          </p>
        </div>
        {boards.length === 0 ? (
          <p className="mt-2 px-1 text-sm text-[#9B9A97]">No boards yet</p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {boards.map((board) => {
              const boardPath = `/${workspaceSlug}/boards/${board.id}`;
              const isActive = pathname === boardPath;
              return (
                <li key={board.id}>
                  <Link
                    href={boardPath}
                    className={`block rounded-md px-2 py-1.5 text-sm transition-colors duration-120 ${
                      isActive
                        ? "bg-white font-medium text-[#2383E2]"
                        : "text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F]"
                    }`}
                  >
                    {board.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex items-center gap-1.5 px-1">
          <svg className="h-3 w-3 text-[#9B9A97]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9B9A97]">
            Settings
          </p>
        </div>
        <ul className="mt-1 space-y-0.5">
          <li>
            <Link
              href={`/${workspaceSlug}/members`}
              className={`block rounded-md px-2 py-1.5 text-sm transition-colors duration-120 ${
                pathname === `/${workspaceSlug}/members`
                  ? "bg-white font-medium text-[#2383E2]"
                  : "text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F]"
              }`}
            >
              Members
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

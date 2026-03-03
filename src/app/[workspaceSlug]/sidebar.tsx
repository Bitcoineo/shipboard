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
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="p-4">
        <Link
          href="/workspaces"
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          &larr; All Workspaces
        </Link>
        <h2 className="mt-3 text-sm font-semibold text-gray-900 truncate">
          {workspaceName}
        </h2>
      </div>
      <nav className="flex-1 px-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">
          Boards
        </p>
        {boards.length === 0 ? (
          <p className="mt-2 px-1 text-sm text-gray-400">No boards yet</p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {boards.map((board) => {
              const boardPath = `/${workspaceSlug}/boards/${board.id}`;
              const isActive = pathname === boardPath;
              return (
                <li key={board.id}>
                  <Link
                    href={boardPath}
                    className={`block rounded-md px-2 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-gray-100 font-medium text-gray-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {board.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 px-1 text-xs font-medium uppercase tracking-wider text-gray-400">
          Settings
        </p>
        <ul className="mt-1 space-y-0.5">
          <li>
            <Link
              href={`/${workspaceSlug}/members`}
              className={`block rounded-md px-2 py-1.5 text-sm transition ${
                pathname === `/${workspaceSlug}/members`
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

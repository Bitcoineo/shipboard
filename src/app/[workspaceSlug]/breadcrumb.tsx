"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface WorkspaceBreadcrumbProps {
  workspaceSlug: string;
  workspaceName: string;
  boards: Array<{ id: string; name: string }>;
}

export default function WorkspaceBreadcrumb({
  workspaceSlug,
  workspaceName,
  boards,
}: WorkspaceBreadcrumbProps) {
  const pathname = usePathname();
  const boardMatch = pathname.match(/\/boards\/([^/]+)/);
  const activeBoard = boardMatch
    ? boards.find((b) => b.id === boardMatch[1])
    : null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href="/workspaces"
        className="flex items-center gap-1.5 font-semibold text-[#2D2D2D] transition-colors hover:text-[#4F46E5]"
      >
        <svg
          className="h-4 w-4 text-[#4F46E5]"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
          <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
        </svg>
        ShipBoard
      </Link>
      <span className="text-[#EEEEED]">/</span>
      <Link
        href={`/${workspaceSlug}`}
        className="font-medium text-[#6B6B6B] transition-colors hover:text-[#2D2D2D]"
      >
        {workspaceName}
      </Link>
      {activeBoard && (
        <>
          <span className="text-[#EEEEED]">/</span>
          <span className="font-medium text-[#2D2D2D]">
            {activeBoard.name}
          </span>
        </>
      )}
    </div>
  );
}

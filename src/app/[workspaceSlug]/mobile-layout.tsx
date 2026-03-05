"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

interface MobileLayoutProps {
  sidebarProps: {
    workspaceName: string;
    workspaceSlug: string;
    boards: Array<{ id: string; name: string }>;
  };
  children: React.ReactNode;
}

export default function MobileLayout({
  sidebarProps,
  children,
}: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger header */}
      <div className="flex items-center border-b border-[#EEEEED] bg-[#F8F8F7] px-4 py-2.5 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded p-1.5 text-[#6B6B6B] hover:bg-[#F0F0EF]"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="ml-2 text-sm font-semibold text-[#2D2D2D] truncate">
          {sidebarProps.workspaceName}
        </span>
      </div>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 w-64 md:hidden">
            <Sidebar
              {...sidebarProps}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {children}
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface CommandPaletteProps {
  workspaceSlug: string;
  workspaceName: string;
  boards: Array<{ id: string; name: string }>;
}

interface CommandItem {
  id: string;
  label: string;
  group: "Boards" | "Actions";
  hint?: string;
  action: () => void;
}

export default function CommandPalette({
  workspaceSlug,
  workspaceName,
  boards,
}: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const items: CommandItem[] = [
    ...boards.map((board) => ({
      id: `board-${board.id}`,
      label: board.name,
      group: "Boards" as const,
      hint: "Open board",
      action: () => {
        router.push(`/${workspaceSlug}/boards/${board.id}`);
        setOpen(false);
      },
    })),
    {
      id: "action-members",
      label: "Go to Members",
      group: "Actions",
      hint: "Settings",
      action: () => {
        router.push(`/${workspaceSlug}/members`);
        setOpen(false);
      },
    },
    {
      id: "action-switch",
      label: "Switch workspace",
      group: "Actions",
      hint: "Navigation",
      action: () => {
        router.push("/workspaces");
        setOpen(false);
      },
    },
  ];

  const filtered = query
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const groups = {
    Boards: filtered.filter((i) => i.group === "Boards"),
    Actions: filtered.filter((i) => i.group === "Actions"),
  };

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setActiveIndex(0);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on pathname change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action();
      }
    },
    [filtered, activeIndex]
  );

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) setOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[20vh] animate-fade-in"
    >
      <div className="mx-4 w-full max-w-lg rounded-md bg-white shadow-lg animate-cmd-palette-in">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[#EEEEED] px-4 py-3">
          <svg
            className="h-4 w-4 shrink-0 text-[#A3A3A3]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleNavigation}
            placeholder={`Search ${workspaceName}...`}
            className="w-full border-0 bg-transparent text-sm text-[#2D2D2D] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-0"
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#A3A3A3]">
              No results
            </p>
          ) : (
            Object.entries(groups).map(
              ([group, groupItems]) =>
                groupItems.length > 0 && (
                  <div key={group}>
                    <p className="px-4 py-1.5 text-xs font-medium text-[#A3A3A3]">
                      {group}
                    </p>
                    {groupItems.map((item) => {
                      const idx = flatIndex++;
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`flex w-full items-center justify-between border-l-2 px-4 py-2 text-left text-sm transition-colors duration-100 ${
                            idx === activeIndex
                              ? "border-[#4F46E5] bg-[#F8F8F7] pl-[calc(1rem-2px)] text-[#2D2D2D]"
                              : "border-transparent text-[#6B6B6B]"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.hint && (
                            <span className="text-xs text-[#A3A3A3]">
                              {item.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
            )
          )}
        </div>
      </div>
    </div>
  );
}

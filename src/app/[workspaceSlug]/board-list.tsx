"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Board {
  id: string;
  name: string;
  description: string | null;
  columnCount: number;
  taskCount: number;
}

export default function BoardList({
  initialBoards,
  workspaceSlug,
}: {
  initialBoards: Board[];
  workspaceSlug: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/workspaces/${workspaceSlug}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create board");
      setLoading(false);
      return;
    }

    setName("");
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  if (initialBoards.length === 0 && !showForm) {
    return (
      <div className="mt-12 animate-fade-in-up text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F8F7]">
          <svg className="h-8 w-8 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#2D2D2D]">No boards yet</h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">A board holds your tasks. One per project works well.</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 rounded-md bg-[#4F46E5] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4338CA]"
        >
          Create board
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2D2D2D]">Boards</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4338CA]"
          >
            New board
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 flex items-end gap-3 rounded-md border border-[#EEEEED] bg-white p-4">
          <div className="flex-1">
            <label htmlFor="board-name" className="block text-sm font-medium text-[#2D2D2D]">
              Name
            </label>
            <input
              id="board-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-[#EEEEED] px-3 py-2 text-sm text-[#2D2D2D] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              placeholder="e.g. Product Roadmap, Sprint 12"
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-[#EB5757]">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4338CA] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setError(""); setName(""); }}
            className="rounded-md border border-[#EEEEED] px-4 py-2 text-sm text-[#6B6B6B] transition-colors hover:bg-[#F8F8F7]"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {initialBoards.map((board, i) => (
          <Link
            key={board.id}
            href={`/${workspaceSlug}/boards/${board.id}`}
            className="animate-fade-in-up group rounded-md border border-[#EEEEED] bg-white p-5 transition-all duration-150 hover:bg-[#F8F8F7]"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <h3 className="font-medium text-[#2D2D2D]">
              {board.name}
            </h3>
            {board.description && (
              <p className="mt-1 text-sm text-[#6B6B6B] line-clamp-2">{board.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-[#A3A3A3]">
              <span>{board.columnCount} columns</span>
              <span>&middot;</span>
              <span>{board.taskCount} tasks</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

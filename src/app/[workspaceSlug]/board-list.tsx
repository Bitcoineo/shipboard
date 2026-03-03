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
      <div className="mt-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No boards yet</h2>
        <p className="mt-1 text-sm text-gray-500">Create your first board to start organizing tasks.</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Board
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Boards</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New Board
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 flex items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex-1">
            <label htmlFor="board-name" className="block text-sm font-medium text-gray-700">
              Board name
            </label>
            <input
              id="board-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Product Roadmap"
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setError(""); setName(""); }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {initialBoards.map((board) => (
          <Link
            key={board.id}
            href={`/${workspaceSlug}/boards/${board.id}`}
            className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-gray-900">
              {board.name}
            </h3>
            {board.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{board.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
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

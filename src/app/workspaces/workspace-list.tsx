"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-gray-900 text-white",
  admin: "bg-gray-200 text-gray-700",
  member: "bg-gray-100 text-gray-600",
};

export default function WorkspaceList({
  initialWorkspaces,
}: {
  initialWorkspaces: Workspace[];
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

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create workspace");
      setLoading(false);
      return;
    }

    setName("");
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  if (initialWorkspaces.length === 0 && !showForm) {
    return (
      <div className="mt-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No workspaces yet</h2>
        <p className="mt-1 text-sm text-gray-500">Create your first workspace to get started.</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your Workspaces</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Workspace
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 flex items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex-1">
            <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700">
              Workspace name
            </label>
            <input
              id="workspace-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="My Team"
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
        {initialWorkspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/${ws.slug}`}
            className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900 group-hover:text-gray-900">
                {ws.name}
              </h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[ws.role] || ROLE_STYLES.member}`}>
                {ws.role}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">/{ws.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

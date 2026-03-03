"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteWorkspace({
  workspaceName,
  workspaceSlug,
}: {
  workspaceName: string;
  workspaceSlug: string;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/workspaces/${workspaceSlug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/workspaces");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete workspace");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-12 border-t border-red-200 pt-8">
      <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
      <p className="mt-1 text-sm text-gray-500">
        Permanently delete this workspace and all its boards, columns, and tasks.
        This action cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete Workspace
        </button>
      ) : (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-gray-700">
            Type <strong>{workspaceName}</strong> to confirm deletion:
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspaceName}
            className="mt-2 block w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirmText !== workspaceName || deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Permanently Delete"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
                setError("");
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

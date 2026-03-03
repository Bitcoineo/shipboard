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
    <div className="mt-12 border-t border-[#F5D0D0] pt-8">
      <h2 className="text-lg font-semibold text-[#EB5757]">Danger Zone</h2>
      <p className="mt-1 text-sm text-[#787774]">
        Permanently delete this workspace and all its boards, columns, and tasks.
        This action cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-4 rounded-md border border-[#EB5757]/30 px-4 py-2 text-sm font-medium text-[#EB5757] transition-colors hover:bg-[#FBE9E9]"
        >
          Delete Workspace
        </button>
      ) : (
        <div className="mt-4 rounded-md border border-[#F5D0D0] bg-[#FBE9E9] p-4">
          <p className="text-sm text-[#37352F]">
            Type <strong>{workspaceName}</strong> to confirm deletion:
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspaceName}
            className="mt-2 block w-full max-w-sm rounded-md border border-[#E8E5E0] px-3 py-2 text-sm focus:border-[#EB5757] focus:outline-none focus:ring-2 focus:ring-[#EB5757]"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-[#EB5757]">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirmText !== workspaceName || deleting}
              className="rounded-md bg-[#EB5757] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D14343] disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Permanently Delete"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
                setError("");
              }}
              className="rounded-md border border-[#E8E5E0] px-4 py-2 text-sm text-[#787774] transition-colors hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

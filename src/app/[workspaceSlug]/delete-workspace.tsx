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
      <h2 className="text-lg font-semibold text-[#EB5757]">Danger zone</h2>
      <p className="mt-1 text-sm text-[#6B6B6B]">
        Delete this workspace and everything in it. Boards, tasks, members — all gone. This can&apos;t be undone.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-4 text-sm text-[#A3A3A3] underline decoration-[#D3D1CB] underline-offset-2 transition-colors hover:text-[#EB5757] hover:decoration-[#EB5757]"
        >
          Delete this workspace
        </button>
      ) : (
        <div className="mt-4 animate-fade-in-up rounded-md border border-[#F5D0D0] bg-[#FBE9E9] p-4">
          <p className="text-sm text-[#2D2D2D]">
            Type the workspace name to confirm.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspaceName}
            className="mt-2 block w-full max-w-sm rounded-md border border-[#EEEEED] px-3 py-2 text-sm focus:border-[#EB5757] focus:outline-none focus:ring-2 focus:ring-[#EB5757]"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-[#EB5757]">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirmText !== workspaceName || deleting}
              className="rounded-md bg-[#EB5757] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#D14343] hover:shadow-md active:scale-[0.97] disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete forever"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
                setError("");
              }}
              className="rounded-md border border-[#EEEEED] px-4 py-2 text-sm text-[#6B6B6B] transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.97]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

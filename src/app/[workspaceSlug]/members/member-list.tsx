"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    avatarColor: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  invitedBy: { id: string; name: string | null; email: string };
}

interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
}

const PRESET_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

const ROLE_BADGE: Record<string, string> = {
  owner: "bg-[#37352F] text-white",
  admin: "bg-[#F7F7F5] text-[#37352F] border border-[#E8E5E0]",
  member: "bg-[#F7F7F5] text-[#787774]",
};

export default function MemberList({
  members,
  pendingInvites,
  labels,
  currentUserRole,
  currentUserId,
  workspaceSlug,
}: {
  members: Member[];
  pendingInvites: Invite[];
  labels: Label[];
  currentUserRole: string;
  currentUserId: string;
  workspaceSlug: string;
}) {
  const router = useRouter();
  const isAdmin = currentUserRole === "admin" || currentUserRole === "owner";
  const isOwner = currentUserRole === "owner";

  // Invite form state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  // Member action state
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Label state
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(PRESET_COLORS[4].value);
  const [labelLoading, setLabelLoading] = useState(false);
  const [confirmDeleteLabelId, setConfirmDeleteLabelId] = useState<string | null>(null);

  const apiBase = `/api/workspaces/${workspaceSlug}`;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");
    setInviteLink("");

    const res = await fetch(`${apiBase}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });

    const data = await res.json();

    if (!res.ok) {
      setInviteError(data.error || "Failed to send invite");
      setInviteLoading(false);
      return;
    }

    // Build invite link
    const link = `${window.location.origin}/invite/${data.data.token}`;
    setInviteLink(link);
    setInviteEmail("");
    setInviteLoading(false);
    router.refresh();
  }

  async function handleCancelInvite(inviteId: string) {
    const res = await fetch(`${apiBase}/invites/${inviteId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const res = await fetch(`${apiBase}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  async function handleRemoveMember(memberId: string) {
    setRemovingId(memberId);

    const res = await fetch(`${apiBase}/members/${memberId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
    setRemovingId(null);
    setConfirmRemoveId(null);
  }

  async function handleCreateLabel(e: React.FormEvent) {
    e.preventDefault();
    if (!labelName.trim()) return;
    setLabelLoading(true);

    const res = await fetch(`${apiBase}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: labelName.trim(), color: labelColor }),
    });

    if (res.ok) {
      setLabelName("");
      setLabelColor(PRESET_COLORS[4].value);
      setShowLabelForm(false);
      router.refresh();
    }
    setLabelLoading(false);
  }

  async function handleDeleteLabel(labelId: string) {
    const res = await fetch(`${apiBase}/labels/${labelId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
    setConfirmDeleteLabelId(null);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-8">
      {/* Invite Form */}
      {isAdmin && (
        <div>
          {!showInvite ? (
            <button
              onClick={() => setShowInvite(true)}
              className="rounded-md bg-[#2383E2] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B6EC2]"
            >
              Invite member
            </button>
          ) : (
            <div className="rounded-md border border-[#E8E5E0] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#37352F]">
                Invite
              </h3>
              <form onSubmit={handleInvite} className="mt-3 flex items-end gap-3">
                <div className="flex-1">
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="block w-full rounded-md border border-[#E8E5E0] px-3 py-2 text-sm focus:border-[#2383E2] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                    placeholder="Email address"
                    autoFocus
                  />
                </div>
                <div>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "member" | "admin")
                    }
                    className="mt-1 block rounded-md border border-[#E8E5E0] px-3 py-2 text-sm focus:border-[#2383E2] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="rounded-md bg-[#2383E2] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B6EC2] disabled:opacity-50"
                >
                  {inviteLoading ? "Sending..." : "Send invite"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvite(false);
                    setInviteError("");
                    setInviteLink("");
                  }}
                  className="rounded-md border border-[#E8E5E0] px-4 py-2 text-sm text-[#787774] hover:bg-[#F7F7F5]"
                >
                  Cancel
                </button>
              </form>
              {inviteError && (
                <p className="mt-2 text-sm text-[#EB5757]">{inviteError}</p>
              )}
              {inviteLink && (
                <div className="mt-3 rounded-md bg-[#E8F5F1] border border-[#C2E5DC] p-3">
                  <p className="text-sm text-[#4DAB9A]">
                    Invite sent. Share the link.
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs text-[#37352F] border border-[#C2E5DC]">
                      {inviteLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(inviteLink)}
                      className="rounded bg-[#2383E2] px-3 py-1 text-xs font-medium text-white hover:bg-[#1B6EC2]"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending Invites */}
      {isAdmin && pendingInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#37352F]">
            Pending Invites
            <span className="ml-2 text-xs font-normal text-[#9B9A97]">
              {pendingInvites.length}
            </span>
          </h3>
          <div className="mt-2 space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-md border border-[#E8E5E0] bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#37352F]">
                    {invite.email}
                  </p>
                  <p className="text-xs text-[#9B9A97]">
                    Invited as{" "}
                    <span className="capitalize">{invite.role}</span>
                    {" by "}
                    {invite.invitedBy.name || invite.invitedBy.email}
                    {" · Expires "}
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCancelInvite(invite.id)}
                  className="rounded px-3 py-1.5 text-sm text-[#EB5757] hover:bg-[#FBE9E9]"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div>
        <h3 className="text-sm font-semibold text-[#37352F]">
          Members
          <span className="ml-2 text-xs font-normal text-[#9B9A97]">
            {members.length}
          </span>
        </h3>
        <div className="mt-2 space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-md border border-[#E8E5E0] bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{
                    backgroundColor: m.user.avatarColor || "#2383E2",
                  }}
                >
                  {(m.user.name || m.user.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#37352F]">
                    {m.user.name || m.user.email}
                    {m.user.id === currentUserId && (
                      <span className="ml-1 text-xs text-[#9B9A97]">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-[#9B9A97]">{m.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Role badge or selector */}
                {isOwner && m.role !== "owner" ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className="rounded border border-[#E8E5E0] px-2 py-1 text-xs text-[#37352F] focus:border-[#2383E2] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      ROLE_BADGE[m.role] || ROLE_BADGE.member
                    }`}
                  >
                    {m.role}
                  </span>
                )}

                {/* Remove button */}
                {isAdmin &&
                  m.role !== "owner" &&
                  m.user.id !== currentUserId && (
                    <>
                      {confirmRemoveId === m.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            disabled={removingId === m.id}
                            className="rounded bg-[#EB5757] px-2 py-1 text-xs font-medium text-white hover:bg-[#D14343] disabled:opacity-50"
                          >
                            {removingId === m.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="rounded px-2 py-1 text-xs text-[#787774] hover:bg-[#EFEFEF]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(m.id)}
                          className="rounded px-2 py-1 text-xs text-[#EB5757] hover:bg-[#FBE9E9]"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels */}
      {isAdmin && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#37352F]">
              Labels
              <span className="ml-2 text-xs font-normal text-[#9B9A97]">
                {labels.length}
              </span>
            </h3>
            {!showLabelForm && (
              <button
                onClick={() => setShowLabelForm(true)}
                className="rounded-md bg-[#2383E2] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B6EC2]"
              >
                New label
              </button>
            )}
          </div>

          {showLabelForm && (
            <form
              onSubmit={handleCreateLabel}
              className="mt-3 rounded-md border border-[#E8E5E0] bg-white p-4"
            >
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="label-name"
                    className="block text-sm font-medium text-[#37352F]"
                  >
                    Name
                  </label>
                  <input
                    id="label-name"
                    type="text"
                    required
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-[#E8E5E0] px-3 py-2 text-sm focus:border-[#2383E2] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                    placeholder="e.g. Bug, Feature, Urgent"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={labelLoading || !labelName.trim()}
                  className="rounded-md bg-[#2383E2] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B6EC2] disabled:opacity-50"
                >
                  {labelLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLabelForm(false);
                    setLabelName("");
                  }}
                  className="rounded-md border border-[#E8E5E0] px-4 py-2 text-sm text-[#787774] hover:bg-[#F7F7F5]"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-[#37352F]">
                  Color
                </label>
                <div className="mt-1.5 flex gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setLabelColor(c.value)}
                      className={`h-7 w-7 rounded-full transition ${
                        labelColor === c.value
                          ? "ring-2 ring-offset-2 ring-[#2383E2]"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </form>
          )}

          {labels.length > 0 && (
            <div className="mt-3 space-y-2">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between rounded-md border border-[#E8E5E0] bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm font-medium text-[#37352F]">
                      {label.name}
                    </span>
                  </div>
                  {confirmDeleteLabelId === label.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        className="rounded bg-[#EB5757] px-2 py-1 text-xs font-medium text-white hover:bg-[#D14343]"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteLabelId(null)}
                        className="rounded px-2 py-1 text-xs text-[#787774] hover:bg-[#EFEFEF]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteLabelId(label.id)}
                      className="rounded px-2 py-1 text-xs text-[#EB5757] hover:bg-[#FBE9E9]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

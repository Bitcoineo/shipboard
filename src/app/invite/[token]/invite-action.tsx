"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InviteData {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  workspace: { id: string; name: string; slug: string };
  invitedBy: { name: string | null };
}

export default function InviteAction({
  invite,
  error,
  isLoggedIn,
  userEmail,
  token,
}: {
  invite: InviteData | null;
  error: string | null;
  isLoggedIn: boolean;
  userEmail: string | null;
  token: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [declined, setDeclined] = useState(false);

  async function handleAccept() {
    setLoading(true);
    setActionError("");

    const res = await fetch(`/api/invites/${token}/accept`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setActionError(data.error || "Failed to accept invite");
      setLoading(false);
      return;
    }

    router.push(`/${data.data.workspaceSlug}`);
  }

  async function handleDecline() {
    setLoading(true);
    setActionError("");

    const res = await fetch(`/api/invites/${token}/decline`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error || "Failed to decline invite");
      setLoading(false);
      return;
    }

    setDeclined(true);
    setLoading(false);
  }

  // Error state (invalid/expired)
  if (error || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            Invalid Invite
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {error || "This invite link is not valid."}
          </p>
          <Link
            href={isLoggedIn ? "/workspaces" : "/login"}
            className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {isLoggedIn ? "Go to Workspaces" : "Sign In"}
          </Link>
        </div>
      </div>
    );
  }

  // Already handled (accepted/declined/expired)
  if (invite.status !== "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Invite Already {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            This invite has already been {invite.status}.
          </p>
          <Link
            href={isLoggedIn ? "/workspaces" : "/login"}
            className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {isLoggedIn ? "Go to Workspaces" : "Sign In"}
          </Link>
        </div>
      </div>
    );
  }

  // Declined success state
  if (declined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Invite Declined
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            You have declined the invite to {invite.workspace.name}.
          </p>
          <Link
            href="/workspaces"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Go to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              You&apos;re Invited
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {invite.invitedBy.name || "Someone"} invited you to join{" "}
              <strong className="text-gray-900">{invite.workspace.name}</strong>{" "}
              as a <span className="capitalize font-medium">{invite.role}</span>.
            </p>
            <Link
              href={`/login?callbackUrl=/invite/${token}`}
              className="mt-6 inline-block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Sign in to accept
            </Link>
            <p className="mt-3 text-xs text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?callbackUrl=/invite/${token}`}
                className="font-medium text-gray-900 underline hover:text-gray-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Email mismatch
  if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Email Mismatch
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              This invite was sent to{" "}
              <strong>{invite.email}</strong> but you&apos;re signed in as{" "}
              <strong>{userEmail}</strong>.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in with the correct account to accept this invite.
            </p>
            <Link
              href={`/login?callbackUrl=/invite/${token}`}
              className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
            >
              Sign in with a different account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Valid invite, logged in, email matches
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Join {invite.workspace.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {invite.invitedBy.name || "Someone"} invited you to join as a{" "}
            <span className="capitalize font-medium text-gray-700">
              {invite.role}
            </span>
            .
          </p>

          {actionError && (
            <p className="mt-3 text-sm text-red-600">{actionError}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "..." : "Accept Invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

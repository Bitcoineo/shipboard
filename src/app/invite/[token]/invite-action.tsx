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

  if (error || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm animate-fade-in-up text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBE9E9]">
            <svg className="h-6 w-6 text-[#EB5757]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-[#37352F]">Invalid Invite</h1>
          <p className="mt-1 text-sm text-[#787774]">{error || "This invite link is not valid."}</p>
          <Link
            href={isLoggedIn ? "/workspaces" : "/login"}
            className="mt-6 inline-block rounded-md bg-[#2383E2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2]"
          >
            {isLoggedIn ? "Go to Workspaces" : "Sign In"}
          </Link>
        </div>
      </div>
    );
  }

  if (invite.status !== "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm animate-fade-in-up text-center">
          <h1 className="text-lg font-semibold text-[#37352F]">
            Invite Already {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
          </h1>
          <p className="mt-1 text-sm text-[#787774]">This invite has already been {invite.status}.</p>
          <Link
            href={isLoggedIn ? "/workspaces" : "/login"}
            className="mt-6 inline-block rounded-md bg-[#2383E2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2]"
          >
            {isLoggedIn ? "Go to Workspaces" : "Sign In"}
          </Link>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm animate-fade-in-up text-center">
          <h1 className="text-lg font-semibold text-[#37352F]">Invite Declined</h1>
          <p className="mt-1 text-sm text-[#787774]">You have declined the invite to {invite.workspace.name}.</p>
          <Link
            href="/workspaces"
            className="mt-6 inline-block rounded-md bg-[#2383E2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2]"
          >
            Go to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="rounded-md bg-white p-6 text-center">
            <h1 className="text-lg font-semibold text-[#37352F]">You&apos;re Invited</h1>
            <p className="mt-2 text-sm text-[#787774]">
              {invite.invitedBy.name || "Someone"} invited you to join{" "}
              <strong className="text-[#37352F]">{invite.workspace.name}</strong>{" "}
              as a <span className="capitalize font-medium">{invite.role}</span>.
            </p>
            <Link
              href={`/login?callbackUrl=/invite/${token}`}
              className="mt-6 inline-block w-full rounded-md bg-[#2383E2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2]"
            >
              Sign in to accept
            </Link>
            <p className="mt-3 text-xs text-[#9B9A97]">
              Don&apos;t have an account?{" "}
              <Link href={`/register?callbackUrl=/invite/${token}`} className="font-medium text-[#2383E2] hover:text-[#1B6EC2]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="rounded-md border border-[#F2C94C]/30 bg-[#FDF6E3] p-6 text-center">
            <h1 className="text-lg font-semibold text-[#37352F]">Email Mismatch</h1>
            <p className="mt-2 text-sm text-[#787774]">
              This invite was sent to <strong className="text-[#37352F]">{invite.email}</strong> but you&apos;re signed in as{" "}
              <strong className="text-[#37352F]">{userEmail}</strong>.
            </p>
            <p className="mt-2 text-sm text-[#787774]">Please sign in with the correct account to accept this invite.</p>
            <Link
              href={`/login?callbackUrl=/invite/${token}`}
              className="mt-4 inline-block rounded-md border border-[#E8E5E0] px-4 py-2 text-sm font-medium text-[#37352F] transition-colors hover:bg-white"
            >
              Sign in with a different account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="rounded-md bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-[#37352F]">Join {invite.workspace.name}</h1>
          <p className="mt-2 text-sm text-[#787774]">
            {invite.invitedBy.name || "Someone"} invited you to join as a{" "}
            <span className="capitalize font-medium text-[#37352F]">{invite.role}</span>.
          </p>

          {actionError && (
            <p className="mt-3 text-sm text-[#EB5757]">{actionError}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 rounded-md border border-[#E8E5E0] px-4 py-2.5 text-sm font-medium text-[#37352F] transition-colors hover:bg-[#F7F7F5] disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 rounded-md bg-[#2383E2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B6EC2] disabled:opacity-50"
            >
              {loading ? "..." : "Accept Invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

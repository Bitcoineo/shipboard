"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/workspaces";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Wrong email or password. Try again.");
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <svg className="h-5 w-5 text-[#4F46E5]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3" />
              <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="34" y="8" width="10" height="16" rx="2" fill="currentColor" />
            </svg>
            <span className="text-2xl font-bold text-[#2D2D2D]">ShipBoard</span>
          </Link>
          <p className="mt-1 text-sm text-[#6B6B6B]">Welcome back.</p>
        </div>

        <div className="rounded-md bg-white p-6">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#EEEEED] bg-white px-4 py-2.5 text-sm font-medium text-[#2D2D2D] transition-all duration-150 hover:bg-[#F8F8F7] hover:shadow-sm active:scale-[0.97]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EEEEED]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-[#A3A3A3]">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D2D2D]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border-0 border-b border-[#EEEEED] bg-transparent px-0 py-2 text-sm text-[#2D2D2D] placeholder-[#A3A3A3] transition-all duration-150 focus:border-[#4F46E5] focus:outline-none focus:ring-0"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D2D2D]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border-0 border-b border-[#EEEEED] bg-transparent px-0 py-2 text-sm text-[#2D2D2D] placeholder-[#A3A3A3] transition-all duration-150 focus:border-[#4F46E5] focus:outline-none focus:ring-0"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-[#EB5757]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#4F46E5] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#4338CA] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-50 active:scale-[0.97]"
            >
              {loading ? "One moment..." : "Continue"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[#6B6B6B]">
          First time here?{" "}
          <Link href={callbackUrl !== "/workspaces" ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register"} className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

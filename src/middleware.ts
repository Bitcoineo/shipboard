import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");
  const isPublic = req.nextUrl.pathname === "/";
  const isInvitePage = req.nextUrl.pathname.startsWith("/invite");

  // Allow auth API routes
  if (isApiAuth) return;

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/workspaces", req.url));
  }

  // Protect all non-public routes (allow invite pages for unauthenticated users)
  if (!isPublic && !isAuthPage && !isInvitePage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

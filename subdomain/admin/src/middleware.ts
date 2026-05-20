import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side middleware for admin route protection.
 *
 * Strategy:
 * 1. Allow public routes (/login, /api/*, /_next/*, static assets).
 * 2. For protected routes, check for a server-side session cookie.
 * 3. If no valid session cookie exists → redirect to /login.
 * 4. Checks the loginRequired flag — if disabled, allows access.
 *
 * The cookie `fashcon_admin_session` is set on successful login
 * and cleared on logout. This prevents direct URL access bypass.
 */

// Routes that never require auth
const PUBLIC_PATHS = ["/login", "/api/", "/_next/", "/favicon", "/site.webmanifest"];
const STATIC_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".css", ".js", ".woff", ".woff2", ".ttf"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if login gate is disabled via the cookie-cached flag.
  // The toggle sets this cookie for fast middleware reads (avoids DB call).
  const loginGateCookie = request.cookies.get("fashcon_login_gate")?.value;
  if (loginGateCookie === "disabled") {
    return NextResponse.next();
  }

  // Check for the secure session cookie
  const session = request.cookies.get("fashcon_admin_session")?.value;

  if (!session) {
    // No session → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session format: "email::role::timestamp"
  try {
    const parts = session.split("::");
    if (parts.length < 3) {
      throw new Error("Invalid session format");
    }
    const [, role, timestamp] = parts;

    // Check role
    if (role !== "admin" && role !== "super_admin" && role !== "manager") {
      throw new Error("Insufficient permissions");
    }

    // Check session expiry against current time
    const expireTime = parseInt(timestamp, 10);
    if (isNaN(expireTime) || Date.now() > expireTime) {
      throw new Error("Session expired");
    }
  } catch {
    // Invalid/expired session → clear cookie and redirect
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("fashcon_admin_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except _next/static, _next/image, and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|css|js)$).*)",
  ],
};

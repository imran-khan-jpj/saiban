import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public pages that don't require authentication
const PUBLIC_PAGES = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access public pages
  if (PUBLIC_PAGES.includes(pathname) && authToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/forgot-password"],
};

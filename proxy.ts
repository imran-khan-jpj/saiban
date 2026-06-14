import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_HOME_PATH, normalizeAdminPath } from "@/lib/admin-routes";

const PUBLIC_PAGES_WHEN_AUTHENTICATED = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const canonical = normalizeAdminPath(pathname);
    if (canonical !== pathname) {
      return NextResponse.redirect(new URL(canonical, request.url));
    }
  }

  if (PUBLIC_PAGES_WHEN_AUTHENTICATED.includes(pathname) && authToken) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};

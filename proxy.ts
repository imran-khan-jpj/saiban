import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PAGES = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (PUBLIC_PAGES.includes(pathname) && authToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/forgot-password"],
};

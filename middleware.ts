import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  // if (pathname.startsWith("/admin")) {
  //   if (!authToken) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  // }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (pathname.startsWith("/auth") && authToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getAdminHomePath,
  mapAdminPathToExperience,
  normalizeAdminPath,
} from "@/lib/admin-routes";

const PUBLIC_PAGES = ["/login", "/register", "/forgot-password"];
const SIDEBAR_VERSION_COOKIE = "saiban-sidebar-version";

function readExperience(request: NextRequest): "v1" | "v2" {
  return request.cookies.get(SIDEBAR_VERSION_COOKIE)?.value === "v2"
    ? "v2"
    : "v1";
}

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;
  const experience = readExperience(request);

  if (pathname.startsWith("/admin")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const canonical = normalizeAdminPath(pathname);
    const aligned = mapAdminPathToExperience(canonical, experience);
    if (aligned !== pathname) {
      return NextResponse.redirect(new URL(aligned, request.url));
    }
  }

  if (PUBLIC_PAGES.includes(pathname) && authToken) {
    return NextResponse.redirect(
      new URL(getAdminHomePath(experience), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/forgot-password"],
};

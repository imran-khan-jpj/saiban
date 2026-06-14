import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  if (!API_URL) {
    return NextResponse.json(
      { message: "API_URL is not configured on the server" },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token")?.value;
  if (!authToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const upstream = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${authToken}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    if (upstream.status === 401) {
      await clearAuthCookie();
    }
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(data);
}

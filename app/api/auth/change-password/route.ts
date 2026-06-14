import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { setAuthCookie } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const accessToken: string | undefined = data?.access_token;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Change password response missing access_token" },
      { status: 502 },
    );
  }

  await setAuthCookie(accessToken);

  return NextResponse.json({ message: data.message });
}

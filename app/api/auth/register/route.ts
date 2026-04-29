import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "API_URL is not configured on the server" },
      { status: 500 },
    );
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

  const upstream = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
      { message: "Register response missing access_token" },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("auth-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  });

  return NextResponse.json({ user: data.user });
}

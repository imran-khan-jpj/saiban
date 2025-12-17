import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // TODO: Replace with actual authentication logic
    // This is a simple example - in production, verify against a database
    if (email && password) {
      // Simulate successful login
      const response = NextResponse.json(
        { message: "Login successful" },
        { status: 200 }
      );

      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set("auth-token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

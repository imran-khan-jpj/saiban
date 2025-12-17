import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // TODO: Replace with actual registration logic
    // This is a simple example - in production, save to a database
    if (email && password && name) {
      // Simulate successful registration
      return NextResponse.json(
        { message: "Registration successful" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

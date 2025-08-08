import { NextRequest, NextResponse } from "next/server";
import { authServices } from "@/server/modules/auth/factory";
import { AppError } from "@/utils/error/app-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const userId = await authServices.login.execute({
      email: email.toLowerCase().trim(),
      password,
    });

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.httpStatus }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

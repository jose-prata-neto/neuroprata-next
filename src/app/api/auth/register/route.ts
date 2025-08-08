import { NextRequest, NextResponse } from "next/server";
import { authServices } from "@/server/modules/auth";
import { AppError } from "@/utils/error/app-error";
import type { UserCreate, UserRole } from "@/server/db/schema";
import type { RegisterFormData } from "@/models/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, password, role, crp, cpf } = body as RegisterFormData;

    if (!name || !email || !password || !role || !crp || !cpf) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "USER", "GUEST"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const userData: UserCreate = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role as UserRole,
      crp: crp.trim(),
      cpf: cpf.replace(/\D/g, ""),
    };

    const userId = await authServices.register.execute(userData);

    if (!userId) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error);

    if (error instanceof AppError) {
      if (error.code === "CONFLICT" && error.field === "email") {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

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

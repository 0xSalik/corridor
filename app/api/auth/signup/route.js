// Signup route: creates a new user with role, exam scores, and sets JWT cookie.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["student", "aspirant"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be student or aspirant" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const userData = { name, email, password, role };

    if (role === "student") {
      userData.college = body.college || "";
      userData.branch = body.branch || "";
      userData.yearOfStudy = body.yearOfStudy || null;
    }

    if (body.examScores) {
      userData.examScores = body.examScores;
    }

    const user = await User.create(userData);
    const token = createToken(user);
    const cookieOpts = getTokenCookieOptions();

    const response = NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

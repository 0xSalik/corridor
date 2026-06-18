// Profile API: GET current user's full profile, PUT to update it.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken, createToken, getTokenCookieOptions, TOKEN_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("collegeId", "name city")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.name) user.name = body.name;

    if (user.role === "student") {
      if (body.branch !== undefined) user.branch = body.branch;
      if (body.yearOfStudy !== undefined) user.yearOfStudy = body.yearOfStudy;
      if (body.mentoring !== undefined) {
        user.mentoring = { ...(user.mentoring?.toObject?.() || {}), ...body.mentoring };
      }
    }

    if (user.role === "aspirant" && body.examScores !== undefined) {
      user.examScores = { ...(user.examScores?.toObject?.() || {}), ...body.examScores };
    }

    if (body.password && body.password.length >= 6) {
      user.password = body.password;
    }

    await user.save();

    const newToken = createToken(user);
    const cookieOpts = getTokenCookieOptions();

    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
      },
    });

    response.cookies.set(cookieOpts.name, newToken, cookieOpts);
    return response;
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

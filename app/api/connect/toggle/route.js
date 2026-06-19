// Toggle mentoring availability for the current student user.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Only students can toggle mentoring" }, { status: 403 });
    }

    const body = await request.json();
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mentoring) user.mentoring = {};
    user.mentoring.available = body.available ?? !user.mentoring.available;
    if (body.about !== undefined) user.mentoring.about = body.about;
    if (body.contactMethod !== undefined) user.mentoring.contactMethod = body.contactMethod;
    if (body.contactInfo !== undefined) user.mentoring.contactInfo = body.contactInfo;

    await user.save();
    return NextResponse.json({ mentoring: user.mentoring });
  } catch (error) {
    console.error("POST /api/connect/toggle error:", error);
    return NextResponse.json({ error: "Failed to update mentoring" }, { status: 500 });
  }
}

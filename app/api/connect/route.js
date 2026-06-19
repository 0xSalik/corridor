// Connect API: list students who are available for mentoring at a given college.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");

    if (!collegeId || !mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json(
        { error: "Valid collegeId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const mentors = await User.find({
      role: "student",
      collegeId,
      "mentoring.available": true,
    })
      .select("name branch yearOfStudy mentoring.about mentoring.contactMethod mentoring.contactInfo")
      .lean();

    return NextResponse.json(mentors);
  } catch (error) {
    console.error("GET /api/connect error:", error);
    return NextResponse.json({ error: "Failed to load mentors" }, { status: 500 });
  }
}

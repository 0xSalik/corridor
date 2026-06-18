import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
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

    const decoded = await getAuthUser();

    await connectDB();

    const mentors = await User.find({
      role: "student",
      collegeId,
      "mentoring.available": true,
    })
      .select("name branch yearOfStudy mentoring.about mentoring.contactMethod mentoring.contactInfo")
      .lean();

    const results = mentors.map((m) => {
      const mentor = {
        _id: m._id,
        name: m.name,
        branch: m.branch,
        yearOfStudy: m.yearOfStudy,
        mentoring: { about: m.mentoring?.about },
      };

      if (decoded) {
        mentor.mentoring.contactMethod = m.mentoring?.contactMethod;
        mentor.mentoring.contactInfo = m.mentoring?.contactInfo;
      }

      return mentor;
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/connect error:", error);
    return NextResponse.json({ error: "Failed to load mentors" }, { status: 500 });
  }
}

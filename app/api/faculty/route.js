// Faculty API: GET faculty for a college (with optional department filter),
// POST to add a faculty member (students only, own college).

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Faculty from "@/models/Faculty";
import FacultyReview from "@/models/FacultyReview";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    const department = searchParams.get("department");
    const sort = searchParams.get("sort");

    if (!collegeId || !mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json({ error: "Valid collegeId is required" }, { status: 400 });
    }

    await connectDB();

    const filter = { collegeId };
    if (department) filter.department = department;

    const faculty = await Faculty.find(filter).sort({ department: 1, name: 1 }).lean();

    // Attach review stats to each faculty member
    const facultyIds = faculty.map((f) => f._id);
    const stats = await FacultyReview.aggregate([
      { $match: { facultyId: { $in: facultyIds } } },
      {
        $group: {
          _id: "$facultyId",
          avgRating: { $avg: "$rating" },
          avgDifficulty: { $avg: "$difficulty" },
          totalReviews: { $sum: 1 },
          wouldTakeAgainCount: {
            $sum: { $cond: ["$wouldTakeAgain", 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    for (const s of stats) {
      statsMap[s._id.toString()] = {
        avgRating: parseFloat(s.avgRating.toFixed(1)),
        avgDifficulty: parseFloat(s.avgDifficulty.toFixed(1)),
        totalReviews: s.totalReviews,
        wouldTakeAgainPct: Math.round((s.wouldTakeAgainCount / s.totalReviews) * 100),
      };
    }

    let results = faculty.map((f) => ({
      ...f,
      stats: statsMap[f._id.toString()] || {
        avgRating: null,
        avgDifficulty: null,
        totalReviews: 0,
        wouldTakeAgainPct: null,
      },
    }));

    if (sort === "rating") {
      results.sort((a, b) => (b.stats.avgRating || 0) - (a.stats.avgRating || 0));
    } else if (sort === "reviews") {
      results.sort((a, b) => b.stats.totalReviews - a.stats.totalReviews);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/faculty error:", error);
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Only students can add faculty" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name || !body.department) {
      return NextResponse.json({ error: "Name and department are required" }, { status: 400 });
    }

    if (decoded.collegeId && body.collegeId !== decoded.collegeId) {
      return NextResponse.json({ error: "You can only add faculty to your own college" }, { status: 403 });
    }

    await connectDB();

    const faculty = await Faculty.create({
      collegeId: body.collegeId || decoded.collegeId,
      addedBy: decoded.userId,
      name: body.name,
      department: body.department,
      designation: body.designation || "assistant_professor",
      courses: body.courses || [],
    });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    console.error("POST /api/faculty error:", error);
    return NextResponse.json({ error: "Failed to add faculty" }, { status: 500 });
  }
}

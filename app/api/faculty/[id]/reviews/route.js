// Faculty reviews API: GET all reviews for a faculty member, POST a new review.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import FacultyReview from "@/models/FacultyReview";
import Faculty from "@/models/Faculty";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 });
    }

    await connectDB();

    const reviews = await FacultyReview.find({ facultyId: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/faculty/[id]/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Only students can review faculty" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.rating || !body.difficulty || body.wouldTakeAgain === undefined || !body.body) {
      return NextResponse.json(
        { error: "Rating, difficulty, wouldTakeAgain, and review text are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    if (!decoded.collegeId || faculty.collegeId.toString() !== decoded.collegeId) {
      return NextResponse.json({ error: "You can only review faculty at your own college" }, { status: 403 });
    }

    const review = await FacultyReview.create({
      facultyId: id,
      userId: decoded.userId,
      rating: body.rating,
      difficulty: body.difficulty,
      wouldTakeAgain: body.wouldTakeAgain,
      courseName: body.courseName || null,
      grade: body.grade || null,
      tags: body.tags || [],
      body: body.body,
      isAnonymous: body.isAnonymous !== false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/faculty/[id]/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

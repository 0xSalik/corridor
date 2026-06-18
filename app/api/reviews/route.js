// Reviews API: GET reviews for a college, POST a new review.
// POST enforces that students can only review their own college.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    const category = searchParams.get("category");
    const departmentName = searchParams.get("department");

    if (!collegeId) {
      return NextResponse.json({ error: "collegeId is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json({ error: "Invalid collegeId" }, { status: 400 });
    }

    await connectDB();

    const filter = { collegeId };
    const validCategories = ["hostel", "department", "placement", "overall", "lab", "campus", "faculty", "food"];
    if (category && validCategories.includes(category)) {
      filter.category = category;
    }
    if (departmentName) {
      filter.departmentName = departmentName;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "You must be logged in to submit a review" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (decoded.role !== "student") {
      return NextResponse.json({ error: "Only current students can submit reviews" }, { status: 403 });
    }

    const body = await request.json();

    if (!decoded.collegeId) {
      return NextResponse.json(
        { error: "Your account is not linked to a college" },
        { status: 403 }
      );
    }

    if (body.collegeId !== decoded.collegeId) {
      return NextResponse.json(
        { error: "You can only review your own college" },
        { status: 403 }
      );
    }

    const required = ["collegeId", "branch", "yearOfStudy", "rating", "title", "body", "category"];
    const missing = required.filter((field) => !body[field]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const validCategories = ["hostel", "department", "placement", "overall", "lab", "campus", "faculty", "food"];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.create({
      collegeId: body.collegeId,
      userId: decoded.userId,
      studentName: body.isAnonymous ? "Anonymous" : (body.studentName || decoded.name),
      branch: body.branch,
      yearOfStudy: parseInt(body.yearOfStudy),
      rating: body.rating,
      title: body.title,
      body: body.body,
      category: body.category,
      departmentName: body.departmentName || null,
      isAnonymous: body.isAnonymous || false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

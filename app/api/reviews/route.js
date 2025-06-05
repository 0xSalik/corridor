// API route for reviews: GET reviews for a college, POST a new review.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    const category = searchParams.get("category");

    if (!collegeId) {
      return NextResponse.json(
        { error: "collegeId query parameter is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json(
        { error: "Invalid collegeId format" },
        { status: 400 }
      );
    }

    await connectDB();

    const filter = { collegeId };
    const validCategories = [
      "hostel",
      "department",
      "placement",
      "overall",
      "lab",
      "campus",
    ];
    if (category && validCategories.includes(category)) {
      filter.category = category;
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const required = [
      "collegeId",
      "studentName",
      "branch",
      "yearOfStudy",
      "rating",
      "title",
      "body",
      "category",
    ];
    const missing = required.filter((field) => !body[field]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const validCategories = [
      "hostel",
      "department",
      "placement",
      "overall",
      "lab",
      "campus",
    ];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    await connectDB();
    const review = await Review.create(body);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

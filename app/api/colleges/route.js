// API route for colleges: GET all colleges, POST a new college.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/models/College";

export async function GET() {
  try {
    await connectDB();
    const colleges = await College.find({})
      .select("name city state type averagePlacement departments photos about")
      .lean();

    const results = colleges.map((college) => {
      const ratings = college.departments
        .filter((d) => d.rating > 0)
        .map((d) => d.rating);
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : null;

      return {
        _id: college._id,
        name: college.name,
        city: college.city,
        state: college.state,
        type: college.type,
        averagePlacement: college.averagePlacement,
        avgRating: avgRating ? parseFloat(avgRating) : null,
        about: college.about,
        photoCount: college.photos?.length || 0,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/colleges error:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.city || !body.state || !body.type) {
      return NextResponse.json(
        { error: "name, city, state, and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["public", "private", "deemed"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "type must be one of: public, private, deemed" },
        { status: 400 }
      );
    }

    await connectDB();
    const college = await College.create(body);
    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error("POST /api/colleges error:", error);
    return NextResponse.json(
      { error: "Failed to create college" },
      { status: 500 }
    );
  }
}

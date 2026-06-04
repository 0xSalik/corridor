// API route for a single college by ID: returns full college data.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/models/College";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid college ID format" },
        { status: 400 }
      );
    }

    await connectDB();
    const college = await College.findById(id).lean();

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(college);
  } catch (error) {
    console.error("GET /api/colleges/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch college" },
      { status: 500 }
    );
  }
}

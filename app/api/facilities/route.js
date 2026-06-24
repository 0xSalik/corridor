// Facilities API: GET facilities for a college, POST to add one (students only, own college).

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Facility from "@/models/Facility";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    const type = searchParams.get("type");

    if (!collegeId || !mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json({ error: "Valid collegeId is required" }, { status: 400 });
    }

    await connectDB();

    const filter = { collegeId };
    if (type) filter.type = type;

    const facilities = await Facility.find(filter).sort({ type: 1, name: 1 }).lean();
    return NextResponse.json(facilities);
  } catch (error) {
    console.error("GET /api/facilities error:", error);
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Only students can add facilities" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name || !body.type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    if (decoded.collegeId && body.collegeId !== decoded.collegeId) {
      return NextResponse.json({ error: "You can only add facilities to your own college" }, { status: 403 });
    }

    await connectDB();

    const facility = await Facility.create({
      collegeId: body.collegeId || decoded.collegeId,
      addedBy: decoded.userId,
      name: body.name,
      type: body.type,
      department: body.department || null,
      description: body.description || null,
      rating: body.rating || null,
    });

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error("POST /api/facilities error:", error);
    return NextResponse.json({ error: "Failed to add facility" }, { status: 500 });
  }
}

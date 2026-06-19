// Saved colleges API: GET saved list, POST to toggle a college in/out.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import College from "@/models/College";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.userId).select("savedColleges").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const colleges = await College.find({ _id: { $in: user.savedColleges || [] } })
      .select("name city state type averagePlacement departments")
      .lean();

    const results = colleges.map((c) => {
      const ratings = c.departments.filter((d) => d.rating > 0).map((d) => d.rating);
      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1))
        : null;
      return { _id: c._id, name: c.name, city: c.city, state: c.state, type: c.type, averagePlacement: c.averagePlacement, avgRating };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/user/saved error:", error);
    return NextResponse.json({ error: "Failed to load saved colleges" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { collegeId } = await request.json();
    if (!collegeId || !mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json({ error: "Valid collegeId is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const idx = (user.savedColleges || []).findIndex((id) => id.toString() === collegeId);
    if (idx >= 0) {
      user.savedColleges.splice(idx, 1);
    } else {
      user.savedColleges.push(collegeId);
    }

    await user.save();
    return NextResponse.json({ saved: user.savedColleges });
  } catch (error) {
    console.error("POST /api/user/saved error:", error);
    return NextResponse.json({ error: "Failed to update saved colleges" }, { status: 500 });
  }
}

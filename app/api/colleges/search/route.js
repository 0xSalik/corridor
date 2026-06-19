// College search API: returns colleges matching a name query. Used in signup flow.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/models/College";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    await connectDB();

    const filter = q
      ? { name: { $regex: new RegExp(q, "i") } }
      : {};

    const colleges = await College.find(filter)
      .select("name city state type departments")
      .limit(20)
      .lean();

    const results = colleges.map((c) => ({
      _id: c._id,
      name: c.name,
      city: c.city,
      state: c.state,
      type: c.type,
      departments: (c.departments || []).map((d) => d.name),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/colleges/search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

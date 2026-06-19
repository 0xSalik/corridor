// Compare API: returns full data for 2-3 colleges for side-by-side comparison.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/models/College";
import Review from "@/models/Review";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids") || "";
    const ids = idsParam.split(",").filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (ids.length < 2 || ids.length > 3) {
      return NextResponse.json(
        { error: "Provide 2 or 3 valid college IDs separated by commas" },
        { status: 400 }
      );
    }

    await connectDB();

    const colleges = await College.find({ _id: { $in: ids } }).lean();

    const reviewStats = await Review.aggregate([
      { $match: { collegeId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } } },
      {
        $group: {
          _id: "$collegeId",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    for (const s of reviewStats) {
      statsMap[s._id.toString()] = {
        avgRating: parseFloat(s.avgRating.toFixed(1)),
        totalReviews: s.totalReviews,
      };
    }

    const results = colleges.map((c) => ({
      ...c,
      reviewStats: statsMap[c._id.toString()] || { avgRating: null, totalReviews: 0 },
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/compare error:", error);
    return NextResponse.json({ error: "Comparison failed" }, { status: 500 });
  }
}

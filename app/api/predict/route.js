// Predict API: matches a student's rank/score against historical cutoff data
// for a specific entrance exam. Supports jee_main, jee_advanced, neet, bitsat.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RankData from "@/models/RankData";
import College from "@/models/College";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rank = parseInt(searchParams.get("rank"));
    const exam = searchParams.get("exam") || "jee_main";
    const quota = searchParams.get("quota") || "general";
    const branch = searchParams.get("branch");

    if (!rank || isNaN(rank) || rank < 1) {
      return NextResponse.json(
        { error: "A valid rank (positive number) is required" },
        { status: 400 }
      );
    }

    const validExams = ["jee_main", "jee_advanced", "neet", "bitsat"];
    if (!validExams.includes(exam)) {
      return NextResponse.json(
        { error: `exam must be one of: ${validExams.join(", ")}` },
        { status: 400 }
      );
    }

    const validQuotas = ["general", "obc", "sc", "st", "ews"];
    if (!validQuotas.includes(quota)) {
      return NextResponse.json(
        { error: `quota must be one of: ${validQuotas.join(", ")}` },
        { status: 400 }
      );
    }

    await connectDB();

    const filter = {
      exam,
      closingRank: { $gte: rank },
      quota,
    };

    if (branch) {
      filter.branch = { $regex: new RegExp(branch, "i") };
    }

    const rankEntries = await RankData.find(filter)
      .sort({ year: -1 })
      .lean();

    const collegeMap = {};
    for (const entry of rankEntries) {
      const key = `${entry.collegeId}-${entry.branch}`;
      if (!collegeMap[key]) {
        collegeMap[key] = entry;
      }
    }

    const predictions = Object.values(collegeMap);

    const collegeIds = [...new Set(predictions.map((p) => p.collegeId))];
    const colleges = await College.find({ _id: { $in: collegeIds } })
      .select("name city state type")
      .lean();

    const collegeInfo = {};
    for (const c of colleges) {
      collegeInfo[c._id.toString()] = c;
    }

    const results = predictions.map((p) => ({
      college: collegeInfo[p.collegeId.toString()] || null,
      branch: p.branch,
      year: p.year,
      openingRank: p.openingRank,
      closingRank: p.closingRank,
      quota: p.quota,
      round: p.roundNumber,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/predict error:", error);
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 }
    );
  }
}

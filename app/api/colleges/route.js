import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/models/College";
import Review from "@/models/Review";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const colleges = await College.find({})
      .select("name city state type averagePlacement departments photos about")
      .lean();

    const collegeIds = colleges.map((c) => c._id);
    const reviewStats = await Review.aggregate([
      { $match: { collegeId: { $in: collegeIds } } },
      {
        $group: {
          _id: "$collegeId",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const reviewMap = {};
    for (const s of reviewStats) {
      reviewMap[s._id.toString()] = {
        avgRating: parseFloat(s.avgRating.toFixed(1)),
        totalReviews: s.totalReviews,
      };
    }

    const results = colleges.map((college) => {
      const deptRatings = college.departments
        .filter((d) => d.rating > 0)
        .map((d) => d.rating);
      const deptAvg =
        deptRatings.length > 0
          ? (deptRatings.reduce((sum, r) => sum + r, 0) / deptRatings.length).toFixed(1)
          : null;

      const review = reviewMap[college._id.toString()];
      const corridorScore = computeCorridorScore(college, review, deptAvg);

      return {
        _id: college._id,
        name: college.name,
        city: college.city,
        state: college.state,
        type: college.type,
        averagePlacement: college.averagePlacement,
        avgRating: review?.avgRating ?? (deptAvg ? parseFloat(deptAvg) : null),
        totalReviews: review?.totalReviews ?? 0,
        about: college.about,
        photoCount: college.photos?.length || 0,
        corridorScore,
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

function computeCorridorScore(college, reviewStats, deptAvg) {
  let score = 0;
  let weights = 0;

  if (reviewStats?.avgRating) {
    score += reviewStats.avgRating * 30;
    weights += 30;
  }
  if (deptAvg) {
    score += parseFloat(deptAvg) * 25;
    weights += 25;
  }
  if (college.averagePlacement) {
    const placementScore = Math.min(college.averagePlacement / 2, 5);
    score += placementScore * 25;
    weights += 25;
  }
  if (reviewStats?.totalReviews) {
    const activityScore = Math.min(reviewStats.totalReviews / 5, 5);
    score += activityScore * 10;
    weights += 10;
  }
  const facilityCount = [college.facilities?.hostel, college.facilities?.lab, college.facilities?.library].filter(Boolean).length;
  if (facilityCount > 0) {
    score += (facilityCount / 3) * 5 * 10;
    weights += 10;
  }

  if (weights === 0) return null;
  return parseFloat(((score / weights) * 20).toFixed(1));
}

export async function POST(request) {
  try {
    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json({ error: "You must be logged in to add a college" }, { status: 401 });
    }

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
    const college = await College.create({
      name: body.name,
      city: body.city,
      state: body.state,
      type: body.type,
      about: body.about || "",
      established: body.established || null,
    });
    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error("POST /api/colleges error:", error);
    return NextResponse.json(
      { error: "Failed to create college" },
      { status: 500 }
    );
  }
}

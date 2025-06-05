// API route for questions: GET questions for a college, POST a new question.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");

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

    const questions = await Question.find({ collegeId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(questions);
  } catch (error) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.collegeId || !body.questionText) {
      return NextResponse.json(
        { error: "collegeId and questionText are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.collegeId)) {
      return NextResponse.json(
        { error: "Invalid collegeId format" },
        { status: 400 }
      );
    }

    await connectDB();

    const question = await Question.create({
      collegeId: body.collegeId,
      questionText: body.questionText,
      isAnonymous: body.isAnonymous !== false,
      askedBy: body.askedBy || null,
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

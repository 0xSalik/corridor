import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";
import { getAuthUser } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid question ID format" },
        { status: 400 }
      );
    }

    const decoded = await getAuthUser();
    if (!decoded) {
      return NextResponse.json(
        { error: "You must be logged in to answer a question" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.text || !body.text.trim()) {
      return NextResponse.json(
        { error: "Answer text is required" },
        { status: 400 }
      );
    }

    if (body.text.length > 2000) {
      return NextResponse.json(
        { error: "Answer must be under 2000 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    question.answers.push({
      text: body.text.trim(),
      respondentName: body.respondentName?.trim() || decoded.name || "Anonymous",
    });

    await question.save();
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions/[id]/answer error:", error);
    return NextResponse.json(
      { error: "Failed to add answer" },
      { status: 500 }
    );
  }
}

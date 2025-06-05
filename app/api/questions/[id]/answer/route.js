// API route for adding an answer to an existing question.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";
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

    const body = await request.json();

    if (!body.text) {
      return NextResponse.json(
        { error: "Answer text is required" },
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
      text: body.text,
      respondentName: body.respondentName || "Anonymous",
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

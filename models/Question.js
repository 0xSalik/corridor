// Question model: anonymous questions about a college, with nested answers.

import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  respondentName: { type: String, default: "Anonymous" },
  createdAt: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  questionText: { type: String, required: true },
  isAnonymous: { type: Boolean, default: true },
  askedBy: { type: String },
  answers: [answerSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question ||
  mongoose.model("Question", questionSchema);

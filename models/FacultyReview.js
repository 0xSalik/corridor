// FacultyReview model: RateMyProfessor-style reviews for individual faculty members.
// Includes overall rating, difficulty, would-take-again, tags, course, and grade.

import mongoose from "mongoose";

const facultyReviewSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  difficulty: { type: Number, min: 1, max: 5, required: true },
  wouldTakeAgain: { type: Boolean, required: true },
  courseName: { type: String },
  grade: { type: String },
  tags: [
    {
      type: String,
      enum: [
        "tough_grader",
        "easy_grader",
        "gives_good_notes",
        "inspirational",
        "lots_of_homework",
        "clear_explanations",
        "skippable_lectures",
        "attendance_mandatory",
        "helpful_outside_class",
        "test_heavy",
        "project_heavy",
        "curved_grading",
        "boring_lectures",
        "engaging",
      ],
    },
  ],
  body: { type: String, required: true },
  isAnonymous: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.FacultyReview ||
  mongoose.model("FacultyReview", facultyReviewSchema);

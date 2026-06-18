// Review model: student reviews linked to a college, categorized by topic.
// Reviews with category "department" or "faculty" can specify a departmentName.
// Students can only review their own college (enforced in API route).

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  studentName: { type: String, required: true },
  branch: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "hostel",
      "department",
      "placement",
      "overall",
      "lab",
      "campus",
      "faculty",
      "food",
    ],
    required: true,
  },
  departmentName: { type: String },
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);

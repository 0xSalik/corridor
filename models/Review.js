// Review model: student reviews linked to a college, categorized by topic.

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  studentName: { type: String, required: true },
  branch: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: {
    type: String,
    enum: ["hostel", "department", "placement", "overall", "lab", "campus"],
    required: true,
  },
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);

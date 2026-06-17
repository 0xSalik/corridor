// User model: multi-tier accounts for students (current college-goers who write reviews)
// and aspirants (prospective students exploring colleges). Stores exam scores for predictions.

import mongoose from "mongoose";
import pkg from "bcryptjs";
const { hash, compare } = pkg;

const examScoresSchema = new mongoose.Schema(
  {
    jeeMain: {
      percentile: { type: Number, min: 0, max: 100 },
      rank: { type: Number },
      qualified: { type: Boolean },
    },
    jeeAdvanced: {
      rank: { type: Number },
      qualified: { type: Boolean },
    },
    neet: {
      marks: { type: Number },
      rank: { type: Number },
    },
    bitsat: {
      score: { type: Number },
    },
    category: {
      type: String,
      enum: ["general", "obc", "sc", "st", "ews"],
      default: "general",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ["student", "aspirant"],
    required: true,
  },
  // Fields for students (current college-goers)
  college: { type: String },
  branch: { type: String },
  yearOfStudy: { type: Number },
  // Exam scores for aspirants (and optionally students)
  examScores: examScoresSchema,
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);

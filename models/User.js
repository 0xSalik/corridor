// User model: two tiers - students (review their own college) and aspirants (explore + predict).
// Students can opt into mentoring so aspirants can find them.

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

const mentoringSchema = new mongoose.Schema(
  {
    available: { type: Boolean, default: false },
    about: { type: String, maxlength: 300 },
    contactMethod: {
      type: String,
      enum: ["whatsapp", "email", "telegram", "instagram", ""],
      default: "",
    },
    contactInfo: { type: String },
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
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
  },
  branch: { type: String },
  yearOfStudy: { type: Number },
  examScores: examScoresSchema,
  savedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
  mentoring: mentoringSchema,
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);

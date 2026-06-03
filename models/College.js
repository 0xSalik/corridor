// College model: stores basic info, departments, facilities, and placement data.

import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  type: {
    type: String,
    enum: ["public", "private", "deemed"],
    required: true,
  },
  established: { type: Number },
  about: { type: String },
  departments: [departmentSchema],
  facilities: {
    hostel: { type: Boolean, default: false },
    lab: { type: Boolean, default: false },
    library: { type: Boolean, default: false },
  },
  averagePlacement: { type: Number, default: 0 },
  photos: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.College ||
  mongoose.model("College", collegeSchema);

// Facility model: individual facilities at a college (specific labs, hostels, courts, etc.)
// Added by students so aspirants can see what is actually available.

import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: [
      "lab",
      "hostel",
      "library",
      "sports",
      "cafeteria",
      "auditorium",
      "medical",
      "gym",
      "workshop",
      "other",
    ],
    required: true,
  },
  department: { type: String },
  description: { type: String, maxlength: 500 },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Facility ||
  mongoose.model("Facility", facilitySchema);

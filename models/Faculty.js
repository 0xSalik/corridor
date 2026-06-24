// Faculty model: professors and lecturers at a college, linked to a department.
// Students can add faculty members and then review them individually.

import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
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
  department: { type: String, required: true },
  designation: {
    type: String,
    enum: [
      "professor",
      "associate_professor",
      "assistant_professor",
      "lecturer",
      "visiting",
      "hod",
      "other",
    ],
    default: "assistant_professor",
  },
  courses: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Faculty ||
  mongoose.model("Faculty", facultySchema);

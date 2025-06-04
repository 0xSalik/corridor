// RankData model: stores historical cutoff ranks for college branches by year and quota.

import mongoose from "mongoose";

const rankDataSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  year: { type: Number, required: true },
  branch: { type: String, required: true },
  openingRank: { type: Number, required: true },
  closingRank: { type: Number, required: true },
  quota: {
    type: String,
    enum: ["general", "obc", "sc", "st", "ews"],
    required: true,
  },
  roundNumber: { type: Number, required: true },
});

export default mongoose.models.RankData ||
  mongoose.model("RankData", rankDataSchema);

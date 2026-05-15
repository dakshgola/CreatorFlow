import mongoose from "mongoose";

const contentScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["title", "hook", "thumbnailConcept", "script"], required: true },
  platform: { type: String, required: true },
  content: { type: String, required: true },
  scores: {
    hookStrength: Number,
    clarity: Number,
    retentionPotential: Number,
    overallScore: Number
  },
  reason: { type: String },
  fixSuggestion: { type: String },
  createdAt: { type: Date, default: Date.now }
});

contentScoreSchema.index({ userId: 1 });

export default mongoose.model("ContentScore", contentScoreSchema);

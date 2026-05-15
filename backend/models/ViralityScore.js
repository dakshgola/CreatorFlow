import mongoose from "mongoose";

const viralityScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contentType: { type: String, enum: ["title", "hook", "script", "thumbnailText"], required: true },
  content: { type: String, required: true },

  overallScore: { type: Number, required: true },
  
  metrics: {
    hookStrength: {
      score: { type: Number, default: 0 },
      explanation: { type: String, default: "" }
    },
    retentionPotential: {
      score: { type: Number, default: 0 },
      explanation: { type: String, default: "" }
    },
    clarity: {
      score: { type: Number, default: 0 },
      explanation: { type: String, default: "" }
    },
    emotionalResonance: {
      score: { type: Number, default: 0 },
      explanation: { type: String, default: "" }
    }
  },

  weakestSentence: { type: String, default: "" },
  suggestedFixes: { type: [String], default: [] },
  ctrEstimate: { type: String, enum: ["High", "Average", "Low"], default: "Average" },

  // Learning Loop
  actualPerformance: { type: String, enum: ["viral", "average", "flopped", "pending"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("ViralityScore", viralityScoreSchema);

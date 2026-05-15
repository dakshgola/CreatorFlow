import mongoose from "mongoose";

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One profile per user
    },
    // 1. Core Identity
    niche: { type: String, default: "" }, // e.g., "AI Engineering", "SaaS Growth"
    targetAudience: { type: String, default: "" }, // e.g., "Mid-level developers", "Founders"
    tone: { type: [String], default: [] }, // e.g., ["Professional", "Witty", "Actionable"]
    
    // 2. Writing & Content Mechanics
    preferredHooks: { type: [String], default: [] }, // e.g., ["Contrarian statement", "Data-backed claim"]
    writingStyle: { type: String, default: "" }, // e.g., "Short sentences. High impact. No fluff."
    platformPreferences: {
      type: Map,
      of: String, // e.g., { "Twitter": "Threads with bullet points", "LinkedIn": "Storytelling with takeaways" }
      default: {},
    },
    contentPillars: { type: [String], default: [] },
    contentGoals: { type: String, default: "" }, // e.g., "Drive newsletter signups, build authority"
    
    // 3. Dynamic AI Memory (Learned over time)
    viralContentPatterns: { type: [String], default: [] }, // Auto-updated from successful posts
    commonFeedback: { type: [String], default: [] }, // User feedback like "Make it shorter"
    rejectedOutputs: { type: [String], default: [] }, // Anti-patterns to avoid
  },
  { timestamps: true }
);

export default mongoose.model("CreatorProfile", creatorProfileSchema);

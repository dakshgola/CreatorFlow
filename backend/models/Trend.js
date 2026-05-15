import mongoose from "mongoose";

const trendSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true }, // e.g., "AI Agents replacing SaaS"
    niche: { type: String, required: true }, // e.g., "Tech", "Fitness"
    source: { type: String, enum: ["reddit", "youtube", "twitter", "google"] },
    
    // Analytics Layer
    score: { type: Number, default: 0 }, // Out of 100
    momentum: { type: Number, default: 0 }, // Rate of growth (% increase over 24h)
    engagementVolume: { type: Number, default: 0 }, // Total likes/comments/views
    
    // AI Synthesized Data
    summary: { type: String, default: "" },
    audiencePainPoints: { type: [String], default: [] }, // What are people complaining about?
    repeatedAngles: { type: [String], default: [] }, // Saturated angles
    contentGaps: { type: [String], default: [] }, // Missing angles to exploit
    actionableHooks: { type: [String], default: [] },
    
    // Raw Data References
    sourceUrls: { type: [String], default: [] },
    
    // TTL Index - automatically delete documents after 48 hours
    expiresAt: { 
      type: Date, 
      default: () => Date.now() + 48 * 60 * 60 * 1000 
    }
  },
  { timestamps: true }
);

// Indexes for fast retrieval
trendSchema.index({ niche: 1, score: -1 });
trendSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL

export default mongoose.model("Trend", trendSchema);

import mongoose from "mongoose";

const competitorAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUrl: { type: String, required: true },
    platform: { type: String, enum: ["youtube", "twitter", "linkedin", "instagram", "other"], default: "other" },
    
    status: { 
      type: String, 
      enum: ["scraping", "analyzing", "completed", "failed"], 
      default: "scraping" 
    },
    
    // Metadata
    competitorName: { type: String, default: "Unknown" },
    
    // AI Analyzed Intelligence
    contentPillars: [
      {
        topic: { type: String },
        frequencyPercent: { type: Number }
      }
    ],
    viralHookPatterns: { type: [String], default: [] },
    audienceOverlap: { type: [String], default: [] }, // What pain points are they hitting?
    
    // Strategic Differentiation (The core value)
    ignoredTopics: { type: [String], default: [] },
    differentiationAngle: { type: String, default: "" },
    
    errorLogs: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("CompetitorAnalysis", competitorAnalysisSchema);

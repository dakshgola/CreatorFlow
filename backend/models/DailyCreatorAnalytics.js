import mongoose from "mongoose";

const dailyCreatorAnalyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // Should be truncated to Midnight UTC
    
    // Core Aggregate Metrics
    totalViews: { type: Number, default: 0 },
    totalSubscribers: { type: Number, default: 0 },
    watchTimeHours: { type: Number, default: 0 },
    
    // Deltas (Percentage change from previous day)
    viewsDeltaPercent: { type: Number, default: 0 },
    subscribersDeltaPercent: { type: Number, default: 0 },
    
    // Video Performance Data
    topPerformingVideoTitle: { type: String, default: "" },
    topPerformingVideoViews: { type: Number, default: 0 },
    averageViewDurationSeconds: { type: Number, default: 0 },
    
    // AI Synthesized Insight (The Daily Briefing)
    dailyInsight: { type: String, default: "" }
  },
  { timestamps: true }
);

// Compound index to quickly fetch charts for a specific user over a date range
dailyCreatorAnalyticsSchema.index({ userId: 1, date: -1 });

export default mongoose.model("DailyCreatorAnalytics", dailyCreatorAnalyticsSchema);

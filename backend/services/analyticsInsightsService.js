import { GoogleGenerativeAI } from "@google/generative-ai";
import DailyCreatorAnalytics from "../models/DailyCreatorAnalytics.js";

// This simulates the background worker fetching data from YouTube API
// and computing the AI insight.
export const generateDailyAnalytics = async (userId) => {
  try {
    // 1. Simulate fetching from YouTube API
    const totalViews = Math.floor(Math.random() * 50000) + 1000;
    const totalSubscribers = Math.floor(Math.random() * 500) + 10;
    const viewsDeltaPercent = +(Math.random() * 40 - 10).toFixed(2); // -10% to +30%
    const watchTimeHours = Math.floor(totalViews * 0.05);
    const topPerformingVideoTitle = "How I Built an AI Agent in 24 Hours";

    // 2. Generate Insight via AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a Senior Data Analyst for a YouTube Creator.
Here is the creator's performance delta for the last 24 hours:
- Views: ${totalViews} (${viewsDeltaPercent > 0 ? '+' : ''}${viewsDeltaPercent}%)
- Watch Time: ${watchTimeHours} hours
- Top Video: "${topPerformingVideoTitle}"
- New Subscribers: ${totalSubscribers}

Write a 2-sentence executive summary for their dashboard.
Rule 1: Point out the most interesting anomaly or trend.
Rule 2: Offer a highly strategic, actionable recommendation based on the data.
Tone: Direct, professional, no fluff.`;

    const result = await model.generateContent(prompt);
    const dailyInsight = result.response?.text()?.trim() || "Performance is stable. Keep publishing consistently.";

    // 3. Upsert to DB (Truncate date to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await DailyCreatorAnalytics.findOneAndUpdate(
      { userId, date: today },
      {
        totalViews,
        totalSubscribers,
        watchTimeHours,
        viewsDeltaPercent,
        topPerformingVideoTitle,
        dailyInsight
      },
      { new: true, upsert: true }
    );

    return record;
  } catch (error) {
    console.error("ANALYTICS INSIGHT ERROR:", error);
    throw error;
  }
};

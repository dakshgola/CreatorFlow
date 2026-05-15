import Trend from "../models/Trend.js";
import { ingestAndAnalyzeTrend } from "../services/trendIngestionService.js";

// @desc    Get top trends for a specific niche
// @route   GET /api/trends
// @access  Private
export const getTrends = async (req, res) => {
  try {
    const { niche } = req.query;
    
    // In production, this would use Redis caching here
    // e.g. const cached = await redis.get(`trends:${niche}`)
    
    let query = {};
    if (niche) {
      query.niche = niche;
    }

    const trends = await Trend.find(query)
      .sort({ score: -1, momentum: -1 }) // Sort by highest score & velocity
      .limit(10);

    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    console.error("GET TRENDS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Manually trigger trend ingestion (Admin/Dev tool)
// @route   POST /api/trends/trigger
// @access  Private
export const triggerIngestion = async (req, res) => {
  try {
    const { topic, niche, source, rawData } = req.body;
    
    if (!topic || !niche || !rawData) {
      return res.status(400).json({ success: false, message: "Topic, niche, and rawData are required" });
    }

    const newTrend = await ingestAndAnalyzeTrend(topic, niche, source || "reddit", rawData);

    res.status(200).json({ success: true, data: newTrend });
  } catch (error) {
    console.error("TRIGGER INGESTION ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

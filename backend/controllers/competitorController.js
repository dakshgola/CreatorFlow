import CompetitorAnalysis from "../models/CompetitorAnalysis.js";
import { processCompetitorIntelligence } from "../services/competitorService.js";

// @desc    Start competitor analysis
// @route   POST /api/competitors/analyze
// @access  Private
export const startAnalysis = async (req, res) => {
  try {
    const { targetUrl, platform } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: "targetUrl is required" });
    }

    // 1. Create DB record in 'scraping' state
    const analysis = await CompetitorAnalysis.create({
      userId: req.user.id,
      targetUrl,
      platform: platform || "other"
    });

    // 2. Trigger async background pipeline
    // (Returns immediately, does not block the HTTP response)
    processCompetitorIntelligence(analysis._id, req.user.id, targetUrl);

    res.status(202).json({ 
      success: true, 
      message: "Analysis started", 
      analysisId: analysis._id 
    });
  } catch (error) {
    console.error("START COMPETITOR ANALYSIS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get status/result of an analysis
// @route   GET /api/competitors/:id
// @access  Private
export const getAnalysis = async (req, res) => {
  try {
    const analysis = await CompetitorAnalysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }
    
    if (analysis.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error("GET COMPETITOR ANALYSIS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

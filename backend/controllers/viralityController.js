import ViralityScore from "../models/ViralityScore.js";
import { evaluateContent } from "../services/viralityScoringService.js";

// @desc    Score new content
// @route   POST /api/virality/score
// @access  Private
export const scoreContent = async (req, res) => {
  try {
    const { contentType, content } = req.body;

    if (!contentType || !content) {
      return res.status(400).json({ success: false, message: "contentType and content are required" });
    }

    // 1. Evaluate via AI Service
    const evaluation = await evaluateContent(contentType, content);

    // 2. Save to history
    const newScore = await ViralityScore.create({
      userId: req.user.id,
      contentType,
      content,
      overallScore: evaluation.overallScore,
      metrics: evaluation.metrics,
      weakestSentence: evaluation.weakestSentence,
      suggestedFixes: evaluation.suggestedFixes,
      ctrEstimate: evaluation.ctrEstimate
    });

    res.status(200).json({ success: true, data: newScore });
  } catch (error) {
    console.error("SCORE CONTENT ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get user's scoring history (for analytics/charts)
// @route   GET /api/virality/history
// @access  Private
export const getScoreHistory = async (req, res) => {
  try {
    const history = await ViralityScore.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("GET SCORE HISTORY ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update actual performance (The Learning Loop)
// @route   PUT /api/virality/:id/performance
// @access  Private
export const updatePerformance = async (req, res) => {
  try {
    const { actualPerformance } = req.body; // "viral", "average", "flopped"
    
    const scoreRecord = await ViralityScore.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { actualPerformance },
      { new: true }
    );

    if (!scoreRecord) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    // NOTE: If actualPerformance === "flopped" and overallScore was > 80, 
    // a Senior engineer would trigger a background job here to update the CreatorProfile's 
    // negative constraints to stop the AI from rating that style highly again.

    res.status(200).json({ success: true, data: scoreRecord });
  } catch (error) {
    console.error("UPDATE PERFORMANCE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

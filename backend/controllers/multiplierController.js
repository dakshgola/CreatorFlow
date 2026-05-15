import MultiplierCampaign from "../models/MultiplierCampaign.js";
import { executeFanOutCampaign } from "../services/multiplierService.js";

// @desc    Start a new multiplier campaign
// @route   POST /api/multiplier/start
// @access  Private
export const startCampaign = async (req, res) => {
  try {
    const { topic, sourceContent } = req.body;

    if (!topic || !sourceContent) {
      return res.status(400).json({ success: false, message: "Topic and sourceContent required" });
    }

    // 1. Create Initial Campaign Record
    const campaign = await MultiplierCampaign.create({
      userId: req.user.id,
      topic,
      sourceContent,
      status: "processing"
    });

    // 2. Trigger async execution WITHOUT awaiting it
    // This prevents the HTTP request from hanging for 30+ seconds.
    // In a production setup, this would be `jobQueue.add({ campaignId })`
    executeFanOutCampaign(campaign._id, req.user.id, sourceContent);

    // 3. Return immediately so the frontend can start polling or connect to SSE
    res.status(202).json({ 
      success: true, 
      message: "Campaign started", 
      campaignId: campaign._id 
    });
  } catch (error) {
    console.error("START CAMPAIGN ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get status/results of a campaign
// @route   GET /api/multiplier/:id
// @access  Private
export const getCampaign = async (req, res) => {
  try {
    const campaign = await MultiplierCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    
    if (campaign.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    console.error("GET CAMPAIGN ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

import CreatorProfile from "../models/CreatorProfile.js";

// @desc    Get current user's creator profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let profile = await CreatorProfile.findOne({ userId: req.user.id });
    
    // Auto-create an empty profile if none exists
    if (!profile) {
      profile = await CreatorProfile.create({ userId: req.user.id });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update creator profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent modifying the associated userId
    delete updates.userId;

    const profile = await CreatorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add a rejected output to memory
// @route   POST /api/profile/reject
// @access  Private
export const addRejectedOutput = async (req, res) => {
  try {
    const { pattern } = req.body;
    if (!pattern) {
      return res.status(400).json({ success: false, message: "Pattern is required" });
    }

    const profile = await CreatorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { rejectedOutputs: pattern } }, // Prevent duplicates
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("REJECT OUTPUT ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

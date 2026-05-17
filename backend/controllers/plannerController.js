import PlannerCard from "../models/PlannerCard.js";

/**
 * @desc    Get all planner cards for user, grouped by status
 * @route   GET /api/v1/planner
 * @access  Private
 */
export const getPlannerCards = async (req, res) => {
  try {
    const cards = await PlannerCard.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Group cards by status
    const groupedCards = {
      Idea: [],
      Script: [],
      Shoot: [],
      Edit: [],
      Posted: [],
    };

    cards.forEach((card) => {
      if (groupedCards[card.status]) {
        groupedCards[card.status].push(card);
      } else {
        // Fallback for unexpected statuses
        groupedCards[card.status] = [card]; 
      }
    });

    res.status(200).json({
      success: true,
      data: groupedCards,
    });
  } catch (error) {
    console.error("GET PLANNER CARDS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error fetching planner cards" });
  }
};

/**
 * @desc    Create new card
 * @route   POST /api/v1/planner
 * @access  Private
 */
export const createPlannerCard = async (req, res) => {
  try {
    const { title, description, platform, status, dueDate, aiGenerated } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const card = await PlannerCard.create({
      userId: req.user.id,
      title,
      description,
      platform,
      status: status || "Idea",
      dueDate,
      aiGenerated: aiGenerated || false,
    });

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error("CREATE PLANNER CARD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error creating planner card" });
  }
};

/**
 * @desc    Update card fields (including status for drag-and-drop)
 * @route   PATCH /api/v1/planner/:id
 * @access  Private
 */
export const updatePlannerCard = async (req, res) => {
  try {
    let card = await PlannerCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    // Ensure the user owns the card
    if (card.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized to update this card" });
    }

    card = await PlannerCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error("UPDATE PLANNER CARD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error updating planner card" });
  }
};

/**
 * @desc    Delete card
 * @route   DELETE /api/v1/planner/:id
 * @access  Private
 */
export const deletePlannerCard = async (req, res) => {
  try {
    const card = await PlannerCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    // Ensure the user owns the card
    if (card.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized to delete this card" });
    }

    await card.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("DELETE PLANNER CARD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error deleting planner card" });
  }
};

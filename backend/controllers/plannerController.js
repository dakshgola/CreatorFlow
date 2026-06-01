import PlannerCard from "../models/PlannerCard.js";
import AppError from "../utils/AppError.js";

/**
 * @desc    Get all planner cards for user, grouped by status
 * @route   GET /api/v1/planner
 * @access  Private
 */
export const getPlannerCards = async (req, res, next) => {
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
    next(error);
  }
};

/**
 * @desc    Create new card
 * @route   POST /api/v1/planner
 * @access  Private
 */
export const createPlannerCard = async (req, res, next) => {
  try {
    const { title, description, platform, status, dueDate, aiGenerated } = req.body;

    if (!title) {
      return next(new AppError("Title is required", 400));
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
    next(error);
  }
};

/**
 * @desc    Update card fields (including status for drag-and-drop)
 * @route   PATCH /api/v1/planner/:id
 * @access  Private
 */
export const updatePlannerCard = async (req, res, next) => {
  try {
    let card = await PlannerCard.findById(req.params.id);

    if (!card) {
      return next(new AppError("Card not found", 404));
    }

    // Ensure the user owns the card
    if (card.userId.toString() !== req.user.id) {
      return next(new AppError("Not authorized to update this card", 401));
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
    next(error);
  }
};

/**
 * @desc    Delete card
 * @route   DELETE /api/v1/planner/:id
 * @access  Private
 */
export const deletePlannerCard = async (req, res, next) => {
  try {
    const card = await PlannerCard.findById(req.params.id);

    if (!card) {
      return next(new AppError("Card not found", 404));
    }

    // Ensure the user owns the card
    if (card.userId.toString() !== req.user.id) {
      return next(new AppError("Not authorized to delete this card", 401));
    }

    await card.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

import express from "express";
import {
  getPlannerCards,
  createPlannerCard,
  updatePlannerCard,
  deletePlannerCard,
} from "../controllers/plannerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All planner routes require authentication
router.use(protect);

router
  .route("/")
  .get(getPlannerCards)
  .post(createPlannerCard);

router
  .route("/:id")
  .patch(updatePlannerCard)
  .delete(deletePlannerCard);

export default router;

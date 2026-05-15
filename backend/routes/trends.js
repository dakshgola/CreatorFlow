import express from "express";
import { protect } from "../middleware/auth.js";
import { getTrends, triggerIngestion } from "../controllers/trendController.js";

const router = express.Router();

// Apply auth middleware to all trend routes
router.use(protect);

router.route("/")
  .get(getTrends);

router.post("/trigger", triggerIngestion);

export default router;

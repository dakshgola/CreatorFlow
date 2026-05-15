import express from "express";
import { protect } from "../middleware/auth.js";
import { scoreContent, getScoreHistory, updatePerformance } from "../controllers/viralityController.js";

const router = express.Router();

router.use(protect);

router.post("/score", scoreContent);
router.get("/history", getScoreHistory);
router.put("/:id/performance", updatePerformance);

export default router;

import express from "express";
import { protect } from "../middleware/auth.js";
import { getDashboardData, syncYouTubeData } from "../controllers/creatorAnalyticsController.js";

const router = express.Router();

router.use(protect);

router.get("/", getDashboardData);
router.post("/sync", syncYouTubeData);

export default router;

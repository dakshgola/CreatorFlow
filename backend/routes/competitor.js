import express from "express";
import { protect } from "../middleware/auth.js";
import { startAnalysis, getAnalysis } from "../controllers/competitorController.js";

const router = express.Router();

router.use(protect);

router.post("/analyze", startAnalysis);
router.get("/:id", getAnalysis);

export default router;

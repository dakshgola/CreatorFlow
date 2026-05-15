import express from "express";
import { protect } from "../middleware/auth.js";
import { startCampaign, getCampaign } from "../controllers/multiplierController.js";

const router = express.Router();

router.use(protect);

router.post("/start", startCampaign);
router.get("/:id", getCampaign);

export default router;

import express from "express";
import { protect } from "../middleware/auth.js";
import { startAgentWorkflow, getAgentStatus } from "../controllers/agentController.js";

const router = express.Router();

router.use(protect);

router.post("/run", startAgentWorkflow);
router.get("/:id", getAgentStatus);

export default router;

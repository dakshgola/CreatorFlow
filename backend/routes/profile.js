import express from "express";
import { protect } from "../middleware/auth.js";
import { getProfile, updateProfile, addRejectedOutput } from "../controllers/creatorProfileController.js";

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(protect);

router.route("/")
  .get(getProfile)
  .put(updateProfile);

router.post("/reject", addRejectedOutput);

export default router;
